"use server";

import {
  getNextUnitsAndContent,
  getSubjectQuizzes,
  getSubjectFlashcards,
} from "@/dal/note/next-content";

export async function getNextContentAction(
  university: string,
  degree: string,
  year: string,
  semester: string,
  subject: string,
  currentSlug: string,
) {
  try {
    const data = await getNextUnitsAndContent(
      university,
      degree,
      year,
      semester,
      subject,
      currentSlug,
    );
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching next content:", error);
    return { success: false, error: "Failed to fetch next content" };
  }
}

export async function getSubjectQuizzesAction(
  university: string,
  degree: string,
  year: string,
  semester: string,
  subject: string,
) {
  try {
    const quizzes = await getSubjectQuizzes(
      university,
      degree,
      year,
      semester,
      subject,
    );
    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error fetching subject quizzes:", error);
    return { success: false, error: "Failed to fetch quizzes" };
  }
}

export async function getSubjectFlashcardsAction(
  university: string,
  degree: string,
  year: string,
  semester: string,
  subject: string,
) {
  try {
    const flashcards = await getSubjectFlashcards(
      university,
      degree,
      year,
      semester,
      subject,
    );
    return { success: true, data: flashcards };
  } catch (error) {
    console.error("Error fetching subject flashcards:", error);
    return { success: false, error: "Failed to fetch flashcards" };
  }
}
