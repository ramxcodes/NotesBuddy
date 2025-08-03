"use server";

import { getSession } from "@/lib/db/user";
import { getFlashcardSetForUser } from "@/dal/flashcard/user-query";
import { getUserPremiumStatus } from "@/dal/premium/query";
import { hasFlashcardSetAccess } from "@/dal/flashcard/access";
import prisma from "@/lib/db/prisma";
import { Role } from "@prisma/client";
import type { FlashcardSetDetail } from "@/dal/flashcard/types";

export interface FlashcardAccessResult {
  canAccess: boolean;
  reason?:
    | "NOT_AUTHENTICATED"
    | "FLASHCARD_NOT_FOUND"
    | "NO_PREMIUM"
    | "INSUFFICIENT_TIER";
  message?: string;
  flashcardSet?: FlashcardSetDetail;
  userStatus?: {
    hasPremium: boolean;
    tier: string | null;
  };
}

/**
 * Check if user can access a flashcard set
 */
export async function checkUserAccesstoFlashcard(
  flashcardSetId: string,
): Promise<FlashcardAccessResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        canAccess: false,
        reason: "NOT_AUTHENTICATED",
        message: "Please sign in to access flashcards",
      };
    }

    const userId = session.user.id;

    // Check if user is an admin - admins get access to everything
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Get flashcard set details
    const flashcardSet = await getFlashcardSetForUser(flashcardSetId, userId);

    if (!flashcardSet) {
      return {
        canAccess: false,
        reason: "FLASHCARD_NOT_FOUND",
        message: "Flashcard set not found",
      };
    }

    // If user is admin, grant access
    if (user?.role === Role.ADMIN) {
      return {
        canAccess: true,
        flashcardSet,
        userStatus: {
          hasPremium: true,
          tier: "TIER_3",
        },
      };
    }

    if (!flashcardSet) {
      return {
        canAccess: false,
        reason: "FLASHCARD_NOT_FOUND",
        message: "Flashcard set not found",
      };
    }

    // If it's a free flashcard set, allow access
    if (!flashcardSet.isPremium) {
      return {
        canAccess: true,
        flashcardSet,
      };
    }

    // For premium flashcard sets, check access
    const premiumStatus = await getUserPremiumStatus(userId);

    const canAccess = hasFlashcardSetAccess(
      flashcardSet.isPremium,
      flashcardSet.requiredTier,
      premiumStatus.tier,
      premiumStatus.isActive,
    );

    if (!canAccess) {
      let reason: FlashcardAccessResult["reason"] = "NO_PREMIUM";
      let message = "This flashcard set requires a premium subscription.";

      if (premiumStatus.isActive && flashcardSet.requiredTier) {
        reason = "INSUFFICIENT_TIER";
        message = `This flashcard set requires ${flashcardSet.requiredTier.replace("TIER_", "Tier ")} or higher.`;
      }

      return {
        canAccess: false,
        reason,
        message,
        flashcardSet,
        userStatus: {
          hasPremium: premiumStatus.isActive,
          tier: premiumStatus.tier,
        },
      };
    }

    return {
      canAccess: true,
      flashcardSet,
      userStatus: {
        hasPremium: premiumStatus.isActive,
        tier: premiumStatus.tier,
      },
    };
  } catch {
    return {
      canAccess: false,
      reason: "FLASHCARD_NOT_FOUND",
      message: "Error checking flashcard access. Please try again.",
    };
  }
}
