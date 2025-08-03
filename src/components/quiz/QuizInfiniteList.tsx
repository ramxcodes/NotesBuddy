"use client";

import { useState, useTransition, useEffect } from "react";
import { UserQuizListItem } from "@/dal/quiz/user-query";
import QuizCard from "./QuizCard";
import { Button } from "@/components/ui/button";
import { loadMoreQuizzesAction } from "@/app/(user)/quiz/actions";
import { University, Degree, Year, Semester } from "@prisma/client";

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

interface QuizInfiniteListProps {
  initialQuizzes: UserQuizListItem[];
  searchParams: SearchParams;
  isAuthenticated: boolean;
}

export function QuizInfiniteList({
  initialQuizzes,
  searchParams,
  isAuthenticated,
}: QuizInfiniteListProps) {
  const [quizzes, setQuizzes] = useState<UserQuizListItem[]>(initialQuizzes);
  const [hasMore, setHasMore] = useState(initialQuizzes.length === 6);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuizzes(initialQuizzes);
    setHasMore(initialQuizzes.length === 6);
  }, [
    initialQuizzes,
    searchParams.q,
    searchParams.university,
    searchParams.degree,
    searchParams.year,
    searchParams.semester,
    searchParams.subject,
    searchParams.isPremium,
    searchParams.sort,
  ]);

  const loadMoreQuizzes = async () => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      try {
        const lastQuiz = quizzes[quizzes.length - 1];

        const newQuizzes = await loadMoreQuizzesAction({
          search: searchParams.q,
          university: searchParams.university,
          degree: searchParams.degree,
          year: searchParams.year,
          semester: searchParams.semester,
          subject: searchParams.subject,
          isPremium: searchParams.isPremium,
          sort: searchParams.sort,
          lastTitle: lastQuiz?.title || undefined,
          lastId: lastQuiz?.id || undefined,
        });

        if (newQuizzes.length > 0) {
          setQuizzes((prevQuizzes) => [...prevQuizzes, ...newQuizzes]);
          setHasMore(newQuizzes.length === 6);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more quizzes:", error);
        setHasMore(false);
      }
    });
  };

  return (
    <>
      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.length > 0 ? (
          quizzes.map((quiz: UserQuizListItem) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isAuthenticated={isAuthenticated}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No quizzes found with the current filters.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Load More button */}
      {quizzes.length > 0 && hasMore && (
        <div className="group mt-10 flex justify-center hover:cursor-pointer">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMoreQuizzes}
            disabled={isPending}
            className="border-primary dark:border-secondary border-r-4 border-b-4 transition-all duration-300 group-hover:cursor-pointer hover:border-r-1 hover:border-b-1"
          >
            {isPending ? "Loading..." : "Load More Quizzes"}
          </Button>
        </div>
      )}

      {/* End message */}
      {quizzes.length > 0 && !hasMore && (
        <div className="mt-10 flex justify-center">
          <p className="text-muted-foreground">
            Its the end {">"}.{"<"}
          </p>
        </div>
      )}
    </>
  );
}
