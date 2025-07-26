"use server";

import { getSession } from "@/lib/db/user";
import { checkUserAccessToQuiz, getQuizForAttempt } from "@/dal/quiz/access";
import prisma from "@/lib/db/prisma";
import { AttemptStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";

export interface StartQuizAttemptResult {
  success: boolean;
  attemptId?: string;
  error?: string;
  message?: string;
}

export interface SubmitAnswerResult {
  success: boolean;
  isCorrect?: boolean;
  correctOptionId?: string;
  marksAwarded?: number;
  error?: string;
}

export interface CompleteQuizResult {
  success: boolean;
  attemptId?: string;
  score?: number;
  totalMarks?: number;
  accuracy?: number;
  error?: string;
}

/**
 * Start a new quiz attempt
 */
export async function startQuizAttemptAction(
  quizId: string,
): Promise<StartQuizAttemptResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "NOT_AUTHENTICATED",
        message: "Please sign in to take the quiz",
      };
    }

    const userId = session.user.id;

    // Check access to quiz
    const accessCheck = await checkUserAccessToQuiz(quizId);
    if (!accessCheck.canAccess) {
      return {
        success: false,
        error: accessCheck.reason,
        message: accessCheck.message,
      };
    }

    // Check if user already has an active attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (existingAttempt) {
      return {
        success: true,
        attemptId: existingAttempt.id,
        message: "Resuming existing attempt",
      };
    }

    // Get quiz details to calculate total marks
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!quiz) {
      return {
        success: false,
        error: "QUIZ_NOT_FOUND",
        message: "Quiz not found",
      };
    }

    const totalMarks = quiz._count.questions * quiz.marksPerQuestion;

    // Generate randomization seeds
    const questionSeed = Math.floor(Math.random() * 1000000);
    const optionSeed = Math.floor(Math.random() * 1000000);

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        questionSeed,
        optionSeed,
        totalMarks,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    // Revalidate caches
    revalidateTag("user-quizzes");

    return {
      success: true,
      attemptId: attempt.id,
      message: "Quiz attempt started successfully",
    };
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Failed to start quiz attempt. Please try again.",
    };
  }
}

/**
 * Submit an answer for a question
 */
export async function submitAnswerAction(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
): Promise<SubmitAnswerResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to submit answers",
      };
    }

    const userId = session.user.id;

    // Verify attempt belongs to user and is active
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        quiz: {
          select: {
            marksPerQuestion: true,
          },
        },
      },
    });

    if (!attempt) {
      return {
        success: false,
        error: "Invalid or expired quiz attempt",
      };
    }

    // Get the question and its options
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
      },
    });

    if (!question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    // Find the selected option and check if it's correct
    const selectedOption = question.options.find(
      (opt) => opt.id === selectedOptionId,
    );
    if (!selectedOption) {
      return {
        success: false,
        error: "Invalid option selected",
      };
    }

    const correctOption = question.options.find((opt) => opt.isCorrect);
    const isCorrect = selectedOption.isCorrect;
    const marksAwarded = isCorrect ? attempt.quiz.marksPerQuestion : 0;

    // Check if answer already exists (update) or create new
    const existingAnswer = await prisma.quizAnswer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.quizAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOptionId,
          isCorrect,
          marksAwarded,
        },
      });
    } else {
      // Create new answer
      await prisma.quizAnswer.create({
        data: {
          attemptId,
          questionId,
          selectedOptionId,
          isCorrect,
          marksAwarded,
        },
      });
    }

    return {
      success: true,
      isCorrect,
      correctOptionId: correctOption?.id,
      marksAwarded,
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      error: "Failed to submit answer. Please try again.",
    };
  }
}

/**
 * Complete the quiz attempt
 */
export async function completeQuizAttemptAction(
  attemptId: string,
  isTimeUp: boolean = false,
): Promise<CompleteQuizResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to complete the quiz",
      };
    }

    const userId = session.user.id;

    // Verify attempt belongs to user and is active
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        answers: true,
        quiz: {
          select: {
            id: true,
            isAttempted: true,
            timeLimit: true,
          },
        },
      },
    });

    if (!attempt) {
      return {
        success: false,
        error: "Invalid or expired quiz attempt",
      };
    }

    // Calculate final score
    const score = attempt.answers.reduce(
      (total, answer) => total + answer.marksAwarded,
      0,
    );
    const accuracy =
      attempt.totalMarks > 0 ? (score / attempt.totalMarks) * 100 : 0;

    // Calculate time taken in seconds
    const completedAt = new Date();
    const timeTakenInSeconds = Math.round(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    // Determine status - if time limit exists and we've exceeded it, mark as TIME_UP
    let status: AttemptStatus = AttemptStatus.COMPLETED;
    if (
      isTimeUp ||
      (attempt.quiz.timeLimit &&
        timeTakenInSeconds >= attempt.quiz.timeLimit * 60)
    ) {
      status = AttemptStatus.TIME_UP;
    }

    // Update attempt status
    const completedAttempt = await prisma.$transaction(async (tx) => {
      // Update the attempt
      const updated = await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          accuracy,
          timeTaken: timeTakenInSeconds,
          status,
          completedAt,
        },
      });

      // Mark quiz as attempted if this is the first completion
      if (!attempt.quiz.isAttempted) {
        await tx.quiz.update({
          where: { id: attempt.quiz.id },
          data: { isAttempted: true },
        });
      }

      return updated;
    });

    // Revalidate caches
    revalidateTag("user-quizzes");
    revalidateTag("admin-quizzes");

    return {
      success: true,
      attemptId: completedAttempt.id,
      score,
      totalMarks: attempt.totalMarks,
      accuracy,
    };
  } catch (error) {
    console.error("Error completing quiz attempt:", error);
    return {
      success: false,
      error: "Failed to complete quiz. Please try again.",
    };
  }
}

/**
 * Get quiz attempt details for taking the quiz
 */
export async function getQuizAttemptAction(attemptId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to access the quiz",
      };
    }

    const userId = session.user.id;

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return {
        success: false,
        error: "Quiz attempt not found or already completed",
      };
    }

    // Transform data for frontend (hide correct answers)
    const quiz = {
      id: attempt.quiz.id,
      title: attempt.quiz.title,
      description: attempt.quiz.description,
      subject: attempt.quiz.subject,
      timeLimit: attempt.quiz.timeLimit,
      marksPerQuestion: attempt.quiz.marksPerQuestion,
      questions: attempt.quiz.questions.map((question) => ({
        id: question.id,
        question: question.question,
        order: question.order,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          order: option.order,
        })),
      })),
    };

    // Include user's current answers
    const answers = attempt.answers.reduce(
      (acc, answer) => {
        acc[answer.questionId] = answer.selectedOptionId;
        return acc;
      },
      {} as Record<string, string | null>,
    );

    return {
      success: true,
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        totalMarks: attempt.totalMarks,
        questionSeed: attempt.questionSeed,
        optionSeed: attempt.optionSeed,
      },
      quiz,
      answers,
    };
  } catch (error) {
    console.error("Error getting quiz attempt:", error);
    return {
      success: false,
      error: "Failed to load quiz. Please try again.",
    };
  }
}

/**
 * Get quiz for starting attempt (with access check)
 */
export async function getQuizForAttemptAction(quizId: string) {
  return await getQuizForAttempt(quizId);
}
