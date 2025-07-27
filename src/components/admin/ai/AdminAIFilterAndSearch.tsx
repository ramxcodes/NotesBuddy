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
import { Badge } from "@/components/ui/badge";
import {
  MagnifyingGlass,
  SortAscending,
  Funnel,
  X,
} from "@phosphor-icons/react";
import { University, Degree, Year, Semester } from "@prisma/client";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
} from "@/utils/academic-config";

interface AdminAIFilterAndSearchProps {
  search: string;
  setSearch: (search: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
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
  onFilterChange: (
    type: string,
    value: string | University | Degree | Year | Semester | undefined,
  ) => void;
  onClearFilters: () => void;
}

export default function AdminAIFilterAndSearch({
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
  onFilterChange,
  onClearFilters,
}: AdminAIFilterAndSearchProps) {
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

  const hasActiveFilters =
    search ||
    filter !== "ALL" ||
    selectedUniversity ||
    selectedDegree ||
    selectedYear ||
    selectedSemester ||
    (selectedSubject && selectedSubject !== "ALL_SUBJECTS");

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          size={16}
        />
        <Input
          placeholder="Search chats by name, subject, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAscending size={16} className="text-muted-foreground" />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="NAME_ASC">Name (A-Z)</SelectItem>
              <SelectItem value="NAME_DESC">Name (Z-A)</SelectItem>
              <SelectItem value="MOST_MESSAGES">Most Messages</SelectItem>
              <SelectItem value="LEAST_MESSAGES">Least Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <Funnel size={16} className="text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Academic Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* University */}
          <Select
            value={selectedUniversity || "ALL_UNIVERSITIES"}
            onValueChange={(value) =>
              onFilterChange(
                "university",
                value === "ALL_UNIVERSITIES" ? undefined : value,
              )
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_UNIVERSITIES">All Universities</SelectItem>
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

          {/* Degree */}
          <Select
            value={selectedDegree || "ALL_DEGREES"}
            onValueChange={(value) =>
              onFilterChange(
                "degree",
                value === "ALL_DEGREES" ? undefined : value,
              )
            }
            disabled={!selectedUniversity}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_DEGREES">All Degrees</SelectItem>
              {degrees.map((degree) => (
                <SelectItem key={degree.value} value={degree.prismaValue}>
                  {degree.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select
            value={selectedYear || "ALL_YEARS"}
            onValueChange={(value) =>
              onFilterChange("year", value === "ALL_YEARS" ? undefined : value)
            }
            disabled={!selectedDegree}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_YEARS">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.prismaValue}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Semester */}
          <Select
            value={selectedSemester || "ALL_SEMESTERS"}
            onValueChange={(value) =>
              onFilterChange(
                "semester",
                value === "ALL_SEMESTERS" ? undefined : value,
              )
            }
            disabled={!selectedYear}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_SEMESTERS">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester.value} value={semester.prismaValue}>
                  {semester.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject */}
          <Select
            value={selectedSubject || "ALL_SUBJECTS"}
            onValueChange={(value) =>
              onFilterChange("subject", value === "ALL_SUBJECTS" ? "" : value)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_SUBJECTS">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X size={14} />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {search}
              <button
                onClick={() => setSearch("")}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {filter !== "ALL" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Time: {filter.replace("_", " ")}
              <button
                onClick={() => setFilter("ALL")}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {selectedUniversity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {universities.find((u) => u.prismaValue === selectedUniversity)
                ?.label || selectedUniversity}
              <button
                onClick={() => setSelectedUniversity(undefined)}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {selectedDegree && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {degrees.find((d) => d.prismaValue === selectedDegree)?.label ||
                selectedDegree}
              <button
                onClick={() => setSelectedDegree(undefined)}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {selectedYear && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {years.find((y) => y.prismaValue === selectedYear)?.label ||
                selectedYear}
              <button
                onClick={() => setSelectedYear(undefined)}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {selectedSemester && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {semesters.find((s) => s.prismaValue === selectedSemester)
                ?.label || selectedSemester}
              <button
                onClick={() => setSelectedSemester(undefined)}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          {selectedSubject && selectedSubject !== "ALL_SUBJECTS" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Subject: {selectedSubject}
              <button
                onClick={() => setSelectedSubject("ALL_SUBJECTS")}
                className="hover:text-foreground ml-1"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
