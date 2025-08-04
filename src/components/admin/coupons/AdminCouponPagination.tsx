"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface AdminCouponPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminCouponPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdminCouponPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-satoshi rounded-md border-2 border-black bg-zinc-100 font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
      >
        Previous
      </Button>

      <span className="font-satoshi px-4 font-bold text-black dark:text-white">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-satoshi rounded-md border-2 border-black bg-zinc-100 font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
      >
        Next
      </Button>
    </div>
  );
}
