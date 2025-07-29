"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  prismaToSanityValue,
} from "@/utils/academic-config";
import { getAvailableSubjects } from "@/dal/note/helper";
import { University, Degree, Year, Semester } from "@prisma/client";

interface EmbeddedAcademicFiltersProps {
  userProfile?: {
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
  } | null;
  isOnboarded?: boolean;
  onFiltersChange: (context: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
    subject: string;
  }) => void;
}

interface FilterState {
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject: string;
}

export default function EmbeddedAcademicFilters({
  userProfile,
  isOnboarded = false,
  onFiltersChange,
}: EmbeddedAcademicFiltersProps) {
  // Get hierarchical filter options
  const universities = getUniversities();

  // Initialize filter state based on user profile
  const initializeFilters = useCallback((): FilterState => {
    // If user is authenticated and onboarded, use their profile as default for academic info
    // Subject is always manually selected from Sanity data
    if (isOnboarded && userProfile) {
      const profileUniversity = userProfile.university
        ? (userProfile.university as University)
        : undefined;
      const profileDegree = userProfile.degree
        ? (userProfile.degree as Degree)
        : undefined;
      const profileYear = userProfile.year
        ? (userProfile.year as Year)
        : undefined;
      const profileSemester = userProfile.semester
        ? (userProfile.semester as Semester)
        : undefined;

      return {
        university: profileUniversity,
        degree: profileDegree,
        year: profileYear,
        semester: profileSemester,
        subject: "", // Subject is always manually selected from dropdown
      };
    }

    return {
      university: undefined,
      degree: undefined,
      year: undefined,
      semester: undefined,
      subject: "", // Subject is always manually selected from dropdown
    };
  }, [isOnboarded, userProfile]);

  const [filters, setFilters] = useState<FilterState>(initializeFilters);
  const [subjects, setSubjects] = useState<{ subject: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Get filtered options based on current selections
  const degrees = filters.university
    ? getDegreesByUniversity(filters.university)
    : [];
  const years =
    filters.university && filters.degree
      ? getYearsByUniversityAndDegree(filters.university, filters.degree)
      : [];
  const semesters =
    filters.university && filters.degree && filters.year
      ? getSemestersByUniversityDegreeAndYear(
          filters.university,
          filters.degree,
          filters.year,
        )
      : [];

  // Fetch subjects from Sanity when academic context changes (like FilterNotesDropdown)
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjectData = await getAvailableSubjects({
          university: filters.university
            ? prismaToSanityValue("university", filters.university)
            : undefined,
          degree: filters.degree
            ? prismaToSanityValue("degree", filters.degree)
            : undefined,
          year: filters.year
            ? prismaToSanityValue("year", filters.year)
            : undefined,
          semester: filters.semester
            ? prismaToSanityValue("semester", filters.semester)
            : undefined,
        });

        const dataArray = Array.isArray(subjectData) ? subjectData : [];
        const uniqueSubjects = Array.from(
          new Set(
            dataArray
              .map((item: { subject: string | null }) => item.subject)
              .filter((subject): subject is string => Boolean(subject)),
          ),
        ).map((subject) => ({ subject }));

        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [filters.university, filters.degree, filters.year, filters.semester]);

  // Handle filter changes with cascading resets (like FilterNotesDropdown)
  const handleFilterChange = useCallback(
    (
      filterType: keyof FilterState,
      value: University | Degree | Year | Semester | string | undefined,
    ) => {
      setFilters((prev) => {
        const updated = { ...prev };

        if (filterType === "university") {
          updated.university = value as University | undefined;
          updated.degree = undefined;
          updated.year = undefined;
          updated.semester = undefined;
          updated.subject = "";
        } else if (filterType === "degree") {
          updated.degree = value as Degree | undefined;
          updated.year = undefined;
          updated.semester = undefined;
          updated.subject = "";
        } else if (filterType === "year") {
          updated.year = value as Year | undefined;
          updated.semester = undefined;
          updated.subject = "";
        } else if (filterType === "semester") {
          updated.semester = value as Semester | undefined;
          updated.subject = "";
        } else if (filterType === "subject") {
          updated.subject = value as string;
        }

        return updated;
      });
    },
    [],
  );

  // Trigger callback when all required fields are selected
  useEffect(() => {
    if (
      filters.university &&
      filters.degree &&
      filters.year &&
      filters.semester &&
      filters.subject &&
      filters.subject.trim() !== ""
    ) {
      onFiltersChange({
        university: filters.university,
        degree: filters.degree,
        year: filters.year,
        semester: filters.semester,
        subject: filters.subject,
      });
    }
  }, [filters, onFiltersChange]);

  return (
    <div className="neuro flex flex-col flex-wrap items-start justify-center gap-3 rounded-lg border p-3 sm:flex-row sm:items-end">
      {/* University Filter */}
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          University
        </label>
        <Select
          value={filters.university || ""}
          onValueChange={(value) =>
            handleFilterChange(
              "university",
              value === "" ? undefined : (value as University),
            )
          }
        >
          <SelectTrigger
            className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            data-umami-event="ai-filter-university-trigger"
          >
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            {universities.map((university) => (
              <SelectItem
                key={university.value}
                value={university.prismaValue}
                className="text-xs"
                data-umami-event={`ai-filter-university-${university.value}`}
              >
                {university.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Degree Filter */}
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Degree
        </label>
        <Select
          value={filters.degree || ""}
          onValueChange={(value) =>
            handleFilterChange(
              "degree",
              value === "" ? undefined : (value as Degree),
            )
          }
          disabled={!filters.university}
        >
          <SelectTrigger
            className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            data-umami-event="ai-filter-degree-trigger"
          >
            <SelectValue placeholder="Select degree" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            {degrees.map((degree) => (
              <SelectItem
                key={degree.value}
                value={degree.prismaValue}
                className="text-xs"
                data-umami-event={`ai-filter-degree-${degree.value}`}
              >
                {degree.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Year
        </label>
        <Select
          value={filters.year || ""}
          onValueChange={(value) =>
            handleFilterChange(
              "year",
              value === "" ? undefined : (value as Year),
            )
          }
          disabled={!filters.degree}
        >
          <SelectTrigger
            className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            data-umami-event="ai-filter-year-trigger"
          >
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            {years.map((year) => (
              <SelectItem
                key={year.value}
                value={year.prismaValue}
                className="text-xs"
                data-umami-event={`ai-filter-year-${year.value}`}
              >
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semester Filter */}
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Semester
        </label>
        <Select
          value={filters.semester || ""}
          onValueChange={(value) =>
            handleFilterChange(
              "semester",
              value === "" ? undefined : (value as Semester),
            )
          }
          disabled={!filters.year}
        >
          <SelectTrigger
            className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            data-umami-event="ai-filter-semester-trigger"
          >
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            {semesters.map((semester) => (
              <SelectItem
                key={semester.value}
                value={semester.prismaValue}
                className="text-xs"
                data-umami-event={`ai-filter-semester-${semester.value}`}
              >
                {semester.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter - Dropdown like FilterNotesDropdown */}
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Subject
        </label>
        <Select
          value={filters.subject || ""}
          onValueChange={(value) => handleFilterChange("subject", value)}
          disabled={isLoadingSubjects || !filters.semester}
        >
          <SelectTrigger
            className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            data-umami-event="ai-filter-subject-trigger"
          >
            <SelectValue
              placeholder={isLoadingSubjects ? "Loading..." : "Select subject"}
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            {subjects.map((subject, index) => (
              <SelectItem
                key={index}
                value={subject.subject}
                className="text-xs"
                data-umami-event={`ai-filter-subject-${subject.subject.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {subject.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
