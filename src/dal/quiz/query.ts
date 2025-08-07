import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions, adminCacheConfig } from "@/cache/cache";
import { University, Degree, Year, Semester } from "@prisma/client";
import {
  type QuizListItem,
  type QuizzesListResponse,
  type QuizDetailsResponse,
  type QuizAttemptStats,
  type GetQuizzesParams,
  type CreateQuizInput,
  type UpdateQuizInput,
  type QuizAttemptDetails,
  type QuizAttemptWithUser,
  type QuizStats,
} from "./types";
import { Prisma } from "@prisma/client";

// Get all quizzes with pagination and filters (internal function)
async function getQuizzesInternal({
  page = 1,
  limit = 10,
  search,
  sort = "NEWEST",
  filter = "ALL",
  university,
  degree,
  year,
  semester,
  subject,
}: GetQuizzesParams): Promise<QuizzesListResponse> {
  const offset = (page - 1) * limit;

  // Build where clause
  const where: Prisma.QuizWhereInput = {};

  // Add search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }

  // Add academic filters
  if (university) where.university = university;
  if (degree) where.degree = degree;
  if (year) where.year = year;
  if (semester) where.semester = semester;
  if (subject) where.subject = { contains: subject, mode: "insensitive" };

  // Add status filter
  switch (filter) {
    case "ACTIVE":
      where.isActive = true;
      break;
    case "INACTIVE":
      where.isActive = false;
      break;
    case "PUBLISHED":
      where.isPublished = true;
      break;
    case "DRAFT":
      where.isPublished = false;
      break;
    case "PREMIUM":
      where.isPremium = true;
      break;
    case "FREE":
      where.isPremium = false;
      break;
    case "ATTEMPTED":
      where.isAttempted = true;
      break;
    case "NOT_ATTEMPTED":
      where.isAttempted = false;
      break;
  }

  // Build order by clause
  const orderBy: Prisma.QuizOrderByWithRelationInput = {};

  switch (sort) {
    case "NEWEST":
      orderBy.createdAt = "desc";
      break;
    case "OLDEST":
      orderBy.createdAt = "asc";
      break;
    case "MOST_ATTEMPTED":
      orderBy.attempts = { _count: "desc" };
      break;
    case "LEAST_ATTEMPTED":
      orderBy.attempts = { _count: "asc" };
      break;
    case "TITLE_ASC":
      orderBy.title = "asc";
      break;
    case "TITLE_DESC":
      orderBy.title = "desc";
      break;
    case "HIGHEST_SCORE":
      // This would require a complex aggregation, for now use creation date
      orderBy.createdAt = "desc";
      break;
    case "LOWEST_SCORE":
      // This would require a complex aggregation, for now use creation date
      orderBy.createdAt = "asc";
      break;
  }

  // Get quizzes and total count
  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    }),
    prisma.quiz.count({ where }),
  ]);

  // Transform to response format
  const transformedQuizzes: QuizListItem[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    university: quiz.university,
    degree: quiz.degree,
    year: quiz.year,
    semester: quiz.semester,
    timeLimit: quiz.timeLimit,
    marksPerQuestion: quiz.marksPerQuestion,
    isActive: quiz.isActive,
    isPublished: quiz.isPublished,
    isAttempted: quiz.isAttempted,
    isPremium: quiz.isPremium,
    requiredTier: quiz.requiredTier,
    questionCount: quiz._count.questions,
    attemptCount: quiz._count.attempts,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  }));

  return {
    quizzes: transformedQuizzes,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      perPage: limit,
    },
  };
}

// Cached wrapper for getQuizzes (10 minutes cache)
export const getQuizzes = unstable_cache(
  getQuizzesInternal,
  ["admin-quizzes"],
  getCacheOptions(adminCacheConfig.getAdminQuizzes),
);

// Get quiz details with questions and attempt stats (internal function)
async function getQuizDetailsInternal(
  id: string,
): Promise<QuizDetailsResponse | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      attempts: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 10, // Get recent 10 attempts
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  if (!quiz) return null;

  // Calculate attempt statistics
  const completedAttempts = quiz.attempts.filter(
    (attempt) => attempt.completedAt !== null,
  );
  const totalAttempts = quiz.attempts.length;
  const uniqueUsers = new Set(quiz.attempts.map((attempt) => attempt.userId))
    .size;

  const averageScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        completedAttempts.length
      : 0;

  const averageTimeTaken =
    completedAttempts.length > 0
      ? completedAttempts
          .filter((attempt) => attempt.timeTaken !== null)
          .reduce((sum, attempt) => sum + (attempt.timeTaken || 0), 0) /
        completedAttempts.filter((attempt) => attempt.timeTaken !== null).length
      : null;

  const completionRate =
    totalAttempts > 0 ? (completedAttempts.length / totalAttempts) * 100 : 0;

  const attemptStats: QuizAttemptStats = {
    totalAttempts,
    uniqueUsers,
    averageScore,
    averageTimeTaken,
    completionRate,
    recentAttempts: quiz.attempts.slice(0, 10).map((attempt) => ({
      id: attempt.id,
      userId: attempt.userId,
      userName: attempt.user.name,
      userEmail: attempt.user.email,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      accuracy: attempt.accuracy.toNumber(),
      timeTaken: attempt.timeTaken,
      status: attempt.status,
      completedAt: attempt.completedAt,
    })),
  };

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    university: quiz.university,
    degree: quiz.degree,
    year: quiz.year,
    semester: quiz.semester,
    timeLimit: quiz.timeLimit,
    marksPerQuestion: quiz.marksPerQuestion,
    isActive: quiz.isActive,
    isPublished: quiz.isPublished,
    isAttempted: quiz.isAttempted,
    isPremium: quiz.isPremium,
    requiredTier: quiz.requiredTier,
    questionCount: quiz._count.questions,
    attemptCount: quiz._count.attempts,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      explanation: question.explanation,
      order: question.order,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order,
      })),
    })),
    attemptStats,
  };
}

// Cached wrapper for getQuizDetails (10 minutes cache)
export const getQuizDetails = unstable_cache(
  getQuizDetailsInternal,
  ["quiz-details"],
  getCacheOptions(adminCacheConfig.getQuizDetails),
);

// Create new quiz
export async function createQuiz(data: CreateQuizInput): Promise<QuizListItem> {
  const { questions, ...quizData } = data;

  const quiz = await prisma.quiz.create({
    data: {
      ...quizData,
      questions: {
        create: questions.map((questionData, questionIndex) => ({
          question: questionData.question,
          explanation: questionData.explanation,
          order: questionIndex + 1,
          options: {
            create: questionData.options.map((optionData, optionIndex) => ({
              text: optionData.text,
              isCorrect: optionData.isCorrect,
              order: optionIndex + 1,
            })),
          },
        })),
      },
    },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    university: quiz.university,
    degree: quiz.degree,
    year: quiz.year,
    semester: quiz.semester,
    timeLimit: quiz.timeLimit,
    marksPerQuestion: quiz.marksPerQuestion,
    isActive: quiz.isActive,
    isPublished: quiz.isPublished,
    isAttempted: quiz.isAttempted,
    isPremium: quiz.isPremium,
    requiredTier: quiz.requiredTier,
    questionCount: quiz._count.questions,
    attemptCount: quiz._count.attempts,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

// Update quiz
export async function updateQuiz(
  data: UpdateQuizInput,
): Promise<QuizListItem | null> {
  const { id, questions, ...updateData } = data;

  // If questions are being updated, we need to handle them separately
  if (questions) {
    await prisma.$transaction(async (tx) => {
      // Delete existing questions and options
      await tx.question.deleteMany({
        where: { quizId: id },
      });

      // Create new questions
      await tx.question.createMany({
        data: questions.map((questionData, questionIndex) => ({
          quizId: id,
          question: questionData.question,
          explanation: questionData.explanation,
          order: questionIndex + 1,
        })),
      });

      // Get the created questions to create options
      const createdQuestions = await tx.question.findMany({
        where: { quizId: id },
        orderBy: { order: "asc" },
      });

      // Create options for each question
      for (let i = 0; i < createdQuestions.length; i++) {
        const question = createdQuestions[i];
        const questionData = questions[i];

        await tx.questionOption.createMany({
          data: questionData.options.map((optionData, optionIndex) => ({
            questionId: question.id,
            text: optionData.text,
            isCorrect: optionData.isCorrect,
            order: optionIndex + 1,
          })),
        });
      }

      // Update the quiz itself
      await tx.quiz.update({
        where: { id },
        data: updateData,
      });
    });
  } else {
    // Just update the quiz without touching questions
    await prisma.quiz.update({
      where: { id },
      data: updateData,
    });
  }

  // Fetch and return the updated quiz
  const updatedQuiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  if (!updatedQuiz) return null;

  return {
    id: updatedQuiz.id,
    title: updatedQuiz.title,
    description: updatedQuiz.description,
    subject: updatedQuiz.subject,
    university: updatedQuiz.university,
    degree: updatedQuiz.degree,
    year: updatedQuiz.year,
    semester: updatedQuiz.semester,
    timeLimit: updatedQuiz.timeLimit,
    marksPerQuestion: updatedQuiz.marksPerQuestion,
    isActive: updatedQuiz.isActive,
    isPublished: updatedQuiz.isPublished,
    isAttempted: updatedQuiz.isAttempted,
    isPremium: updatedQuiz.isPremium,
    requiredTier: updatedQuiz.requiredTier,
    questionCount: updatedQuiz._count.questions,
    attemptCount: updatedQuiz._count.attempts,
    createdAt: updatedQuiz.createdAt,
    updatedAt: updatedQuiz.updatedAt,
  };
}

// Delete quiz
export async function deleteQuiz(id: string): Promise<boolean> {
  try {
    await prisma.quiz.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return false;
  }
}

// Get quiz attempt details
export async function getQuizAttemptDetails(
  attemptId: string,
): Promise<QuizAttemptDetails | null> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      quiz: {
        select: {
          id: true,
          title: true,
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

  if (!attempt) return null;

  return {
    id: attempt.id,
    userId: attempt.userId,
    userName: attempt.user.name,
    userEmail: attempt.user.email,
    quizId: attempt.quizId,
    quizTitle: attempt.quiz.title,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    accuracy: attempt.accuracy.toNumber(),
    timeTaken: attempt.timeTaken,
    status: attempt.status,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    answers: attempt.answers.map((answer) => {
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
        timeTaken: answer.timeTaken,
      };
    }),
  };
}

// Get all attempts for a specific quiz
async function getQuizAttemptsInternal(
  quizId: string,
): Promise<QuizAttemptWithUser[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return attempts.map((attempt) => {
    // Calculate score percentage
    const scorePercentage =
      attempt.totalMarks > 0 ? (attempt.score / attempt.totalMarks) * 100 : 0;

    return {
      id: attempt.id,
      userId: attempt.userId,
      quizId: attempt.quizId,
      status: attempt.status,
      scoreObtained: attempt.score,
      totalScore: attempt.totalMarks,
      scorePercentage: scorePercentage,
      timeSpentInSeconds: attempt.timeTaken,
      createdAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() || null,
      user: {
        id: attempt.user.id,
        email: attempt.user.email,
        displayName: attempt.user.name, // Using name as displayName
        rollNumber: null, // Not available in schema
      },
    };
  });
}

// Get quiz attempts (cached)
export const getQuizAttempts = unstable_cache(
  getQuizAttemptsInternal,
  ["quiz-attempts"],
  getCacheOptions(adminCacheConfig.getQuizAttempts),
);

// Get quiz statistics for admin dashboard
export async function getQuizStats(): Promise<QuizStats> {
  const [
    totalQuizzes,
    activeQuizzes,
    publishedQuizzes,
    totalQuestions,
    totalAttempts,
  ] = await Promise.all([
    prisma.quiz.count(),
    prisma.quiz.count({ where: { isActive: true } }),
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.question.count(),
    prisma.quizAttempt.count(),
  ]);

  return {
    totalQuizzes,
    activeQuizzes,
    publishedQuizzes,
    totalQuestions,
    totalAttempts,
  };
}

// Get unique subjects for filter dropdown
export async function getQuizSubjects(): Promise<string[]> {
  const subjects = await prisma.quiz.findMany({
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  });

  return subjects.map((s) => s.subject);
}

// Bulk import quizzes
export async function bulkCreateQuizzes(
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
  }>,
  academicInfo: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
  },
  unitNumber?: number,
  customTitle?: string,
  customDescription?: string,
): Promise<{
  success: boolean;
  quizId?: string;
  imported?: {
    quizzes: number;
    questions: number;
    options: number;
  };
  error?: string;
}> {
  try {
    let importedQuizzes = 0;
    let importedQuestions = 0;
    let importedOptions = 0;
    let createdQuizId: string | undefined;

    const chunkSize = 3;

    for (let i = 0; i < quizSets.length; i += chunkSize) {
      const chunk = quizSets.slice(i, i + chunkSize);

      await prisma.$transaction(
        async (tx) => {
          for (const quizSet of chunk) {
            const quiz = await tx.quiz.create({
              data: {
                title: customTitle || `${quizSet.subject}`,
                description:
                  customDescription ||
                  `Quiz on ${quizSet.topic} from ${quizSet.subject}`,
                subject: quizSet.subject,
                university: academicInfo.university,
                degree: academicInfo.degree,
                year: academicInfo.year,
                semester: academicInfo.semester,
                timeLimit: null,
                marksPerQuestion: 1,
                isActive: true,
                isPublished: false,
              },
            });

            if (quizSets.length === 1) {
              createdQuizId = quiz.id;
            }

            importedQuizzes++;

            // Prepare all questions for batch creation
            const questionsToCreate = quizSet.questions.map((questionData) => ({
              quizId: quiz.id,
              question: questionData.question,
              explanation: questionData.explanation,
              order: questionData.order,
            }));

            // Create all questions at once
            await tx.question.createMany({
              data: questionsToCreate,
            });

            importedQuestions += questionsToCreate.length;

            // Get the created questions to link options
            const createdQuestions = await tx.question.findMany({
              where: { quizId: quiz.id },
              orderBy: { order: "asc" },
            });

            // Prepare all options for batch creation
            const optionsToCreate: Array<{
              questionId: string;
              text: string;
              isCorrect: boolean;
              order: number;
            }> = [];

            for (let i = 0; i < createdQuestions.length; i++) {
              const question = createdQuestions[i];
              const questionData = quizSet.questions[i];

              for (const optionData of questionData.options) {
                optionsToCreate.push({
                  questionId: question.id,
                  text: optionData.text,
                  isCorrect: optionData.isCorrect,
                  order: optionData.order,
                });
              }
            }

            // Create all options at once
            if (optionsToCreate.length > 0) {
              await tx.questionOption.createMany({
                data: optionsToCreate,
              });

              importedOptions += optionsToCreate.length;
            }
          }
        },
        {
          timeout: 20000, // 20 seconds timeout per chunk
          maxWait: 5000, // 5 seconds max wait to acquire connection
        },
      );
    }

    return {
      success: true,
      quizId: createdQuizId,
      imported: {
        quizzes: importedQuizzes,
        questions: importedQuestions,
        options: importedOptions,
      },
    };
  } catch (error) {
    console.error("Error in bulk quiz creation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to bulk create quizzes",
    };
  }
}
