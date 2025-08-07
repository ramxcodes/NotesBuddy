import { z } from "zod";
import { PremiumTier } from "@prisma/client";

export const TIER_CONFIG = {
  TIER_1: {
    price: 99,
    duration: 180,
    features: [
      "Access to one shots",
      "Access to all quizzes",
      "Access to all premium notes",
      "6 Month Access",
    ],
    title: "Basic Plan",
    description: "Perfect for MST-1",
  },
  TIER_2: {
    price: 199,
    duration: 180,
    features: [
      "Access to one shots",
      "Access to all quizzes",
      "Access to all premium notes",
      "Access to all notes",
      "Access to all flashcards",
      "Access to PYQs",
      "Access to MST-1 & MST-2",
      "6 Month Access",
    ],
    title: "Premium Plan",
    description: "Great for focused learning",
  },
  TIER_3: {
    price: 299,
    duration: 180,
    features: [
      "Access to one shots",
      "Access to all quizzes",
      "Access to all premium notes",
      "Access to all notes",
      "Access to all flashcards",
      "Access to PYQs",
      "Access to MST-1 & MST-2",
      "Access to Video Materials",
      "Handwritten Notes (if available)",
      "6 Month Access",
    ],
    title: "Pro Plan",
    description: "Complete academic solution",
  },
} as const;

export const premiumTierSchema = z.enum(["TIER_1", "TIER_2", "TIER_3"]);

export const discountCodeSchema = z
  .string()
  .min(1, "Code cannot be empty")
  .max(20, "Code too long")
  .regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only")
  .optional();

export const purchaseRequestSchema = z.object({
  tier: premiumTierSchema,
  discountCode: discountCodeSchema,
  referralCode: discountCodeSchema,
  useWalletBalance: z.boolean().optional(),
  walletAmount: z.number().min(0).optional(),
});

export const razorpayOrderSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  receipt: z.string(),
});

export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Type Exports
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
export type RazorpayOrder = z.infer<typeof razorpayOrderSchema>;
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;

export interface TierDetails {
  tier: PremiumTier;
  price: number;
  duration: number;
  features: string[];
  title: string;
  description: string;
}

export interface PriceCalculation {
  tier: PremiumTier;
  originalAmount: number;
  discounts: DiscountApplication[];
  totalDiscount: number;
  finalAmount: number;
  currency: string;
}

export interface DiscountApplication {
  type: "COUPON" | "REFERRAL" | "WALLET";
  code: string;
  amount: number;
  description: string;
}

export interface UserPremiumStatus {
  isActive: boolean;
  tier: PremiumTier | null;
  expiryDate: Date | string | null;
  daysRemaining: number | null;
}

export interface UserAccessStatus {
  canAccess: boolean;
  reason?: "NO_PREMIUM" | "INSUFFICIENT_TIER" | "ACADEMIC_MISMATCH";
  userStatus: {
    hasPremium: boolean;
    tier: PremiumTier | null;
    university: string | null;
    degree: string | null;
    year: string | null;
    semester: string | null;
    expiryDate: Date | string | null;
    daysRemaining: number | null;
  };
  noteRequirements: {
    tier: PremiumTier;
    university: string | null;
    degree: string | null;
    year: string | null;
    semester: string | null;
  };
  mismatches: Array<{
    field: "university" | "degree" | "year" | "semester";
    userValue: string;
    requiredValue: string;
  }>;
}

// Helper Functions
export const getTierConfig = (tier: PremiumTier): TierDetails => {
  return {
    tier,
    ...TIER_CONFIG[tier],
    features: [...TIER_CONFIG[tier].features],
  };
};

export const getAllTierConfigs = (): TierDetails[] => {
  return Object.entries(TIER_CONFIG).map(([tier, config]) => ({
    tier: tier as PremiumTier,
    ...config,
    features: [...config.features],
  }));
};

export const calculateDaysRemaining = (expiryDate: Date | string): number => {
  const now = new Date();
  const expiry =
    typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const diffTime = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export interface UpgradeOption {
  tier: PremiumTier;
  title: string;
  description: string;
  features: string[];
  price: number;
  duration: number;
  upgradePrice?: number;
  isUpgrade: boolean;
  currentTier?: PremiumTier;
}

export interface UpgradeContext {
  currentTier: PremiumTier;
  university: string;
  degree: string;
  year: string;
  semester: string;
  expiryDate: Date;
  daysRemaining: number;
}

export const getUpgradeOptions = (
  currentTier: PremiumTier,
): UpgradeOption[] => {
  const allTiers = getAllTierConfigs();

  const upgradeableTiers = allTiers.filter((tier) => {
    if (currentTier === "TIER_1")
      return tier.tier === "TIER_2" || tier.tier === "TIER_3";
    if (currentTier === "TIER_2") return tier.tier === "TIER_3";
    return false;
  });

  return upgradeableTiers.map((tier) => ({
    ...tier,
    isUpgrade: true,
    currentTier,
  }));
};

export const calculateUpgradePrice = (
  currentTier: PremiumTier,
  targetTier: PremiumTier,
  daysRemaining: number,
): number => {
  const currentConfig = getTierConfig(currentTier);
  const targetConfig = getTierConfig(targetTier);

  const dailyRate = currentConfig.price / currentConfig.duration;
  const remainingCredit = dailyRate * daysRemaining;

  const upgradePrice = Math.max(0, targetConfig.price - remainingCredit);

  return Math.round(upgradePrice);
};

export const isUpgradeTier = (
  currentTier: PremiumTier,
  targetTier: PremiumTier,
): boolean => {
  const tierHierarchy = { TIER_1: 1, TIER_2: 2, TIER_3: 3 };
  return tierHierarchy[targetTier] > tierHierarchy[currentTier];
};
