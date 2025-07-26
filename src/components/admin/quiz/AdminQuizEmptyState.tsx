"use client";

import React from "react";
import { QuestionIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type QuizFilterOption } from "@/dal/quiz/types";

interface AdminQuizEmptyStateProps {
  search: string;
  filter: QuizFilterOption;
  hasAcademicFilters: boolean;
}

export default function AdminQuizEmptyState({
  search,
  filter,
  hasAcademicFilters,
}: AdminQuizEmptyStateProps) {
  const hasFilters = search || filter !== "ALL" || hasAcademicFilters;

  if (hasFilters) {
    return (
      <div className="neuro rounded-xl p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
          <MagnifyingGlassIcon className="h-10 w-10 text-orange-600" />
        </div>
        <div className="mt-6">
          <div className="font-excon text-xl font-black text-black dark:text-white">
            No quizzes found
          </div>
          <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
            No quizzes match your current search and filter criteria.
            <br />
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="neuro rounded-xl p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
        <QuestionIcon className="h-10 w-10 text-blue-600" />
      </div>
      <div className="mt-6">
        <div className="font-excon text-xl font-black text-black dark:text-white">
          No quizzes yet
        </div>
        <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
          Get started by creating your first quiz.
          <br />
          You can create educational quizzes for different subjects and academic
          levels.
        </p>
      </div>
    </div>
  );
}
