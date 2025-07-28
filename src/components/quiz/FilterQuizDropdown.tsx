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
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  prismaToSanityValue,
  sanityToPrismaValue,
} from "@/utils/academic-config";
import { getUserQuizSubjectsAction } from "@/app/quiz/actions";
import { useDebounce } from "@/hooks/use-debounce";
import { University, Degree, Year, Semester } from "@prisma/client";

interface FilterQuizDropdownProps {
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
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject: string;
  isPremium: string; // "all", "true", "false"
}

export default function FilterQuizDropdown({
  userProfile,
  isOnboarded = false,
  isAuthenticated = false,
}: FilterQuizDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get hierarchical filter options
  const universities = getUniversities();

  // Initialize filter state based on user context
  const initializeFilters = useCallback((): FilterState => {
    const urlUniversity = searchParams.get("university");
    const urlDegree = searchParams.get("degree");
    const urlYear = searchParams.get("year");
    const urlSemester = searchParams.get("semester");
    const urlSubject = searchParams.get("subject");
    const urlIsPremium = searchParams.get("isPremium");

    // Convert URL params (sanity values) to Prisma values
    const universityValue = urlUniversity
      ? (sanityToPrismaValue("university", urlUniversity) as
          | University
          | undefined)
      : undefined;
    const degreeValue = urlDegree
      ? (sanityToPrismaValue("degree", urlDegree) as Degree | undefined)
      : undefined;
    const yearValue = urlYear
      ? (sanityToPrismaValue("year", urlYear) as Year | undefined)
      : undefined;
    const semesterValue = urlSemester
      ? (sanityToPrismaValue("semester", urlSemester) as Semester | undefined)
      : undefined;

    // If user is authenticated and onboarded, use their profile as default
    if (isAuthenticated && isOnboarded && userProfile) {
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
        university: universityValue || profileUniversity,
        degree: degreeValue || profileDegree,
        year: yearValue || profileYear,
        semester: semesterValue || profileSemester,
        subject: urlSubject || "",
        isPremium: urlIsPremium || "all",
      };
    }

    return {
      university: universityValue,
      degree: degreeValue,
      year: yearValue,
      semester: semesterValue,
      subject: urlSubject || "",
      isPremium: urlIsPremium || "all",
    };
  }, [searchParams, isAuthenticated, isOnboarded, userProfile]);

  const [filters, setFilters] = useState<FilterState>(initializeFilters);
  const [subjects, setSubjects] = useState<{ subject: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const debouncedFilters = useDebounce(filters, 300);

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

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const currentQuery = searchParams.get("q");
    if (currentQuery && currentQuery.trim()) {
      params.set("q", currentQuery);
    }

    // Convert Prisma values to Sanity values for URL
    if (debouncedFilters.university) {
      const sanityValue = prismaToSanityValue(
        "university",
        debouncedFilters.university,
      );
      if (sanityValue) params.set("university", sanityValue);
    } else {
      params.delete("university");
    }

    if (debouncedFilters.degree) {
      const sanityValue = prismaToSanityValue(
        "degree",
        debouncedFilters.degree,
      );
      if (sanityValue) params.set("degree", sanityValue);
    } else {
      params.delete("degree");
    }

    if (debouncedFilters.year) {
      const sanityValue = prismaToSanityValue("year", debouncedFilters.year);
      if (sanityValue) params.set("year", sanityValue);
    } else {
      params.delete("year");
    }

    if (debouncedFilters.semester) {
      const sanityValue = prismaToSanityValue(
        "semester",
        debouncedFilters.semester,
      );
      if (sanityValue) params.set("semester", sanityValue);
    } else {
      params.delete("semester");
    }

    if (debouncedFilters.subject && debouncedFilters.subject !== "all") {
      params.set("subject", debouncedFilters.subject);
    } else {
      params.delete("subject");
    }

    if (debouncedFilters.isPremium && debouncedFilters.isPremium !== "all") {
      params.set("isPremium", debouncedFilters.isPremium);
    } else {
      params.delete("isPremium");
    }

    // Reset pagination when filters change
    params.delete("page");

    router.push(`/quiz?${params.toString()}`);
  }, [debouncedFilters, router, searchParams]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjectData = await getUserQuizSubjectsAction({
          university: filters.university,
          degree: filters.degree,
          year: filters.year,
          semester: filters.semester,
        });

        const uniqueSubjects = Array.from(new Set(subjectData)).map(
          (subject) => ({ subject }),
        );

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
        } else if (filterType === "isPremium") {
          updated.isPremium = value as string;
        }

        return updated;
      });
    },
    [],
  );

  return (
    <div className="my-6 rounded-xl border-4 border-black px-8 py-12 shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:shadow-[8px_8px_0px_0px_#757373]">
      <div className="flex flex-wrap items-end justify-center gap-4">
        {/* University Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            University
          </label>
          <Select
            value={filters.university || "all"}
            onValueChange={(value) =>
              handleFilterChange(
                "university",
                value === "all" ? undefined : (value as University),
              )
            }
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-48 font-bold"
              data-umami-event="quiz-filter-university-trigger"
            >
              <SelectValue placeholder="Select University" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-university-all"
              >
                All Universities
              </SelectItem>
              {universities.map((university) => (
                <SelectItem
                  key={university.value}
                  value={university.prismaValue}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  data-umami-event={`quiz-filter-university-${university.value}`}
                >
                  {university.label}
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
            value={filters.degree || "all"}
            onValueChange={(value) =>
              handleFilterChange(
                "degree",
                value === "all" ? undefined : (value as Degree),
              )
            }
            disabled={!filters.university}
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-40 font-bold"
              data-umami-event="quiz-filter-degree-trigger"
            >
              <SelectValue placeholder="Select Degree" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-degree-all"
              >
                All Degrees
              </SelectItem>
              {degrees.map((degree) => (
                <SelectItem
                  key={degree.value}
                  value={degree.prismaValue}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  data-umami-event={`quiz-filter-degree-${degree.value}`}
                >
                  {degree.label}
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
            value={filters.year || "all"}
            onValueChange={(value) =>
              handleFilterChange(
                "year",
                value === "all" ? undefined : (value as Year),
              )
            }
            disabled={!filters.degree}
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-32 font-bold"
              data-umami-event="quiz-filter-year-trigger"
            >
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-year-all"
              >
                All Years
              </SelectItem>
              {years.map((year) => (
                <SelectItem
                  key={year.value}
                  value={year.prismaValue}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  data-umami-event={`quiz-filter-year-${year.value}`}
                >
                  {year.label}
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
            value={filters.semester || "all"}
            onValueChange={(value) =>
              handleFilterChange(
                "semester",
                value === "all" ? undefined : (value as Semester),
              )
            }
            disabled={!filters.year}
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-36 font-bold"
              data-umami-event="quiz-filter-semester-trigger"
            >
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-semester-all"
              >
                All Semesters
              </SelectItem>
              {semesters.map((semester) => (
                <SelectItem
                  key={semester.value}
                  value={semester.prismaValue}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  data-umami-event={`quiz-filter-semester-${semester.value}`}
                >
                  {semester.label}
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
            value={filters.subject || "all"}
            onValueChange={(value) =>
              handleFilterChange("subject", value === "all" ? "" : value)
            }
            disabled={isLoadingSubjects}
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-40 font-bold"
              data-umami-event="quiz-filter-subject-trigger"
            >
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-subject-all"
              >
                All Subjects
              </SelectItem>
              {subjects.map((subjectItem) => (
                <SelectItem
                  key={subjectItem.subject}
                  value={subjectItem.subject}
                  className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  data-umami-event={`quiz-filter-subject-${subjectItem.subject.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {subjectItem.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Premium Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
            Type
          </label>
          <Select
            value={filters.isPremium}
            onValueChange={(value) => handleFilterChange("isPremium", value)}
          >
            <SelectTrigger
              className="neuro-sm font-satoshi w-32 font-bold"
              data-umami-event="quiz-filter-type-trigger"
            >
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="all"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-type-all"
              >
                All Types
              </SelectItem>
              <SelectItem
                value="false"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-type-free"
              >
                Free
              </SelectItem>
              <SelectItem
                value="true"
                className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                data-umami-event="quiz-filter-type-premium"
              >
                Premium
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
