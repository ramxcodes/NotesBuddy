import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { PremiumTier } from "@prisma/client";
import {
  calculateUpgradePricing,
  getUserUpgradeContext,
} from "@/dal/premium/query";
import { getUserFullProfile } from "@/dal/user/onboarding/query";
import {
  createRazorpayOrder,
  generateReceiptId,
  convertToSmallestUnit,
} from "@/lib/razorpay/config";
import prisma from "@/lib/db/prisma";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tier, discountCode, useWalletBalance, walletAmount } = body;

    // Validate tier
    if (!tier || !["TIER_1", "TIER_2", "TIER_3"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier specified" },
        { status: 400 },
      );
    }

    // Get upgrade context and user profile
    const [upgradeContext, userProfile] = await Promise.all([
      getUserUpgradeContext(session.user.id),
      getUserFullProfile(session.user.id),
    ]);

    if (!upgradeContext) {
      return NextResponse.json(
        { error: "No active premium plan found for upgrade" },
        { status: 400 },
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 },
      );
    }

    // Calculate upgrade pricing
    const priceCalculation = await calculateUpgradePricing(
      session.user.id,
      tier as PremiumTier,
      discountCode,
      useWalletBalance,
      walletAmount,
    );

    // Create Razorpay order
    const orderAmount = convertToSmallestUnit(priceCalculation.finalAmount);

    let razorpayOrderId = null;

    if (orderAmount > 0) {
      try {
        const receiptId = generateReceiptId(session.user.id, `upgrade_${tier}`);

        const order = await createRazorpayOrder({
          amount: orderAmount,
          receipt: receiptId,
          notes: {
            userId: session.user.id,
            tier,
            isUpgrade: "true",
            currentTier: upgradeContext.currentTier,
          },
        });
        razorpayOrderId = order.id;
      } catch (razorpayError) {
        console.error("Razorpay order creation failed:", razorpayError);
        throw razorpayError;
      }
    }

    // Create premium purchase record
    const premiumPurchase = await prisma.premiumPurchase.create({
      data: {
        userId: session.user.id,
        razorpayOrderId,
        tier: tier as PremiumTier,
        duration: 180, // Same duration as original plans
        originalAmount: priceCalculation.originalAmount,
        discountAmount: priceCalculation.totalDiscount,
        finalAmount: priceCalculation.finalAmount,
        currency: "INR",
        paymentStatus: orderAmount === 0 ? "CAPTURED" : "PENDING",
        discountCode,

        // Academic details from user profile
        university: userProfile.university,
        degree: userProfile.degree,
        year: userProfile.year,
        semester: userProfile.semester,

        // Set expiry date to current plan's expiry date (upgrade doesn't extend time)
        expiryDate: upgradeContext.expiryDate,
        isActive: orderAmount === 0, // Activate immediately if no payment needed
        webhookProcessed: orderAmount === 0,
      },
    });

    // If no payment needed (fully discounted), update user's premium status immediately
    if (orderAmount === 0) {
      // Deactivate the old plan
      await prisma.premiumPurchase.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
          id: { not: premiumPurchase.id },
        },
        data: { isActive: false },
      });

      // Update user's current premium status
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentPremiumTier: tier as PremiumTier,
          premiumExpiryDate: upgradeContext.expiryDate,
          isPremiumActive: true,
        },
      });

      // Revalidate premium-related caches for immediate upgrades
      revalidateTag("user-premium-status");
      revalidateTag("user-purchase-history");
      revalidateTag("user-referral-status");
      revalidateTag("user-wallet-balance");
      revalidateTag("user-wallet-history");
    }

    return NextResponse.json({
      razorpayOrderId,
      amount: priceCalculation.finalAmount,
      currency: "INR",
      purchaseId: premiumPurchase.id,
    });
  } catch (error) {
    console.error("Error creating upgrade order:", error);

    return NextResponse.json(
      {
        error: "Failed to create upgrade order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
