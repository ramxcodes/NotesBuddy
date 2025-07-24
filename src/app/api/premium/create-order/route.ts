import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  calculatePurchasePrice,
  createPremiumPurchase,
} from "@/dal/premium/query";
import { purchaseRequestSchema } from "@/dal/premium/types";
import {
  createRazorpayOrder,
  generateReceiptId,
  convertToSmallestUnit,
} from "@/lib/razorpay/config";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = purchaseRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { tier, discountCode, referralCode, useWalletBalance, walletAmount } =
      validationResult.data;

    // Calculate price with discounts (server-side verification)
    const priceCalculation = await calculatePurchasePrice(
      session.user.id,
      tier,
      discountCode,
      referralCode,
      useWalletBalance,
      walletAmount,
    );

    // Generate unique receipt ID
    const receipt = generateReceiptId(session.user.id, tier);

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: convertToSmallestUnit(priceCalculation.finalAmount), // Convert to paise
      currency: "INR",
      receipt,
      notes: {
        userId: session.user.id,
        tier: priceCalculation.tier,
        discountCode: discountCode || "",
        referralCode: referralCode || "",
      },
    });

    // Create purchase record in database
    const purchase = await createPremiumPurchase(
      session.user.id,
      priceCalculation,
      razorpayOrder.id,
      referralCode,
    );

    // Return order details for frontend
    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        priceCalculation,
        purchaseId: purchase.id,
      },
    });
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
