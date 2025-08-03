"use server";

import {
  getUserFlashcardSets,
  getUserFlashcardSubjects,
  loadMoreUserFlashcardSets,
} from "@/dal/flashcard/user-query";
import type {
  FlashcardSetFilters,
  FlashcardSetListItem,
} from "@/dal/flashcard/types";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { University, Degree, Year, Semester } from "@prisma/client";
import { unstable_cache } from "next/cache";

export interface GetUserFlashcardSetsParams {
  search?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
}

interface LoadMoreFlashcardSetsParams {
  search?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
  lastTitle?: string;
  lastId?: string;
}

export async function loadMoreFlashcardSetsAction(
  params: LoadMoreFlashcardSetsParams,
): Promise<FlashcardSetListItem[]> {
  try {
    // Get user session for user-specific data
    const session = await getSession();
    const userId = session?.user?.id;

    if (!params.lastId) {
      return [];
    }

    const filters: FlashcardSetFilters = {
      search: params.search,
      university: params.university,
      degree: params.degree,
      year: params.year,
      semester: params.semester,
      subject: params.subject,
      isPremium: params.isPremium,
      isActive: true,
      isPublished: true,
    };

    // Get user profile for academic context
    const userProfile = userId ? await getUserFullProfile(userId) : undefined;

    const result = await loadMoreUserFlashcardSets(
      params.lastId,
      filters,
      userProfile || undefined,
      userId,
      6,
    );

    return result;
  } catch (error) {
    console.error("Error loading more flashcard sets:", error);
    return [];
  }
}

export interface UserFlashcardSetsResponse {
  flashcardSets: FlashcardSetListItem[];
  totalCount: number;
}

// Cache flashcard sets for 1 hour
const getCachedFlashcardSets = unstable_cache(
  async (
    params: GetUserFlashcardSetsParams,
    userId?: string,
  ): Promise<UserFlashcardSetsResponse> => {
    const filters: FlashcardSetFilters = {
      search: params.search,
      university: params.university,
      degree: params.degree,
      year: params.year,
      semester: params.semester,
      subject: params.subject,
      isPremium: params.isPremium,
      isActive: true,
      isPublished: true,
    };

    const flashcardSets = await getUserFlashcardSets(
      filters,
      undefined,
      userId,
      6, // Load 6 items initially for consistency with infinite scroll
    );

    return {
      flashcardSets,
      totalCount: flashcardSets.length,
    };
  },
  ["user-flashcard-sets"],
  {
    revalidate: 3600, // 1 hour
    tags: ["flashcard-sets"],
  },
);

export async function loadUserFlashcardSetsAction(
  params: GetUserFlashcardSetsParams,
): Promise<UserFlashcardSetsResponse | null> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    const result = await getCachedFlashcardSets(params, userId);

    return result;
  } catch (error) {
    console.error("Error loading user flashcard sets:", error);
    return null;
  }
}

export async function getUserFlashcardSubjectsAction(filters: {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
}): Promise<string[]> {
  try {
    const subjects = await getUserFlashcardSubjects(filters);
    return subjects;
  } catch (error) {
    console.error("Error loading flashcard subjects:", error);
    return [];
  }
}

export async function getUserContextAction() {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        isAuthenticated: false,
        isOnboarded: false,
        userProfile: null,
      };
    }

    const [onboardingStatus, userProfile] = await Promise.all([
      getUserOnboardingStatus(userId),
      getUserFullProfile(userId),
    ]);

    return {
      isAuthenticated: true,
      isOnboarded: onboardingStatus?.isOnboarded || false,
      userProfile: userProfile
        ? {
            university: userProfile.university,
            degree: userProfile.degree,
            year: userProfile.year,
            semester: userProfile.semester,
          }
        : null,
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

export async function trackFlashcardSetVisitAction(setId: string) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Import the tracking function
    const { trackFlashcardSetVisit } = await import(
      "@/dal/flashcard/user-query"
    );

    await trackFlashcardSetVisit(userId, setId);

    return { success: true };
  } catch (error) {
    console.error("Error tracking flashcard set visit:", error);
    return { success: false, error: "Failed to track visit" };
  }
}

export async function getFlashcardSetByIdAction(id: string) {
  try {
    // Import the function to get flashcard set by ID
    const { getFlashcardSetById } = await import("@/dal/flashcard/query");

    const flashcardSet = await getFlashcardSetById(id);

    if (!flashcardSet) {
      return null;
    }

    // Check if user has access (you might want to add access control here)
    return flashcardSet;
  } catch (error) {
    console.error("Error getting flashcard set:", error);
    return null;
  }
}
