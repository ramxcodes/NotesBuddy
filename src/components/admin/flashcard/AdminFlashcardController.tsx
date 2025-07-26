"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getFlashcardSetsAction,
  toggleFlashcardSetStatusAction,
  toggleFlashcardSetPublishedAction,
  deleteFlashcardSetAction,
  getFlashcardAcademicOptionsAction,
  getFlashcardSetStatsAction,
} from "@/components/admin/actions/admin-flashcards";
import type {
  FlashcardSetListItem,
  FlashcardSetStats,
  FlashcardSetFilters,
} from "@/dal/flashcard/types";
import { University, Degree, Year, Semester } from "@prisma/client";
import AdminFlashcardHeader from "./AdminFlashcardHeader";
import AdminFlashcardFilterAndSearch from "./AdminFlashcardFilterAndSearch";
import AdminFlashcardTable from "./AdminFlashcardTable";
import AdminFlashcardEmptyState from "./AdminFlashcardEmptyState";

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

export default function AdminFlashcardController() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetListItem[]>(
    [],
  );
  const [stats, setStats] = useState<FlashcardSetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<FlashcardSortOption>("NEWEST");
  const [filter, setFilter] = useState<FlashcardFilterOption>("ALL");
  const [subjects, setSubjects] = useState<string[]>([]);

  // Academic filters
  const [selectedUniversity, setSelectedUniversity] = useState<
    University | undefined
  >();
  const [selectedDegree, setSelectedDegree] = useState<Degree | undefined>();
  const [selectedYear, setSelectedYear] = useState<Year | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<
    Semester | undefined
  >();
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const fetchFlashcardSets = useCallback(async () => {
    setLoading(true);
    try {
      const filters: FlashcardSetFilters = {
        search: debouncedSearch || undefined,
        university: selectedUniversity,
        degree: selectedDegree,
        year: selectedYear,
        semester: selectedSemester,
        subject: selectedSubject || undefined,
      };

      // Apply filter-specific conditions
      switch (filter) {
        case "ACTIVE":
          filters.isActive = true;
          break;
        case "INACTIVE":
          filters.isActive = false;
          break;
        case "PUBLISHED":
          filters.isPublished = true;
          break;
        case "UNPUBLISHED":
          filters.isPublished = false;
          break;
        case "PREMIUM":
          filters.isPremium = true;
          break;
        case "FREE":
          filters.isPremium = false;
          break;
      }

      const result = await getFlashcardSetsAction(filters);
      if (result.success && result.data) {
        const sortedSets = [...result.data];

        // Apply sorting
        switch (sort) {
          case "NEWEST":
            sortedSets.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            break;
          case "OLDEST":
            sortedSets.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            break;
          case "TITLE_ASC":
            sortedSets.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "TITLE_DESC":
            sortedSets.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "MOST_CARDS":
            sortedSets.sort((a, b) => b.cardCount - a.cardCount);
            break;
          case "MOST_VISITS":
            sortedSets.sort((a, b) => b.visitCount - a.visitCount);
            break;
        }

        setFlashcardSets(sortedSets);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    sort,
    filter,
    selectedUniversity,
    selectedDegree,
    selectedYear,
    selectedSemester,
    selectedSubject,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await getFlashcardSetStatsAction();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching flashcard stats:", error);
    }
  }, []);

  const fetchAcademicOptions = useCallback(async () => {
    try {
      const result = await getFlashcardAcademicOptionsAction();
      if (result.success && result.data) {
        setSubjects(result.data.subjects);
      }
    } catch (error) {
      console.error("Error fetching academic options:", error);
    }
  }, []);

  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);

  useEffect(() => {
    fetchStats();
    fetchAcademicOptions();
  }, [fetchStats, fetchAcademicOptions]);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleFlashcardSetStatusAction(id, isActive);
      if (result.success) {
        await fetchFlashcardSets();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error toggling flashcard set status:", error);
    }
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      const result = await toggleFlashcardSetPublishedAction(id, isPublished);
      if (result.success) {
        await fetchFlashcardSets();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error toggling flashcard set published status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this flashcard set? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const result = await deleteFlashcardSetAction(id);
      if (result.success) {
        await fetchFlashcardSets();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/flashcards/${id}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSort("NEWEST");
    setFilter("ALL");
    setSelectedUniversity(undefined);
    setSelectedDegree(undefined);
    setSelectedYear(undefined);
    setSelectedSemester(undefined);
    setSelectedSubject("");
  };

  return (
    <div className="space-y-6">
      <AdminFlashcardHeader
        stats={stats}
        onCreateNew={() => router.push("/admin/flashcards/create")}
      />

      <AdminFlashcardFilterAndSearch
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        filter={filter}
        setFilter={setFilter}
        selectedUniversity={selectedUniversity}
        setSelectedUniversity={setSelectedUniversity}
        selectedDegree={selectedDegree}
        setSelectedDegree={setSelectedDegree}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
        onClearFilters={clearFilters}
      />

      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading flashcard sets...</p>
        </div>
      ) : flashcardSets.length === 0 ? (
        <AdminFlashcardEmptyState
          hasFilters={
            !!search ||
            filter !== "ALL" ||
            !!selectedUniversity ||
            !!selectedDegree ||
            !!selectedYear ||
            !!selectedSemester ||
            !!selectedSubject
          }
          onClearFilters={clearFilters}
          onCreateNew={() => router.push("/admin/flashcards/create")}
        />
      ) : (
        <AdminFlashcardTable
          flashcardSets={flashcardSets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePublished={handleTogglePublished}
        />
      )}
    </div>
  );
}
