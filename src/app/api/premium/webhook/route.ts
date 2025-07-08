import { NextRequest, NextResponse } from "next/server";
import { updatePurchasePaymentStatus } from "@/dal/premium/query";
import {
  verifyWebhookSignature,
  paymentStatusMapping,
  fetchRazorpayPayment,
  RazorpayPayment,
} from "@/lib/razorpay/config";

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

if (!WEBHOOK_SECRET) {
  console.warn("RAZORPAY_WEBHOOK_SECRET environment variable is not set");
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature for security
    if (
      WEBHOOK_SECRET &&
      !verifyWebhookSignature(body, signature, WEBHOOK_SECRET)
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const webhookData = JSON.parse(body);
    const { event, payload } = webhookData;

    console.log("Webhook received:", {
      event,
      entityId: payload?.payment?.entity?.id,
    });

    // Handle payment events
    if (event === "payment.captured") {
      await handlePaymentCaptured(payload.payment.entity);
    } else if (event === "payment.failed") {
      await handlePaymentFailed(payload.payment.entity);
    } else if (event === "payment.authorized") {
      await handlePaymentAuthorized(payload.payment.entity);
    } else {
      console.log("Unhandled webhook event:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentCaptured(payment: RazorpayPayment) {
  try {
    console.log("Processing payment captured:", payment.id);

    // Fetch full payment details for verification
    const fullPayment = await fetchRazorpayPayment(payment.id);

    const paymentStatus =
      paymentStatusMapping[
        fullPayment.status as keyof typeof paymentStatusMapping
      ];

    await updatePurchasePaymentStatus(
      fullPayment.order_id,
      fullPayment.id,
      "", // Signature not available in webhook
      paymentStatus,
      fullPayment.method,
      fullPayment.error_description || undefined,
    );

    console.log("Payment captured successfully processed:", payment.id);
  } catch (error: unknown) {
    console.error("Error handling payment captured:", error);
    throw error;
  }
}

async function handlePaymentFailed(payment: RazorpayPayment) {
  try {
    console.log("Processing payment failed:", payment.id);

    const fullPayment = await fetchRazorpayPayment(payment.id);
    const paymentStatus =
      paymentStatusMapping[
        fullPayment.status as keyof typeof paymentStatusMapping
      ];

    await updatePurchasePaymentStatus(
      fullPayment.order_id,
      fullPayment.id,
      "",
      paymentStatus,
      fullPayment.method,
      fullPayment.error_description || undefined,
    );

    console.log("Payment failure successfully processed:", payment.id);
  } catch (error: unknown) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

async function handlePaymentAuthorized(payment: RazorpayPayment) {
  try {
    console.log("Processing payment authorized:", payment.id);

    const fullPayment = await fetchRazorpayPayment(payment.id);
    const paymentStatus =
      paymentStatusMapping[
        fullPayment.status as keyof typeof paymentStatusMapping
      ];

    await updatePurchasePaymentStatus(
      fullPayment.order_id,
      fullPayment.id,
      "",
      paymentStatus,
      fullPayment.method,
      fullPayment.error_description || undefined,
    );

    console.log("Payment authorization successfully processed:", payment.id);
  } catch (error: unknown) {
    console.error("Error handling payment authorized:", error);
    throw error;
  }
}
