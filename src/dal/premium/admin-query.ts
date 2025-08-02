import prisma from "@/lib/db/prisma";
import { PremiumTier, University } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import type { Prisma } from "@prisma/client";

// Types for admin premium operations
export interface AdminPremiumUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPremiumActive: boolean;
  currentPremiumTier: PremiumTier | null;
  premiumExpiryDate: Date | null;
  daysRemaining: number | null;
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    university: string | null;
    degree: string | null;
    year: string | null;
    semester: string | null;
  } | null;
  activePurchase: {
    id: string;
    tier: PremiumTier;
    finalAmount: string;
    expiryDate: Date;
    createdAt: Date;
  } | null;
}

export interface AdminPremiumStats {
  totalPremiumUsers: number;
  activePremiumUsers: number;
  expiredPremiumUsers: number;
  totalRevenue: number;
  revenueThisMonth: number;
  tierDistribution: Array<{
    tier: PremiumTier;
    count: number;
  }>;
  expiringUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    tier: PremiumTier;
    expiryDate: Date;
    daysRemaining: number;
  }>;
}

export interface AdminPremiumFilters {
  search?: string;
  tier?: PremiumTier | "ALL";
  status?: "ACTIVE" | "EXPIRED" | "ALL";
  university?: string;
  sortBy?:
    | "NEWEST"
    | "OLDEST"
    | "NAME_ASC"
    | "NAME_DESC"
    | "EXPIRY_SOON"
    | "EXPIRY_LATE";
  page?: number;
  limit?: number;
}

export interface AdminPremiumResponse {
  users: AdminPremiumUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GrantPremiumParams {
  userId: string;
  tier: PremiumTier;
  durationInDays: number;
}

// Cache configurations for admin premium operations
const adminPremiumCacheConfig = {
  getAdminPremiumUsers: {
    cacheTime: 300, // 5 minutes
    tags: ["admin-premium-users"],
    cacheKey: "admin-premium-users",
  },
  getAdminPremiumStats: {
    cacheTime: 600, // 10 minutes
    tags: ["admin-premium-stats"],
    cacheKey: "admin-premium-stats",
  },
};

// Helper function to calculate days remaining
function calculateDaysRemaining(expiryDate: Date): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Get premium users with filters and pagination
async function getAdminPremiumUsersInternal(
  filters: AdminPremiumFilters = {},
): Promise<AdminPremiumResponse> {
  const {
    search,
    tier,
    status,
    university,
    sortBy = "NEWEST",
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;

  // Build where clause
  const where: Prisma.UserWhereInput = {};

  // Search filter
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        profile: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    ];
  }

  // Tier filter
  if (tier && tier !== "ALL") {
    where.currentPremiumTier = tier;
  }

  // Status filter
  if (status && status !== "ALL") {
    if (status === "ACTIVE") {
      where.isPremiumActive = true;
      where.premiumExpiryDate = {
        gt: new Date(),
      };
    } else if (status === "EXPIRED") {
      where.OR = [
        { isPremiumActive: false },
        {
          AND: [
            { isPremiumActive: true },
            { premiumExpiryDate: { lte: new Date() } },
          ],
        },
      ];
    }
  }

  // University filter
  if (university) {
    where.profile = {
      university: university as University,
    };
  }

  // Only include users who have had premium at some point
  where.currentPremiumTier = {
    not: null,
  };

  // Build order clause
  const orderBy: Prisma.UserOrderByWithRelationInput[] = [];
  switch (sortBy) {
    case "NEWEST":
      orderBy.push({ createdAt: "desc" });
      break;
    case "OLDEST":
      orderBy.push({ createdAt: "asc" });
      break;
    case "NAME_ASC":
      orderBy.push({ name: "asc" });
      break;
    case "NAME_DESC":
      orderBy.push({ name: "desc" });
      break;
    case "EXPIRY_SOON":
      orderBy.push({ premiumExpiryDate: "asc" });
      break;
    case "EXPIRY_LATE":
      orderBy.push({ premiumExpiryDate: "desc" });
      break;
    default:
      orderBy.push({ createdAt: "desc" });
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
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
          },
        },
        premiumPurchases: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            tier: true,
            finalAmount: true,
            expiryDate: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Transform users data
  const transformedUsers: AdminPremiumUser[] = users.map((user) => {
    const daysRemaining = user.premiumExpiryDate
      ? calculateDaysRemaining(user.premiumExpiryDate)
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isPremiumActive: user.isPremiumActive,
      currentPremiumTier: user.currentPremiumTier,
      premiumExpiryDate: user.premiumExpiryDate,
      daysRemaining,
      createdAt: user.createdAt,
      profile: user.profile,
      activePurchase: user.premiumPurchases[0]
        ? {
            ...user.premiumPurchases[0],
            finalAmount:
              user.premiumPurchases[0].finalAmount?.toString() || "0",
          }
        : null,
    };
  });

  return {
    users: transformedUsers,
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

async function getAdminPremiumStatsInternal(): Promise<AdminPremiumStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPremiumUsers,
    activePremiumUsers,
    expiredPremiumUsers,
    totalRevenueResult,
    monthlyRevenueResult,
    tierDistribution,
    expiringUsersData,
  ] = await Promise.all([
    // Total users who have ever had premium
    prisma.user.count({
      where: {
        currentPremiumTier: {
          not: null,
        },
      },
    }),

    // Currently active premium users
    prisma.user.count({
      where: {
        isPremiumActive: true,
        premiumExpiryDate: {
          gt: now,
        },
      },
    }),

    // Expired premium users
    prisma.user.count({
      where: {
        currentPremiumTier: {
          not: null,
        },
        OR: [{ isPremiumActive: false }, { premiumExpiryDate: { lte: now } }],
      },
    }),

    // Total revenue
    prisma.premiumPurchase.aggregate({
      where: {
        paymentStatus: "CAPTURED",
      },
      _sum: {
        finalAmount: true,
      },
    }),

    // Monthly revenue
    prisma.premiumPurchase.aggregate({
      where: {
        paymentStatus: "CAPTURED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        finalAmount: true,
      },
    }),

    // Tier distribution
    prisma.user.groupBy({
      by: ["currentPremiumTier"],
      where: {
        isPremiumActive: true,
        premiumExpiryDate: {
          gt: now,
        },
      },
      _count: {
        currentPremiumTier: true,
      },
    }),

    // Users expiring in next 7 days
    prisma.user.findMany({
      where: {
        isPremiumActive: true,
        premiumExpiryDate: {
          gt: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentPremiumTier: true,
        premiumExpiryDate: true,
      },
      orderBy: {
        premiumExpiryDate: "asc",
      },
      take: 10,
    }),
  ]);

  const totalRevenue = Number(totalRevenueResult._sum?.finalAmount || 0);
  const revenueThisMonth = Number(monthlyRevenueResult._sum?.finalAmount || 0);

  const formattedTierDistribution = tierDistribution
    .filter((item) => item.currentPremiumTier !== null)
    .map((item) => ({
      tier: item.currentPremiumTier as PremiumTier,
      count: item._count.currentPremiumTier,
    }));

  const expiringUsers = expiringUsersData.map((user) => ({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    tier: user.currentPremiumTier as PremiumTier,
    expiryDate: user.premiumExpiryDate!,
    daysRemaining: calculateDaysRemaining(user.premiumExpiryDate!),
  }));

  return {
    totalPremiumUsers,
    activePremiumUsers,
    expiredPremiumUsers,
    totalRevenue,
    revenueThisMonth,
    tierDistribution: formattedTierDistribution,
    expiringUsers,
  };
}

// Grant premium to a user (admin action)
export async function grantPremiumToUser({
  userId,
  tier,
  durationInDays,
}: GrantPremiumParams): Promise<boolean> {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationInDays);

    // Get user profile for academic details
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      console.error("User profile not found for premium grant");
      return false;
    }

    // Create a premium purchase record for admin-granted premium
    await prisma.premiumPurchase.create({
      data: {
        userId,
        tier,
        duration: durationInDays,
        originalAmount: 0, // Admin granted - no cost
        discountAmount: 0,
        finalAmount: 0,
        currency: "INR",
        paymentStatus: "CAPTURED", // Mark as captured since it's admin granted
        paymentMethod: null, // Admin granted - no payment method
        isActive: true,
        expiryDate,
        webhookProcessed: true,
        university: userProfile.university,
        degree: userProfile.degree,
        year: userProfile.year,
        semester: userProfile.semester,
      },
    });

    // Deactivate any existing active purchases for this user
    await prisma.premiumPurchase.updateMany({
      where: {
        userId,
        isActive: true,
        tier: { not: tier }, // Don't deactivate the one we just created
      },
      data: { isActive: false },
    });

    // Update user's premium status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremiumActive: true,
        currentPremiumTier: tier,
        premiumExpiryDate: expiryDate,
      },
    });

    return true;
  } catch (error) {
    console.error("Error granting premium to user:", error);
    return false;
  }
}

// Extend existing premium subscription
export async function extendPremiumSubscription(
  userId: string,
  additionalDays: number,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremiumActive: true,
        currentPremiumTier: true,
        premiumExpiryDate: true,
      },
    });

    if (!user || !user.isPremiumActive || !user.currentPremiumTier) {
      return false;
    }

    const currentExpiry = user.premiumExpiryDate || new Date();
    const newExpiryDate = new Date(currentExpiry);
    newExpiryDate.setDate(newExpiryDate.getDate() + additionalDays);

    // Update the active purchase record
    await prisma.premiumPurchase.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        expiryDate: newExpiryDate,
      },
    });

    // Update user's expiry date
    await prisma.user.update({
      where: { id: userId },
      data: {
        premiumExpiryDate: newExpiryDate,
      },
    });

    return true;
  } catch (error) {
    console.error("Error extending premium subscription:", error);
    return false;
  }
}

// Revoke premium access
export async function revokePremiumAccess(userId: string): Promise<boolean> {
  try {
    // Deactivate all active purchases
    await prisma.premiumPurchase.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Update user's premium status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremiumActive: false,
        currentPremiumTier: null,
        premiumExpiryDate: null,
      },
    });

    return true;
  } catch (error) {
    console.error("Error revoking premium access:", error);
    return false;
  }
}

// Get available universities for filter
export async function getPremiumUniversities(): Promise<string[]> {
  try {
    const profiles = await prisma.userProfile.findMany({
      where: {
        user: {
          currentPremiumTier: {
            not: null,
          },
        },
      },
      select: {
        university: true,
      },
      distinct: ["university"],
    });

    return profiles.map((p) => p.university).sort();
  } catch (error) {
    console.error("Error fetching premium universities:", error);
    return [];
  }
}

// Cached functions
export const getAdminPremiumUsers = unstable_cache(
  getAdminPremiumUsersInternal,
  ["admin-premium-users"],
  getCacheOptions(adminPremiumCacheConfig.getAdminPremiumUsers),
);

export const getAdminPremiumStats = unstable_cache(
  getAdminPremiumStatsInternal,
  ["admin-premium-stats"],
  getCacheOptions(adminPremiumCacheConfig.getAdminPremiumStats),
);
