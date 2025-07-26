"use server";

import { getSession } from "@/lib/db/user";
import prisma from "@/lib/db/prisma";
import { AttemptStatus } from "@prisma/client";

export interface QuizScoreResult {
  success: boolean;
  score?: {
    attemptId: string;
    score: number;
    totalMarks: number;
    accuracy: number;
    timeTaken: number | null;
    completedAt: Date;
    quiz: {
      id: string;
      title: string;
      subject: string;
      marksPerQuestion: number;
      questionCount: number;
    };
    breakdown?: {
      questionId: string;
      question: string;
      selectedOptionId: string | null;
      selectedOptionText: string | null;
      correctOptionText: string;
      isCorrect: boolean;
      marksAwarded: number;
    }[];
  };
  error?: string;
}

/**
 * Get quiz score and breakdown for a completed attempt
 */
export async function getQuizScoreAction(
  attemptId: string,
  includeBreakdown = false,
): Promise<QuizScoreResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to view quiz results",
      };
    }

    const userId = session.user.id;

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.COMPLETED,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            marksPerQuestion: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                options: {
                  select: {
                    id: true,
                    text: true,
                    isCorrect: true,
                  },
                },
              },
            },
            selectedOption: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return {
        success: false,
        error: "Quiz attempt not found or not completed",
      };
    }

    const scoreData: {
      attemptId: string;
      score: number;
      totalMarks: number;
      accuracy: number;
      timeTaken: number | null;
      completedAt: Date;
      quiz: {
        id: string;
        title: string;
        subject: string;
        marksPerQuestion: number;
        questionCount: number;
      };
      breakdown?: {
        questionId: string;
        question: string;
        selectedOptionId: string | null;
        selectedOptionText: string | null;
        correctOptionText: string;
        isCorrect: boolean;
        marksAwarded: number;
      }[];
    } = {
      attemptId: attempt.id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      accuracy:
        typeof attempt.accuracy === "number"
          ? attempt.accuracy
          : attempt.accuracy.toNumber(),
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt!,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        subject: attempt.quiz.subject,
        marksPerQuestion: attempt.quiz.marksPerQuestion,
        questionCount: attempt.quiz._count.questions,
      },
    };

    if (includeBreakdown) {
      scoreData.breakdown = attempt.answers.map((answer) => {
        const correctOption = answer.question.options.find(
          (opt) => opt.isCorrect,
        );
        return {
          questionId: answer.questionId,
          question: answer.question.question,
          selectedOptionId: answer.selectedOptionId,
          selectedOptionText: answer.selectedOption?.text || null,
          correctOptionText: correctOption?.text || "Unknown",
          isCorrect: answer.isCorrect,
          marksAwarded: answer.marksAwarded,
        };
      });
    }

    return {
      success: true,
      score: scoreData,
    };
  } catch (error) {
    console.error("Error getting quiz score:", error);
    return {
      success: false,
      error: "Failed to load quiz results. Please try again.",
    };
  }
}
