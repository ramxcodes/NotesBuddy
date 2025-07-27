"use client";

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
import { MagnifyingGlassIcon, FunnelIcon } from "@phosphor-icons/react";
import { type QuizSortOption, type QuizFilterOption } from "@/dal/quiz/types";
import { University, Degree, Year, Semester } from "@prisma/client";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
} from "@/utils/academic-config";

interface AdminQuizFilterAndSearchProps {
  search: string;
  sort: QuizSortOption;
  filter: QuizFilterOption;
  subjects: string[];
  selectedUniversity?: University;
  selectedDegree?: Degree;
  selectedYear?: Year;
  selectedSemester?: Semester;
  selectedSubject: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: QuizSortOption) => void;
  onFilterChange: (value: QuizFilterOption) => void;
  onAcademicFilterChange: (
    type: "university" | "degree" | "year" | "semester" | "subject",
    value: University | Degree | Year | Semester | string | undefined,
  ) => void;
}

export default function AdminQuizFilterAndSearch({
  search,
  sort,
  filter,
  subjects,
  selectedUniversity,
  selectedDegree,
  selectedYear,
  selectedSemester,
  selectedSubject,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onAcademicFilterChange,
}: AdminQuizFilterAndSearchProps) {
  const universities = getUniversities();
  const degrees = selectedUniversity
    ? getDegreesByUniversity(selectedUniversity)
    : [];
  const years =
    selectedUniversity && selectedDegree
      ? getYearsByUniversityAndDegree(selectedUniversity, selectedDegree)
      : [];
  const semesters =
    selectedUniversity && selectedDegree && selectedYear
      ? getSemestersByUniversityDegreeAndYear(
          selectedUniversity,
          selectedDegree,
          selectedYear,
        )
      : [];

  const handleClearFilters = () => {
    onAcademicFilterChange("university", undefined);
    onAcademicFilterChange("degree", undefined);
    onAcademicFilterChange("year", undefined);
    onAcademicFilterChange("semester", undefined);
    onAcademicFilterChange("subject", "");
    onFilterChange("ALL");
  };

  const hasActiveFilters =
    selectedUniversity ||
    selectedDegree ||
    selectedYear ||
    selectedSemester ||
    selectedSubject ||
    filter !== "ALL";

  return (
    <div className="neuro rounded-xl p-6">
      <div className="space-y-4">
        {/* Search and Primary Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/50" />
            <Input
              placeholder="Search quizzes by title, subject..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="neuro-sm font-satoshi pl-10 font-bold"
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex gap-2">
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="neuro-sm font-satoshi w-40 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">Newest First</SelectItem>
                <SelectItem value="OLDEST">Oldest First</SelectItem>
                <SelectItem value="MOST_ATTEMPTED">Most Attempted</SelectItem>
                <SelectItem value="LEAST_ATTEMPTED">Least Attempted</SelectItem>
                <SelectItem value="TITLE_ASC">Title A-Z</SelectItem>
                <SelectItem value="TITLE_DESC">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger className="neuro-sm font-satoshi w-32 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="ATTEMPTED">Attempted</SelectItem>
                <SelectItem value="NOT_ATTEMPTED">Not Attempted</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="neuro-button-sm font-satoshi font-bold"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Academic Filters */}
        <div className="dark:border-white/20/10 border-t-2 border-black/10 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-black/70 dark:text-white/70" />
            <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
              Academic Filters
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            {/* University Filter */}
            <Select
              value={selectedUniversity || "all"}
              onValueChange={(value) =>
                onAcademicFilterChange(
                  "university",
                  value === "all" ? undefined : (value as University),
                )
              }
            >
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((university) => (
                  <SelectItem
                    key={university.value}
                    value={university.prismaValue}
                  >
                    {university.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Degree Filter */}
            <Select
              value={selectedDegree || "all"}
              onValueChange={(value) =>
                onAcademicFilterChange(
                  "degree",
                  value === "all" ? undefined : (value as Degree),
                )
              }
              disabled={!selectedUniversity}
            >
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue placeholder="Degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {degrees.map((degree) => (
                  <SelectItem key={degree.value} value={degree.prismaValue}>
                    {degree.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select
              value={selectedYear || "all"}
              onValueChange={(value) =>
                onAcademicFilterChange(
                  "year",
                  value === "all" ? undefined : (value as Year),
                )
              }
              disabled={!selectedDegree}
            >
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.prismaValue}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Semester Filter */}
            <Select
              value={selectedSemester || "all"}
              onValueChange={(value) =>
                onAcademicFilterChange(
                  "semester",
                  value === "all" ? undefined : (value as Semester),
                )
              }
              disabled={!selectedYear}
            >
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester.value} value={semester.prismaValue}>
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subject Filter */}
            <Select
              value={selectedSubject || "all"}
              onValueChange={(value) =>
                onAcademicFilterChange("subject", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
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
  );
}
