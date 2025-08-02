"use server";

import { adminStatus } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  getAdminPremiumUsers,
  getAdminPremiumStats,
  grantPremiumToUser,
  extendPremiumSubscription,
  revokePremiumAccess,
  getPremiumUniversities,
  type AdminPremiumFilters,
  type AdminPremiumResponse,
  type AdminPremiumStats,
  type GrantPremiumParams,
} from "@/dal/premium/admin-query";
import {
  searchUsersForAdmin,
  getUserDetailsForAdmin,
} from "@/dal/user/admin/user-search-query";
import prisma from "@/lib/db/prisma";
import {
  PremiumTier,
  PaymentStatus,
  PaymentMethod,
  University,
  Degree,
  Year,
  Semester,
} from "@prisma/client";

export type {
  AdminPremiumFilters,
  AdminPremiumResponse,
  AdminPremiumStats,
  GrantPremiumParams,
} from "@/dal/premium/admin-query";

export async function searchUsersAction(query: string) {
  const isAdmin = await adminStatus();
  if (!isAdmin) return [];
  try {
    return await searchUsersForAdmin(query);
  } catch {
    return [];
  }
}

export async function getUserDetailsAction(userId: string) {
  const isAdmin = await adminStatus();
  if (!isAdmin) return null;
  try {
    return await getUserDetailsForAdmin(userId);
  } catch {
    return null;
  }
}

export async function getAdminPremiumUsersAction(
  filters: AdminPremiumFilters = {},
): Promise<AdminPremiumResponse | null> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return null;
  try {
    return await getAdminPremiumUsers(filters);
  } catch {
    return null;
  }
}

export async function getAdminPremiumStatsAction(): Promise<{
  success: boolean;
  data?: AdminPremiumStats;
  error?: string;
}> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };
  try {
    const stats = await getAdminPremiumStats();
    return { success: true, data: stats };
  } catch {
    return { success: false, error: "Failed to fetch premium statistics" };
  }
}

export async function grantPremiumAction(
  params: GrantPremiumParams,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };
  try {
    const success = await grantPremiumToUser(params);
    if (!success)
      return { success: false, error: "Failed to grant premium access" };
    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("user-premium-status");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to grant premium access" };
  }
}

export async function extendPremiumAction(
  userId: string,
  additionalDays: number,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };
  try {
    const success = await extendPremiumSubscription(userId, additionalDays);
    if (!success)
      return { success: false, error: "Failed to extend premium subscription" };
    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("user-premium-status");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to extend premium subscription" };
  }
}

export async function revokePremiumAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };
  try {
    const success = await revokePremiumAccess(userId);
    if (!success)
      return { success: false, error: "Failed to revoke premium access" };
    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("user-premium-status");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to revoke premium access" };
  }
}

// Comprehensive premium purchase creation interface
export interface CreatePremiumPurchaseParams {
  userId: string;
  // Razorpay specific fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Purchase details
  tier: PremiumTier;
  duration: number; // Duration in days
  originalAmount: string; // As string to avoid Decimal serialization issues
  discountAmount?: string;
  finalAmount: string;
  currency?: string;

  // Payment details
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  razorpayFee?: string;
  razorpayTax?: string;

  // Discount & Referral tracking
  discountCode?: string;
  referralCode?: string;
  referredByUserId?: string;

  // Academic details
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;

  // Timestamps
  purchaseDate?: Date;
  expiryDate: Date;
  isActive?: boolean;

  // Webhook & Processing
  webhookProcessed?: boolean;
  failureReason?: string;

  // Admin notes
  adminNotes?: string;
}

export interface UpdatePremiumPurchaseParams
  extends CreatePremiumPurchaseParams {
  purchaseId: string;
}

export async function createFullPremiumPurchaseAction(
  params: CreatePremiumPurchaseParams,
) {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const purchase = await prisma.premiumPurchase.create({
      data: {
        userId: params.userId,
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        tier: params.tier,
        duration: params.duration,
        originalAmount: params.originalAmount,
        discountAmount: params.discountAmount || "0",
        finalAmount: params.finalAmount,
        currency: params.currency || "INR",
        paymentStatus: params.paymentStatus,
        paymentMethod: params.paymentMethod,
        razorpayFee: params.razorpayFee,
        razorpayTax: params.razorpayTax,
        discountCode: params.discountCode,
        referralCode: params.referralCode,
        referredByUserId: params.referredByUserId,
        university: params.university,
        degree: params.degree,
        year: params.year,
        semester: params.semester,
        purchaseDate: params.purchaseDate || new Date(),
        expiryDate: params.expiryDate,
        isActive: params.isActive ?? true,
        webhookProcessed: params.webhookProcessed ?? true,
        failureReason: params.failureReason,
      },
    });

    // Update user's premium status if purchase is active
    if (params.isActive) {
      await prisma.user.update({
        where: { id: params.userId },
        data: {
          currentPremiumTier: params.tier,
          premiumExpiryDate: params.expiryDate,
          isPremiumActive: true,
        },
      });
    }

    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("admin-user-search");
    revalidateTag("admin-user-details");

    return { success: true, purchaseId: purchase.id };
  } catch (error) {
    console.error("Failed to create premium purchase:", error);
    return { success: false, error: "Failed to create premium purchase" };
  }
}

export async function updatePremiumPurchaseAction(
  params: UpdatePremiumPurchaseParams,
) {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.premiumPurchase.update({
      where: { id: params.purchaseId },
      data: {
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        tier: params.tier,
        duration: params.duration,
        originalAmount: params.originalAmount,
        discountAmount: params.discountAmount || "0",
        finalAmount: params.finalAmount,
        currency: params.currency || "INR",
        paymentStatus: params.paymentStatus,
        paymentMethod: params.paymentMethod,
        razorpayFee: params.razorpayFee,
        razorpayTax: params.razorpayTax,
        discountCode: params.discountCode,
        referralCode: params.referralCode,
        referredByUserId: params.referredByUserId,
        university: params.university,
        degree: params.degree,
        year: params.year,
        semester: params.semester,
        purchaseDate: params.purchaseDate || new Date(),
        expiryDate: params.expiryDate,
        isActive: params.isActive ?? true,
        webhookProcessed: params.webhookProcessed ?? true,
        failureReason: params.failureReason,
      },
    });

    // Update user's premium status if needed
    if (params.isActive) {
      await prisma.user.update({
        where: { id: params.userId },
        data: {
          currentPremiumTier: params.tier,
          premiumExpiryDate: params.expiryDate,
          isPremiumActive: true,
        },
      });
    }

    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("admin-user-search");
    revalidateTag("admin-user-details");

    return { success: true };
  } catch (error) {
    console.error("Failed to update premium purchase:", error);
    return { success: false, error: "Failed to update premium purchase" };
  }
}

export async function deletePremiumPurchaseAction(purchaseId: string) {
  const isAdmin = await adminStatus();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.premiumPurchase.delete({
      where: { id: purchaseId },
    });

    revalidateTag("admin-premium-users");
    revalidateTag("admin-premium-stats");
    revalidateTag("admin-user-search");
    revalidateTag("admin-user-details");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete premium purchase:", error);
    return { success: false, error: "Failed to delete premium purchase" };
  }
}

export async function getPremiumUniversitiesAction(): Promise<string[] | null> {
  const isAdmin = await adminStatus();
  if (!isAdmin) return null;
  try {
    return await getPremiumUniversities();
  } catch {
    return null;
  }
}
