import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay Configuration
export const razorpayConfig = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  keySecret: process.env.RAZORPAY_SECRET_ID as string,
  currency: "INR",
  timeout: 10 * 60 * 1000, // 10 minutes
};

if (
  !razorpayConfig.keyId ||
  !razorpayConfig.keySecret ||
  razorpayConfig.keyId.trim() === "" ||
  razorpayConfig.keySecret.trim() === ""
) {
  console.warn(
    "Razorpay configuration is missing. Please check environment variables. Some features may not work properly.",
  );
}

// Initialize Razorpay instance (server-side only)
export const razorpayInstance = (() => {
  if (
    !razorpayConfig.keyId ||
    !razorpayConfig.keySecret ||
    razorpayConfig.keyId.trim() === "" ||
    razorpayConfig.keySecret.trim() === ""
  ) {
    return null; // Return null if credentials are missing
  }

  return new Razorpay({
    key_id: razorpayConfig.keyId,
    key_secret: razorpayConfig.keySecret,
  });
})();

// Types for Razorpay API responses
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: "card" | "netbanking" | "wallet" | "emi" | "upi";
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: Record<string, string>;
  created_at: number;
}

export interface CreateOrderOptions {
  amount: number; // Amount in smallest currency unit (paise for INR)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
}

// Create Razorpay Order
export async function createRazorpayOrder(
  options: CreateOrderOptions,
): Promise<RazorpayOrder> {
  try {
    if (!razorpayInstance) {
      throw new Error(
        "Razorpay is not configured. Please check environment variables.",
      );
    }

    // Validate required parameters
    if (!options.amount || options.amount <= 0) {
      throw new Error(`Invalid order amount: ${options.amount}`);
    }

    if (!options.receipt || options.receipt.trim() === "") {
      throw new Error("Receipt ID is required");
    }

    const order = await razorpayInstance.orders.create({
      amount: options.amount,
      currency: options.currency || razorpayConfig.currency,
      receipt: options.receipt,
      notes: options.notes || {},
      partial_payment: options.partial_payment || false,
    });

    return order as RazorpayOrder;
  } catch (error: unknown) {
    console.error("Razorpay order creation failed:", error);

    // Preserve the original error for better debugging
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Failed to create Razorpay order: ${JSON.stringify(error)}`,
      );
    }
  }
}

// Fetch Razorpay Order
export async function fetchRazorpayOrder(
  orderId: string,
): Promise<RazorpayOrder> {
  try {
    if (!razorpayInstance) {
      throw new Error(
        "Razorpay is not configured. Please check environment variables.",
      );
    }

    const order = await razorpayInstance.orders.fetch(orderId);
    return order as RazorpayOrder;
  } catch (error: unknown) {
    console.error("Razorpay order fetch failed:", error);
    throw new Error(
      `Failed to fetch Razorpay order: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Fetch Razorpay Payment
export async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment> {
  try {
    if (!razorpayInstance) {
      throw new Error(
        "Razorpay is not configured. Please check environment variables.",
      );
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment as unknown as RazorpayPayment;
  } catch (error: unknown) {
    console.error("Razorpay payment fetch failed:", error);
    throw new Error(
      `Failed to fetch Razorpay payment: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Verify Payment Signature (Critical for security)
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayConfig.keySecret)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  } catch (error: unknown) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

// Verify Webhook Signature (For webhook authentication)
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error: unknown) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

// Generate unique receipt ID (max 40 characters for Razorpay)
export function generateReceiptId(userId: string, tier: string): string {
  const timestamp = Date.now().toString(36); // Base36 is more compact
  const random = Math.random().toString(36).substring(2, 6); // 4 chars
  const userIdShort = userId.substring(0, 8); // 8 chars

  // Simplify tier names to be shorter
  const tierMap: Record<string, string> = {
    TIER_1: "T1",
    TIER_2: "T2",
    TIER_3: "T3",
    upgrade_TIER_1: "UP1",
    upgrade_TIER_2: "UP2",
    upgrade_TIER_3: "UP3",
  };

  const tierShort = tierMap[tier] || tier.substring(0, 4);

  // Format: tierShort_userIdShort_timestamp_random
  const receiptId = `${tierShort}_${userIdShort}_${timestamp}_${random}`;

  // Ensure it's under 40 characters (should be around 20-25 chars)
  return receiptId.length > 40 ? receiptId.substring(0, 40) : receiptId;
}

// Convert amount to smallest currency unit (paise for INR)
export function convertToSmallestUnit(
  amount: number,
  currency: string = "INR",
): number {
  const multipliers: Record<string, number> = {
    INR: 100, // 1 INR = 100 paise
    USD: 100, // 1 USD = 100 cents
    EUR: 100, // 1 EUR = 100 cents
  };

  return Math.round(amount * (multipliers[currency] || 100));
}

// Convert from smallest currency unit to major unit
export function convertFromSmallestUnit(
  amount: number,
  currency: string = "INR",
): number {
  const divisors: Record<string, number> = {
    INR: 100,
    USD: 100,
    EUR: 100,
  };

  return amount / (divisors[currency] || 100);
}

// Payment status mapping
export const paymentStatusMapping = {
  created: "PENDING",
  authorized: "AUTHORIZED",
  captured: "CAPTURED",
  refunded: "REFUNDED",
  failed: "FAILED",
} as const;

// Payment method mapping
export const paymentMethodMapping = {
  card: "CARD",
  netbanking: "NETBANKING",
  wallet: "WALLET",
  emi: "EMI",
  upi: "UPI",
  paylater: "PAYLATER",
} as const;

export type RazorpayStatus = keyof typeof paymentStatusMapping;
export type PrismaPaymentStatus = (typeof paymentStatusMapping)[RazorpayStatus];
export type RazorpayPaymentMethod = keyof typeof paymentMethodMapping;
export type PrismaPaymentMethod =
  (typeof paymentMethodMapping)[RazorpayPaymentMethod];
