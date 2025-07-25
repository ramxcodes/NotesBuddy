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

  // Build where clause
  const whereClause: Prisma.UserWhereInput = {};

  // Search functionality
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

  // Filter by premium status
  if (filter === "PREMIUM") {
    whereClause.isPremiumActive = true;
  } else if (filter === "FREE") {
    whereClause.isPremiumActive = false;
  } else if (filter === "BLOCKED") {
    whereClause.isBlocked = true;
  }

  // Build order by clause
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
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Transform users data to include deviceCount
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
