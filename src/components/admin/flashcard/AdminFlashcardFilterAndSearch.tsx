"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MagnifyingGlass, Funnel, X } from "@phosphor-icons/react";
import { University, Degree, Year, Semester } from "@prisma/client";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";

type FlashcardSortOption =
  | "NEWEST"
  | "OLDEST"
  | "TITLE_ASC"
  | "TITLE_DESC"
  | "MOST_CARDS"
  | "MOST_VISITS";
type FlashcardFilterOption =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "PREMIUM"
  | "FREE";

interface AdminFlashcardFilterAndSearchProps {
  search: string;
  setSearch: (search: string) => void;
  sort: FlashcardSortOption;
  setSort: (sort: FlashcardSortOption) => void;
  filter: FlashcardFilterOption;
  setFilter: (filter: FlashcardFilterOption) => void;
  selectedUniversity?: University;
  setSelectedUniversity: (university: University | undefined) => void;
  selectedDegree?: Degree;
  setSelectedDegree: (degree: Degree | undefined) => void;
  selectedYear?: Year;
  setSelectedYear: (year: Year | undefined) => void;
  selectedSemester?: Semester;
  setSelectedSemester: (semester: Semester | undefined) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  subjects: string[];
  onClearFilters: () => void;
}

export default function AdminFlashcardFilterAndSearch({
  search,
  setSearch,
  sort,
  setSort,
  filter,
  setFilter,
  selectedUniversity,
  setSelectedUniversity,
  selectedDegree,
  setSelectedDegree,
  selectedYear,
  setSelectedYear,
  selectedSemester,
  setSelectedSemester,
  selectedSubject,
  setSelectedSubject,
  subjects,
  onClearFilters,
}: AdminFlashcardFilterAndSearchProps) {
  const hasActiveFilters =
    !!search ||
    filter !== "ALL" ||
    !!selectedUniversity ||
    !!selectedDegree ||
    !!selectedYear ||
    !!selectedSemester ||
    !!selectedSubject;

  const getFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (filter !== "ALL") count++;
    if (selectedUniversity) count++;
    if (selectedDegree) count++;
    if (selectedYear) count++;
    if (selectedSemester) count++;
    if (selectedSubject) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search and Primary Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search flashcard sets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-black pl-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:w-[180px] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEWEST">Newest First</SelectItem>
            <SelectItem value="OLDEST">Oldest First</SelectItem>
            <SelectItem value="TITLE_ASC">Title A-Z</SelectItem>
            <SelectItem value="TITLE_DESC">Title Z-A</SelectItem>
            <SelectItem value="MOST_CARDS">Most Cards</SelectItem>
            <SelectItem value="MOST_VISITS">Most Visits</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:w-[140px] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sets</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Academic Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          value={selectedUniversity || "ALL"}
          onValueChange={(value) =>
            setSelectedUniversity(
              value === "ALL" ? undefined : (value as University),
            )
          }
        >
          <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <SelectValue placeholder="University" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Universities</SelectItem>
            {Object.values(University).map((university) => (
              <SelectItem key={university} value={university}>
                {getDisplayNameFromPrismaValue("university", university)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDegree || "ALL"}
          onValueChange={(value) =>
            setSelectedDegree(value === "ALL" ? undefined : (value as Degree))
          }
        >
          <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <SelectValue placeholder="Degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Degrees</SelectItem>
            {Object.values(Degree).map((degree) => (
              <SelectItem key={degree} value={degree}>
                {getDisplayNameFromPrismaValue("degree", degree)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear || "ALL"}
          onValueChange={(value) =>
            setSelectedYear(value === "ALL" ? undefined : (value as Year))
          }
        >
          <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Years</SelectItem>
            {Object.values(Year).map((year) => (
              <SelectItem key={year} value={year}>
                {getDisplayNameFromPrismaValue("year", year)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSemester || "ALL"}
          onValueChange={(value) =>
            setSelectedSemester(
              value === "ALL" ? undefined : (value as Semester),
            )
          }
        >
          <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Semesters</SelectItem>
            {Object.values(Semester).map((semester) => (
              <SelectItem key={semester} value={semester}>
                {getDisplayNameFromPrismaValue("semester", semester)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubject || "ALL"}
          onValueChange={(value) =>
            setSelectedSubject(value === "ALL" ? "" : value)
          }
        >
          <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Funnel className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Active filters:</span>
            <Badge variant="secondary" className="text-xs">
              {getFilterCount()} filter{getFilterCount() !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="border-gray-300 hover:border-gray-400"
          >
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
