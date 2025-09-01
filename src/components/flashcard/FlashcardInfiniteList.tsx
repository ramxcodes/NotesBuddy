"use client";

import { useState, useTransition, useEffect } from "react";
import { FlashcardSetListItem } from "@/dal/flashcard/types";
import FlashcardCard from "./FlashcardCard";
import { Button } from "@/components/ui/button";
import { loadMoreFlashcardSetsAction } from "@/app/(user)/flashcards/actions";
import { University, Degree, Year, Semester } from "@prisma/client";
import { telegramLogger } from "@/utils/telegram-logger";

interface SearchParams {
  q?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  isPremium?: boolean;
  sort?: string;
}

interface FlashcardInfiniteListProps {
  initialFlashcardSets: FlashcardSetListItem[];
  searchParams: SearchParams;
  isAuthenticated: boolean;
}

export function FlashcardInfiniteList({
  initialFlashcardSets,
  searchParams,
  isAuthenticated,
}: FlashcardInfiniteListProps) {
  const [flashcardSets, setFlashcardSets] =
    useState<FlashcardSetListItem[]>(initialFlashcardSets);
  const [hasMore, setHasMore] = useState(initialFlashcardSets.length === 6);
  const [isPending, startTransition] = useTransition();

  // Reset flashcard sets when search parameters change
  useEffect(() => {
    setFlashcardSets(initialFlashcardSets);
    setHasMore(initialFlashcardSets.length === 6);
  }, [
    initialFlashcardSets,
    searchParams.q,
    searchParams.university,
    searchParams.degree,
    searchParams.year,
    searchParams.semester,
    searchParams.subject,
    searchParams.isPremium,
    searchParams.sort,
  ]);

  const loadMoreFlashcardSets = async () => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      try {
        const lastFlashcardSet = flashcardSets[flashcardSets.length - 1];

        const newFlashcardSets = await loadMoreFlashcardSetsAction({
          search: searchParams.q,
          university: searchParams.university,
          degree: searchParams.degree,
          year: searchParams.year,
          semester: searchParams.semester,
          subject: searchParams.subject,
          isPremium: searchParams.isPremium,
          sort: searchParams.sort,
          lastTitle: lastFlashcardSet?.title || undefined,
          lastId: lastFlashcardSet?.id || undefined,
        });

        if (newFlashcardSets.length > 0) {
          setFlashcardSets((prevFlashcardSets) => [
            ...prevFlashcardSets,
            ...newFlashcardSets,
          ]);
          setHasMore(newFlashcardSets.length === 6);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        await telegramLogger("Error loading more flashcard sets:", error);
        setHasMore(false);
      }
    });
  };

  return (
    <>
      {/* Flashcard Sets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flashcardSets.length > 0 ? (
          flashcardSets.map((flashcardSet: FlashcardSetListItem) => (
            <FlashcardCard
              key={flashcardSet.id}
              flashcardSet={flashcardSet}
              isAuthenticated={isAuthenticated}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No flashcard sets found with the current filters.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Load More button */}
      {flashcardSets.length > 0 && hasMore && (
        <div className="group mt-10 flex justify-center hover:cursor-pointer">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMoreFlashcardSets}
            disabled={isPending}
            className="border-primary dark:border-secondary border-r-4 border-b-4 transition-all duration-300 group-hover:cursor-pointer hover:border-r-1 hover:border-b-1"
          >
            {isPending ? "Loading..." : "Load More Flashcard Sets"}
          </Button>
        </div>
      )}

      {/* End message */}
      {flashcardSets.length > 0 && !hasMore && (
        <div className="mt-10 flex justify-center">
          <p className="text-muted-foreground">
            Its the end {">"}.{"<"}
          </p>
        </div>
      )}
    </>
  );
}
