import prisma from "@/lib/db/prisma";
import {
  PremiumTier,
  PaymentStatus,
  PaymentMethod,
  Role,
} from "@prisma/client";
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
import { getCacheOptions } from "@/cache/cache";
import { premiumCacheConfig } from "@/cache/premium";
import telegramBot, {
  type PaymentNotificationData,
} from "@/lib/telegram/telegramBot";

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
  [premiumCacheConfig.getUserPremiumStatus.cacheKey!],
  getCacheOptions(premiumCacheConfig.getUserPremiumStatus),
);

// Get user's wallet balance
export const getUserWalletBalance = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
      },
    });

    return user ? Number(user.walletBalance) : 0;
  },
  [premiumCacheConfig.getUserPremiumStatus.cacheKey!],
  getCacheOptions(premiumCacheConfig.getUserPremiumStatus),
);

// Calculate price with discounts (server-side only)
export async function calculatePurchasePrice(
  userId: string,
  tier: PremiumTier,
  discountCode?: string,
  referralCode?: string,
  useWalletBalance?: boolean,
  walletAmount?: number,
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
    // Check if referral code exists and belongs to a different user
    const referrer = await prisma.user.findFirst({
      where: {
        referralCode,
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (referrer) {
      // Check if user has already used a referral code for any purchase
      const existingUsage = await prisma.premiumPurchase.findFirst({
        where: {
          userId,
          referralCode: {
            not: null,
          },
          paymentStatus: "CAPTURED",
        },
      });

      // Only apply referral discount if user hasn't used any referral code before
      if (!existingUsage) {
        // Use fixed referral discount amount from config
        const referralDiscount = Math.min(10, originalAmount - totalDiscount); // ₹10 fixed discount

        totalDiscount += referralDiscount;
        discounts.push({
          type: "REFERRAL",
          code: referralCode,
          amount: referralDiscount,
          description: `Referral discount from ${referrer.name || "friend"}`,
        });
      }
    }
  }

  // Apply wallet balance discount
  if (useWalletBalance && walletAmount && walletAmount > 0) {
    // Get user's wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (user && user.walletBalance.toNumber() > 0) {
      // Calculate maximum wallet discount that can be applied
      const availableBalance = user.walletBalance.toNumber();
      const remainingAmount = originalAmount - totalDiscount;
      const maxWalletDiscount = Math.min(
        availableBalance,
        remainingAmount,
        walletAmount,
      );

      if (maxWalletDiscount > 0) {
        totalDiscount += maxWalletDiscount;
        discounts.push({
          type: "WALLET",
          code: "WALLET_BALANCE",
          amount: maxWalletDiscount,
          description: `Wallet balance discount`,
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
            discount.type === "COUPON"
              ? "FIXED_AMOUNT"
              : discount.type === "WALLET"
                ? "FIXED_AMOUNT"
                : "REFERRAL_BONUS",
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
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      discounts: true,
    },
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

    // Deduct wallet balance if used
    const walletDiscount = purchase.discounts.find(
      (d) => d.discountCode === "WALLET_BALANCE",
    );

    if (walletDiscount) {
      await prisma.user.update({
        where: { id: purchase.userId },
        data: {
          walletBalance: {
            decrement: walletDiscount.discountAmount,
          },
        },
      });
    }

    // Revalidate premium-related caches
    revalidateTag("user-premium-status");
    revalidateTag("user-purchase-history");
    revalidateTag("user-referral-status");
    revalidateTag("user-wallet-balance");
    revalidateTag("user-wallet-history");

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

  try {
    const notificationData: PaymentNotificationData = {
      userName: purchase.user.name || "Unknown User",
      email: purchase.user.email,
      phone: purchase.user.profile?.phoneNumber || undefined,
      paymentAmount: purchase.finalAmount.toString(),
      tier: purchase.tier,
      university: purchase.university,
      degree: purchase.degree,
      year: purchase.year,
      semester: purchase.semester,
      isSuccess: paymentStatus === "CAPTURED",
      failureReason: failureReason || undefined,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
    };

    await telegramBot.sendPaymentNotification(notificationData);
  } catch {}

  return updatedPurchase;
}

// Process referral rewards
async function processReferralReward(
  purchaseId: string,
  referrerUserId: string,
  refereeUserId: string,
) {
  try {
    // Get or create the referral program
    let referralProgram = await prisma.referralProgram.findFirst({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
    });

    // Auto-create referral program if it doesn't exist
    if (!referralProgram) {
      referralProgram = await prisma.referralProgram.create({
        data: {
          name: "Default Referral Program",
          description:
            "Get ₹10 discount for both referrer and referee on premium purchases",
          referrerDiscountType: "FIXED_AMOUNT",
          referrerDiscountValue: 10, // ₹10
          refereeDiscountType: "FIXED_AMOUNT",
          refereeDiscountValue: 10, // ₹10
          isActive: true,
          validFrom: new Date(),
          validUntil: null, // No expiry
        },
      });
    }

    if (referralProgram) {
      await prisma.referralReward.create({
        data: {
          referrerUserId,
          refereeUserId,
          purchaseId,
          rewardAmount: referralProgram.referrerDiscountValue,
          rewardType: referralProgram.referrerDiscountType,
          isProcessed: true, // Mark as processed immediately since discount was already applied
        },
      });

      // Add reward to referrer's wallet balance
      await prisma.user.update({
        where: { id: referrerUserId },
        data: {
          walletBalance: {
            increment: referralProgram.referrerDiscountValue,
          },
        },
      });

      // Invalidate referral cache to show new reward
      revalidateTag("user-referral-status");
      revalidateTag("user-wallet-balance");
      revalidateTag("user-wallet-history");
    }
  } catch {
    // Don't throw error to avoid breaking the payment flow
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
  [premiumCacheConfig.getUserPurchaseHistory.cacheKey!],
  getCacheOptions(premiumCacheConfig.getUserPurchaseHistory),
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
  const userRole = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (userRole?.role === Role.ADMIN) {
    return {
      canAccess: true,
      userStatus: {
        hasPremium: true,
        tier: "TIER_3",
        university: null,
        degree: null,
        year: null,
        semester: null,
        expiryDate: null,
        daysRemaining: null,
      },
      noteRequirements: {
        tier: requiredTier,
        university: requiredUniversity ?? null,
        degree: requiredDegree ?? null,
        year: requiredYear ?? null,
        semester: requiredSemester ?? null,
      },
      mismatches: [],
    };
  }

  const premiumStatus = await getUserPremiumStatus(userId);

  const userPremiumData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremiumActive: true,
      premiumExpiryDate: true,
    },
  });

  if (
    userPremiumData &&
    userPremiumData.isPremiumActive &&
    userPremiumData.premiumExpiryDate &&
    userPremiumData.premiumExpiryDate <= new Date()
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremiumActive: false,
        currentPremiumTier: null,
        premiumExpiryDate: null,
      },
    });

    await prisma.premiumPurchase.updateMany({
      where: {
        userId,
        expiryDate: { lte: new Date() },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    revalidateTag("user-premium-status");
    revalidateTag("user-purchase-history");
  }

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

export async function getUserUpgradeContext(userId: string) {
  const currentPurchase = await prisma.premiumPurchase.findFirst({
    where: {
      userId,
      isActive: true,
      paymentStatus: "CAPTURED",
      expiryDate: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      tier: true,
      university: true,
      degree: true,
      year: true,
      semester: true,
      expiryDate: true,
    },
  });

  if (!currentPurchase) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining(currentPurchase.expiryDate);

  return {
    currentTier: currentPurchase.tier,
    university: currentPurchase.university,
    degree: currentPurchase.degree,
    year: currentPurchase.year,
    semester: currentPurchase.semester,
    expiryDate: currentPurchase.expiryDate,
    daysRemaining,
  };
}

// Get user's premium purchase history with upgrade context
export const getUserPremiumPurchaseHistory = unstable_cache(
  async (userId: string) => {
    const purchases = await prisma.premiumPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tier: true,
        originalAmount: true,
        finalAmount: true,
        discountAmount: true,
        currency: true,
        paymentStatus: true,
        isActive: true,
        createdAt: true,
        expiryDate: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        paymentMethod: true,
        failureReason: true,
        discountCode: true,
        referralCode: true,
        university: true,
        degree: true,
        year: true,
        semester: true,
      },
    });

    // Add upgrade context to each purchase
    return purchases.map((purchase, index) => {
      const previousPurchase = purchases[index + 1]; // Next in array (previous chronologically)
      const isUpgrade =
        previousPurchase &&
        previousPurchase.paymentStatus === "CAPTURED" &&
        isUpgradeTier(previousPurchase.tier, purchase.tier) &&
        previousPurchase.university === purchase.university &&
        previousPurchase.degree === purchase.degree &&
        previousPurchase.year === purchase.year &&
        previousPurchase.semester === purchase.semester;

      return {
        ...purchase,
        isUpgrade,
        upgradedFromTier: isUpgrade ? previousPurchase.tier : null,
      };
    });
  },
  [
    premiumCacheConfig.getUserPurchaseHistory?.cacheKey ||
      "user-premium-history",
  ],
  getCacheOptions(
    premiumCacheConfig.getUserPurchaseHistory || {
      duration: 300,
      tags: ["premium-history"],
    },
  ),
);

// Calculate upgrade price with prorated credit
export async function calculateUpgradePricing(
  userId: string,
  targetTier: PremiumTier,
  discountCode?: string,
  useWalletBalance?: boolean,
  walletAmount?: number,
): Promise<
  PriceCalculation & {
    upgradeDetails?: {
      currentTier: PremiumTier;
      targetTier: PremiumTier;
      daysRemaining: number;
      creditApplied: number;
    };
  }
> {
  const upgradeContext = await getUserUpgradeContext(userId);

  if (!upgradeContext) {
    // Not an upgrade, use regular pricing
    return calculatePurchasePrice(
      userId,
      targetTier,
      discountCode,
      undefined,
      useWalletBalance,
      walletAmount,
    );
  }

  const { currentTier, daysRemaining } = upgradeContext;

  // Validate this is actually an upgrade
  if (!isUpgradeTier(currentTier, targetTier)) {
    throw new Error(`Cannot upgrade from ${currentTier} to ${targetTier}`);
  }

  // Calculate base upgrade price
  const upgradePrice = calculateUpgradePrice(
    currentTier,
    targetTier,
    daysRemaining,
  );

  // Now apply regular discount logic to the upgrade price
  const pricing = await calculatePurchasePrice(
    userId,
    targetTier,
    discountCode,
    undefined,
    useWalletBalance,
    walletAmount,
  );

  // Override the original amount with upgrade price
  const finalAmount = Math.max(0, upgradePrice - pricing.totalDiscount);

  return {
    ...pricing,
    originalAmount: upgradePrice,
    finalAmount,
    upgradeDetails: {
      currentTier,
      targetTier,
      daysRemaining,
      creditApplied: getTierConfig(targetTier).price - upgradePrice,
    },
  };
}

import { calculateUpgradePrice, isUpgradeTier } from "./types";
