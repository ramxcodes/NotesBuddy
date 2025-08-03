import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions, adminCacheConfig } from "@/cache/cache";
import {
  FlashcardSetListItem,
  FlashcardSetDetail,
  FlashcardSetStats,
  FlashcardSetFilters,
  FlashcardSetsListResponse,
  CreateFlashcardSetInput,
  UpdateFlashcardSetInput,
} from "./types";

// Admin Functions
export async function createFlashcardSet(data: CreateFlashcardSetInput) {
  const { cards, ...setData } = data;

  return await prisma.flashcardSet.create({
    data: {
      ...setData,
      cards: {
        create: cards.map((card, index) => ({
          ...card,
          order: index + 1,
        })),
      },
    },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          cards: true,
          visits: true,
        },
      },
    },
  });
}

export async function updateFlashcardSet(data: UpdateFlashcardSetInput) {
  const { id, cards, ...setData } = data;

  // If cards are provided, we need to update them
  if (cards) {
    return await prisma.$transaction(async (tx) => {
      // Delete existing cards
      await tx.flashcardItem.deleteMany({
        where: { setId: id },
      });

      // Update the set and create new cards
      return await tx.flashcardSet.update({
        where: { id },
        data: {
          ...setData,
          cards: {
            create: cards.map((card, index) => ({
              ...card,
              order: index + 1,
            })),
          },
        },
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              cards: true,
              visits: true,
            },
          },
        },
      });
    });
  }

  // If no cards provided, just update the set
  return await prisma.flashcardSet.update({
    where: { id },
    data: setData,
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          cards: true,
          visits: true,
        },
      },
    },
  });
}

export async function deleteFlashcardSet(id: string) {
  return await prisma.flashcardSet.delete({
    where: { id },
  });
}

export async function getFlashcardSets(
  filters: FlashcardSetFilters = {},
): Promise<FlashcardSetsListResponse> {
  const { page = 1, limit = 10, ...filterParams } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filterParams.university) where.university = filterParams.university;
  if (filterParams.degree) where.degree = filterParams.degree;
  if (filterParams.year) where.year = filterParams.year;
  if (filterParams.semester) where.semester = filterParams.semester;
  if (filterParams.subject)
    where.subject = { contains: filterParams.subject, mode: "insensitive" };
  if (filterParams.isPremium !== undefined)
    where.isPremium = filterParams.isPremium;
  if (filterParams.isActive !== undefined)
    where.isActive = filterParams.isActive;
  if (filterParams.isPublished !== undefined)
    where.isPublished = filterParams.isPublished;
  if (filterParams.search) {
    where.OR = [
      { title: { contains: filterParams.search, mode: "insensitive" } },
      { description: { contains: filterParams.search, mode: "insensitive" } },
      { subject: { contains: filterParams.search, mode: "insensitive" } },
    ];
  }

  // Get total count and paginated results in parallel
  const [sets, total] = await Promise.all([
    prisma.flashcardSet.findMany({
      where,
      include: {
        _count: {
          select: {
            cards: true,
            visits: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: offset,
      take: limit,
    }),
    prisma.flashcardSet.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const mappedSets = sets.map(
    (set) =>
      ({
        id: set.id,
        title: set.title,
        description: set.description,
        subject: set.subject,
        university: set.university,
        degree: set.degree,
        year: set.year,
        semester: set.semester,
        isActive: set.isActive,
        isPublished: set.isPublished,
        isPremium: set.isPremium,
        requiredTier: set.requiredTier,
        cardCount: set._count.cards,
        visitCount: set._count.visits,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
      }) satisfies FlashcardSetListItem,
  );

  return {
    sets: mappedSets,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
}

export async function getFlashcardSetById(
  id: string,
): Promise<FlashcardSetDetail | null> {
  const set = await prisma.flashcardSet.findUnique({
    where: { id },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!set) return null;

  return {
    id: set.id,
    title: set.title,
    description: set.description,
    subject: set.subject,
    university: set.university,
    degree: set.degree,
    year: set.year,
    semester: set.semester,
    isActive: set.isActive,
    isPublished: set.isPublished,
    isPremium: set.isPremium,
    requiredTier: set.requiredTier,
    cards: set.cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      order: card.order,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    })),
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
  };
}

async function getFlashcardSetStatsInternal(): Promise<FlashcardSetStats> {
  const [totalSets, activeSets, publishedSets, totalCards, totalVisits] =
    await Promise.all([
      prisma.flashcardSet.count(),
      prisma.flashcardSet.count({ where: { isActive: true } }),
      prisma.flashcardSet.count({ where: { isPublished: true } }),
      prisma.flashcardItem.count(),
      prisma.flashcardVisit.count(),
    ]);

  return {
    totalSets,
    activeSets,
    publishedSets,
    totalCards,
    totalVisits,
  };
}

export const getFlashcardSetStats = unstable_cache(
  getFlashcardSetStatsInternal,
  ["flashcard-stats"],
  getCacheOptions(adminCacheConfig.getFlashcardSetStats),
);

export async function toggleFlashcardSetStatus(id: string, isActive: boolean) {
  return await prisma.flashcardSet.update({
    where: { id },
    data: { isActive },
  });
}

export async function toggleFlashcardSetPublished(
  id: string,
  isPublished: boolean,
) {
  return await prisma.flashcardSet.update({
    where: { id },
    data: { isPublished },
  });
}

// Get academic filter options
export async function getFlashcardAcademicOptions() {
  const [universities, degrees, years, semesters, subjects] = await Promise.all(
    [
      prisma.flashcardSet.findMany({
        select: { university: true },
        distinct: ["university"],
      }),
      prisma.flashcardSet.findMany({
        select: { degree: true },
        distinct: ["degree"],
      }),
      prisma.flashcardSet.findMany({
        select: { year: true },
        distinct: ["year"],
      }),
      prisma.flashcardSet.findMany({
        select: { semester: true },
        distinct: ["semester"],
      }),
      prisma.flashcardSet.findMany({
        select: { subject: true },
        distinct: ["subject"],
      }),
    ],
  );

  return {
    universities: universities.map((u) => u.university),
    degrees: degrees.map((d) => d.degree),
    years: years.map((y) => y.year),
    semesters: semesters.map((s) => s.semester),
    subjects: subjects.map((s) => s.subject),
  };
}
