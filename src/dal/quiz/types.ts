import { z } from "zod";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
  AttemptStatus,
} from "@prisma/client";

// Create Quiz Schema
export const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().optional(),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(50, "Subject must be at most 50 characters"),
  university: z.nativeEnum(University),
  degree: z.nativeEnum(Degree),
  year: z.nativeEnum(Year),
  semester: z.nativeEnum(Semester),
  timeLimit: z
    .number()
    .min(1, "Time limit must be at least 1 minute")
    .max(300, "Time limit must be at most 300 minutes")
    .optional(),
  marksPerQuestion: z
    .number()
    .min(1, "Marks per question must be at least 1")
    .max(10, "Marks per question must be at most 10")
    .default(1),
  isPremium: z.boolean().default(false),
  requiredTier: z.nativeEnum(PremiumTier).optional(),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(10, "Question must be at least 10 characters")
          .max(500, "Question must be at most 500 characters"),
        explanation: z
          .string()
          .max(1000, "Explanation must be at most 1000 characters")
          .optional(),
        options: z
          .array(
            z.object({
              text: z
                .string()
                .min(1, "Option text is required")
                .max(200, "Option text must be at most 200 characters"),
              isCorrect: z.boolean(),
            }),
          )
          .min(2, "At least 2 options are required")
          .max(6, "At most 6 options are allowed"),
      }),
    )
    .min(1, "At least 1 question is required")
    .max(100, "At most 100 questions are allowed"),
});

export const updateQuizSchema = createQuizSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

// API Response Types
export interface QuizListItem {
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
  isActive: boolean;
  isPublished: boolean;
  isAttempted: boolean;
  isPremium: boolean;
  requiredTier: PremiumTier | null;
  questionCount: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  explanation: string | null;
  order: number;
  options: QuizQuestionOption[];
}

export interface QuizQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizAttemptStats {
  totalAttempts: number;
  uniqueUsers: number;
  averageScore: number;
  averageTimeTaken: number | null;
  completionRate: number;
  recentAttempts: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    score: number;
    totalMarks: number;
    accuracy: number;
    timeTaken: number | null;
    status: AttemptStatus;
    completedAt: Date | null;
  }[];
}

export interface QuizDetailsResponse extends QuizListItem {
  questions: QuizQuestion[];
  attemptStats: QuizAttemptStats;
}

export interface QuizzesListResponse {
  quizzes: QuizListItem[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    perPage: number;
  };
}

// Filter and Sort Types
export type QuizSortOption =
  | "NEWEST"
  | "OLDEST"
  | "MOST_ATTEMPTED"
  | "LEAST_ATTEMPTED"
  | "TITLE_ASC"
  | "TITLE_DESC"
  | "HIGHEST_SCORE"
  | "LOWEST_SCORE";

export type QuizFilterOption =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"
  | "PUBLISHED"
  | "DRAFT"
  | "PREMIUM"
  | "FREE"
  | "ATTEMPTED"
  | "NOT_ATTEMPTED";

export interface GetQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: QuizSortOption;
  filter?: QuizFilterOption;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
}

// Quiz Attempt Details
export interface QuizAttemptDetails {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number | null;
  status: AttemptStatus;
  startedAt: Date;
  completedAt: Date | null;
  answers: {
    questionId: string;
    question: string;
    selectedOptionId: string | null;
    selectedOptionText: string | null;
    correctOptionText: string;
    isCorrect: boolean;
    marksAwarded: number;
    timeTaken: number | null;
  }[];
}

// Quiz Attempt with User for Admin View
export interface QuizAttemptWithUser {
  id: string;
  userId: string;
  quizId: string;
  status: AttemptStatus;
  scoreObtained: number | null;
  totalScore: number | null;
  scorePercentage: number | null;
  timeSpentInSeconds: number | null;
  createdAt: string;
  completedAt: string | null;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    rollNumber: string | null;
  };
}
