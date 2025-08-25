import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updatePurchasePaymentStatus } from "@/dal/premium/query";
import { paymentVerificationSchema } from "@/dal/premium/types";
import {
  verifyRazorpaySignature,
  fetchRazorpayPayment,
  paymentStatusMapping,
} from "@/lib/razorpay/config";
import { headers } from "next/headers";
import { telegramLogger } from "@/utils/telegram-logger";

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
    const validationResult = paymentVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid verification data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      validationResult.data;

    // Critical: Verify payment signature for security
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isSignatureValid) {
      console.error("Invalid payment signature detected", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: session.user.id,
      });

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    // Fetch payment details from Razorpay for additional verification
    const payment = await fetchRazorpayPayment(razorpay_payment_id);

    // Verify payment belongs to the order
    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Payment order mismatch" },
        { status: 400 },
      );
    }

    // Map Razorpay status to our internal status
    const paymentStatus =
      paymentStatusMapping[payment.status as keyof typeof paymentStatusMapping];

    if (!paymentStatus) {
      return NextResponse.json(
        { error: "Unknown payment status" },
        { status: 400 },
      );
    }

    // Update purchase record with payment details
    const updatedPurchase = await updatePurchasePaymentStatus(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus,
      payment.method,
      payment.error_description || undefined,
    );

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: paymentStatus,
        isActive: updatedPurchase.isActive,
        tier: updatedPurchase.tier,
        expiryDate: updatedPurchase.expiryDate,
      },
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Premium Verify Payment",
    );
    return NextResponse.json(
      {
        error: "Payment verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
