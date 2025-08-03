"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

interface AdminReportsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function AdminReportsEmptyState({
  hasFilters,
  onClearFilters,
}: AdminReportsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-zinc-100 dark:border-white/20 dark:bg-zinc-700">
        <MagnifyingGlassIcon
          size={32}
          className="text-zinc-600 dark:text-zinc-400"
        />
      </div>

      <h3 className="font-excon mb-2 text-xl font-bold text-black dark:text-white">
        {hasFilters ? "No Reports Found" : "No Reports Yet"}
      </h3>

      <p className="font-satoshi mb-6 max-w-md text-center text-zinc-600 dark:text-zinc-400">
        {hasFilters
          ? "We couldn't find any reports matching your current filters. Try adjusting your search criteria or clearing the filters."
          : "No reports have been submitted yet. When users submit reports, they will appear here for you to review and manage."}
      </p>

      {hasFilters && (
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="neuro-button flex items-center gap-2"
        >
          <XIcon size={16} />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
