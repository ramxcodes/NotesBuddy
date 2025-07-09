"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/db/user";
import {
  createUserProfile,
  updateUserOnboardingStatus,
} from "@/dal/user/onboarding/query";
import { onboardingFormSchema } from "@/dal/user/onboarding/types";

export async function handleOnboarding(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    university: formData.get("university") as string,
    degree: formData.get("degree") as string,
    year: formData.get("year") as string,
    semester: formData.get("semester") as string,
  };

  const validationResult = onboardingFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const validData = validationResult.data;

  try {
    await createUserProfile(session.user.id, validData);

    await updateUserOnboardingStatus(session.user.id, true);

    revalidateTag("user-onboarding");
    revalidateTag("user-full-profile");
  } catch (error: unknown) {
    // Check if the error is due to unique constraint violation for phone number
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002" &&
      "meta" in error &&
      error.meta &&
      typeof error.meta === "object" &&
      "target" in error.meta &&
      Array.isArray(error.meta.target) &&
      error.meta.target.includes("phoneNumber")
    ) {
      return {
        success: false,
        error: "Phone number is already in use",
        fieldErrors: {
          phoneNumber: [
            "This phone number is already registered with another account",
          ],
        },
      };
    }

    return {
      success: false,
      error: "Failed to complete onboarding. Please try again.",
    };
  }

  redirect("/profile");
}
