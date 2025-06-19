"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import {
  createUserProfile,
  updateUserOnboardingStatus,
} from "@/dal/user/onboarding/query";
import { onboardingFormSchema } from "@/dal/user/onboarding/types";

export async function handleOnboarding(formData: FormData) {

  // 1. Check authentication
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 2. Extract form data
  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    university: formData.get("university") as string,
    degree: formData.get("degree") as string,
    year: formData.get("year") as string,
    semester: formData.get("semester") as string,
  };


  // 3. Validate with Zod
  const validationResult = onboardingFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    throw new Error("Invalid form data");
  }

  const validData = validationResult.data;

  try {
    // 4. Create detailed profile
    await createUserProfile(session.user.id, validData);

    // 5. Mark as onboarded (so they don't see this page again)
    await updateUserOnboardingStatus(session.user.id, true);

  } catch (error) {
    console.error("💥 Onboarding failed:", error);
    throw new Error("Failed to complete onboarding");
  }

  // 6. Redirect to main app
  redirect("/profile");
}
