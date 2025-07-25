import { z } from "zod";
import { DiscountType, PremiumTier } from "@prisma/client";

// Create Coupon Schema
export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Code must contain only uppercase letters and numbers",
    ),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  value: z.number().min(0, "Value must be positive"),
  maxDiscount: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  validFrom: z.date(),
  validUntil: z.date().optional(),
  maxUses: z.number().min(1).optional(),
  maxUsesPerUser: z.number().min(1).max(10).default(1),
  applicableTiers: z
    .array(z.nativeEnum(PremiumTier))
    .min(1, "Select at least one tier"),
});

export const updateCouponSchema = createCouponSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// API Response Types
export interface CouponListItem {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  currentUses: number;
  applicableTiers: PremiumTier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsageStats {
  totalUsage: number;
  uniqueUsers: number;
  totalDiscountGiven: number;
  recentUsages: {
    userId: string;
    userName: string;
    userEmail: string;
    discountAmount: number;
    usedAt: Date;
  }[];
}

export interface CouponDetailsResponse extends CouponListItem {
  usageStats: CouponUsageStats;
}

export interface CouponsListResponse {
  coupons: CouponListItem[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    perPage: number;
  };
}

// Filter and Sort Types
export type CouponSortOption =
  | "NEWEST"
  | "OLDEST"
  | "MOST_USED"
  | "LEAST_USED"
  | "HIGHEST_VALUE"
  | "LOWEST_VALUE";

export type CouponFilterOption =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "PERCENTAGE"
  | "FIXED_AMOUNT";

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: CouponSortOption;
  filter?: CouponFilterOption;
}
