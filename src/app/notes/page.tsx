import Search from "@/components/note/NotesSearch";
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
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <div className="mx-4">
        <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-center gap-4 space-y-6 px-4 py-5 sm:mt-8 sm:space-y-8 sm:px-6 lg:mt-10 lg:space-y-10 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Welcome to Notes Buddy!
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              Find your notes by searching or filtering.
            </p>
          </div>

          {/* Search Component */}
          <div className="w-full max-w-2xl">
            <Search query={query || ""} />
          </div>

          {/* Filter Dropdown */}
          <div className="w-full max-w-4xl">
            <FilterNotesDropdown
              userProfile={userProfile}
              isOnboarded={isOnboarded}
              isAuthenticated={!!session?.user}
            />
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
