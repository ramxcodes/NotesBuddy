import prisma from "@/lib/db/prisma";
import { OnboardingFormData } from "./types";

// Check if user completed onboarding
export async function getUserOnboardingStatus(userId: string) {
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
}

// Create the detailed user profile
export async function createUserProfile(
  userId: string,
  data: OnboardingFormData
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
  isOnboarded: boolean
) {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnboarded },
  });

  return { success: true };
}

// Get user profile
export async function getUserFullProfile(userId: string) {
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
}
