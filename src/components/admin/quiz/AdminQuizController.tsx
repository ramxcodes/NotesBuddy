"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getQuizzesAction,
  toggleQuizStatusAction,
  toggleQuizPublishedAction,
  deleteQuizAction,
  getQuizSubjectsAction,
} from "../actions/admin-quizzes";
import {
  type QuizzesListResponse,
  type QuizSortOption,
  type QuizFilterOption,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<QuizSortOption>("NEWEST");
  const [filter, setFilter] = useState<QuizFilterOption>("ALL");
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

  const fetchQuizzes = useCallback(
    async (page: number = currentPage) => {
      try {
        const result = await getQuizzesAction({
          page,
          search: debouncedSearch,
          sort,
          filter,
          university: selectedUniversity,
          degree: selectedDegree,
          year: selectedYear,
          semester: selectedSemester,
          subject: selectedSubject || undefined,
        });
        setQuizzesData(result);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },
    [
      currentPage,
      debouncedSearch,
      sort,
      filter,
      selectedUniversity,
      selectedDegree,
      selectedYear,
      selectedSemester,
      selectedSubject,
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

  const handleSortChange = (newSort: QuizSortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: QuizFilterOption) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleAcademicFilterChange = (
    type: "university" | "degree" | "year" | "semester" | "subject",
    value: University | Degree | Year | Semester | string | undefined,
  ) => {
    switch (type) {
      case "university":
        setSelectedUniversity(value as University | undefined);
        // Reset dependent filters
        setSelectedDegree(undefined);
        setSelectedYear(undefined);
        setSelectedSemester(undefined);
        break;
      case "degree":
        setSelectedDegree(value as Degree | undefined);
        // Reset dependent filters
        setSelectedYear(undefined);
        setSelectedSemester(undefined);
        break;
      case "year":
        setSelectedYear(value as Year | undefined);
        // Reset dependent filters
        setSelectedSemester(undefined);
        break;
      case "semester":
        setSelectedSemester(value as Semester | undefined);
        break;
      case "subject":
        setSelectedSubject((value as string) || "");
        break;
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchQuizzes(page);
  };

  const handleToggleStatus = async (quizId: string) => {
    const result = await toggleQuizStatusAction(quizId);
    if (result.success) {
      fetchQuizzes(currentPage);
    }
  };

  const handleTogglePublished = async (quizId: string) => {
    const result = await toggleQuizPublishedAction(quizId);
    if (result.success) {
      fetchQuizzes(currentPage);
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
        fetchQuizzes(currentPage);
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
    fetchQuizzes(1);
  }, [
    sort,
    filter,
    debouncedSearch,
    selectedUniversity,
    selectedDegree,
    selectedYear,
    selectedSemester,
    selectedSubject,
    fetchQuizzes,
  ]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, search]);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return (
    <div className="w-full space-y-6">
      <AdminQuizHeader onCreateQuiz={handleCreateQuiz} />

      <AdminQuizFilterAndSearch
        search={search}
        sort={sort}
        filter={filter}
        subjects={subjects}
        selectedUniversity={selectedUniversity}
        selectedDegree={selectedDegree}
        selectedYear={selectedYear}
        selectedSemester={selectedSemester}
        selectedSubject={selectedSubject}
        onSearchChange={setSearch}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onAcademicFilterChange={handleAcademicFilterChange}
      />

      {quizzesData?.quizzes.length === 0 ? (
        <AdminQuizEmptyState
          search={search}
          filter={filter}
          hasAcademicFilters={
            !!(
              selectedUniversity ||
              selectedDegree ||
              selectedYear ||
              selectedSemester ||
              selectedSubject
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
          currentPage={currentPage}
          totalPages={quizzesData.pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
