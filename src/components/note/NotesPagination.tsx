import { Button } from "@/components/ui/button";
import { NOTES_QUERYResult } from "@/sanity/types";

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

export function NotesPagination({
  hasMore,
  lastNote,
  searchParams,
}: {
  hasMore: boolean;
  lastNote: NOTES_QUERYResult[0];
  searchParams: SearchParams;
}) {
  // Helper function to build URL with cursor for next page
  const buildNextPageUrl = () => {
    const params = new URLSearchParams();

    // Add all current search params except cursor params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "lastTitle" && key !== "lastId" && value) {
        params.set(key, value);
      }
    });

    // Add cursor parameters from the last note
    if (lastNote) {
      params.set("lastTitle", lastNote.title || "");
      params.set("lastId", lastNote._id);
    }

    const queryString = params.toString();
    return `/notes${queryString ? `?${queryString}` : ""}`;
  };

  if (!hasMore) {
    return null;
  }

  return (
    <div className="mt-10 flex justify-center">
      <Button asChild variant="outline" size="lg">
        <a href={buildNextPageUrl()}>Load More Notes</a>
      </Button>
    </div>
  );
}
