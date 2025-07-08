import prisma from "@/lib/db/prisma";
import { PremiumTier, PaymentStatus, PaymentMethod } from "@prisma/client";
import { paymentMethodMapping } from "@/lib/razorpay/config";
import {
  getTierConfig,
  calculateDaysRemaining,
  type PriceCalculation,
  type DiscountApplication,
  type UserAccessStatus,
} from "./types";
import {
  convertSanityValueToPrismaValue,
  convertPrismaValueToDisplayFormat,
} from "@/utils/value-convert";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Get user's current premium status
export const getUserPremiumStatus = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremiumActive: true,
        currentPremiumTier: true,
        premiumExpiryDate: true,
      },
    });

    if (!user || !user.isPremiumActive || !user.premiumExpiryDate) {
      return {
        isActive: false,
        tier: null,
        expiryDate: null,
        daysRemaining: null,
      };
    }

    const daysRemaining = calculateDaysRemaining(user.premiumExpiryDate);
    const isStillActive = daysRemaining > 0;

    return {
      isActive: isStillActive,
      tier: user.currentPremiumTier,
      expiryDate: user.premiumExpiryDate,
      daysRemaining: isStillActive ? daysRemaining : 0,
    };
  },
  ["user-premium-status"],
  {
    revalidate: 1800,
    tags: ["user-premium-status"],
  },
);

// Calculate price with discounts (server-side only)
export async function calculatePurchasePrice(
  userId: string,
  tier: PremiumTier,
  discountCode?: string,
  referralCode?: string,
): Promise<PriceCalculation> {
  const tierConfig = getTierConfig(tier);
  const originalAmount = tierConfig.price;
  const discounts: DiscountApplication[] = [];
  let totalDiscount = 0;

  // Apply discount coupon
  if (discountCode) {
    const coupon = await prisma.discountCoupon.findFirst({
      where: {
        code: discountCode,
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        applicableTiers: {
          has: tier,
        },
      },
    });

    if (coupon && originalAmount >= (coupon.minOrderAmount?.toNumber() || 0)) {
      // Check usage limits
      const userUsageCount = await prisma.premiumPurchase.count({
        where: {
          userId,
          discountCode,
          paymentStatus: "CAPTURED",
        },
      });

      const maxUsesPerUser = coupon.maxUsesPerUser || 1;

      if (
        userUsageCount < maxUsesPerUser &&
        coupon.currentUses < (coupon.maxUses || Infinity)
      ) {
        let discountAmount = 0;

        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (originalAmount * coupon.value.toNumber()) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(
              discountAmount,
              coupon.maxDiscount.toNumber(),
            );
          }
        } else {
          discountAmount = Math.min(coupon.value.toNumber(), originalAmount);
        }

        totalDiscount += discountAmount;
        discounts.push({
          type: "COUPON",
          code: discountCode,
          amount: discountAmount,
          description: coupon.description || `${coupon.code} discount`,
        });
      }
    }
  }

  // Apply referral discount
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });

    if (referrer && referrer.id !== userId) {
      const referralProgram = await prisma.referralProgram.findFirst({
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });

      if (referralProgram) {
        let referralDiscount = 0;

        if (referralProgram.refereeDiscountType === "PERCENTAGE") {
          referralDiscount =
            (originalAmount * referralProgram.refereeDiscountValue.toNumber()) /
            100;
        } else {
          referralDiscount = Math.min(
            referralProgram.refereeDiscountValue.toNumber(),
            originalAmount,
          );
        }

        totalDiscount += referralDiscount;
        discounts.push({
          type: "REFERRAL",
          code: referralCode,
          amount: referralDiscount,
          description: "Referral discount",
        });
      }
    }
  }

  const finalAmount = Math.max(0, originalAmount - totalDiscount);

  return {
    tier,
    originalAmount,
    discounts,
    totalDiscount,
    finalAmount,
    currency: "INR",
  };
}

// Create premium purchase record
export async function createPremiumPurchase(
  userId: string,
  priceCalculation: PriceCalculation,
  razorpayOrderId: string,
  referralCode?: string,
) {
  // Get user's current academic details
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      university: true,
      degree: true,
      year: true,
      semester: true,
    },
  });

  if (!userProfile) {
    throw new Error(
      "User profile not found. Please complete onboarding first.",
    );
  }

  const tierConfig = getTierConfig(priceCalculation.tier);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + tierConfig.duration);

  // Find referrer if referral code provided
  let referredByUserId = null;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    referredByUserId = referrer?.id || null;
  }

  const purchase = await prisma.premiumPurchase.create({
    data: {
      userId,
      razorpayOrderId,
      tier: priceCalculation.tier,
      duration: tierConfig.duration,
      originalAmount: priceCalculation.originalAmount,
      discountAmount: priceCalculation.totalDiscount,
      finalAmount: priceCalculation.finalAmount,
      currency: priceCalculation.currency,
      paymentStatus: "PENDING",
      discountCode: priceCalculation.discounts.find((d) => d.type === "COUPON")
        ?.code,
      referralCode,
      referredByUserId,
      university: userProfile.university,
      degree: userProfile.degree,
      year: userProfile.year,
      semester: userProfile.semester,
      expiryDate,
      discounts: {
        create: priceCalculation.discounts.map((discount) => ({
          discountType:
            discount.type === "COUPON" ? "FIXED_AMOUNT" : "REFERRAL_BONUS",
          discountCode: discount.code,
          discountValue: discount.amount,
          discountAmount: discount.amount,
          description: discount.description,
        })),
      },
    },
    include: {
      discounts: true,
    },
  });

  return purchase;
}

// Update purchase status after payment
export async function updatePurchasePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: string,
  failureReason?: string,
) {
  const purchase = await prisma.premiumPurchase.findUnique({
    where: { razorpayOrderId },
    include: { user: true },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  // Map Razorpay payment method to our enum
  const mappedPaymentMethod = paymentMethod
    ? (paymentMethodMapping[
        paymentMethod as keyof typeof paymentMethodMapping
      ] as PaymentMethod)
    : undefined;

  const updatedPurchase = await prisma.premiumPurchase.update({
    where: { razorpayOrderId },
    data: {
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus,
      paymentMethod: mappedPaymentMethod,
      failureReason,
      isActive: paymentStatus === "CAPTURED",
      webhookProcessed: true,
    },
  });

  // If payment successful, update user premium status
  if (paymentStatus === "CAPTURED") {
    await prisma.user.update({
      where: { id: purchase.userId },
      data: {
        currentPremiumTier: purchase.tier,
        premiumExpiryDate: purchase.expiryDate,
        isPremiumActive: true,
      },
    });

    // Revalidate premium-related caches
    revalidateTag("user-premium-status");
    revalidateTag("user-purchase-history");

    // Process referral rewards if applicable
    if (purchase.referredByUserId) {
      await processReferralReward(
        purchase.id,
        purchase.referredByUserId,
        purchase.userId,
      );
    }

    // Update coupon usage count
    if (purchase.discountCode) {
      await prisma.discountCoupon.updateMany({
        where: { code: purchase.discountCode },
        data: {
          currentUses: { increment: 1 },
        },
      });
    }
  }

  return updatedPurchase;
}

// Process referral rewards
async function processReferralReward(
  purchaseId: string,
  referrerUserId: string,
  refereeUserId: string,
) {
  const referralProgram = await prisma.referralProgram.findFirst({
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
  });

  if (referralProgram) {
    await prisma.referralReward.create({
      data: {
        referrerUserId,
        refereeUserId,
        purchaseId,
        rewardAmount: referralProgram.referrerDiscountValue,
        rewardType: referralProgram.referrerDiscountType,
        isProcessed: false,
      },
    });
  }
}

// Get user purchase history
export const getUserPurchaseHistory = unstable_cache(
  async (userId: string) => {
    return await prisma.premiumPurchase.findMany({
      where: { userId },
      include: {
        discounts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["user-purchase-history"],
  {
    revalidate: 1800,
    tags: ["user-purchase-history"],
  },
);

// Enhanced access check that returns detailed status
export async function checkUserAccessToContent(
  userId: string,
  requiredTier: PremiumTier,
  requiredUniversity?: string | null,
  requiredDegree?: string | null,
  requiredYear?: string | null,
  requiredSemester?: string | null,
): Promise<UserAccessStatus> {
  const premiumStatus = await getUserPremiumStatus(userId);

  // Get user's active purchase for academic details
  const activePurchase = await prisma.premiumPurchase.findFirst({
    where: {
      userId,
      isActive: true,
      expiryDate: { gt: new Date() },
    },
    orderBy: {
      expiryDate: "desc",
    },
  });

  const userStatus = {
    hasPremium: premiumStatus.isActive,
    tier: premiumStatus.tier,
    university: activePurchase
      ? convertPrismaValueToDisplayFormat(
          "university",
          activePurchase.university.toString(),
        )
      : null,
    degree: activePurchase
      ? convertPrismaValueToDisplayFormat(
          "degree",
          activePurchase.degree.toString(),
        )
      : null,
    year: activePurchase
      ? convertPrismaValueToDisplayFormat(
          "year",
          activePurchase.year.toString(),
        )
      : null,
    semester: activePurchase
      ? convertPrismaValueToDisplayFormat(
          "semester",
          activePurchase.semester.toString(),
        )
      : null,
    expiryDate: premiumStatus.expiryDate,
    daysRemaining: premiumStatus.daysRemaining,
  };

  const noteRequirements = {
    tier: requiredTier,
    university: requiredUniversity ?? null,
    degree: requiredDegree ?? null,
    year: requiredYear ?? null,
    semester: requiredSemester ?? null,
  };

  // Check if user has premium
  if (!premiumStatus.isActive || !premiumStatus.tier || !activePurchase) {
    return {
      canAccess: false,
      reason: "NO_PREMIUM",
      userStatus,
      noteRequirements,
      mismatches: [],
    };
  }

  // Check tier level (TIER_3 > TIER_2 > TIER_1)
  const tierLevels = { TIER_1: 1, TIER_2: 2, TIER_3: 3 };
  const userTierLevel = tierLevels[premiumStatus.tier];
  const requiredTierLevel = tierLevels[requiredTier];

  if (userTierLevel < requiredTierLevel) {
    return {
      canAccess: false,
      reason: "INSUFFICIENT_TIER",
      userStatus,
      noteRequirements,
      mismatches: [],
    };
  }

  // Check academic criteria if specified
  const mismatches: Array<{
    field: "university" | "degree" | "year" | "semester";
    userValue: string;
    requiredValue: string;
  }> = [];

  if (requiredUniversity) {
    const userUniversityPrisma = activePurchase.university.toString();
    const requiredUniversityPrisma = convertSanityValueToPrismaValue(
      "university",
      requiredUniversity,
    );

    if (
      requiredUniversityPrisma &&
      userUniversityPrisma !== requiredUniversityPrisma
    ) {
      mismatches.push({
        field: "university",
        userValue: convertPrismaValueToDisplayFormat(
          "university",
          userUniversityPrisma,
        ),
        requiredValue: convertPrismaValueToDisplayFormat(
          "university",
          requiredUniversityPrisma,
        ),
      });
    }
  }

  if (requiredDegree) {
    const userDegreePrisma = activePurchase.degree.toString();
    const requiredDegreePrisma = convertSanityValueToPrismaValue(
      "degree",
      requiredDegree,
    );

    if (requiredDegreePrisma && userDegreePrisma !== requiredDegreePrisma) {
      mismatches.push({
        field: "degree",
        userValue: convertPrismaValueToDisplayFormat(
          "degree",
          userDegreePrisma,
        ),
        requiredValue: convertPrismaValueToDisplayFormat(
          "degree",
          requiredDegreePrisma,
        ),
      });
    }
  }

  if (requiredYear) {
    const userYearPrisma = activePurchase.year.toString();
    const requiredYearPrisma = convertSanityValueToPrismaValue(
      "year",
      requiredYear,
    );

    if (requiredYearPrisma && userYearPrisma !== requiredYearPrisma) {
      mismatches.push({
        field: "year",
        userValue: convertPrismaValueToDisplayFormat("year", userYearPrisma),
        requiredValue: convertPrismaValueToDisplayFormat(
          "year",
          requiredYearPrisma,
        ),
      });
    }
  }

  if (requiredSemester) {
    const userSemesterPrisma = activePurchase.semester.toString();
    const requiredSemesterPrisma = convertSanityValueToPrismaValue(
      "semester",
      requiredSemester,
    );

    if (
      requiredSemesterPrisma &&
      userSemesterPrisma !== requiredSemesterPrisma
    ) {
      mismatches.push({
        field: "semester",
        userValue: convertPrismaValueToDisplayFormat(
          "semester",
          userSemesterPrisma,
        ),
        requiredValue: convertPrismaValueToDisplayFormat(
          "semester",
          requiredSemesterPrisma,
        ),
      });
    }
  }

  // If there are mismatches, user cannot access content
  if (mismatches.length > 0) {
    return {
      canAccess: false,
      reason: "ACADEMIC_MISMATCH",
      userStatus,
      noteRequirements,
      mismatches,
    };
  }

  return {
    canAccess: true,
    userStatus,
    noteRequirements,
    mismatches: [],
  };
}

// Keep the original function for backward compatibility but mark it as deprecated
export async function canUserAccessContent(
  userId: string,
  requiredTier: PremiumTier,
  requiredUniversity: string,
  requiredDegree: string,
  requiredYear: string,
  requiredSemester: string,
): Promise<boolean> {
  const accessStatus = await checkUserAccessToContent(
    userId,
    requiredTier,
    requiredUniversity,
    requiredDegree,
    requiredYear,
    requiredSemester,
  );

  return accessStatus.canAccess;
}
