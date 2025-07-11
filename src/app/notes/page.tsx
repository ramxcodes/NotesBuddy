import Search from "@/components/note/Search";
import { Metadata } from "next";
import NotesCard from "@/components/note/NotesCard";
import FilterNotesDropdown from "@/components/note/FilterNotesDropdown";
import { getFilteredNotes } from "@/dal/note/helper";
import { getSession } from "@/lib/db/user";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { NotesPagination } from "@/components/note/NotesPagination";
import { NOTES_QUERYResult } from "@/sanity/types";

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
  const {
    query,
    university,
    degree,
    year,
    semester,
    subject,
    lastTitle,
    lastId,
  } = params;

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

  // Fetch filtered notes with cursor-based pagination
  const notes = await getFilteredNotes(filters, { lastTitle, lastId });

  // Check if there are more notes (if we got 6 results, there might be more)
  const hasMore = notes.length === 6;

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

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.length > 0 ? (
          notes.map((note: NOTES_QUERYResult[0]) => (
            <NotesCard key={note._id} note={note} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No notes found with the current filters.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Load More button - only show if there are notes and potentially more */}
      {notes.length > 0 && hasMore && (
        <NotesPagination
          hasMore={hasMore}
          lastNote={notes[notes.length - 1]}
          searchParams={params}
        />
      )}
    </div>
  );
}
