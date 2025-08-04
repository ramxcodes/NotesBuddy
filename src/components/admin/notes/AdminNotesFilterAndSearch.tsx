import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlass, Funnel, ArrowsDownUp } from "@phosphor-icons/react";

interface FilterOptions {
  universities: string[];
  degrees: string[];
  years: string[];
  semesters: string[];
  subjects: string[];
}

interface Props {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: "title" | "createdAt" | "university" | "subject";
  sortOrder: "asc" | "desc";
  onSortChange: (
    sortBy: "title" | "createdAt" | "university" | "subject",
    sortOrder: "asc" | "desc",
  ) => void;
  selectedUniversity: string;
  selectedDegree: string;
  selectedYear: string;
  selectedSemester: string;
  selectedSubject: string;
  onUniversityChange: (value: string) => void;
  onDegreeChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  filterOptions: FilterOptions | null;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function AdminNotesFilterAndSearch({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectedUniversity,
  selectedDegree,
  selectedYear,
  selectedSemester,
  selectedSubject,
  onUniversityChange,
  onDegreeChange,
  onYearChange,
  onSemesterChange,
  onSubjectChange,
  filterOptions,
  onClearFilters,
  hasActiveFilters,
}: Props) {
  const handleSortChange = (field: typeof sortBy) => {
    if (field === sortBy) {
      // Toggle order if same field
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc order
      onSortChange(field, "desc");
    }
  };

  return (
    <div className="neuro rounded-md p-6">
      <div className="space-y-6">
        {/* Search and Sort */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <MagnifyingGlass
              weight="duotone"
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/50"
            />
            <Input
              placeholder="Search notes by title, subject..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="font-satoshi pl-10 font-bold"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <ArrowsDownUp weight="duotone" className="h-4 w-4" />
            <span className="font-satoshi text-sm font-bold">Sort by:</span>
            <div className="flex gap-1">
              {[
                { key: "createdAt" as const, label: "Date" },
                { key: "title" as const, label: "Title" },
                { key: "university" as const, label: "University" },
                { key: "subject" as const, label: "Subject" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(key)}
                  className={`font-satoshi rounded-md font-bold ${
                    sortBy === key
                      ? "neuro-sm bg-black text-white dark:bg-white dark:text-black"
                      : "neuro-sm hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1 text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Funnel weight="duotone" className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold">
                Academic Filters
              </span>
            </div>
            {hasActiveFilters && (
              <Button
                onClick={onClearFilters}
                variant="outline"
                size="sm"
                className="font-satoshi font-bold"
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* University Filter */}
            <div>
              <label className="font-satoshi mb-2 block text-xs font-bold text-black/70 dark:text-white/70">
                University
              </label>
              <Select
                value={selectedUniversity}
                onValueChange={onUniversityChange}
              >
                <SelectTrigger className="font-satoshi font-bold">
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {filterOptions?.universities.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university === "MediCaps University"
                        ? "IPS University"
                        : university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Degree Filter */}
            <div>
              <label className="font-satoshi mb-2 block text-xs font-bold text-black/70 dark:text-white/70">
                Degree
              </label>
              <Select value={selectedDegree} onValueChange={onDegreeChange}>
                <SelectTrigger className="font-satoshi font-bold">
                  <SelectValue placeholder="All Degrees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degrees</SelectItem>
                  {filterOptions?.degrees.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree === "B.Tech CSE" ? "B.Tech IT" : degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="font-satoshi mb-2 block text-xs font-bold text-black/70 dark:text-white/70">
                Year
              </label>
              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="font-satoshi font-bold">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {filterOptions?.years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="font-satoshi mb-2 block text-xs font-bold text-black/70 dark:text-white/70">
                Semester
              </label>
              <Select value={selectedSemester} onValueChange={onSemesterChange}>
                <SelectTrigger className="font-satoshi font-bold">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {filterOptions?.semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="font-satoshi mb-2 block text-xs font-bold text-black/70 dark:text-white/70">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={onSubjectChange}>
                <SelectTrigger className="font-satoshi font-bold">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filterOptions?.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
