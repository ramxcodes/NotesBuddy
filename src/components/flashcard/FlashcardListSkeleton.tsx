"use client";

import React from "react";

export default function FlashcardListSkeleton() {
  return (
    <div className="mx-4 space-y-6">
      {/* Filter Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="neuro animate-pulse rounded-xl p-6">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="ml-2 h-6 w-16 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Subject Badge */}
            <div className="mb-4">
              <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Academic Info */}
            <div className="mb-4 space-y-1">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Stats */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Button */}
            <div className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
