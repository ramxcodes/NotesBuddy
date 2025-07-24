import { z } from "zod";
import { DiscountType } from "@prisma/client";

// Referral configuration
export const REFERRAL_CONFIG = {
  REWARD_AMOUNT: 10, // ₹10 for both referrer and referee
  DISCOUNT_TYPE: "FIXED_AMOUNT" as const,
  CODE_LENGTH: 6, // 6 random characters after name
} as const;

// Referral validation schemas
export const generateReferralCodeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const validateReferralCodeSchema = z.object({
  code: z.string().min(1, "Referral code is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const applyReferralCodeSchema = z.object({
  code: z.string().min(1, "Referral code is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Type definitions
export interface ReferralStatus {
  hasReferralCode: boolean;
  referralCode: string | null;
  totalReferrals: number;
  totalEarnings: number;
  walletBalance: number;
  referrals: ReferralDetails[];
}

export interface ReferralDetails {
  id: string;
  refereeUserId: string;
  refereeName: string;
  refereeEmail: string;
  rewardAmount: number;
  isProcessed: boolean;
  createdAt: Date;
  purchaseId: string;
  purchaseTier: string;
  purchaseAmount: number;
}

export interface ReferralValidation {
  isValid: boolean;
  canUse: boolean;
  message: string;
  discountAmount?: number;
  referrerInfo?: {
    name: string;
    email: string;
  };
}

export interface ReferralCodeGeneration {
  success: boolean;
  referralCode?: string;
  message: string;
}

export interface ReferralReward {
  id: string;
  referrerUserId: string;
  refereeUserId: string;
  purchaseId: string;
  rewardAmount: number;
  rewardType: DiscountType;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
  referrer: {
    name: string;
    email: string;
  };
  referee: {
    name: string;
    email: string;
  };
  purchase: {
    tier: string;
    finalAmount: number;
  };
}

// Form schemas
export type GenerateReferralCodeData = z.infer<
  typeof generateReferralCodeSchema
>;
export type ValidateReferralCodeData = z.infer<
  typeof validateReferralCodeSchema
>;
export type ApplyReferralCodeData = z.infer<typeof applyReferralCodeSchema>;
