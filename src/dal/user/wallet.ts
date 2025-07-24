import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";

// Get user's wallet balance
export const getUserWalletBalance = unstable_cache(
  async (userId: string): Promise<number> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    return user?.walletBalance.toNumber() || 0;
  },
  ["user-wallet-balance"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["user-wallet-balance"],
  },
);

// Get user's wallet transaction history (for future use)
export const getUserWalletHistory = unstable_cache(
  async (userId: string) => {
    const referralRewards = await prisma.referralReward.findMany({
      where: { referrerUserId: userId },
      select: {
        id: true,
        rewardAmount: true,
        createdAt: true,
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
      orderBy: { createdAt: "desc" },
    });

    const purchases = await prisma.premiumPurchase.findMany({
      where: {
        userId,
        paymentStatus: "CAPTURED",
        discounts: {
          some: {
            discountCode: "WALLET_BALANCE",
          },
        },
      },
      select: {
        id: true,
        tier: true,
        finalAmount: true,
        createdAt: true,
        discounts: {
          where: {
            discountCode: "WALLET_BALANCE",
          },
          select: {
            discountAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      earnings: referralRewards.map((reward) => ({
        id: reward.id,
        type: "REFERRAL_REWARD" as const,
        amount: reward.rewardAmount.toNumber(),
        date: reward.createdAt,
        description: `Referral reward from ${reward.referee.name || "friend"}`,
        details: {
          refereeName: reward.referee.name,
          refereeEmail: reward.referee.email,
          purchaseTier: reward.purchase?.tier,
          purchaseAmount: reward.purchase?.finalAmount.toNumber(),
        },
      })),
      redemptions: purchases.map((purchase) => ({
        id: purchase.id,
        type: "WALLET_REDEMPTION" as const,
        amount: -(purchase.discounts[0]?.discountAmount.toNumber() || 0),
        date: purchase.createdAt,
        description: `Used for ${purchase.tier.replace("_", " ")} purchase`,
        details: {
          tier: purchase.tier,
          finalAmount: purchase.finalAmount.toNumber(),
        },
      })),
    };
  },
  ["user-wallet-history"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["user-wallet-history", "user-referral-status"],
  },
);
