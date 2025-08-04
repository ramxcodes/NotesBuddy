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

export type PremiumFilterOption = "all" | "free" | "premium";

interface NotesPremiumFilterDropdownProps {
  className?: string;
}

const premiumFilterOptions = [
  { value: "all", label: "All Notes" },
  { value: "free", label: "Free Notes" },
  { value: "premium", label: "Premium Notes" },
] as const;

export default function NotesPremiumFilterDropdown({
  className,
}: NotesPremiumFilterDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter =
    (searchParams.get("premium") as PremiumFilterOption) || "all";

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("premium");
    } else {
      params.set("premium", value);
    }

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
          {premiumFilterOptions.map((option) => (
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
