"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TypeFilterOption =
  | "all"
  | "notes"
  | "mst"
  | "pyq"
  | "one-shot"
  | "video-material"
  | "handwritten-notes";

interface NotesTypeFilterDropdownProps {
  className?: string;
}

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  { value: "notes", label: "Notes" },
  { value: "mst", label: "MST" },
  { value: "pyq", label: "PYQ" },
  { value: "one-shot", label: "One-Shot" },
  { value: "video-material", label: "Video Material" },
  { value: "handwritten-notes", label: "Handwritten Notes" },
] as const;

export default function NotesTypeFilterDropdown({
  className,
}: NotesTypeFilterDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter =
    (searchParams.get("type") as TypeFilterOption) || "notes";

  // Set initial URL state if no type parameter exists
  useEffect(() => {
    if (!searchParams.get("type")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", "notes");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always set the type parameter (don't delete it for default)
    params.set("type", value);

    params.delete("lastTitle");
    params.delete("lastId");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className={className}>
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px] rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
          {typeFilterOptions.map((option) => (
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
