import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";

// Cache configurations
const userSearchCacheConfig = {
  searchUsers: {
    cacheTime: 300, // 5 minutes
    tags: ["admin-user-search"],
    cacheKey: "admin-user-search",
  },
  getUserDetails: {
    cacheTime: 600, // 10 minutes
    tags: ["admin-user-details"],
    cacheKey: "admin-user-details",
  },
};

// Search users by name or email
export async function searchUsersForAdmin(query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          profile: {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                phoneNumber: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPremiumActive: true,
      currentPremiumTier: true,
      premiumExpiryDate: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          university: true,
          degree: true,
          year: true,
          semester: true,
        },
      },
      premiumPurchases: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          tier: true,
          finalAmount: true,
          expiryDate: true,
          createdAt: true,
          university: true,
          degree: true,
          year: true,
          semester: true,
          paymentMethod: true,
          razorpayOrderId: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    take: 10,
    orderBy: [{ isPremiumActive: "asc" }, { name: "asc" }],
  });

  return users.map((user) => ({
    ...user,
    premiumPurchases:
      user.premiumPurchases?.map((purchase) => ({
        ...purchase,
        finalAmount: purchase.finalAmount?.toString() || "0",
      })) || [],
  }));
}

// Get detailed user information for premium management
export async function getUserDetailsForAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPremiumActive: true,
      currentPremiumTier: true,
      premiumExpiryDate: true,
      createdAt: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          university: true,
          degree: true,
          year: true,
          semester: true,
          createdAt: true,
        },
      },
      premiumPurchases: {
        select: {
          id: true,
          tier: true,
          duration: true,
          originalAmount: true,
          discountAmount: true,
          finalAmount: true,
          currency: true,
          paymentStatus: true,
          paymentMethod: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          discountCode: true,
          referralCode: true,
          university: true,
          degree: true,
          year: true,
          semester: true,
          purchaseDate: true,
          expiryDate: true,
          isActive: true,
          webhookProcessed: true,
          failureReason: true,
          createdAt: true,
          discounts: {
            select: {
              discountType: true,
              discountCode: true,
              discountValue: true,
              discountAmount: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      referrerRewards: {
        select: {
          rewardAmount: true,
          rewardType: true,
          isProcessed: true,
          createdAt: true,
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

  if (!user) return null;

  // Convert Decimal fields to strings for client serialization
  return {
    ...user,
    premiumPurchases:
      user.premiumPurchases?.map((purchase) => ({
        ...purchase,
        originalAmount: purchase.originalAmount?.toString() || "0",
        discountAmount: purchase.discountAmount?.toString() || "0",
        finalAmount: purchase.finalAmount?.toString() || "0",
        discounts:
          purchase.discounts?.map((discount) => ({
            ...discount,
            discountValue: discount.discountValue?.toString() || "0",
            discountAmount: discount.discountAmount?.toString() || "0",
          })) || [],
      })) || [],
    referrerRewards:
      user.referrerRewards?.map((reward) => ({
        ...reward,
        rewardAmount: reward.rewardAmount?.toString() || "0",
        purchase: {
          ...reward.purchase,
          finalAmount: reward.purchase.finalAmount?.toString() || "0",
        },
      })) || [],
  };
}

// Cached versions
export const getCachedUserSearch = unstable_cache(
  searchUsersForAdmin,
  [userSearchCacheConfig.searchUsers.cacheKey!],
  getCacheOptions(userSearchCacheConfig.searchUsers),
);

export const getCachedUserDetails = unstable_cache(
  getUserDetailsForAdmin,
  [userSearchCacheConfig.getUserDetails.cacheKey ?? "admin-user-details"],
  getCacheOptions(userSearchCacheConfig.getUserDetails),
);
