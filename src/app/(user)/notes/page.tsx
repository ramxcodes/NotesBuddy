import Search from "@/components/note/NotesSearch";
import { Metadata } from "next";
import FilterNotesDropdown from "@/components/note/FilterNotesDropdown";
import NotesPremiumFilterDropdown from "@/components/note/NotesPremiumFilterDropdown";
import NotesTypeFilterDropdown from "@/components/note/NotesTypeFilterDropdown";
import { getFilteredNotes } from "@/dal/note/helper";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { NotesInfiniteList } from "@/components/note/NotesInfiniteList";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Study Notes - Comprehensive Academic Resources",
  description:
    "Browse through thousands of comprehensive study notes across different universities, degrees, and subjects. Find the perfect notes to boost your academic performance and exam preparation.",
  keywords: [
    "study notes",
    "academic notes",
    "university notes",
    "exam preparation",
    "student resources",
    "learning materials",
    "education",
  ],
  openGraph: {
    title: "Study Notes - Comprehensive Academic Resources | Notes Buddy",
    description:
      "Browse through thousands of comprehensive study notes across different universities, degrees, and subjects. Find the perfect notes to boost your academic performance.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/notes`,
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Notes - Comprehensive Academic Resources",
    description:
      "Browse through thousands of comprehensive study notes across different universities, degrees, and subjects.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/notes`,
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

interface SearchParams {
  query?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
  premium?: string;
  type?: string;
  lastTitle?: string;
  lastId?: string;
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Get search parameters
  const params = await searchParams;
  const { query, university, degree, year, semester, subject, premium, type } =
    params;

  // Get user session and profile data
  const session = await getSession();
  let userProfile = null;
  let isOnboarded = false;

  if (session?.user?.id) {
    try {
      // Check if user completed onboarding
      const onboardingStatus = await getUserOnboardingStatus(session.user.id);
      isOnboarded = onboardingStatus?.isOnboarded ?? false;

      // Get user profile if onboarded
      if (isOnboarded) {
        userProfile = await getUserFullProfile(session.user.id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Prepare filter object
  const filters = {
    search: query,
    university: university === "all" ? undefined : university,
    degree: degree === "all" ? undefined : degree,
    year: year === "all" ? undefined : year,
    semester: semester === "all" ? undefined : semester,
    subject: subject === "all" ? undefined : subject,
    premium: premium === "all" ? undefined : premium,
    type: type === "all" ? undefined : type || "notes",
  };

  // Fetch initial notes (first page only)
  const initialNotes = await getFilteredNotes(filters);

  // Prepare search params for the infinite list (excluding cursor params)
  const searchParamsForList = {
    query,
    university,
    degree,
    year,
    semester,
    subject,
    premium,
    type: type || "notes", // Ensure type is always passed to the infinite list
  };

  return (
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <div className="relative mx-4">
        <Image
          src="/doodles/idea.svg"
          alt="Hero"
          width={50}
          height={50}
          className="absolute -top-20 left-0 size-28 md:top-20"
        />

        <div className="relative mx-auto mt-6 flex max-w-6xl flex-col items-center justify-center gap-4 space-y-6 px-4 py-5 sm:mt-8 sm:space-y-8 sm:px-6 lg:mt-10 lg:space-y-10 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Welcome to Notes Buddy!
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              Find your notes by searching or filtering.
            </p>
            <Image
              src="/doodles/rular.svg"
              alt="Hero"
              width={50}
              height={50}
              className="absolute right-0 hidden size-28 md:block"
            />
          </div>

          {/* Search Component */}
          <div className="w-full max-w-2xl">
            <Search query={query || ""} />
          </div>

          {/* Filter Dropdown */}
          <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-4">
              <FilterNotesDropdown
                userProfile={userProfile}
                isOnboarded={isOnboarded}
                isAuthenticated={!!session?.user}
              />
              <div className="flex gap-4">
                <NotesPremiumFilterDropdown />
                <NotesTypeFilterDropdown />
              </div>
            </div>
          </div>

          {/* Infinite List Component */}
          <div className="w-full">
            <NotesInfiniteList
              initialNotes={initialNotes}
              searchParams={searchParamsForList}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
