import { Suspense } from "react";
import { Link } from "next-view-transitions";
import FilterQuizDropdown from "@/components/quiz/FilterQuizDropdown";
import { QuizInfiniteList } from "@/components/quiz/QuizInfiniteList";
import QuizListSkeleton from "@/components/quiz/QuizListSkeleton";
import SortDropdown from "@/components/common/SortDropdown";
import { loadUserQuizzesAction, getUserContextAction } from "./actions";
import type { University, Degree, Year, Semester } from "@prisma/client";
import { GraduationCapIcon } from "@/components/icons/GraduationCapIcon";
import { sanityToPrismaValue } from "@/utils/academic-config";
import { getSession } from "@/lib/db/user";
import { getUserOnboardingStatus } from "@/dal/user/onboarding/query";
import OnboardingToast from "@/components/auth/OnboardingToast";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Quizzes - Test Your Knowledge",
  description:
    "Challenge yourself with interactive quizzes designed to test your understanding and reinforce learning. Track your progress and improve your academic performance with our comprehensive quiz platform.",
  keywords: [
    "quiz",
    "test",
    "assessment",
    "learning",
    "education",
    "knowledge test",
    "academic quiz",
    "practice test",
  ],
  openGraph: {
    title: "Interactive Quizzes - Test Your Knowledge | Notes Buddy",
    description:
      "Challenge yourself with interactive quizzes designed to test your understanding and reinforce learning.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/quiz`,
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Quizzes - Test Your Knowledge",
    description:
      "Challenge yourself with interactive quizzes designed to test your understanding and reinforce learning.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/quiz`,
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

interface QuizPageProps {
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

async function QuizList({ searchParams }: QuizPageProps) {
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

  const [quizzes, userContext] = await Promise.all([
    loadUserQuizzesAction({
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

  if (!quizzes) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <GraduationCapIcon className="mb-4 size-64 text-gray-400" />
        <h3 className="mb-2 text-xl font-bold">Error loading quizzes</h3>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 space-y-6">
      <div className="flex flex-col gap-4">
        <FilterQuizDropdown
          userProfile={userContext.userProfile}
          isOnboarded={userContext.isOnboarded}
          isAuthenticated={userContext.isAuthenticated}
        />
        <SortDropdown />
      </div>

      {quizzes.quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <GraduationCapIcon className="mb-4 size-64 text-gray-400" />
          <h3 className="mb-2 text-xl font-bold">No quizzes found</h3>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria, or{" "}
            <Link href="/notes" className="text-blue-600 hover:underline">
              explore our notes collection
            </Link>
            .
          </p>
        </div>
      ) : (
        <QuizInfiniteList
          initialQuizzes={quizzes.quizzes}
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

export default async function QuizPage({ searchParams }: QuizPageProps) {
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
        <h1 className="mb-2 text-4xl font-bold">Quiz</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with our comprehensive quizzes
        </p>
      </div>

      <Suspense fallback={<QuizListSkeleton />}>
        <QuizList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
