"use server";

import { getSession } from "@/lib/db/user";
import { updateUserProfile } from "@/dal/user/onboarding/query";
import {
  onboardingFormSchema,
  type OnboardingFormData,
} from "@/dal/user/onboarding/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { telegramLogger } from "@/utils/telegram-logger";

export async function handleProfileUpdate(data: OnboardingFormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Validate the data
  const validationResult = onboardingFormSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error("Invalid form data");
  }

  const validData = validationResult.data;

  try {
    await updateUserProfile(session.user.id, validData);

    revalidatePath("/profile");
    revalidateTag("user-full-profile");
    revalidateTag("user-onboarding");
    revalidateTag("user-devices");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "Profile Update",
    );
    throw new Error("Failed to update profile");
  }
}
