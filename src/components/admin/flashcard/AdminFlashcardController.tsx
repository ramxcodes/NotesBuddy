"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlStates } from "@/hooks/use-url-state";
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
import AdminQuizPagination from "../quiz/AdminQuizPagination";

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
  const [subjects, setSubjects] = useState<string[]>([]);

  // Pagination state
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // URL state management for filters and pagination
  const [urlState, setUrlState] = useUrlStates({
    page: { defaultValue: 1 },
    search: { defaultValue: "" },
    sort: { defaultValue: "NEWEST" as FlashcardSortOption },
    filter: { defaultValue: "ALL" as FlashcardFilterOption },
    university: { defaultValue: "" },
    degree: { defaultValue: "" },
    year: { defaultValue: "" },
    semester: { defaultValue: "" },
    subject: { defaultValue: "" },
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(urlState.search, 500);

  const fetchFlashcardSets = useCallback(
    async (page = urlState.page) => {
      setLoading(true);
      try {
        const filters: FlashcardSetFilters = {
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
          university: urlState.university
            ? (urlState.university as University)
            : undefined,
          degree: urlState.degree ? (urlState.degree as Degree) : undefined,
          year: urlState.year ? (urlState.year as Year) : undefined,
          semester: urlState.semester
            ? (urlState.semester as Semester)
            : undefined,
          subject: urlState.subject || undefined,
        };

        // Apply filter-specific conditions
        switch (urlState.filter) {
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
          setFlashcardSets(result.data.sets);
          setTotalPages(result.data.pagination.totalPages);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [
      urlState.page,
      urlState.filter,
      urlState.university,
      urlState.degree,
      urlState.year,
      urlState.semester,
      urlState.subject,
      debouncedSearch,
    ],
  );

  const fetchStats = useCallback(async () => {
    try {
      const result = await getFlashcardSetStatsAction();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch {}
  }, []);

  const fetchAcademicOptions = useCallback(async () => {
    try {
      const result = await getFlashcardAcademicOptionsAction();
      if (result.success && result.data) {
        setSubjects(result.data.subjects);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchFlashcardSets(1);
  }, [
    urlState.sort,
    urlState.filter,
    urlState.university,
    urlState.degree,
    urlState.year,
    urlState.semester,
    urlState.subject,
    debouncedSearch,
    fetchFlashcardSets,
  ]);

  // Reset to page 1 when search changes (handled by URL state now)
  useEffect(() => {
    if (debouncedSearch !== urlState.search) {
      setUrlState({ page: 1 });
    }
  }, [debouncedSearch, urlState.search, setUrlState]);

  useEffect(() => {
    fetchStats();
    fetchAcademicOptions();
  }, [fetchStats, fetchAcademicOptions]);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleFlashcardSetStatusAction(id, isActive);
      if (result.success) {
        await fetchFlashcardSets(urlState.page);
        await fetchStats();
      }
    } catch {}
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      const result = await toggleFlashcardSetPublishedAction(id, isPublished);
      if (result.success) {
        await fetchFlashcardSets(urlState.page);
        await fetchStats();
      }
    } catch {}
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
        await fetchFlashcardSets(urlState.page);
        await fetchStats();
      }
    } catch {}
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/flashcards/${id}`);
  };

  const clearFilters = () => {
    setUrlState({
      search: "",
      sort: "NEWEST" as FlashcardSortOption,
      filter: "ALL" as FlashcardFilterOption,
      university: "",
      degree: "",
      year: "",
      semester: "",
      subject: "",
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setUrlState({ page });
  };

  const handleSearchChange = (search: string) => {
    setUrlState({ search, page: 1 });
  };

  const handleSortChange = (sort: FlashcardSortOption) => {
    setUrlState({ sort, page: 1 });
  };

  const handleFilterChange = (filter: FlashcardFilterOption) => {
    setUrlState({ filter, page: 1 });
  };

  const handleAcademicFilterChange = (
    type: "university" | "degree" | "year" | "semester" | "subject",
    value: University | Degree | Year | Semester | string | undefined,
  ) => {
    const updates: Record<string, string | number> = { page: 1 };

    switch (type) {
      case "university":
        updates.university = (value as string) || "";
        // Reset dependent filters
        updates.degree = "";
        updates.year = "";
        updates.semester = "";
        break;
      case "degree":
        updates.degree = (value as string) || "";
        // Reset dependent filters
        updates.year = "";
        updates.semester = "";
        break;
      case "year":
        updates.year = (value as string) || "";
        // Reset dependent filters
        updates.semester = "";
        break;
      case "semester":
        updates.semester = (value as string) || "";
        break;
      case "subject":
        updates.subject = (value as string) || "";
        break;
    }

    setUrlState(updates);
  };

  return (
    <div className="space-y-6">
      <AdminFlashcardHeader
        stats={stats}
        onCreateNew={() => router.push("/admin/flashcards/create")}
        onBulkImport={() => router.push("/admin/flashcards/bulk-import")}
      />

      <AdminFlashcardFilterAndSearch
        search={urlState.search}
        setSearch={handleSearchChange}
        sort={urlState.sort}
        setSort={handleSortChange}
        filter={urlState.filter}
        setFilter={handleFilterChange}
        selectedUniversity={
          urlState.university ? (urlState.university as University) : undefined
        }
        setSelectedUniversity={(value) =>
          handleAcademicFilterChange("university", value)
        }
        selectedDegree={
          urlState.degree ? (urlState.degree as Degree) : undefined
        }
        setSelectedDegree={(value) =>
          handleAcademicFilterChange("degree", value)
        }
        selectedYear={urlState.year ? (urlState.year as Year) : undefined}
        setSelectedYear={(value) => handleAcademicFilterChange("year", value)}
        selectedSemester={
          urlState.semester ? (urlState.semester as Semester) : undefined
        }
        setSelectedSemester={(value) =>
          handleAcademicFilterChange("semester", value)
        }
        selectedSubject={urlState.subject}
        setSelectedSubject={(value) =>
          handleAcademicFilterChange("subject", value)
        }
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
            !!urlState.search ||
            urlState.filter !== "ALL" ||
            !!urlState.university ||
            !!urlState.degree ||
            !!urlState.year ||
            !!urlState.semester ||
            !!urlState.subject
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

      {/* Pagination */}
      {flashcardSets.length > 0 && (
        <AdminQuizPagination
          currentPage={urlState.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
