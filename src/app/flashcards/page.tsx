import { Suspense } from "react";
import Link from "next/link";
import FilterFlashcardDropdown from "@/components/flashcard/FilterFlashcardDropdown";
import FlashcardCard from "@/components/flashcard/FlashcardCard";
import FlashcardListSkeleton from "@/components/flashcard/FlashcardListSkeleton";
import { loadUserFlashcardSetsAction, getUserContextAction } from "./actions";
import type { University, Degree, Year, Semester } from "@prisma/client";

import { sanityToPrismaValue } from "@/utils/academic-config";
import { Metadata } from "next";
import StackIcon from "@/components/icons/StackIcon";

export const metadata: Metadata = {
  title: "Flashcards - Notes Buddy",
  description: "Study with interactive flashcards to boost your learning",
};

interface FlashcardsPageProps {
  searchParams?: Promise<{
    q?: string;
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
    subject?: string;
    isPremium?: string;
  }>;
}

async function FlashcardList({ searchParams }: FlashcardsPageProps) {
  // Await searchParams since it's now a Promise in Next.js 15+
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // Convert sanity values to Prisma values
  const university = resolvedSearchParams?.university
    ? (sanityToPrismaValue("university", resolvedSearchParams.university) as
        | University
        | undefined)
    : undefined;
  const degree = resolvedSearchParams?.degree
    ? (sanityToPrismaValue("degree", resolvedSearchParams.degree) as
        | Degree
        | undefined)
    : undefined;
  const year = resolvedSearchParams?.year
    ? (sanityToPrismaValue("year", resolvedSearchParams.year) as
        | Year
        | undefined)
    : undefined;
  const semester = resolvedSearchParams?.semester
    ? (sanityToPrismaValue("semester", resolvedSearchParams.semester) as
        | Semester
        | undefined)
    : undefined;

  const [flashcardSets, userContext] = await Promise.all([
    loadUserFlashcardSetsAction({
      search: resolvedSearchParams?.q,
      university,
      degree,
      year,
      semester,
      subject: resolvedSearchParams?.subject,
      isPremium:
        resolvedSearchParams?.isPremium === "true"
          ? true
          : resolvedSearchParams?.isPremium === "false"
            ? false
            : undefined,
    }),
    getUserContextAction(),
  ]);

  if (!flashcardSets) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <StackIcon className="mb-4 size-64 text-gray-400" />
        <h3 className="mb-2 text-xl font-bold">Error loading flashcard sets</h3>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 space-y-6">
      <div className="space-y-6">
        <FilterFlashcardDropdown
          userProfile={userContext.userProfile}
          isOnboarded={userContext.isOnboarded}
          isAuthenticated={userContext.isAuthenticated}
        />
      </div>

      {flashcardSets.flashcardSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <StackIcon className="mb-4 size-64 text-gray-400" />
          <h3 className="mb-2 text-xl font-bold">No flashcard sets found</h3>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria, or{" "}
            <Link href="/notes" className="text-blue-600 hover:underline">
              explore our notes collection
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.flashcardSets.map((flashcardSet) => (
            <FlashcardCard
              key={flashcardSet.id}
              flashcardSet={flashcardSet}
              isAuthenticated={userContext.isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function FlashcardsPage({
  searchParams,
}: FlashcardsPageProps) {
  return (
    <div className="font-satoshi container mx-auto mt-10 min-h-screen max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Flashcards</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Study with interactive flashcards to boost your learning
        </p>
      </div>

      <Suspense fallback={<FlashcardListSkeleton />}>
        <FlashcardList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
