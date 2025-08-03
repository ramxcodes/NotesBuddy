import prisma from "@/lib/db/prisma";
import { OnboardingFormData } from "./types";
import { unstable_cache } from "next/cache";
import { University, Degree, Year, Semester } from "@prisma/client";
import { getCacheOptions } from "@/cache/cache";
import { userCacheConfig } from "@/cache/user";

// Check if user completed onboarding
export const getUserOnboardingStatus = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        isOnboarded: true,
      },
    });

    return {
      isOnboarded: user?.isOnboarded,
    };
  },
  [userCacheConfig.getUserOnboardingStatus.cacheKey!],
  getCacheOptions(userCacheConfig.getUserOnboardingStatus),
);

// Create or update the detailed user profile
export async function createUserProfile(
  userId: string,
  data: OnboardingFormData,
) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      university: data.university as University,
      degree: data.degree as Degree,
      year: data.year as Year,
      semester: data.semester as Semester,
    },
    create: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      university: data.university as University,
      degree: data.degree as Degree,
      year: data.year as Year,
      semester: data.semester as Semester,
    },
  });

  return profile;
}

// Mark user as completed onboarding
export async function updateUserOnboardingStatus(
  userId: string,
  isOnboarded: boolean,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnboarded },
  });

  return { success: true };
}

// Get user profile
export const getUserFullProfile = unstable_cache(
  async (userId: string) => {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        university: true,
        degree: true,
        year: true,
        semester: true,
        createdAt: true,
      },
    });

    return profile;
  },
  [userCacheConfig.getUserFullProfile.cacheKey!],
  getCacheOptions(userCacheConfig.getUserFullProfile),
);

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: OnboardingFormData,
) {
  const profile = await prisma.userProfile.update({
    where: { userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      university: data.university as University,
      degree: data.degree as Degree,
      year: data.year as Year,
      semester: data.semester as Semester,
    },
  });

  return profile;
}
