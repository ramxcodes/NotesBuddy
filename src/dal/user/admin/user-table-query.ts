import prisma from "@/lib/db/prisma";
import {
  AdminUser,
  AdminUsersResponse,
  SortOption,
  FilterOption,
} from "./user-table-types";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { adminCacheConfig } from "@/cache/admin";

interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  sort: SortOption;
  filter: FilterOption;
}

const _getAdminUsers = async ({
  page,
  limit,
  search,
  sort,
  filter,
}: GetUsersParams): Promise<AdminUsersResponse> => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.UserWhereInput = {};

  if (search && search.trim()) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      {
        profile: {
          phoneNumber: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  if (filter === "PREMIUM") {
    whereClause.isPremiumActive = true;
  } else if (filter === "FREE") {
    whereClause.isPremiumActive = false;
  } else if (filter === "BLOCKED") {
    whereClause.isBlocked = true;
  } else if (filter === "HAD_PREMIUM") {
    whereClause.isPremiumActive = false;
    whereClause.premiumPurchases = {
      some: {},
    };
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = {};
  switch (sort) {
    case "A_TO_Z":
      orderBy = { name: "asc" };
      break;
    case "Z_TO_A":
      orderBy = { name: "desc" };
      break;
    case "NEW_USERS":
      orderBy = { createdAt: "desc" };
      break;
    case "OLD_USERS":
      orderBy = { createdAt: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isBlocked: true,
        isPremiumActive: true,
        currentPremiumTier: true,
        createdAt: true,
        _count: {
          select: {
            deviceFingerprints: {
              where: {
                isActive: true,
              },
            },
          },
        },
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
          select: {
            id: true,
            tier: true,
            isActive: true,
            expiryDate: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Limit to last 5 purchases
        },
        deviceFingerprints: {
          select: {
            id: true,
            deviceLabel: true,
            fingerprint: true,
            lastUsedAt: true,
            isActive: true,
          },
          orderBy: {
            lastUsedAt: "desc",
          },
          take: 5, // Limit to last 5 devices
        },
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const transformedUsers: AdminUser[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isBlocked: user.isBlocked,
    isPremiumActive: user.isPremiumActive,
    currentPremiumTier: user.currentPremiumTier,
    createdAt: user.createdAt,
    deviceCount: user._count.deviceFingerprints,
    profile: user.profile,
    premiumHistory: user.premiumPurchases.map((purchase) => ({
      id: purchase.id,
      tier: purchase.tier,
      isActive: purchase.isActive,
      expiryDate: purchase.expiryDate,
      createdAt: purchase.createdAt,
    })),
    deviceDetails: user.deviceFingerprints.map((device) => ({
      id: device.id,
      deviceLabel: device.deviceLabel,
      fingerprint: (device.fingerprint as Record<string, unknown>) || {},
      lastUsedAt: device.lastUsedAt,
      isActive: device.isActive,
    })),
  }));

  return {
    users: transformedUsers,
    totalCount,
    totalPages,
    currentPage: page,
  };
};

export const getAdminUsers = unstable_cache(
  _getAdminUsers,
  ["admin-users"],
  adminCacheConfig.getAdminUsers,
);

/**
 * Delete a user and all their related data
 * This function will cascade delete all related records
 */
export async function deleteUserAndAllRecords(
  userId: string,
): Promise<boolean> {
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.chatMessage.deleteMany({
          where: {
            chat: {
              userId: userId,
            },
          },
        });
        await tx.chat.deleteMany({
          where: { userId: userId },
        });

        await tx.quizAnswer.deleteMany({
          where: {
            attempt: {
              userId: userId,
            },
          },
        });

        await tx.quizAttempt.deleteMany({
          where: { userId: userId },
        });

        // Delete flashcard visits
        await tx.flashcardVisit.deleteMany({
          where: { userId: userId },
        });

        await tx.referralReward.deleteMany({
          where: {
            OR: [{ referrerUserId: userId }, { refereeUserId: userId }],
          },
        });

        await tx.premiumPurchase.updateMany({
          where: { referredByUserId: userId },
          data: { referredByUserId: null },
        });

        await tx.purchaseDiscount.deleteMany({
          where: {
            purchase: {
              userId: userId,
            },
          },
        });

        await tx.premiumPurchase.deleteMany({
          where: { userId: userId },
        });

        await tx.report.deleteMany({
          where: { userId: userId },
        });

        await tx.deviceFingerprint.deleteMany({
          where: { userId: userId },
        });

        await tx.userProfile.deleteMany({
          where: { userId: userId },
        });

        await tx.account.deleteMany({
          where: { userId: userId },
        });

        await tx.session.deleteMany({
          where: { userId: userId },
        });

        await tx.user.delete({
          where: { id: userId },
        });
      },
      {
        timeout: 30000,
        isolationLevel: "ReadCommitted",
      },
    );

    return true;
  } catch (error) {
    console.error("Error deleting user and all records:", error);
    return false;
  }
}
