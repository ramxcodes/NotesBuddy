"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getNotesAction,
  getNotesFilterOptionsAction,
} from "../actions/admin-notes";
import { type NotesListResponse, type NotesListParams } from "@/dal/note/admin";
import AdminNotesHeader from "./AdminNotesHeader";
import AdminNotesFilterAndSearch from "./AdminNotesFilterAndSearch";
import AdminNotesTable from "./AdminNotesTable";
import AdminNotesPagination from "./AdminNotesPagination";
import AdminNotesEmptyState from "./AdminNotesEmptyState";

export default function AdminNotesController() {
  const router = useRouter();
  const [notesData, setNotesData] = useState<NotesListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "title" | "createdAt" | "university" | "subject"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterOptions, setFilterOptions] = useState<{
    universities: string[];
    degrees: string[];
    years: string[];
    semesters: string[];
    subjects: string[];
  } | null>(null);

  // Academic filters
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const fetchNotes = useCallback(
    async (page: number = currentPage) => {
      setIsLoading(true);
      try {
        const params: NotesListParams = {
          page,
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
          university: selectedUniversity || undefined,
          degree: selectedDegree || undefined,
          year: selectedYear || undefined,
          semester: selectedSemester || undefined,
          subject: selectedSubject || undefined,
        };

        const result = await getNotesAction(params);
        setNotesData(result);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentPage,
      debouncedSearch,
      sortBy,
      sortOrder,
      selectedUniversity,
      selectedDegree,
      selectedYear,
      selectedSemester,
      selectedSubject,
    ],
  );

  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await getNotesFilterOptionsAction();
      if (result) {
        setFilterOptions(result);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  const handleSortChange = (
    newSortBy: typeof sortBy,
    newSortOrder: typeof sortOrder,
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleUniversityChange = (university: string) => {
    setSelectedUniversity(university);
    setCurrentPage(1);
  };

  const handleDegreeChange = (degree: string) => {
    setSelectedDegree(degree);
    setCurrentPage(1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setCurrentPage(1);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/admin/notes/${noteId}/edit`);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedUniversity("");
    setSelectedDegree("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedSubject("");
    setCurrentPage(1);
  };

  // Effect to fetch notes when dependencies change
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Effect to fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      selectedUniversity ||
      selectedDegree ||
      selectedYear ||
      selectedSemester ||
      selectedSubject,
  );

  return (
    <div className="space-y-6">
      <AdminNotesHeader />

      <AdminNotesFilterAndSearch
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        selectedUniversity={selectedUniversity}
        selectedDegree={selectedDegree}
        selectedYear={selectedYear}
        selectedSemester={selectedSemester}
        selectedSubject={selectedSubject}
        onUniversityChange={handleUniversityChange}
        onDegreeChange={handleDegreeChange}
        onYearChange={handleYearChange}
        onSemesterChange={handleSemesterChange}
        onSubjectChange={handleSubjectChange}
        filterOptions={filterOptions}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {notesData && notesData.notes.length > 0 ? (
        <>
          <AdminNotesTable
            notes={notesData.notes}
            onEditNote={handleEditNote}
            isLoading={isLoading}
          />

          <AdminNotesPagination
            currentPage={notesData.currentPage}
            totalPages={notesData.totalPages}
            totalCount={notesData.totalCount}
            hasNextPage={notesData.hasNextPage}
            hasPreviousPage={notesData.hasPreviousPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <AdminNotesEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
