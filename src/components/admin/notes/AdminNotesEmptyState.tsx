import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Funnel } from "@phosphor-icons/react";

interface Props {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isLoading: boolean;
}

export default function AdminNotesEmptyState({
  hasActiveFilters,
  onClearFilters,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="neuro rounded-md">
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black dark:border-white"></div>
          <p className="font-satoshi text-sm font-bold text-black/60 dark:text-white/60">
            Loading notes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="neuro rounded-md">
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="neuro-sm rounded-full bg-white p-6 dark:bg-zinc-800">
          {hasActiveFilters ? (
            <Funnel weight="duotone" className="h-8 w-8 text-blue-600" />
          ) : (
            <FileText weight="duotone" className="h-8 w-8 text-gray-500" />
          )}
        </div>

        <h3 className="font-excon mt-4 text-lg font-black text-black dark:text-white">
          {hasActiveFilters ? "No notes found" : "No notes available"}
        </h3>

        <p className="font-satoshi mt-2 max-w-sm text-center text-sm font-bold text-black/60 dark:text-white/60">
          {hasActiveFilters
            ? "No notes match your current filters. Try adjusting your search criteria."
            : "There are no notes in the system yet."}
        </p>

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            className="neuro-button font-satoshi mt-4 rounded-md font-bold"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
