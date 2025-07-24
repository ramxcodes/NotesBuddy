import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import { referralCacheConfig } from "@/cache/referral";
import {
  ReferralStatus,
  ReferralValidation,
  ReferralCodeGeneration,
  REFERRAL_CONFIG,
} from "./types";

// Generate a unique referral code based on user's name
export function generateReferralCode(userName: string): string {
  // Extract first name and convert to uppercase
  const firstName = userName.split(" ")[0].toUpperCase();

  // Generate random alphanumeric characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomChars = "";

  for (let i = 0; i < REFERRAL_CONFIG.CODE_LENGTH; i++) {
    randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${firstName}${randomChars}`;
}

// Get user's referral status with cached results
export const getUserReferralStatus = unstable_cache(
  async (userId: string): Promise<ReferralStatus> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        name: true,
        walletBalance: true,
        referrerRewards: {
          select: {
            id: true,
            refereeUserId: true,
            rewardAmount: true,
            isProcessed: true,
            createdAt: true,
            updatedAt: true,
            purchaseId: true,
            referee: {
              select: {
                name: true,
                email: true,
              },
            },
            purchase: {
              select: {
                tier: true,
                finalAmount: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }


    return {
      hasReferralCode: Boolean(user.referralCode),
      referralCode: user.referralCode,
      walletBalance: user.walletBalance.toNumber(),
      totalReferrals: user.referrerRewards.length,
      totalEarnings: user.referrerRewards.reduce(
        (sum, reward) => sum + reward.rewardAmount.toNumber(),
        0,
      ),
      referrals: user.referrerRewards.map((reward) => ({
        id: reward.id,
        refereeUserId: reward.refereeUserId,
        refereeName: reward.referee.name || "Unknown",
        refereeEmail: reward.referee.email,
        rewardAmount: reward.rewardAmount.toNumber(),
        isProcessed: reward.isProcessed,
        createdAt: reward.createdAt,
        purchaseId: reward.purchaseId,
        purchaseTier: reward.purchase?.tier,
        purchaseAmount: reward.purchase?.finalAmount.toNumber() || 0,
      })),
    };
  },
  [referralCacheConfig.getUserReferralStatus.cacheKey!],
  getCacheOptions(referralCacheConfig.getUserReferralStatus),
);

// Validate a referral code
export const validateReferralCode = unstable_cache(
  async (code: string, userId: string): Promise<ReferralValidation> => {
    // Check if code exists and belongs to a different user
    const referrer = await prisma.user.findFirst({
      where: {
        referralCode: code,
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!referrer) {
      return {
        isValid: false,
        canUse: false,
        message: "Invalid referral code or you cannot use your own code",
      };
    }

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

    if (existingUsage) {
      return {
        isValid: true,
        canUse: false,
        message:
          "You have already used a referral code for a previous purchase",
        referrerInfo: {
          name: referrer.name || "Unknown",
          email: referrer.email || "Unknown",
        },
      };
    }

    return {
      isValid: true,
      canUse: true,
      message: "Referral code is valid! You'll get ₹10 discount.",
      discountAmount: REFERRAL_CONFIG.REWARD_AMOUNT,
      referrerInfo: {
        name: referrer.name || "Unknown",
        email: referrer.email || "Unknown",
      },
    };
  },
  [referralCacheConfig.validateReferralCode.cacheKey!],
  getCacheOptions(referralCacheConfig.validateReferralCode),
);

// Generate referral code for user
export async function generateUserReferralCode(
  userId: string,
): Promise<ReferralCodeGeneration> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        name: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.referralCode) {
      return {
        success: true,
        referralCode: user.referralCode,
        message: "Referral code already exists",
      };
    }

    if (!user.name) {
      return {
        success: false,
        message: "User name is required to generate referral code",
      };
    }

    let attempts = 0;
    let newCode: string;
    let isUnique = false;

    // Try to generate a unique code (max 10 attempts)
    do {
      newCode = generateReferralCode(user.name);

      const existingCode = await prisma.user.findFirst({
        where: { referralCode: newCode },
      });

      isUnique = !existingCode;
      attempts++;
    } while (!isUnique && attempts < 10);

    if (!isUnique) {
      return {
        success: false,
        message: "Failed to generate unique referral code. Please try again.",
      };
    }

    // Update user with new referral code
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: newCode! },
    });

    return {
      success: true,
      referralCode: newCode!,
      message: "Referral code generated successfully",
    };
  } catch (error) {
    console.error("Error generating referral code:", error);
    return {
      success: false,
      message: "Failed to generate referral code",
    };
  }
}

// Get referral rewards for a user
export async function getUserReferralRewards(userId: string) {
  const rewards = await prisma.referralReward.findMany({
    where: {
      OR: [{ referrerUserId: userId }, { refereeUserId: userId }],
    },
    include: {
      referrer: {
        select: {
          name: true,
          email: true,
        },
      },
      referee: {
        select: {
          name: true,
          email: true,
        },
      },
      purchase: {
        select: {
          tier: true,
          finalAmount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rewards.map((reward) => ({
    id: reward.id,
    referrerUserId: reward.referrerUserId,
    refereeUserId: reward.refereeUserId,
    purchaseId: reward.purchaseId,
    rewardAmount: Number(reward.rewardAmount),
    rewardType: reward.rewardType,
    isProcessed: reward.isProcessed,
    createdAt: reward.createdAt,
    updatedAt: reward.updatedAt,
    referrer: {
      name: reward.referrer.name || "Unknown",
      email: reward.referrer.email || "Unknown",
    },
    referee: {
      name: reward.referee.name || "Unknown",
      email: reward.referee.email || "Unknown",
    },
    purchase: {
      tier: reward.purchase.tier,
      finalAmount: Number(reward.purchase.finalAmount),
    },
  }));
}
