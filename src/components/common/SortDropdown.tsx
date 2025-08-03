"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

interface SortDropdownProps {
  className?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "A - Z" },
  { value: "title-desc", label: "Z - A" },
] as const;

export default function SortDropdown({ className }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortOption) || "newest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className={className}>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="neuro-sm font-satoshi w-48 font-bold">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
          {sortOptions.map((option) => (
            <SelectItem
              className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
