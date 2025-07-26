"use server";

import { getUserQuizzes, getUserQuizSubjects } from "@/dal/quiz/user-query";
import type {
  GetUserQuizzesParams,
  UserQuizzesResponse,
} from "@/dal/quiz/user-query";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { University, Degree, Year, Semester } from "@prisma/client";

export async function loadUserQuizzesAction(
  params: GetUserQuizzesParams,
): Promise<UserQuizzesResponse | null> {
  try {
    // Get user session for user-specific data
    const session = await getSession();
    const userId = session?.user?.id;

    const result = await getUserQuizzes({
      ...params,
      userId,
    });

    return result;
  } catch (error) {
    console.error("Error loading user quizzes:", error);
    return null;
  }
}

export async function getUserQuizSubjectsAction(filters: {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
}): Promise<string[]> {
  try {
    const subjects = await getUserQuizSubjects(filters);
    return subjects;
  } catch (error) {
    console.error("Error loading quiz subjects:", error);
    return [];
  }
}

export async function getUserContextAction() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        isAuthenticated: false,
        isOnboarded: false,
        userProfile: null,
      };
    }

    const [onboardingStatus, userProfile] = await Promise.all([
      getUserOnboardingStatus(session.user.id),
      getUserFullProfile(session.user.id),
    ]);

    return {
      isAuthenticated: true,
      isOnboarded: onboardingStatus?.isOnboarded ?? false,
      userProfile: onboardingStatus?.isOnboarded ? userProfile : null,
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return {
      isAuthenticated: false,
      isOnboarded: false,
      userProfile: null,
    };
  }
}
