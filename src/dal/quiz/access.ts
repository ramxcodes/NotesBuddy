"use server";

import { getSession, checkUserBlockedStatus } from "@/lib/db/user";
import { checkUserAccessToContent } from "@/dal/premium/query";
import prisma from "@/lib/db/prisma";
import { PremiumTier, Role } from "@prisma/client";
import { convertPrismaValueToDisplayFormat } from "@/utils/value-convert";

export interface QuizAccessResult {
  canAccess: boolean;
  reason?:
    | "NOT_AUTHENTICATED"
    | "USER_BLOCKED"
    | "QUIZ_NOT_FOUND"
    | "QUIZ_INACTIVE"
    | "QUIZ_UNPUBLISHED"
    | "NO_PREMIUM"
    | "INSUFFICIENT_TIER"
    | "ACADEMIC_MISMATCH"
    | "ALREADY_ATTEMPTED";
  message?: string;
  quiz?: {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    timeLimit: number | null;
    marksPerQuestion: number;
    isPremium: boolean;
    requiredTier: PremiumTier | null;
    questionCount: number;
  };
  userStatus?: {
    hasPremium: boolean;
    tier: PremiumTier | null;
    university: string | null;
    degree: string | null;
    year: string | null;
    semester: string | null;
    expiryDate: Date | string | null;
    daysRemaining: number | null;
  };
  mismatches?: Array<{
    field: "university" | "degree" | "year" | "semester";
    userValue: string;
    requiredValue: string;
  }>;
}

/**
 * Check if user can access and attempt a quiz
 * Implements hierarchical tier access: TIER_1 users can access TIER_1, TIER_2 can access TIER_1+TIER_2, etc.
 */
export async function checkUserAccessToQuiz(
  quizId: string,
): Promise<QuizAccessResult> {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        canAccess: false,
        reason: "NOT_AUTHENTICATED",
        message: "Please sign in to access quizzes",
      };
    }

    const userId = session.user.id;

    // Check if user is an admin - admins get access to everything
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Get quiz details first to return in response
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!quiz) {
      return {
        canAccess: false,
        reason: "QUIZ_NOT_FOUND",
        message: "Quiz not found",
      };
    }

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      timeLimit: quiz.timeLimit,
      marksPerQuestion: quiz.marksPerQuestion,
      isPremium: quiz.isPremium,
      requiredTier: quiz.requiredTier,
      questionCount: quiz._count.questions,
    };

    // If user is admin, grant access regardless of other conditions
    if (user?.role === Role.ADMIN) {
      return {
        canAccess: true,
        quiz: quizData,
        userStatus: {
          hasPremium: true,
          tier: "TIER_3", // Treat admin as highest tier
          university: null,
          degree: null,
          year: null,
          semester: null,
          expiryDate: null,
          daysRemaining: null,
        },
      };
    }

    // Check if user is blocked
    const isBlocked = await checkUserBlockedStatus(userId);
    if (isBlocked) {
      return {
        canAccess: false,
        reason: "USER_BLOCKED",
        message: "Your account has been suspended. Please contact support.",
      };
    }

    // Check if quiz is active
    if (!quiz.isActive) {
      return {
        canAccess: false,
        reason: "QUIZ_INACTIVE",
        message: "This quiz is currently inactive",
      };
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return {
        canAccess: false,
        reason: "QUIZ_UNPUBLISHED",
        message: "This quiz is not yet available",
      };
    }

    // If it's a free quiz, allow access
    if (!quiz.isPremium) {
      return {
        canAccess: true,
        quiz: quizData,
      };
    }

    // For premium quizzes, check access with hierarchical tier system
    if (!quiz.requiredTier) {
      return {
        canAccess: false,
        reason: "NO_PREMIUM",
        message: "This quiz requires a premium subscription",
      };
    }

    // Convert Prisma enum values to display format for premium check
    const universityDisplay = convertPrismaValueToDisplayFormat(
      "university",
      quiz.university,
    );
    const degreeDisplay = convertPrismaValueToDisplayFormat(
      "degree",
      quiz.degree,
    );
    const yearDisplay = convertPrismaValueToDisplayFormat("year", quiz.year);
    const semesterDisplay = convertPrismaValueToDisplayFormat(
      "semester",
      quiz.semester,
    );

    const accessResult = await checkUserAccessToContent(
      userId,
      quiz.requiredTier,
      universityDisplay,
      degreeDisplay,
      yearDisplay,
      semesterDisplay,
    );

    if (!accessResult.canAccess) {
      let message = "You don't have access to this quiz.";

      switch (accessResult.reason) {
        case "NO_PREMIUM":
          message = "This quiz requires a premium subscription.";
          break;
        case "INSUFFICIENT_TIER":
          message = `This quiz requires ${quiz.requiredTier?.replace("TIER_", "Tier ")} or higher.`;
          break;
        case "ACADEMIC_MISMATCH":
          const mismatches = accessResult.mismatches;
          if (mismatches && mismatches.length > 0) {
            const mismatchFields = mismatches.map((m) => m.field).join(", ");
            message = `This quiz is not available for your ${mismatchFields}. Please check your academic details.`;
          }
          break;
      }

      return {
        canAccess: false,
        reason: accessResult.reason,
        message,
        quiz: quizData,
        userStatus: accessResult.userStatus,
        mismatches: accessResult.mismatches,
      };
    }

    return {
      canAccess: true,
      quiz: quizData,
      userStatus: accessResult.userStatus,
    };
  } catch {
    return {
      canAccess: false,
      reason: "QUIZ_NOT_FOUND",
      message: "Error checking quiz access. Please try again.",
    };
  }
}

/**
 * Get quiz details for attempt (only if user has access)
 */
export async function getQuizForAttempt(quizId: string) {
  const accessCheck = await checkUserAccessToQuiz(quizId);

  if (!accessCheck.canAccess) {
    return accessCheck;
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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
    });

    if (!quiz) {
      return {
        canAccess: false,
        reason: "QUIZ_NOT_FOUND" as const,
        message: "Quiz not found",
      };
    }

    return {
      ...accessCheck,
      quiz: {
        ...accessCheck.quiz!,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          question: question.question,
          explanation: question.explanation,
          order: question.order,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            order: option.order,
          })),
        })),
      },
    };
  } catch {
    return {
      canAccess: false,
      reason: "QUIZ_NOT_FOUND" as const,
      message: "Error loading quiz. Please try again.",
    };
  }
}
