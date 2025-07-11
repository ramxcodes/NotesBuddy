import Search from "@/components/note/Search";
import { Metadata } from "next";
import FilterNotesDropdown from "@/components/note/FilterNotesDropdown";
import { getFilteredNotes } from "@/dal/note/helper";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { NotesInfiniteList } from "@/components/note/NotesInfiniteList";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes page",
};

interface SearchParams {
  query?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
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
  const { query, university, degree, year, semester, subject } = params;

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
  };

  return (
    <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-center gap-4 space-y-10 py-5">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-bold">Welcome to Notes Buddy!</h1>
        <p className="text-muted-foreground text-lg">
          Find your notes by searching or filtering by university, degree, year,
          semester, and subject.
        </p>
      </div>

      {/* Search Component */}
      <Search query={query || ""} />

      {/* Filter Dropdown */}
      <FilterNotesDropdown
        userProfile={userProfile}
        isOnboarded={isOnboarded}
        isAuthenticated={!!session?.user}
      />

      {/* Infinite List Component */}
      <NotesInfiniteList
        initialNotes={initialNotes}
        searchParams={searchParamsForList}
      />
    </div>
  );
}
