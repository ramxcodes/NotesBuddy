"use server";

import { getSession } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  generateUserReferralCode,
  validateReferralCode,
  getUserReferralStatus,
} from "./query";
import {
  generateReferralCodeSchema,
  validateReferralCodeSchema,
  type ReferralCodeGeneration,
  type ReferralValidation,
  type ReferralStatus,
} from "./types";
import { telegramLogger } from "@/utils/telegram-logger";

// Generate referral code action
export async function handleGenerateReferralCode(): Promise<ReferralCodeGeneration> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
      };
    }

    // Validate input
    const validationResult = generateReferralCodeSchema.safeParse({
      userId: session.user.id,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: "Invalid request data",
      };
    }

    const result = await generateUserReferralCode(session.user.id);

    // Revalidate cache if successful
    if (result.success) {
      revalidateTag("user-referral-status");
    }

    return result;
  } catch (error) {
    console.error("Error in handleGenerateReferralCode:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Referral Generate Code",
    );
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Validate referral code action
export async function handleValidateReferralCode(
  code: string,
): Promise<ReferralValidation> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        isValid: false,
        canUse: false,
        message: "Unauthorized. Please sign in.",
      };
    }

    // Validate input
    const validationResult = validateReferralCodeSchema.safeParse({
      code: code.trim().toUpperCase(),
      userId: session.user.id,
    });

    if (!validationResult.success) {
      return {
        isValid: false,
        canUse: false,
        message: "Invalid referral code format",
      };
    }

    const result = await validateReferralCode(
      validationResult.data.code,
      validationResult.data.userId,
    );

    return result;
  } catch (error) {
    console.error("Error in handleValidateReferralCode:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Referral Validate Code",
    );
    return {
      isValid: false,
      canUse: false,
      message: "An unexpected error occurred",
    };
  }
}

// Refresh referral status cache
export async function refreshReferralStatus(): Promise<{ success: boolean }> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false };
    }

    revalidateTag("user-referral-status");
    revalidateTag("referral-code-validation");

    return { success: true };
  } catch (error) {
    console.error("Error refreshing referral status:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Referral Refresh Status",
    );
    return { success: false };
  }
}

// Get referral status action
export async function handleGetReferralStatus(): Promise<{
  success: boolean;
  data?: ReferralStatus;
  message?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
      };
    }

    const status = await getUserReferralStatus(session.user.id);

    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error("Error in handleGetReferralStatus:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Referral Get Status",
    );
    return {
      success: false,
      message: "Failed to load referral status",
    };
  }
}
