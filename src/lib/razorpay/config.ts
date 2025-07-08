import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay Configuration
export const razorpayConfig = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  keySecret: process.env.RAZORPAY_SECRET_ID as string,
  currency: "INR",
  timeout: 10 * 60 * 1000, // 10 minutes
};

if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
  throw new Error(
    "Razorpay configuration is missing. Please check environment variables.",
  );
}

// Initialize Razorpay instance (server-side only)
export const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.keyId,
  key_secret: razorpayConfig.keySecret,
});

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
    throw new Error(
      `Failed to create Razorpay order: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Fetch Razorpay Order
export async function fetchRazorpayOrder(
  orderId: string,
): Promise<RazorpayOrder> {
  try {
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

// Generate unique receipt ID
export function generateReceiptId(userId: string, tier: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${tier}_${userId.substring(0, 8)}_${timestamp}_${random}`;
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
