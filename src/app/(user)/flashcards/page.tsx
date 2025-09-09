import { Suspense } from "react";
import { Link } from "next-view-transitions";
import FilterFlashcardDropdown from "@/components/flashcard/FilterFlashcardDropdown";
import { FlashcardInfiniteList } from "@/components/flashcard/FlashcardInfiniteList";
import FlashcardListSkeleton from "@/components/flashcard/FlashcardListSkeleton";
import SortDropdown from "@/components/common/SortDropdown";
import { loadUserFlashcardSetsAction, getUserContextAction } from "./actions";
import type { University, Degree, Year, Semester } from "@prisma/client";
import { sanityToPrismaValue } from "@/utils/academic-config";
import { getSession } from "@/lib/db/user";
import { getUserOnboardingStatus } from "@/dal/user/onboarding/query";
import OnboardingToast from "@/components/auth/OnboardingToast";
import { Metadata } from "next";
import StackIcon from "@/components/icons/StackIcon";

export const metadata: Metadata = {
  title: "Interactive Flashcards - Master Your Studies",
  description:
    "Enhance your learning with interactive flashcards designed for effective memorization and retention. Create custom flashcard sets and practice with spaced repetition techniques.",
  keywords: [
    "flashcards",
    "memorization",
    "spaced repetition",
    "study cards",
    "learning tools",
    "memory training",
    "academic study",
  ],
  openGraph: {
    title: "Interactive Flashcards - Master Your Studies | Notes Buddy",
    description:
      "Enhance your learning with interactive flashcards designed for effective memorization and retention.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/flashcards`,
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Flashcards - Master Your Studies",
    description:
      "Enhance your learning with interactive flashcards designed for effective memorization and retention.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/flashcards`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    sort?: string;
  }>;
}

async function FlashcardList({ searchParams }: FlashcardsPageProps) {
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
      sort: resolvedSearchParams?.sort,
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
      <div className="flex flex-col gap-4">
        <FilterFlashcardDropdown
          userProfile={userContext.userProfile}
          isOnboarded={userContext.isOnboarded}
          isAuthenticated={userContext.isAuthenticated}
        />
        <SortDropdown />
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
        <FlashcardInfiniteList
          initialFlashcardSets={flashcardSets.flashcardSets}
          searchParams={{
            q: resolvedSearchParams?.q,
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
            sort: resolvedSearchParams?.sort,
          }}
          isAuthenticated={userContext.isAuthenticated}
        />
      )}
    </div>
  );
}

export default async function FlashcardsPage({
  searchParams,
}: FlashcardsPageProps) {
  const session = await getSession();
  const isAuthenticated = !!session?.user?.id;

  let isOnboarded = false;
  if (session?.user?.id) {
    const onboardingStatus = await getUserOnboardingStatus(session.user.id);
    isOnboarded = onboardingStatus?.isOnboarded ?? false;
  }

  return (
    <div className="font-satoshi container mx-auto mt-10 min-h-screen max-w-6xl">
      <OnboardingToast
        isAuthenticated={isAuthenticated}
        isOnboarded={isOnboarded}
      />
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
