"use server";

import { adminStatus } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  getCoupons,
  getCouponDetails,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  checkCouponCodeExists,
} from "@/dal/coupon/query";
import {
  createCouponSchema,
  updateCouponSchema,
  type CreateCouponInput,
  type UpdateCouponInput,
  type GetCouponsParams,
  type CouponsListResponse,
  type CouponDetailsResponse,
  type CouponListItem,
} from "@/dal/coupon/types";

// Get all coupons
export async function getCouponsAction(
  params: GetCouponsParams,
): Promise<CouponsListResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getCoupons(params);
    return result;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return null;
  }
}

// Get coupon details
export async function getCouponDetailsAction(
  id: string,
): Promise<CouponDetailsResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getCouponDetails(id);
    return result;
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    return null;
  }
}

// Create new coupon
export async function createCouponAction(
  data: CreateCouponInput,
): Promise<{ success: boolean; error?: string; coupon?: CouponListItem }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate input
    const validatedData = createCouponSchema.parse(data);

    // Check if code already exists
    const codeExists = await checkCouponCodeExists(validatedData.code);
    if (codeExists) {
      return { success: false, error: "Coupon code already exists" };
    }

    // Validate date range
    if (
      validatedData.validUntil &&
      validatedData.validUntil <= validatedData.validFrom
    ) {
      return {
        success: false,
        error: "Valid until date must be after valid from date",
      };
    }

    // Validate discount value based on type
    if (validatedData.discountType === "PERCENTAGE") {
      if (validatedData.value > 100) {
        return {
          success: false,
          error: "Percentage discount cannot exceed 100%",
        };
      }
    }

    const coupon = await createCoupon(validatedData);

    revalidateTag("admin-coupons");

    return { success: true, coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create coupon" };
  }
}

// Update coupon
export async function updateCouponAction(
  data: UpdateCouponInput,
): Promise<{ success: boolean; error?: string; coupon?: CouponListItem }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate input
    const validatedData = updateCouponSchema.parse(data);

    // Check if code already exists (excluding current coupon)
    if (validatedData.code) {
      const codeExists = await checkCouponCodeExists(
        validatedData.code,
        validatedData.id,
      );
      if (codeExists) {
        return { success: false, error: "Coupon code already exists" };
      }
    }

    // Validate date range
    if (
      validatedData.validFrom &&
      validatedData.validUntil &&
      validatedData.validUntil <= validatedData.validFrom
    ) {
      return {
        success: false,
        error: "Valid until date must be after valid from date",
      };
    }

    // Validate discount value based on type
    if (
      validatedData.discountType === "PERCENTAGE" &&
      validatedData.value &&
      validatedData.value > 100
    ) {
      return {
        success: false,
        error: "Percentage discount cannot exceed 100%",
      };
    }

    const coupon = await updateCoupon(validatedData);

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    revalidateTag("admin-coupons");

    return { success: true, coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update coupon" };
  }
}

// Delete coupon
export async function deleteCouponAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteCoupon(id);

    if (!deleted) {
      return { success: false, error: "Coupon not found or already deleted" };
    }

    revalidateTag("admin-coupons");

    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Toggle coupon active status
export async function toggleCouponStatusAction(
  id: string,
): Promise<{ success: boolean; error?: string; isActive?: boolean }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current coupon to toggle status
    const currentCoupon = await getCouponDetails(id);

    if (!currentCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    const updatedCoupon = await updateCoupon({
      id,
      isActive: !currentCoupon.isActive,
    });

    if (!updatedCoupon) {
      return { success: false, error: "Failed to update coupon status" };
    }

    revalidateTag("admin-coupons");

    return { success: true, isActive: updatedCoupon.isActive };
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return { success: false, error: "Failed to toggle coupon status" };
  }
}
