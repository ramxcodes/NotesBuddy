"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlStates } from "@/hooks/use-url-state";
import {
  getQuizzesAction,
  toggleQuizStatusAction,
  toggleQuizPublishedAction,
  deleteQuizAction,
  getQuizSubjectsAction,
  getQuizStatsAction,
} from "../actions/admin-quizzes";
import {
  type QuizzesListResponse,
  type QuizSortOption,
  type QuizFilterOption,
  type QuizStats,
} from "@/dal/quiz/types";
import { University, Degree, Year, Semester } from "@prisma/client";
import AdminQuizHeader from "./AdminQuizHeader";
import AdminQuizFilterAndSearch from "./AdminQuizFilterAndSearch";
import AdminQuizTable from "./AdminQuizTable";
import AdminQuizPagination from "./AdminQuizPagination";
import AdminQuizEmptyState from "./AdminQuizEmptyState";

export default function AdminQuizController() {
  const router = useRouter();
  const [quizzesData, setQuizzesData] = useState<QuizzesListResponse | null>(
    null,
  );
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);

  // URL state management for filters and pagination
  const [urlState, setUrlState] = useUrlStates({
    page: { defaultValue: 0 }, // Change default to 0 so page 1 stays in URL
    search: { defaultValue: "" },
    sort: { defaultValue: "NEWEST" as QuizSortOption },
    filter: { defaultValue: "ALL" as QuizFilterOption },
    university: { defaultValue: "" },
    degree: { defaultValue: "" },
    year: { defaultValue: "" },
    semester: { defaultValue: "" },
    subject: { defaultValue: "" },
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(urlState.search, 500);

  const fetchQuizzes = useCallback(
    async (page?: number) => {
      const currentPage = page ?? Math.max(1, urlState.page);
      try {
        const result = await getQuizzesAction({
          page: currentPage,
          search: debouncedSearch,
          sort: urlState.sort,
          filter: urlState.filter,
          university: urlState.university
            ? (urlState.university as University)
            : undefined,
          degree: urlState.degree ? (urlState.degree as Degree) : undefined,
          year: urlState.year ? (urlState.year as Year) : undefined,
          semester: urlState.semester
            ? (urlState.semester as Semester)
            : undefined,
          subject: urlState.subject || undefined,
        });
        setQuizzesData(result);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },
    [
      urlState.page,
      urlState.sort,
      urlState.filter,
      urlState.university,
      urlState.degree,
      urlState.year,
      urlState.semester,
      urlState.subject,
      debouncedSearch,
    ],
  );

  const fetchSubjects = useCallback(async () => {
    try {
      const result = await getQuizSubjectsAction();
      if (result) {
        setSubjects(result);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const result = await getQuizStatsAction();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
    }
  }, []);

  const handleSortChange = (newSort: QuizSortOption) => {
    setUrlState({ sort: newSort, page: 1 });
  };

  const handleFilterChange = (newFilter: QuizFilterOption) => {
    setUrlState({ filter: newFilter, page: 1 });
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

  const handlePageChange = (page: number) => {
    setUrlState({ page });
  };

  const handleSearchChange = (search: string) => {
    setUrlState({ search, page: 1 });
  };

  const handleToggleStatus = async (quizId: string) => {
    const result = await toggleQuizStatusAction(quizId);
    if (result.success) {
      fetchQuizzes();
      fetchStats(); // Refresh stats when status changes
    }
  };

  const handleTogglePublished = async (quizId: string) => {
    const result = await toggleQuizPublishedAction(quizId);
    if (result.success) {
      fetchQuizzes();
      fetchStats(); // Refresh stats when published status changes
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      const result = await deleteQuizAction(quizId);
      if (result.success) {
        fetchQuizzes();
        fetchStats(); // Refresh stats when quiz is deleted
      }
    }
  };

  const handleEditQuiz = (quizId: string) => {
    router.push(`/admin/quiz/${quizId}/edit`);
  };

  const handleViewAttempts = (quizId: string) => {
    router.push(`/admin/quiz/${quizId}/attempts`);
  };

  const handleCreateQuiz = () => {
    router.push("/admin/quiz/create");
  };

  // Fetch quizzes when dependencies change
  useEffect(() => {
    fetchQuizzes();
  }, [
    urlState.page,
    urlState.sort,
    urlState.filter,
    urlState.university,
    urlState.degree,
    urlState.year,
    urlState.semester,
    urlState.subject,
    debouncedSearch,
    fetchQuizzes,
  ]);

  // Reset to page 1 when search changes (handled by URL state now)
  useEffect(() => {
    if (debouncedSearch !== urlState.search) {
      setUrlState({ page: 1 });
    }
  }, [debouncedSearch, urlState.search, setUrlState]);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="w-full space-y-6">
      <AdminQuizHeader stats={stats} onCreateQuiz={handleCreateQuiz} />

      <AdminQuizFilterAndSearch
        search={urlState.search}
        sort={urlState.sort}
        filter={urlState.filter}
        subjects={subjects}
        selectedUniversity={
          urlState.university ? (urlState.university as University) : undefined
        }
        selectedDegree={
          urlState.degree ? (urlState.degree as Degree) : undefined
        }
        selectedYear={urlState.year ? (urlState.year as Year) : undefined}
        selectedSemester={
          urlState.semester ? (urlState.semester as Semester) : undefined
        }
        selectedSubject={urlState.subject}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onAcademicFilterChange={handleAcademicFilterChange}
      />

      {quizzesData?.quizzes.length === 0 ? (
        <AdminQuizEmptyState
          search={urlState.search}
          filter={urlState.filter}
          hasAcademicFilters={
            !!(
              urlState.university ||
              urlState.degree ||
              urlState.year ||
              urlState.semester ||
              urlState.subject
            )
          }
        />
      ) : (
        quizzesData && (
          <AdminQuizTable
            quizzesData={quizzesData}
            onToggleStatus={handleToggleStatus}
            onTogglePublished={handleTogglePublished}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onViewAttempts={handleViewAttempts}
          />
        )
      )}

      {quizzesData && (
        <AdminQuizPagination
          currentPage={Math.max(1, urlState.page)}
          totalPages={quizzesData.pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
