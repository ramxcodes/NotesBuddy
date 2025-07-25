import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { adminCacheConfig, getCacheOptions } from "@/cache/cache";
import {
  type CouponListItem,
  type CouponsListResponse,
  type CouponDetailsResponse,
  type CouponUsageStats,
  type GetCouponsParams,
  type CreateCouponInput,
  type UpdateCouponInput,
} from "./types";
import { Prisma, PremiumTier } from "@prisma/client";

// Get all coupons with pagination and filters (without cache for real-time updates)
async function getCouponsInternal({
  page = 1,
  limit = 10,
  search,
  sort = "NEWEST",
  filter = "ALL",
}: GetCouponsParams): Promise<CouponsListResponse> {
  const offset = (page - 1) * limit;

  // Build where clause
  const where: Prisma.DiscountCouponWhereInput = {};

  // Add search filter
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Add status filter
  switch (filter) {
    case "ACTIVE":
      where.isActive = true;
      where.OR = [{ validUntil: null }, { validUntil: { gte: new Date() } }];
      break;
    case "INACTIVE":
      where.isActive = false;
      break;
    case "EXPIRED":
      where.validUntil = { lt: new Date() };
      break;
    case "PERCENTAGE":
      where.discountType = "PERCENTAGE";
      break;
    case "FIXED_AMOUNT":
      where.discountType = "FIXED_AMOUNT";
      break;
  }

  // Build order by clause
  const orderBy: Prisma.DiscountCouponOrderByWithRelationInput = {};

  switch (sort) {
    case "NEWEST":
      orderBy.createdAt = "desc";
      break;
    case "OLDEST":
      orderBy.createdAt = "asc";
      break;
    case "MOST_USED":
      orderBy.currentUses = "desc";
      break;
    case "LEAST_USED":
      orderBy.currentUses = "asc";
      break;
    case "HIGHEST_VALUE":
      orderBy.value = "desc";
      break;
    case "LOWEST_VALUE":
      orderBy.value = "asc";
      break;
  }

  // Get coupons and total count
  const [coupons, total] = await Promise.all([
    prisma.discountCoupon.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.discountCoupon.count({ where }),
  ]);

  // Transform to response format
  const transformedCoupons: CouponListItem[] = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value.toNumber(),
    maxDiscount: coupon.maxDiscount?.toNumber() || null,
    minOrderAmount: coupon.minOrderAmount?.toNumber() || null,
    isActive: coupon.isActive,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    currentUses: coupon.currentUses,
    applicableTiers: coupon.applicableTiers,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  }));

  return {
    coupons: transformedCoupons,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      perPage: limit,
    },
  };
}

// Cached wrapper for getCoupons (10 minutes cache)
export const getCoupons = unstable_cache(
  getCouponsInternal,
  ["admin-coupons"],
  getCacheOptions(adminCacheConfig.getAdminCoupons),
);

// Get coupon details with usage stats (internal function)
async function getCouponDetailsInternal(
  id: string,
): Promise<CouponDetailsResponse | null> {
  const coupon = await prisma.discountCoupon.findUnique({
    where: { id },
  });

  if (!coupon) return null;

  // Get usage statistics
  const usageStats = await getCouponUsageStats(coupon.code);

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value.toNumber(),
    maxDiscount: coupon.maxDiscount?.toNumber() || null,
    minOrderAmount: coupon.minOrderAmount?.toNumber() || null,
    isActive: coupon.isActive,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    currentUses: coupon.currentUses,
    applicableTiers: coupon.applicableTiers,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
    usageStats,
  };
}

// Cached wrapper for getCouponDetails (10 minutes cache)
export const getCouponDetails = unstable_cache(
  getCouponDetailsInternal,
  ["coupon-details"],
  getCacheOptions(adminCacheConfig.getCouponDetails),
);

// Get coupon usage statistics
export async function getCouponUsageStats(
  code: string,
): Promise<CouponUsageStats> {
  // Get all successful purchases with this discount code
  const purchases = await prisma.premiumPurchase.findMany({
    where: {
      discountCode: code,
      paymentStatus: "CAPTURED",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      purchaseDate: "desc",
    },
    take: 10, // Last 10 usages
  });

  const totalUsage = purchases.length;
  const uniqueUsers = new Set(purchases.map((p) => p.userId)).size;
  const totalDiscountGiven = purchases.reduce(
    (sum, purchase) => sum + purchase.discountAmount.toNumber(),
    0,
  );

  const recentUsages = purchases.map((purchase) => ({
    userId: purchase.user.id,
    userName: purchase.user.name,
    userEmail: purchase.user.email,
    discountAmount: purchase.discountAmount.toNumber(),
    usedAt: purchase.purchaseDate,
  }));

  return {
    totalUsage,
    uniqueUsers,
    totalDiscountGiven,
    recentUsages,
  };
}

// Create new coupon
export async function createCoupon(
  data: CreateCouponInput,
): Promise<CouponListItem> {
  const coupon = await prisma.discountCoupon.create({
    data: {
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      value: data.value,
      maxDiscount: data.maxDiscount,
      minOrderAmount: data.minOrderAmount,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      maxUses: data.maxUses,
      maxUsesPerUser: data.maxUsesPerUser,
      applicableTiers: data.applicableTiers,
    },
  });

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value.toNumber(),
    maxDiscount: coupon.maxDiscount?.toNumber() || null,
    minOrderAmount: coupon.minOrderAmount?.toNumber() || null,
    isActive: coupon.isActive,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    currentUses: coupon.currentUses,
    applicableTiers: coupon.applicableTiers,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
}

// Update coupon
export async function updateCoupon(
  data: UpdateCouponInput,
): Promise<CouponListItem | null> {
  const { id, ...updateData } = data;

  const coupon = await prisma.discountCoupon.update({
    where: { id },
    data: {
      ...updateData,
      value: updateData.value ? updateData.value : undefined,
      maxDiscount:
        updateData.maxDiscount !== undefined
          ? updateData.maxDiscount
          : undefined,
      minOrderAmount:
        updateData.minOrderAmount !== undefined
          ? updateData.minOrderAmount
          : undefined,
    },
  });

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value.toNumber(),
    maxDiscount: coupon.maxDiscount?.toNumber() || null,
    minOrderAmount: coupon.minOrderAmount?.toNumber() || null,
    isActive: coupon.isActive,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    currentUses: coupon.currentUses,
    applicableTiers: coupon.applicableTiers,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
}

// Delete coupon
export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await prisma.discountCoupon.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

// Check if coupon code already exists
export async function checkCouponCodeExists(
  code: string,
  excludeId?: string,
): Promise<boolean> {
  const where: Prisma.DiscountCouponWhereInput = { code };

  if (excludeId) {
    where.NOT = { id: excludeId };
  }

  const existingCoupon = await prisma.discountCoupon.findFirst({ where });
  return !!existingCoupon;
}

// Validate coupon for use
export async function validateCouponForPurchase(
  code: string,
  userId: string,
  tier: PremiumTier,
  orderAmount: number,
): Promise<{ valid: boolean; message: string; coupon?: CouponListItem }> {
  const coupon = await prisma.discountCoupon.findFirst({
    where: {
      code,
      isActive: true,
      validFrom: { lte: new Date() },
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      applicableTiers: {
        has: tier,
      },
    },
  });

  if (!coupon) {
    return { valid: false, message: "Invalid or expired coupon code" };
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount.toNumber()) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount.toNumber()} required`,
    };
  }

  // Check usage limits
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, message: "Coupon usage limit reached" };
  }

  // Check user-specific usage limits
  if (coupon.maxUsesPerUser) {
    const userUsageCount = await prisma.premiumPurchase.count({
      where: {
        userId,
        discountCode: code,
        paymentStatus: "CAPTURED",
      },
    });

    if (userUsageCount >= coupon.maxUsesPerUser) {
      return { valid: false, message: "You have already used this coupon" };
    }
  }

  return {
    valid: true,
    message: "Coupon is valid",
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      value: coupon.value.toNumber(),
      maxDiscount: coupon.maxDiscount?.toNumber() || null,
      minOrderAmount: coupon.minOrderAmount?.toNumber() || null,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      maxUses: coupon.maxUses,
      maxUsesPerUser: coupon.maxUsesPerUser,
      currentUses: coupon.currentUses,
      applicableTiers: coupon.applicableTiers,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    },
  };
}
