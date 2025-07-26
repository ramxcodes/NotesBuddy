"use server";

import {
  getFlashcardSets,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  getFlashcardSetById,
  toggleFlashcardSetStatus,
  toggleFlashcardSetPublished,
  getFlashcardSetStats,
  getFlashcardAcademicOptions,
} from "@/dal/flashcard/query";
import {
  getPublishedFlashcardSets,
  getFlashcardSetForUser,
  getUserFlashcardActivity,
  trackFlashcardSetVisit,
  getFlashcardSetsBySubject,
} from "@/dal/flashcard/user-query";
import type {
  CreateFlashcardSetInput,
  UpdateFlashcardSetInput,
  FlashcardSetFilters,
} from "@/dal/flashcard/types";
import { getSession } from "@/lib/db/user";
import { getUserFullProfile } from "@/dal/user/onboarding/query";
import { revalidatePath } from "next/cache";

// Admin Actions
export async function createFlashcardSetAction(data: CreateFlashcardSetInput) {
  try {
    const flashcardSet = await createFlashcardSet(data);
    revalidatePath("/admin/flashcards");
    return { success: true, data: flashcardSet };
  } catch (error) {
    console.error("Error creating flashcard set:", error);
    return { success: false, error: "Failed to create flashcard set" };
  }
}

export async function updateFlashcardSetAction(data: UpdateFlashcardSetInput) {
  try {
    const flashcardSet = await updateFlashcardSet(data);
    revalidatePath("/admin/flashcards");
    revalidatePath(`/admin/flashcards/${data.id}`);
    return { success: true, data: flashcardSet };
  } catch (error) {
    console.error("Error updating flashcard set:", error);
    return { success: false, error: "Failed to update flashcard set" };
  }
}

export async function deleteFlashcardSetAction(id: string) {
  try {
    await deleteFlashcardSet(id);
    revalidatePath("/admin/flashcards");
    return { success: true };
  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    return { success: false, error: "Failed to delete flashcard set" };
  }
}

export async function getFlashcardSetsAction(
  filters: FlashcardSetFilters = {},
) {
  try {
    const flashcardSets = await getFlashcardSets(filters);
    return { success: true, data: flashcardSets };
  } catch (error) {
    console.error("Error fetching flashcard sets:", error);
    return { success: false, error: "Failed to fetch flashcard sets" };
  }
}

export async function getFlashcardSetByIdAction(id: string) {
  try {
    const flashcardSet = await getFlashcardSetById(id);
    return { success: true, data: flashcardSet };
  } catch (error) {
    console.error("Error fetching flashcard set:", error);
    return { success: false, error: "Failed to fetch flashcard set" };
  }
}

export async function toggleFlashcardSetStatusAction(
  id: string,
  isActive: boolean,
) {
  try {
    await toggleFlashcardSetStatus(id, isActive);
    revalidatePath("/admin/flashcards");
    return { success: true };
  } catch (error) {
    console.error("Error toggling flashcard set status:", error);
    return { success: false, error: "Failed to toggle flashcard set status" };
  }
}

export async function toggleFlashcardSetPublishedAction(
  id: string,
  isPublished: boolean,
) {
  try {
    await toggleFlashcardSetPublished(id, isPublished);
    revalidatePath("/admin/flashcards");
    return { success: true };
  } catch (error) {
    console.error("Error toggling flashcard set published status:", error);
    return {
      success: false,
      error: "Failed to toggle flashcard set published status",
    };
  }
}

export async function getFlashcardSetStatsAction() {
  try {
    const stats = await getFlashcardSetStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching flashcard set stats:", error);
    return { success: false, error: "Failed to fetch flashcard set stats" };
  }
}

export async function getFlashcardAcademicOptionsAction() {
  try {
    const options = await getFlashcardAcademicOptions();
    return { success: true, data: options };
  } catch (error) {
    console.error("Error fetching flashcard academic options:", error);
    return {
      success: false,
      error: "Failed to fetch flashcard academic options",
    };
  }
}

// User Actions
export async function getPublishedFlashcardSetsAction(
  filters: FlashcardSetFilters = {},
) {
  try {
    const session = await getSession();
    let userProfile = undefined;

    if (session?.user?.id) {
      const profile = await getUserFullProfile(session.user.id);
      if (profile) {
        userProfile = {
          university: profile.university,
          degree: profile.degree,
          year: profile.year,
          semester: profile.semester,
        };
      }
    }

    const flashcardSets = await getPublishedFlashcardSets(filters, userProfile);
    return { success: true, data: flashcardSets };
  } catch (error) {
    console.error("Error fetching published flashcard sets:", error);
    return { success: false, error: "Failed to fetch flashcard sets" };
  }
}

export async function getFlashcardSetForUserAction(id: string) {
  try {
    const session = await getSession();
    const flashcardSet = await getFlashcardSetForUser(id, session?.user?.id);
    return { success: true, data: flashcardSet };
  } catch (error) {
    console.error("Error fetching flashcard set for user:", error);
    return { success: false, error: "Failed to fetch flashcard set" };
  }
}

export async function getUserFlashcardActivityAction() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    const activity = await getUserFlashcardActivity(session.user.id);
    return { success: true, data: activity };
  } catch (error) {
    console.error("Error fetching user flashcard activity:", error);
    return { success: false, error: "Failed to fetch flashcard activity" };
  }
}

export async function trackFlashcardSetVisitAction(
  setId: string,
  cardId?: string,
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    await trackFlashcardSetVisit(session.user.id, setId, cardId);
    return { success: true };
  } catch (error) {
    console.error("Error tracking flashcard visit:", error);
    return { success: false, error: "Failed to track visit" };
  }
}

export async function getFlashcardSetsBySubjectAction(subject: string) {
  try {
    const session = await getSession();
    let userProfile = undefined;

    if (session?.user?.id) {
      const profile = await getUserFullProfile(session.user.id);
      if (profile) {
        userProfile = {
          university: profile.university,
          degree: profile.degree,
          year: profile.year,
          semester: profile.semester,
        };
      }
    }

    const flashcardSets = await getFlashcardSetsBySubject(subject, userProfile);
    return { success: true, data: flashcardSets };
  } catch (error) {
    console.error("Error fetching flashcard sets by subject:", error);
    return { success: false, error: "Failed to fetch flashcard sets" };
  }
}
