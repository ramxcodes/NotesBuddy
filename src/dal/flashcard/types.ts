import { z } from "zod";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
} from "@prisma/client";

// Create FlashcardSet Schema
export const createFlashcardSetSchema = z.object({
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
  isPremium: z.boolean().default(false),
  requiredTier: z.nativeEnum(PremiumTier).optional(),
  cards: z
    .array(
      z.object({
        front: z
          .string()
          .min(3, "Front content must be at least 3 characters")
          .max(1000, "Front content must be at most 1000 characters"),
        back: z
          .string()
          .min(3, "Back content must be at least 3 characters")
          .max(1000, "Back content must be at most 1000 characters"),
      }),
    )
    .min(1, "At least 1 flashcard is required")
    .max(50, "At most 50 flashcards are allowed"),
});

export const updateFlashcardSetSchema = createFlashcardSetSchema
  .partial()
  .extend({
    id: z.string(),
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  });

export type CreateFlashcardSetInput = z.infer<typeof createFlashcardSetSchema>;
export type UpdateFlashcardSetInput = z.infer<typeof updateFlashcardSetSchema>;

// API Response Types
export interface FlashcardSetListItem {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  isActive: boolean;
  isPublished: boolean;
  isPremium: boolean;
  requiredTier: PremiumTier | null;
  cardCount: number;
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
  // User-specific fields
  userHasVisited?: boolean;
  userLastVisitedAt?: Date | null;
}

export interface FlashcardSetSummary {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  isPremium: boolean;
  cardCount: number;
  visitCount: number;
}

export interface FlashcardSetDetail {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  isActive: boolean;
  isPublished: boolean;
  isPremium: boolean;
  requiredTier: PremiumTier | null;
  cards: FlashcardItemDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardItemDetail {
  id: string;
  front: string;
  back: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardSetStats {
  totalSets: number;
  activeSets: number;
  publishedSets: number;
  totalCards: number;
  totalVisits: number;
}

export interface FlashcardSetFilters {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
  isActive?: boolean;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FlashcardSetsListResponse {
  sets: FlashcardSetListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FlashcardUserActivity {
  setId: string;
  setTitle: string;
  subject: string;
  lastVisitedAt: Date;
  visitCount: number;
  completionPercentage: number;
}
