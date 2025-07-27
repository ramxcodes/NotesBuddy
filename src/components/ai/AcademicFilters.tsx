"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  prismaToSanityValue,
} from "@/utils/academic-config";
import { getAvailableSubjects } from "@/dal/note/helper";
import { University, Degree, Year, Semester } from "@prisma/client";

interface AcademicFiltersProps {
  userId: string;
  onFiltersSelected: (context: {
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

export default function AcademicFilters({
  onFiltersSelected,
}: AcademicFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    subject: "",
  });
  const [subjects, setSubjects] = useState<{ subject: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Get hierarchical filter options
  const universities = getUniversities();
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

  // Fetch subjects when academic context changes
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
        toast.error("Failed to load subjects");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    if (
      filters.university &&
      filters.degree &&
      filters.year &&
      filters.semester
    ) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
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
        }

        return updated;
      });
    },
    [],
  );

  const handleStartChat = () => {
    if (
      !filters.university ||
      !filters.degree ||
      !filters.year ||
      !filters.semester ||
      !filters.subject
    ) {
      toast.error("Please select all academic filters to start a chat");
      return;
    }

    onFiltersSelected({
      university: filters.university,
      degree: filters.degree,
      year: filters.year,
      semester: filters.semester,
      subject: filters.subject,
    });
  };

  const isComplete =
    filters.university &&
    filters.degree &&
    filters.year &&
    filters.semester &&
    filters.subject;

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:bg-gray-800 dark:shadow-[8px_8px_0px_0px_#757373]">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 dark:text-white">
            Start a New Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Select your academic context to get personalized AI assistance based
            on your course materials.
          </p>
        </div>

        <div className="space-y-6">
          {/* University Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
              University
            </Label>
            <Select
              value={filters.university || ""}
              onValueChange={(value) =>
                handleFilterChange("university", value as University)
              }
            >
              <SelectTrigger className="w-full rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
                {universities.map((university) => (
                  <SelectItem
                    key={university.value}
                    value={university.prismaValue}
                    className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  >
                    {university.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Degree Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
              Degree
            </Label>
            <Select
              value={filters.degree || ""}
              onValueChange={(value) =>
                handleFilterChange("degree", value as Degree)
              }
              disabled={!filters.university}
            >
              <SelectTrigger className="w-full rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
                {degrees.map((degree) => (
                  <SelectItem
                    key={degree.value}
                    value={degree.prismaValue}
                    className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  >
                    {degree.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
              Year
            </Label>
            <Select
              value={filters.year || ""}
              onValueChange={(value) =>
                handleFilterChange("year", value as Year)
              }
              disabled={!filters.degree}
            >
              <SelectTrigger className="w-full rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
                {years.map((year) => (
                  <SelectItem
                    key={year.value}
                    value={year.prismaValue}
                    className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  >
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
              Semester
            </Label>
            <Select
              value={filters.semester || ""}
              onValueChange={(value) =>
                handleFilterChange("semester", value as Semester)
              }
              disabled={!filters.year}
            >
              <SelectTrigger className="w-full rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.value}
                    value={semester.prismaValue}
                    className="font-bold text-black hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
                  >
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-black tracking-wider text-black uppercase dark:text-white">
              Subject
            </Label>
            <Select
              value={filters.subject || ""}
              onValueChange={(value) => handleFilterChange("subject", value)}
              disabled={isLoadingSubjects || !filters.semester}
            >
              <SelectTrigger className="w-full rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
                <SelectValue
                  placeholder={
                    isLoadingSubjects ? "Loading..." : "Select subject"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
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

          <div className="pt-6">
            <Button
              onClick={handleStartChat}
              disabled={!isComplete}
              className="w-full border-2 border-black py-3 text-lg font-bold shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            >
              Start AI Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
