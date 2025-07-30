import { client } from "@/sanity/lib/client";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import { nextContentCacheConfig } from "@/cache/next-content";
import {
  NEXT_UNITS_QUERY,
  SUBJECT_OTHER_CONTENT_QUERY,
} from "@/sanity/lib/next-content-queries";
import prisma from "@/lib/db/prisma";
import { University, Degree, Year, Semester } from "@prisma/client";
import { convertSanityValueToPrismaValue } from "@/utils/value-convert";

export interface NextContentData {
  nextUnits: Array<{
    _id: string;
    title: string | null;
    slug: { current: string } | null;
    syllabus?: string | null;
    isPremium: boolean | null;
    tier?: string | null;
  }>;
  otherContent: Array<{
    _id: string;
    title: string | null;
    slug: { current: string } | null;
    syllabus?: string | null;
    isPremium: boolean | null;
    tier?: string | null;
  }>;
  hasQuizzes: boolean;
  hasFlashcards: boolean;
}

export const getNextUnitsAndContent = unstable_cache(
  async (
    university: string,
    degree: string,
    year: string,
    semester: string,
    subject: string,
    currentSlug: string,
  ): Promise<NextContentData> => {
    // Get next units from Sanity
    const [nextUnits, otherContent] = await Promise.all([
      client.fetch(
        NEXT_UNITS_QUERY,
        {
          university,
          degree,
          year,
          semester,
          subject,
          currentSlug,
        },
        {
          next: { revalidate: 1800 }, // 30 minutes
        },
      ),
      client.fetch(
        SUBJECT_OTHER_CONTENT_QUERY,
        {
          university,
          degree,
          year,
          semester,
          subject,
          currentSlug,
        },
        {
          next: { revalidate: 1800 }, // 30 minutes
        },
      ),
    ]);

    // Convert Sanity enum values to Prisma enum values
    const prismaUniversity = convertSanityValueToPrismaValue(
      "university",
      university,
    );
    const prismaDegree = convertSanityValueToPrismaValue("degree", degree);
    const prismaYear = convertSanityValueToPrismaValue("year", year);
    const prismaSemester = convertSanityValueToPrismaValue(
      "semester",
      semester,
    );

    // Only check for quizzes and flashcards if we have valid enum values
    let quizzesCount = 0;
    let flashcardsCount = 0;

    if (prismaUniversity && prismaDegree && prismaYear && prismaSemester) {
      [quizzesCount, flashcardsCount] = await Promise.all([
        prisma.quiz.count({
          where: {
            university: prismaUniversity as University,
            degree: prismaDegree as Degree,
            year: prismaYear as Year,
            semester: prismaSemester as Semester,
            subject: {
              contains: subject,
              mode: "insensitive",
            },
            isActive: true,
            isPublished: true,
          },
        }),
        prisma.flashcardSet.count({
          where: {
            university: prismaUniversity as University,
            degree: prismaDegree as Degree,
            year: prismaYear as Year,
            semester: prismaSemester as Semester,
            subject: {
              contains: subject,
              mode: "insensitive",
            },
            isActive: true,
            isPublished: true,
          },
        }),
      ]);
    }

    return {
      nextUnits: (nextUnits || []) as NextContentData["nextUnits"],
      otherContent: (otherContent || []) as NextContentData["otherContent"],
      hasQuizzes: quizzesCount > 0,
      hasFlashcards: flashcardsCount > 0,
    };
  },
  [nextContentCacheConfig.getSubjectContent.cacheKey!],
  getCacheOptions(nextContentCacheConfig.getSubjectContent),
);

// Get available quizzes for a subject
export const getSubjectQuizzes = unstable_cache(
  async (
    university: string,
    degree: string,
    year: string,
    semester: string,
    subject: string,
  ) => {
    // Convert Sanity enum values to Prisma enum values
    const prismaUniversity = convertSanityValueToPrismaValue(
      "university",
      university,
    );
    const prismaDegree = convertSanityValueToPrismaValue("degree", degree);
    const prismaYear = convertSanityValueToPrismaValue("year", year);
    const prismaSemester = convertSanityValueToPrismaValue(
      "semester",
      semester,
    );

    // Return empty array if conversion fails
    if (!prismaUniversity || !prismaDegree || !prismaYear || !prismaSemester) {
      return [];
    }

    return await prisma.quiz.findMany({
      where: {
        university: prismaUniversity as University,
        degree: prismaDegree as Degree,
        year: prismaYear as Year,
        semester: prismaSemester as Semester,
        subject: {
          contains: subject,
          mode: "insensitive",
        },
        isActive: true,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        isPremium: true,
        requiredTier: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  },
  [nextContentCacheConfig.getSubjectQuizzes.cacheKey!],
  getCacheOptions(nextContentCacheConfig.getSubjectQuizzes),
);

// Get available flashcard sets for a subject
export const getSubjectFlashcards = unstable_cache(
  async (
    university: string,
    degree: string,
    year: string,
    semester: string,
    subject: string,
  ) => {
    // Convert Sanity enum values to Prisma enum values
    const prismaUniversity = convertSanityValueToPrismaValue(
      "university",
      university,
    );
    const prismaDegree = convertSanityValueToPrismaValue("degree", degree);
    const prismaYear = convertSanityValueToPrismaValue("year", year);
    const prismaSemester = convertSanityValueToPrismaValue(
      "semester",
      semester,
    );

    // Return empty array if conversion fails
    if (!prismaUniversity || !prismaDegree || !prismaYear || !prismaSemester) {
      return [];
    }

    return await prisma.flashcardSet.findMany({
      where: {
        university: prismaUniversity as University,
        degree: prismaDegree as Degree,
        year: prismaYear as Year,
        semester: prismaSemester as Semester,
        subject: {
          contains: subject,
          mode: "insensitive",
        },
        isActive: true,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPremium: true,
        requiredTier: true,
        _count: {
          select: {
            cards: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  },
  [nextContentCacheConfig.getSubjectFlashcards.cacheKey!],
  getCacheOptions(nextContentCacheConfig.getSubjectFlashcards),
);
