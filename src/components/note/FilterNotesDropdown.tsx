"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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

  const hasActiveSearch = Boolean(searchParams.get("query")?.trim());

  const prevSearchState = useRef(hasActiveSearch);

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const currentQuery = searchParams.get("query");
    if (currentQuery && currentQuery.trim()) {
      params.set("query", currentQuery);
    }

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

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [debouncedFilters, router, searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get("query");
    const wasSearching = prevSearchState.current;
    const isSearching = Boolean(currentQuery && currentQuery.trim());

    prevSearchState.current = isSearching;

    if (isSearching && !wasSearching) {
      setFilters({
        university: "all",
        degree: "all",
        year: "all",
        semester: "all",
        subject: "all",
      });
    } else if (!isSearching && wasSearching) {
      setFilters(initializeFilters());
    }
  }, [searchParams, initializeFilters]);

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

  const handleFilterChange = useCallback(
    (filterType: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [filterType]: value };

        if (filterType === "university") {
          updated.degree = "all";
          updated.year = "all";
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "degree") {
          updated.year = "all";
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "year") {
          updated.semester = "all";
          updated.subject = "all";
        } else if (filterType === "semester") {
          updated.subject = "all";
        }

        return updated;
      });
    },
    [],
  );

  return (
    <div className="my-6 rounded-xl border-4 border-black px-8 py-12 shadow-[8px_8px_0px_0px_#000] dark:border-white dark:shadow-[8px_8px_0px_0px_#757373]">
      {hasActiveSearch && (
        <div className="mb-4 w-full text-center">
          <p className="text-sm font-bold tracking-wide text-black/70 uppercase dark:text-white/70">
            Searching all notes. Use filters below to narrow down results.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-center gap-4">
        {/* University Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            University
          </label>
          <Select
            value={filters.university}
            onValueChange={(value) => handleFilterChange("university", value)}
          >
            <SelectTrigger className="w-[180px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white  dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white  dark:shadow-[4px_4px_0px_0px_#757373]">
              {filterOptions.universities.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Degree Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            Degree
          </label>
          <Select
            value={filters.degree}
            onValueChange={(value) => handleFilterChange("degree", value)}
          >
            <SelectTrigger className="w-[140px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white  dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue placeholder="Select degree" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white  dark:shadow-[4px_4px_0px_0px_#757373]">
              {filterOptions.degrees.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            Year
          </label>
          <Select
            value={filters.year}
            onValueChange={(value) => handleFilterChange("year", value)}
          >
            <SelectTrigger className="w-[120px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white  dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white  dark:shadow-[4px_4px_0px_0px_#757373]">
              {filterOptions.years.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            Semester
          </label>
          <Select
            value={filters.semester}
            onValueChange={(value) => handleFilterChange("semester", value)}
          >
            <SelectTrigger className="w-[140px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white  dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white  dark:shadow-[4px_4px_0px_0px_#757373]">
              {filterOptions.semesters.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            Subject
          </label>
          <Select
            value={filters.subject}
            onValueChange={(value) => handleFilterChange("subject", value)}
            disabled={isLoadingSubjects}
          >
            <SelectTrigger className="w-[160px] rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white  dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue
                placeholder={isLoadingSubjects ? "Loading..." : "All subjects"}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white  dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
              >
                All subjects
              </SelectItem>
              {subjects.map((subject, index) => (
                <SelectItem
                  key={index}
                  value={subject.subject}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                >
                  {subject.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
