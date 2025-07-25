import { unstable_cache } from "next/cache";
import prisma from "@/lib/db/prisma";
import { getCacheOptions } from "@/cache/cache";

const adminCacheConfig = {
  getAdminStatistics: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-statistics"],
    cacheKey: "admin-statistics",
  },
};

export const getAdminStatistics = unstable_cache(
  async () => {
    const [totalUsers, premiumUsers, blockedUsers, revenueResult] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            isPremiumActive: true,
          },
        }),
        prisma.user.count({
          where: {
            isBlocked: true,
          },
        }),
        prisma.premiumPurchase.aggregate({
          where: {
            paymentStatus: "CAPTURED",
            isActive: true,
          },
          _sum: {
            finalAmount: true,
          },
        }),
      ]);

    const totalRevenue = Number(revenueResult._sum?.finalAmount || 0);

    return {
      totalUsers,
      premiumUsers,
      blockedUsers,
      totalRevenue,
    };
  },
  ["admin-statistics"],
  getCacheOptions(adminCacheConfig.getAdminStatistics),
);
