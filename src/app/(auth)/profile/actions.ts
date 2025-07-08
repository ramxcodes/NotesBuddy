"use server";

import { getSession } from "@/lib/db/user";
import { updateUserProfile } from "@/dal/user/onboarding/query";
import {
  onboardingFormSchema,
  type OnboardingFormData,
} from "@/dal/user/onboarding/types";
import { revalidatePath } from "next/cache";

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

    // Revalidate the profile page to show updated data
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update profile");
  }
}
