import prisma from "@/lib/db/prisma";
import {
  FlashcardSetListItem,
  FlashcardSetDetail,
  FlashcardSetFilters,
  FlashcardUserActivity,
} from "./types";
import { University, Degree, Year, Semester } from "@prisma/client";

// User Functions
export async function getPublishedFlashcardSets(
  filters: FlashcardSetFilters = {},
  userProfile?: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
  },
  userId?: string,
  limit: number = 6,
  lastTitle?: string,
  lastId?: string,
) {
  const where: Record<string, unknown> = {
    isActive: true,
    isPublished: true,
  };

  // Add cursor-based pagination
  if (lastTitle && lastId) {
    const lastFlashcardSet = await prisma.flashcardSet.findUnique({
      where: { id: lastId },
      select: { updatedAt: true, title: true },
    });

    if (lastFlashcardSet) {
      where.OR = [
        {
          updatedAt: {
            lt: lastFlashcardSet.updatedAt,
          },
        },
        {
          updatedAt: lastFlashcardSet.updatedAt,
          title: {
            gt: lastFlashcardSet.title,
          },
        },
      ];
    }
  }

  // Apply user's academic context if available
  if (userProfile) {
    where.university = userProfile.university;
    where.degree = userProfile.degree;
    where.year = userProfile.year;
    where.semester = userProfile.semester;
  }

  // Apply additional filters
  if (filters.subject)
    where.subject = { contains: filters.subject, mode: "insensitive" };
  if (filters.isPremium !== undefined) where.isPremium = filters.isPremium;
  if (filters.search) {
    const searchFilter = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
    ];

    if (where.OR) {
      // Combine cursor and search filters
      where.AND = [{ OR: where.OR }, { OR: searchFilter }];
      delete where.OR;
    } else {
      where.OR = searchFilter;
    }
  }

  const sets = await prisma.flashcardSet.findMany({
    where,
    include: {
      _count: {
        select: {
          cards: true,
          visits: true,
        },
      },
      ...(userId && {
        visits: {
          where: { userId },
          select: {
            visitedAt: true,
          },
          orderBy: {
            visitedAt: "desc",
          },
          take: 1,
        },
      }),
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    take: limit,
  });

  return sets.map((set) => {
    const userVisits = userId && "visits" in set ? set.visits : [];
    const userHasVisited = userVisits.length > 0;
    const userLastVisitedAt = userHasVisited ? userVisits[0].visitedAt : null;

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
      cardCount: set._count.cards,
      visitCount: set._count.visits,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      userHasVisited,
      userLastVisitedAt,
    } satisfies FlashcardSetListItem;
  });
}

export async function getFlashcardSetForUser(
  id: string,
  userId?: string,
): Promise<FlashcardSetDetail | null> {
  const set = await prisma.flashcardSet.findFirst({
    where: {
      id,
      isActive: true,
      isPublished: true,
    },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!set) return null;

  // Track visit if user is provided
  if (userId) {
    await trackFlashcardSetVisit(userId, id);
  }

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

export async function trackFlashcardSetVisit(
  userId: string,
  setId: string,
  cardId?: string,
) {
  return await prisma.flashcardVisit.create({
    data: {
      userId,
      setId,
      cardId,
    },
  });
}

export async function getUserFlashcardActivity(
  userId: string,
): Promise<FlashcardUserActivity[]> {
  const visits = await prisma.flashcardVisit.findMany({
    where: { userId },
    include: {
      set: {
        include: {
          _count: {
            select: {
              cards: true,
            },
          },
        },
      },
    },
    orderBy: { visitedAt: "desc" },
  });

  // Group visits by set and calculate stats
  const setVisits = new Map<
    string,
    {
      set: {
        id: string;
        title: string;
        subject: string;
        _count: { cards: number };
      };
      visits: typeof visits;
      lastVisit: Date;
    }
  >();

  visits.forEach((visit) => {
    const setId = visit.setId;
    if (!setVisits.has(setId)) {
      setVisits.set(setId, {
        set: visit.set,
        visits: [],
        lastVisit: visit.visitedAt,
      });
    }
    const entry = setVisits.get(setId)!;
    entry.visits.push(visit);
    if (visit.visitedAt > entry.lastVisit) {
      entry.lastVisit = visit.visitedAt;
    }
  });

  return Array.from(setVisits.values())
    .map(({ set, visits, lastVisit }) => {
      const uniqueCardVisits = new Set(
        visits.filter((v) => v.cardId).map((v) => v.cardId),
      ).size;
      const totalCards = set._count.cards;
      const completionPercentage =
        totalCards > 0 ? (uniqueCardVisits / totalCards) * 100 : 0;

      return {
        setId: set.id,
        setTitle: set.title,
        subject: set.subject,
        lastVisitedAt: lastVisit,
        visitCount: visits.length,
        completionPercentage: Math.round(completionPercentage),
      };
    })
    .sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime());
}

export async function getFlashcardSetsBySubject(
  subject: string,
  userProfile?: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
  },
  userId?: string,
) {
  const where: Record<string, unknown> = {
    isActive: true,
    isPublished: true,
    subject: { contains: subject, mode: "insensitive" },
  };

  // Apply user's academic context if available
  if (userProfile) {
    where.university = userProfile.university;
    where.degree = userProfile.degree;
    where.year = userProfile.year;
    where.semester = userProfile.semester;
  }

  const sets = await prisma.flashcardSet.findMany({
    where,
    include: {
      _count: {
        select: {
          cards: true,
          visits: true,
        },
      },
      ...(userId && {
        visits: {
          where: { userId },
          select: {
            visitedAt: true,
          },
          orderBy: {
            visitedAt: "desc",
          },
          take: 1,
        },
      }),
    },
    orderBy: [{ title: "asc" }],
  });

  return sets.map((set) => {
    const userVisits = userId && "visits" in set ? set.visits : [];
    const userHasVisited = userVisits.length > 0;
    const userLastVisitedAt = userHasVisited ? userVisits[0].visitedAt : null;

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
      cardCount: set._count.cards,
      visitCount: set._count.visits,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      userHasVisited,
      userLastVisitedAt,
    } satisfies FlashcardSetListItem;
  });
}

// Alias for getUserFlashcardSets
export const getUserFlashcardSets = getPublishedFlashcardSets;

export async function getUserFlashcardSubjects(filters: {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
}): Promise<string[]> {
  const where: Record<string, unknown> = {
    isActive: true,
    isPublished: true,
  };

  // Apply filters
  if (filters.university) where.university = filters.university;
  if (filters.degree) where.degree = filters.degree;
  if (filters.year) where.year = filters.year;
  if (filters.semester) where.semester = filters.semester;

  const sets = await prisma.flashcardSet.findMany({
    where,
    select: {
      subject: true,
    },
    distinct: ["subject"],
    orderBy: {
      subject: "asc",
    },
  });

  return sets.map((set) => set.subject);
}

// Load more flashcard sets with cursor-based pagination - specifically for infinite scroll
export async function loadMoreUserFlashcardSets(
  lastId: string,
  filters: FlashcardSetFilters = {},
  userProfile?: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
  },
  userId?: string,
  limit: number = 6,
): Promise<FlashcardSetListItem[]> {
  const where: Record<string, unknown> = {
    isActive: true,
    isPublished: true,
  };

  // Add cursor-based pagination
  const lastFlashcardSet = await prisma.flashcardSet.findUnique({
    where: { id: lastId },
    select: { updatedAt: true, title: true },
  });

  if (lastFlashcardSet) {
    where.OR = [
      {
        updatedAt: {
          lt: lastFlashcardSet.updatedAt,
        },
      },
      {
        updatedAt: lastFlashcardSet.updatedAt,
        title: {
          gt: lastFlashcardSet.title,
        },
      },
    ];
  }

  // Apply user's academic context if available
  if (userProfile) {
    where.university = userProfile.university;
    where.degree = userProfile.degree;
    where.year = userProfile.year;
    where.semester = userProfile.semester;
  }

  // Apply additional filters
  if (filters.subject)
    where.subject = { contains: filters.subject, mode: "insensitive" };
  if (filters.isPremium !== undefined) where.isPremium = filters.isPremium;
  if (filters.search) {
    const searchFilter = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
    ];

    if (where.OR) {
      // Combine cursor and search filters
      where.AND = [{ OR: where.OR }, { OR: searchFilter }];
      delete where.OR;
    } else {
      where.OR = searchFilter;
    }
  }

  const sets = await prisma.flashcardSet.findMany({
    where,
    include: {
      _count: {
        select: {
          cards: true,
          visits: true,
        },
      },
      ...(userId && {
        visits: {
          where: { userId },
          select: {
            visitedAt: true,
          },
          orderBy: {
            visitedAt: "desc",
          },
          take: 1,
        },
      }),
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    take: limit,
  });

  return sets.map((set) => {
    const userVisits = userId && "visits" in set ? set.visits : [];
    const userHasVisited = userVisits.length > 0;
    const userLastVisitedAt = userHasVisited ? userVisits[0].visitedAt : null;

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
      cardCount: set._count.cards,
      visitCount: set._count.visits,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      userHasVisited,
      userLastVisitedAt,
    } satisfies FlashcardSetListItem;
  });
}
