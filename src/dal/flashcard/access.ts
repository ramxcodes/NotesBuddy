import { PremiumTier } from "@prisma/client";

// Premium access control for flashcard sets
export function hasFlashcardSetAccess(
  isPremium: boolean,
  requiredTier: PremiumTier | null,
  userPremiumTier: PremiumTier | null,
  isUserPremiumActive: boolean,
): boolean {
  // If flashcard set is not premium, allow access
  if (!isPremium) {
    return true;
  }

  // If flashcard set is premium but user is not active premium
  if (!isUserPremiumActive || !userPremiumTier) {
    return false;
  }

  // If no specific tier required, any premium tier grants access
  if (!requiredTier) {
    return true;
  }

  // Check if user's tier meets or exceeds required tier
  const tierOrder = {
    [PremiumTier.TIER_1]: 1,
    [PremiumTier.TIER_2]: 2,
    [PremiumTier.TIER_3]: 3,
  };

  return tierOrder[userPremiumTier] >= tierOrder[requiredTier];
}

export interface FlashcardAccessInfo {
  hasAccess: boolean;
  requiresPremium: boolean;
  requiredTier: PremiumTier | null;
  userTier: PremiumTier | null;
  isUserPremiumActive: boolean;
}

export function getFlashcardSetAccessInfo(
  isPremium: boolean,
  requiredTier: PremiumTier | null,
  userPremiumTier: PremiumTier | null,
  isUserPremiumActive: boolean,
): FlashcardAccessInfo {
  const hasAccess = hasFlashcardSetAccess(
    isPremium,
    requiredTier,
    userPremiumTier,
    isUserPremiumActive,
  );

  return {
    hasAccess,
    requiresPremium: isPremium,
    requiredTier,
    userTier: userPremiumTier,
    isUserPremiumActive,
  };
}
