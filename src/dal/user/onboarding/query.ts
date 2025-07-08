import prisma from "@/lib/db/prisma";
import { OnboardingFormData } from "./types";
import { unstable_cache } from "next/cache";

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
  ["user-onboarding-status"],
  {
    revalidate: 1800,
    tags: ["user-onboarding"],
  },
);

// Create the detailed user profile
export async function createUserProfile(
  userId: string,
  data: OnboardingFormData,
) {
  const profile = await prisma.userProfile.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      university: data.university,
      degree: data.degree,
      year: data.year,
      semester: data.semester,
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
  ["user-full-profile"],
  {
    revalidate: 1800,
    tags: ["user-full-profile"],
  },
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
      university: data.university,
      degree: data.degree,
      year: data.year,
      semester: data.semester,
    },
  });

  return profile;
}
