"use server";

import { adminStatus } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
} from "@prisma/client";
import {
  getQuizzes,
  getQuizDetails,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttemptDetails,
  getQuizAttempts,
  getQuizSubjects,
  getQuizStats,
  bulkCreateQuizzes,
} from "@/dal/quiz/query";
import {
  createQuizSchema,
  updateQuizSchema,
  type CreateQuizInput,
  type UpdateQuizInput,
  type GetQuizzesParams,
  type QuizzesListResponse,
  type QuizDetailsResponse,
  type QuizListItem,
  type QuizAttemptDetails,
} from "@/dal/quiz/types";

// Get all quizzes
export async function getQuizzesAction(
  params: GetQuizzesParams,
): Promise<QuizzesListResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getQuizzes(params);
    return result;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return null;
  }
}

// Get quiz details
export async function getQuizDetailsAction(
  id: string,
): Promise<QuizDetailsResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getQuizDetails(id);
    return result;
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return null;
  }
}

// Create new quiz
export async function createQuizAction(
  data: CreateQuizInput,
): Promise<{ success: boolean; error?: string; quiz?: QuizListItem }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate input
    const validatedData = createQuizSchema.parse(data);

    // Validate that each question has exactly one correct answer
    for (const question of validatedData.questions) {
      const correctOptions = question.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length !== 1) {
        return {
          success: false,
          error: `Question "${question.question}" must have exactly one correct answer`,
        };
      }
    }

    // Validate premium tier requirement
    if (validatedData.isPremium && !validatedData.requiredTier) {
      return {
        success: false,
        error: "Premium quizzes must specify a required tier",
      };
    }

    const quiz = await createQuiz(validatedData);

    revalidateTag("admin-quizzes");

    return { success: true, quiz };
  } catch (error) {
    console.error("Error creating quiz:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create quiz" };
  }
}

// Update quiz
export async function updateQuizAction(
  data: UpdateQuizInput,
): Promise<{ success: boolean; error?: string; quiz?: QuizListItem }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate input
    const validatedData = updateQuizSchema.parse(data);

    // Validate that each question has exactly one correct answer (if questions are provided)
    if (validatedData.questions) {
      for (const question of validatedData.questions) {
        const correctOptions = question.options.filter((opt) => opt.isCorrect);
        if (correctOptions.length !== 1) {
          return {
            success: false,
            error: `Question "${question.question}" must have exactly one correct answer`,
          };
        }
      }
    }

    // Validate premium tier requirement
    if (validatedData.isPremium && !validatedData.requiredTier) {
      return {
        success: false,
        error: "Premium quizzes must specify a required tier",
      };
    }

    const quiz = await updateQuiz(validatedData);

    if (!quiz) {
      return { success: false, error: "Quiz not found" };
    }

    revalidateTag("admin-quizzes");
    revalidateTag("quiz-details");

    return { success: true, quiz };
  } catch (error) {
    console.error("Error updating quiz:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update quiz" };
  }
}

// Delete quiz
export async function deleteQuizAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteQuiz(id);

    if (!deleted) {
      return { success: false, error: "Quiz not found or already deleted" };
    }

    revalidateTag("admin-quizzes");

    return { success: true };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return { success: false, error: "Failed to delete quiz" };
  }
}

// Toggle quiz active status
export async function toggleQuizStatusAction(
  id: string,
): Promise<{ success: boolean; error?: string; isActive?: boolean }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current quiz to toggle status
    const currentQuiz = await getQuizDetails(id);

    if (!currentQuiz) {
      return { success: false, error: "Quiz not found" };
    }

    const updatedQuiz = await updateQuiz({
      id,
      isActive: !currentQuiz.isActive,
    });

    if (!updatedQuiz) {
      return { success: false, error: "Failed to update quiz status" };
    }

    revalidateTag("admin-quizzes");

    return { success: true, isActive: updatedQuiz.isActive };
  } catch (error) {
    console.error("Error toggling quiz status:", error);
    return { success: false, error: "Failed to toggle quiz status" };
  }
}

// Toggle quiz published status
export async function toggleQuizPublishedAction(
  id: string,
): Promise<{ success: boolean; error?: string; isPublished?: boolean }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current quiz to toggle status
    const currentQuiz = await getQuizDetails(id);

    if (!currentQuiz) {
      return { success: false, error: "Quiz not found" };
    }

    const updatedQuiz = await updateQuiz({
      id,
      isPublished: !currentQuiz.isPublished,
    });

    if (!updatedQuiz) {
      return {
        success: false,
        error: "Failed to update quiz published status",
      };
    }

    revalidateTag("admin-quizzes");

    return { success: true, isPublished: updatedQuiz.isPublished };
  } catch (error) {
    console.error("Error toggling quiz published status:", error);
    return { success: false, error: "Failed to toggle quiz published status" };
  }
}

// Get quiz attempt details
export async function getQuizAttemptDetailsAction(
  attemptId: string,
): Promise<QuizAttemptDetails | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getQuizAttemptDetails(attemptId);
    return result;
  } catch (error) {
    console.error("Error fetching quiz attempt details:", error);
    return null;
  }
}

// Get all attempts for a quiz
export async function getQuizAttemptsAction(quizId: string): Promise<{
  success: boolean;
  data?: import("@/dal/quiz/types").QuizAttemptWithUser[];
  error?: string;
}> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await getQuizAttempts(quizId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return { success: false, error: "Failed to fetch quiz attempts" };
  }
}

// Get quiz subjects for filters
export async function getQuizSubjectsAction(): Promise<string[] | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getQuizSubjects();
    return result;
  } catch (error) {
    console.error("Error fetching quiz subjects:", error);
    return null;
  }
}

// Get quiz statistics for admin dashboard
export async function getQuizStatsAction(): Promise<{
  success: boolean;
  data?: import("@/dal/quiz/types").QuizStats;
  error?: string;
}> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const stats = await getQuizStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return { success: false, error: "Failed to fetch quiz stats" };
  }
}
export interface BulkQuizImportData {
  quizSets: Array<{
    id: string;
    subject: string;
    topic: string;
    questions: Array<{
      question: string;
      explanation: string;
      options: Array<{
        text: string;
        isCorrect: boolean;
        order: number;
      }>;
      order: number;
    }>;
    timestamp: string;
  }>;
}

export interface BulkQuizImportResult {
  success: boolean;
  error?: string;
  results?: Array<{
    success: boolean;
    subject?: string;
    topic?: string;
    title?: string;
    id?: string;
    questionCount?: number;
    error?: string;
  }>;
  totalProcessed?: number;
  successCount?: number;
  errorCount?: number;
}

export async function bulkImportQuizzesAction({
  jsonData,
  university,
  degree,
  year,
  semester,
  unitNumber,
  isPremium,
  requiredTier,
}: {
  jsonData: BulkQuizImportData;
  university: string;
  degree: string;
  year: string;
  semester: string;
  unitNumber?: string;
  isPremium?: boolean;
  requiredTier?: string;
}): Promise<BulkQuizImportResult> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  try {
    const results: Array<{
      success: boolean;
      subject?: string;
      topic?: string;
      title?: string;
      id?: string;
      questionCount?: number;
      error?: string;
    }> = [];

    let successCount = 0;
    let errorCount = 0;

    for (const quizSet of jsonData.quizSets) {
      try {
        const { subject, topic, questions } = quizSet;

        if (!subject || !topic || !questions || questions.length === 0) {
          results.push({
            success: false,
            subject,
            topic,
            error: "Missing required fields: subject, topic, or questions",
          });
          errorCount++;
          continue;
        }

        const title = unitNumber ? `Unit ${unitNumber}: ${subject}` : subject;
        const description = topic;

        const result = await bulkCreateQuizzes(
          [quizSet],
          {
            university: university as University,
            degree: degree as Degree,
            year: year as Year,
            semester: semester as Semester,
          },
          unitNumber ? parseInt(unitNumber) : undefined,
          title,
          description,
          isPremium || false,
          requiredTier ? (requiredTier as PremiumTier) : undefined,
        );

        if (result.success && result.quizId) {
          results.push({
            success: true,
            subject,
            topic,
            title,
            id: result.quizId,
            questionCount: questions.length,
          });
          successCount++;
        } else {
          results.push({
            success: false,
            subject,
            topic,
            error: result.error || "Failed to create quiz",
          });
          errorCount++;
        }
      } catch (error) {
        results.push({
          success: false,
          subject: quizSet.subject,
          topic: quizSet.topic,
          error: `Failed to create quiz: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        errorCount++;
      }
    }

    revalidateTag("quizzes");

    return {
      success: true,
      results,
      totalProcessed: jsonData.quizSets.length,
      successCount,
      errorCount,
    };
  } catch (error) {
    console.error("Error importing quizzes:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to import quizzes",
    };
  }
}
