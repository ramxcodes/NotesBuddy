"use server";

import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
  AttemptStatus,
  type Prisma,
} from "@prisma/client";

// Types for user quiz operations
export interface UserQuizListItem {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  timeLimit: number | null;
  marksPerQuestion: number;
  isPremium: boolean;
  requiredTier: PremiumTier | null;
  questionCount: number;
  createdAt: Date;
  // User-specific fields
  userAttempts: UserQuizAttempt[];
  hasAttempted: boolean;
  bestScore: number | null;
  bestAccuracy: number | null;
  lastAttemptDate: Date | null;
  totalAttempts: number;
}

export interface UserQuizAttempt {
  id: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number | null;
  status: AttemptStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export interface UserQuizzesResponse {
  quizzes: UserQuizListItem[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    perPage: number;
  };
}

export interface GetUserQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
  hasAttempted?: boolean;
  userId?: string; // For user-specific data
}

// Cache config for user quiz operations
const userQuizCacheConfig = {
  getUserQuizzes: {
    cacheTime: 60, // 1 hour
    tags: ["user-quizzes"],
    cacheKey: "user-quizzes",
  },
  getUserQuizSubjects: {
    cacheTime: 60, // 1 hour
    tags: ["quiz-subjects"],
    cacheKey: "quiz-subjects",
  },
};

// Get quizzes for user with attempt information
async function getUserQuizzesInternal({
  page = 1,
  limit = 12,
  search,
  university,
  degree,
  year,
  semester,
  subject,
  isPremium,
  hasAttempted,
  userId,
}: GetUserQuizzesParams): Promise<UserQuizzesResponse> {
  const offset = (page - 1) * limit;

  // Build where clause for published and active quizzes only
  const where: Prisma.QuizWhereInput = {
    isActive: true,
    isPublished: true,
  };

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

  // Add premium filter
  if (isPremium !== undefined) where.isPremium = isPremium;

  // Get quizzes and total count
  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
        attempts: userId
          ? {
              where: { userId },
              select: {
                id: true,
                score: true,
                totalMarks: true,
                accuracy: true,
                timeTaken: true,
                status: true,
                startedAt: true,
                completedAt: true,
              },
              orderBy: { completedAt: "desc" },
            }
          : false,
      },
    }),
    prisma.quiz.count({ where }),
  ]);

  // Transform to user quiz format
  const userQuizzes: UserQuizListItem[] = quizzes.map((quiz) => {
    const attempts = quiz.attempts || [];
    const userAttempts: UserQuizAttempt[] = attempts.map((attempt) => ({
      id: attempt.id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      accuracy:
        typeof attempt.accuracy === "number"
          ? attempt.accuracy
          : attempt.accuracy.toNumber(),
      timeTaken: attempt.timeTaken,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));

    const completedAttempts = userAttempts.filter(
      (attempt) => attempt.status === AttemptStatus.COMPLETED,
    );

    const hasAttempted = userAttempts.length > 0;
    const bestScore =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a) => a.score))
        : null;
    const bestAccuracy =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a) => a.accuracy))
        : null;
    const lastAttemptDate =
      userAttempts.length > 0
        ? userAttempts[0].completedAt || userAttempts[0].startedAt
        : null;

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
      isPremium: quiz.isPremium,
      requiredTier: quiz.requiredTier,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
      userAttempts,
      hasAttempted,
      bestScore,
      bestAccuracy,
      lastAttemptDate,
      totalAttempts: userAttempts.length,
    };
  });

  // Apply hasAttempted filter after data transformation
  let filteredQuizzes = userQuizzes;
  if (hasAttempted !== undefined) {
    filteredQuizzes = userQuizzes.filter(
      (quiz) => quiz.hasAttempted === hasAttempted,
    );
  }

  return {
    quizzes: filteredQuizzes,
    pagination: {
      total: hasAttempted !== undefined ? filteredQuizzes.length : total,
      pages: Math.ceil(
        (hasAttempted !== undefined ? filteredQuizzes.length : total) / limit,
      ),
      current: page,
      perPage: limit,
    },
  };
}

// Cached wrapper for getUserQuizzes
export const getUserQuizzes = unstable_cache(
  getUserQuizzesInternal,
  ["user-quizzes"],
  getCacheOptions(userQuizCacheConfig.getUserQuizzes),
);

// Get available subjects for user quiz filters
async function getUserQuizSubjectsInternal(filters: {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
}): Promise<string[]> {
  const where: Prisma.QuizWhereInput = {
    isActive: true,
    isPublished: true,
  };

  if (filters.university) where.university = filters.university;
  if (filters.degree) where.degree = filters.degree;
  if (filters.year) where.year = filters.year;
  if (filters.semester) where.semester = filters.semester;

  const subjects = await prisma.quiz.findMany({
    where,
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  });

  return subjects.map((s) => s.subject);
}

// Cached wrapper for getUserQuizSubjects
export const getUserQuizSubjects = unstable_cache(
  getUserQuizSubjectsInternal,
  ["quiz-subjects"],
  getCacheOptions(userQuizCacheConfig.getUserQuizSubjects),
);

// Check if user has attempted a specific quiz
export async function getUserQuizAttemptStatus(
  quizId: string,
  userId: string,
): Promise<{
  hasAttempted: boolean;
  attempts: UserQuizAttempt[];
  bestScore: number | null;
  lastAttempt: UserQuizAttempt | null;
}> {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId,
      userId,
    },
    select: {
      id: true,
      score: true,
      totalMarks: true,
      accuracy: true,
      timeTaken: true,
      status: true,
      startedAt: true,
      completedAt: true,
    },
    orderBy: { completedAt: "desc" },
  });

  const userAttempts: UserQuizAttempt[] = attempts.map((attempt) => ({
    id: attempt.id,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    accuracy: attempt.accuracy.toNumber(),
    timeTaken: attempt.timeTaken,
    status: attempt.status,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
  }));

  const completedAttempts = userAttempts.filter(
    (attempt) => attempt.status === AttemptStatus.COMPLETED,
  );

  const bestScore =
    completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a) => a.score))
      : null;

  return {
    hasAttempted: userAttempts.length > 0,
    attempts: userAttempts,
    bestScore,
    lastAttempt: userAttempts.length > 0 ? userAttempts[0] : null,
  };
}
