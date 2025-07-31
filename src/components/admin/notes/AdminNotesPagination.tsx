import React from "react";
import { Button } from "@/components/ui/button";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export default function AdminNotesPagination({
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: Props) {
  const pageSize = 20;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const generatePageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show 5 page numbers

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="neuro rounded-xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Results info */}
        <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
          Showing <span className="font-black">{startItem}</span> to{" "}
          <span className="font-black">{endItem}</span> of{" "}
          <span className="font-black">{totalCount}</span> notes
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            variant="outline"
            size="sm"
            className="neuro-sm font-satoshi rounded-md font-bold"
          >
            <CaretLeft weight="duotone" className="h-4 w-4" />
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {generatePageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                className={`font-satoshi rounded-md font-bold ${
                  pageNum === currentPage
                    ? "neuro-sm bg-black text-white dark:bg-white dark:text-black"
                    : "neuro-sm hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {pageNum}
              </Button>
            ))}
          </div>

          {/* Next button */}
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            variant="outline"
            size="sm"
            className="neuro-sm font-satoshi rounded-md font-bold"
          >
            Next
            <CaretRight weight="duotone" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
