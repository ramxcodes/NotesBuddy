"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
} from "@phosphor-icons/react";

interface AdminReportsPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
}

export default function AdminReportsPagination({
  pagination,
  onPageChange,
}: AdminReportsPaginationProps) {
  const { currentPage, totalPages, totalReports, hasNext, hasPrev } =
    pagination;

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

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">
        Showing page {currentPage} of {totalPages} ({totalReports} total
        reports)
      </div>

      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="neuro-button flex items-center gap-1"
        >
          <CaretDoubleLeft size={14} />
          First
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="neuro-button flex items-center gap-1"
        >
          <CaretLeft size={14} />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="text-muted-foreground px-2">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={
                    page === currentPage
                      ? "neuro-primary neuro-button font-bold"
                      : "neuro-button"
                  }
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="neuro-button flex items-center gap-1"
        >
          Next
          <CaretRight size={14} />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="neuro-button flex items-center gap-1"
        >
          Last
          <CaretDoubleRight size={14} />
        </Button>
      </div>
    </div>
  );
}
