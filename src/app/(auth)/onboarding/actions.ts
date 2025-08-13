"use server";

import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/db/user";
import {
  createUserProfile,
  updateUserOnboardingStatus,
  getUserFullProfile,
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
    const existingProfile = await getUserFullProfile(session.user.id);

    if (existingProfile) {
      await createUserProfile(session.user.id, validData);
      await updateUserOnboardingStatus(session.user.id, true);

      revalidateTag("user-onboarding");
      revalidateTag("user-full-profile");

      return {
        success: true,
        profileExists: true,
        message: "Profile updated successfully!",
      };
    }

    // Create new profile if it doesn't exist
    await createUserProfile(session.user.id, validData);

    await updateUserOnboardingStatus(session.user.id, true);

    revalidateTag("user-onboarding");
    revalidateTag("user-full-profile");

    return {
      success: true,
      profileExists: false,
    };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002" &&
      "meta" in error &&
      error.meta &&
      typeof error.meta === "object" &&
      "target" in error.meta &&
      Array.isArray(error.meta.target)
    ) {
      // Handle phoneNumber unique constraint
      if (error.meta.target.includes("phoneNumber")) {
        // Check if the phone number belongs to the current user
        const existingProfile = await getUserFullProfile(session.user.id);
        if (
          existingProfile &&
          existingProfile.phoneNumber === validData.phoneNumber
        ) {
          // Same user, same phone number - this is an update, continue
          await updateUserOnboardingStatus(session.user.id, true);
          revalidateTag("user-onboarding");
          revalidateTag("user-full-profile");

          return {
            success: true,
            profileExists: true,
            message: "Profile updated successfully!",
          };
        }

        // Different user with same phone number
        return {
          success: false,
          fieldErrors: {
            phoneNumber: [
              "This phone number is already in use. Use a different phone number.",
            ],
          },
        };
      }

      // Handle userId unique constraint (though this should be rare with upsert)
      if (error.meta.target.includes("userId")) {
        return {
          success: false,
          error: "User profile already exists. Please try refreshing the page.",
        };
      }
    }

    console.error("Onboarding error:", error);
    return {
      success: false,
      error: "Failed to complete onboarding. Please try again.",
    };
  }
}
