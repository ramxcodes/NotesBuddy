"use client";

import { useState, useTransition, useEffect } from "react";
import { NOTES_QUERYResult } from "@/sanity/types";
import NotesCard from "./NotesCard";
import { Button } from "@/components/ui/button";
import { loadMoreNotesAction } from "@/app/(user)/notes/actions";
import {
  searchOptimizer,
  measureSearchPerformance,
  sortSearchResults,
} from "@/lib/search/optimization";
import { telegramLogger } from "@/utils/telegram-logger";

interface SearchParams {
  query?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
  premium?: string;
  type?: string;
}

interface NotesInfiniteListProps {
  initialNotes: NOTES_QUERYResult;
  searchParams: SearchParams;
}

export function NotesInfiniteList({
  initialNotes,
  searchParams,
}: NotesInfiniteListProps) {
  const [notes, setNotes] = useState<NOTES_QUERYResult>(() => {
    // Sort initial notes if there's a search term
    return searchParams.query
      ? sortSearchResults(initialNotes, searchParams.query)
      : initialNotes;
  });
  const [hasMore, setHasMore] = useState(initialNotes.length === 6);
  const [isPending, startTransition] = useTransition();

  // Reset notes when search parameters change
  useEffect(() => {
    const sortedNotes = searchParams.query
      ? sortSearchResults(initialNotes, searchParams.query)
      : initialNotes;
    setNotes(sortedNotes);
    setHasMore(initialNotes.length === 6);
  }, [
    initialNotes,
    searchParams.query,
    searchParams.university,
    searchParams.degree,
    searchParams.year,
    searchParams.semester,
    searchParams.subject,
    searchParams.premium,
    searchParams.type, // Add type to dependency array
  ]);

  const loadMoreNotes = async () => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      try {
        const lastNote = notes[notes.length - 1];

        // Generate cache key for this search
        const cacheKey = searchOptimizer.generateCacheKey(searchParams, {
          lastTitle: lastNote?.title || undefined,
          lastId: lastNote?._id,
        });

        // Check client-side cache first
        const cachedResults = searchOptimizer.getCachedResults(cacheKey);
        if (cachedResults) {
          setNotes((prevNotes) => [...prevNotes, ...cachedResults]);
          setHasMore(cachedResults.length === 6);
          return;
        }

        const sanitizedQuery = searchParams.query
          ? searchOptimizer.sanitizeSearchQuery(searchParams.query)
          : undefined;

        if (
          sanitizedQuery &&
          searchOptimizer.shouldThrottleSearch(sanitizedQuery)
        ) {
          return;
        }

        const newNotes = await measureSearchPerformance(
          () =>
            loadMoreNotesAction({
              search: sanitizedQuery,
              university: searchParams.university,
              degree: searchParams.degree,
              year: searchParams.year,
              semester: searchParams.semester,
              subject: searchParams.subject,
              premium: searchParams.premium,
              type: searchParams.type,
              lastTitle: lastNote?.title || undefined,
              lastId: lastNote?._id || undefined,
            }),
          sanitizedQuery || "load-more",
        );

        if (newNotes.length > 0) {
          // Sort new results if there's a search term
          const sortedNewNotes = sanitizedQuery
            ? sortSearchResults(newNotes, sanitizedQuery)
            : newNotes;

          // Cache the results for future use
          searchOptimizer.setCachedResults(cacheKey, sortedNewNotes);

          // Append new notes to existing ones
          setNotes((prevNotes) => [...prevNotes, ...sortedNewNotes]);
          setHasMore(newNotes.length === 6);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        await telegramLogger("Error loading more notes:", error);
        setHasMore(false);
      }
    });
  };

  return (
    <>
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

      {/* Load More button */}
      {notes.length > 0 && hasMore && (
        <div className="group mt-10 flex justify-center hover:cursor-pointer">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMoreNotes}
            disabled={isPending}
            className="border-primary dark:border-secondary border-r-4 border-b-4 transition-all duration-300 group-hover:cursor-pointer hover:border-r-1 hover:border-b-1"
          >
            {isPending ? "Loading..." : "Load More Notes"}
          </Button>
        </div>
      )}

      {/* End message */}
      {notes.length > 0 && !hasMore && (
        <div className="mt-10 flex justify-center">
          <p className="text-muted-foreground">
            Its the end {">"}.{"<"}
          </p>
        </div>
      )}
    </>
  );
}
