"use server";

import { getSession } from "@/lib/db/user";
import { getUserOnboardingStatus } from "@/dal/user/onboarding/query";

export async function checkUserOnboardingStatus(): Promise<{
  success: boolean;
  isOnboarded: boolean;
  error?: string;
}> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      isOnboarded: false,
      error: "Unauthorized",
    };
  }

  try {
    const onboardingStatus = await getUserOnboardingStatus(session.user.id);
    return {
      success: true,
      isOnboarded: onboardingStatus?.isOnboarded ?? false,
    };
  } catch {
    return {
      success: false,
      isOnboarded: false,
      error: "Failed to check onboarding status",
    };
  }
}
