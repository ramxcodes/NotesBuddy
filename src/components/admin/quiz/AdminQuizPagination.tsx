"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface AdminQuizPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminQuizPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdminQuizPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="neuro-button font-satoshi rounded-xl font-bold disabled:opacity-50"
      >
        <CaretLeftIcon className="h-4 w-4" />
        Previous
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="font-satoshi px-3 py-2 text-black/50 dark:text-white/50"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(pageNumber)}
              className={`font-satoshi h-10 w-10 rounded-xl font-bold ${
                isActive
                  ? "border-2 border-black bg-black text-white dark:border-white/20 dark:bg-white dark:text-black"
                  : "neuro-button"
              }`}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="neuro-button font-satoshi rounded-xl font-bold disabled:opacity-50"
      >
        Next
        <CaretRightIcon className="h-4 w-4" />
      </Button>

      {/* Page Info */}
      <div className="ml-4 hidden md:block">
        <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
}
