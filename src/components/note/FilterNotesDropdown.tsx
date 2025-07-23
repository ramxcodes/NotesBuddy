"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getFilterOptions,
  userProfileToFilterValues,
} from "@/utils/academic-config";
import { getAvailableSubjects } from "@/dal/note/helper";
import { useDebounce } from "@/hooks/use-debounce";

interface FilterNotesDropdownProps {
  userProfile?: {
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
  } | null;
  isOnboarded?: boolean;
  isAuthenticated?: boolean;
}

interface FilterState {
  university: string;
  degree: string;
  year: string;
  semester: string;
  subject: string;
}

export default function FilterNotesDropdown({
  userProfile,
  isOnboarded = false,
  isAuthenticated = false,
}: FilterNotesDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter options for dropdowns
  const filterOptions = getFilterOptions();

  // Initialize filter state based on user context
  const initializeFilters = useCallback((): FilterState => {
    const urlUniversity = searchParams.get("university");
    const urlDegree = searchParams.get("degree");
    const urlYear = searchParams.get("year");
    const urlSemester = searchParams.get("semester");
    const urlSubject = searchParams.get("subject");

    // If user is authenticated and onboarded, use their profile as default
    if (isAuthenticated && isOnboarded && userProfile) {
      const profileFilters = userProfileToFilterValues(userProfile);
      return {
        university: urlUniversity || profileFilters.university || "all",
        degree: urlDegree || profileFilters.degree || "all",
        year: urlYear || profileFilters.year || "all",
        semester: urlSemester || profileFilters.semester || "all",
        subject: urlSubject || "all",
      };
    }

    return {
      university: urlUniversity || "all",
      degree: urlDegree || "all",
      year: urlYear || "all",
      semester: urlSemester || "all",
      subject: urlSubject || "all",
    };
  }, [searchParams, isAuthenticated, isOnboarded, userProfile]);

  const [filters, setFilters] = useState<FilterState>(initializeFilters);
  const [subjects, setSubjects] = useState<{ subject: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Debounce filter changes to avoid too many URL updates
  const debouncedFilters = useDebounce(filters, 300);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL parameters - only add if not "all"
    if (debouncedFilters.university && debouncedFilters.university !== "all") {
      params.set("university", debouncedFilters.university);
    } else {
      params.delete("university");
    }

    if (debouncedFilters.degree && debouncedFilters.degree !== "all") {
      params.set("degree", debouncedFilters.degree);
    } else {
      params.delete("degree");
    }

    if (debouncedFilters.year && debouncedFilters.year !== "all") {
      params.set("year", debouncedFilters.year);
    } else {
      params.delete("year");
    }

    if (debouncedFilters.semester && debouncedFilters.semester !== "all") {
      params.set("semester", debouncedFilters.semester);
    } else {
      params.delete("semester");
    }

    if (debouncedFilters.subject && debouncedFilters.subject !== "all") {
      params.set("subject", debouncedFilters.subject);
    } else {
      params.delete("subject");
    }

    // Preserve existing search query
    const currentQuery = searchParams.get("query");
    if (currentQuery) {
      params.set("query", currentQuery);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [debouncedFilters, router, searchParams]);

  // Fetch available subjects when other filters change
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjectData = await getAvailableSubjects({
          university:
            filters.university === "all" ? undefined : filters.university,
          degree: filters.degree === "all" ? undefined : filters.degree,
          year: filters.year === "all" ? undefined : filters.year,
          semester: filters.semester === "all" ? undefined : filters.semester,
        });

        // Ensure subjectData is an array and remove duplicates and filter out empty subjects
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

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterType: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [filterType]: value };

        // Reset dependent filters when parent filter changes
        if (filterType === "university") {
          // Reset all dependent filters when university changes
          updated.degree = "all";
          updated.year = "all";
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "degree") {
          // Reset year, semester, and subject when degree changes
          updated.year = "all";
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "year") {
          // Reset semester and subject when year changes
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "semester") {
          // Reset subject when semester changes
          updated.subject = "all";
        }

        return updated;
      });
    },
    [],
  );

  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-4 rounded-md border px-8 py-12 border-b-8 border-r-8 border-primary dark:border-secondary">
      {/* University Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-sm font-medium">
          University
        </label>
        <Select
          value={filters.university}
          onValueChange={(value) => handleFilterChange("university", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select university" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.universities.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Degree Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-sm font-medium">
          Degree
        </label>
        <Select
          value={filters.degree}
          onValueChange={(value) => handleFilterChange("degree", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select degree" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.degrees.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-sm font-medium">
          Year
        </label>
        <Select
          value={filters.year}
          onValueChange={(value) => handleFilterChange("year", value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.years.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semester Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-sm font-medium">
          Semester
        </label>
        <Select
          value={filters.semester}
          onValueChange={(value) => handleFilterChange("semester", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.semesters.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-sm font-medium">
          Subject
        </label>
        <Select
          value={filters.subject}
          onValueChange={(value) => handleFilterChange("subject", value)}
          disabled={isLoadingSubjects}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue
              placeholder={isLoadingSubjects ? "Loading..." : "All subjects"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject, index) => (
              <SelectItem key={index} value={subject.subject}>
                {subject.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
