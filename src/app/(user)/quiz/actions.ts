"use server";

import {
  getUserQuizzes,
  getUserQuizSubjects,
  loadMoreUserQuizzes,
} from "@/dal/quiz/user-query";
import type {
  GetUserQuizzesParams,
  UserQuizzesResponse,
  UserQuizListItem,
} from "@/dal/quiz/user-query";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { University, Degree, Year, Semester } from "@prisma/client";

interface LoadMoreQuizzesParams {
  search?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
  sort?: string;
  lastTitle?: string;
  lastId?: string;
}

export async function loadMoreQuizzesAction(
  params: LoadMoreQuizzesParams,
): Promise<UserQuizListItem[]> {
  try {
    // Get user session for user-specific data
    const session = await getSession();
    const userId = session?.user?.id;

    if (!params.lastId) {
      return [];
    }

    const result = await loadMoreUserQuizzes({
      search: params.search,
      university: params.university,
      degree: params.degree,
      year: params.year,
      semester: params.semester,
      subject: params.subject,
      isPremium: params.isPremium,
      sort: params.sort,
      userId,
      lastId: params.lastId,
      limit: 6,
    });

    return result;
  } catch (error) {
    console.error("Error loading more quizzes:", error);
    return [];
  }
}

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
      limit: 6,
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
