"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getAdminChatsAction,
  getAdminChatStatsAction,
  deleteAdminChatAction,
  getChatSubjectsAction,
} from "@/components/admin/actions/admin-ai";
import type {
  AdminChatsResponse,
  AdminChatStats,
  AdminChatFilters,
} from "@/dal/ai/admin-query";
import { University, Degree, Year, Semester } from "@prisma/client";
import AdminAIHeader from "./AdminAIHeader";
import AdminAIFilterAndSearch from "./AdminAIFilterAndSearch";
import AdminAITable from "./AdminAITable";
import AdminAIPagination from "./AdminAIPagination";
import AdminAIEmptyState from "./AdminAIEmptyState";

type AISortOption =
  | "NEWEST"
  | "OLDEST"
  | "NAME_ASC"
  | "NAME_DESC"
  | "MOST_MESSAGES"
  | "LEAST_MESSAGES";

type AIFilterOption = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

export default function AdminAIController() {
  const router = useRouter();
  const [chatsData, setChatsData] = useState<AdminChatsResponse | null>(null);
  const [stats, setStats] = useState<AdminChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<AISortOption>("NEWEST");
  const [filter, setFilter] = useState<AIFilterOption>("ALL");
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
  const [selectedSubject, setSelectedSubject] =
    useState<string>("ALL_SUBJECTS");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const fetchChats = useCallback(
    async (page: number = currentPage) => {
      setLoading(true);
      try {
        const filters: AdminChatFilters = {
          page,
          search: debouncedSearch || undefined,
          university: selectedUniversity,
          degree: selectedDegree,
          year: selectedYear,
          semester: selectedSemester,
          subject:
            selectedSubject && selectedSubject !== "ALL_SUBJECTS"
              ? selectedSubject
              : undefined,
        };

        const result = await getAdminChatsAction(filters);
        if (result) {
          let sortedChats = [...result.chats];

          // Apply sorting
          switch (sort) {
            case "NEWEST":
              sortedChats.sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              );
              break;
            case "OLDEST":
              sortedChats.sort(
                (a, b) =>
                  new Date(a.updatedAt).getTime() -
                  new Date(b.updatedAt).getTime(),
              );
              break;
            case "NAME_ASC":
              sortedChats.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case "NAME_DESC":
              sortedChats.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case "MOST_MESSAGES":
              sortedChats.sort((a, b) => b.messageCount - a.messageCount);
              break;
            case "LEAST_MESSAGES":
              sortedChats.sort((a, b) => a.messageCount - b.messageCount);
              break;
          }

          // Apply time-based filters
          if (filter !== "ALL") {
            const now = new Date();
            let filterDate: Date;

            switch (filter) {
              case "TODAY":
                filterDate = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                );
                break;
              case "THIS_WEEK":
                filterDate = new Date(now);
                filterDate.setDate(now.getDate() - now.getDay());
                filterDate.setHours(0, 0, 0, 0);
                break;
              case "THIS_MONTH":
                filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
              default:
                filterDate = new Date(0);
            }

            sortedChats = sortedChats.filter(
              (chat) => new Date(chat.updatedAt) >= filterDate,
            );
          }

          setChatsData({
            ...result,
            chats: sortedChats,
          });
        }
      } catch {
      } finally {
        setLoading(false);
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

  const fetchStats = useCallback(async () => {
    try {
      const result = await getAdminChatStatsAction();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch {}
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const result = await getChatSubjectsAction();
      if (result) {
        setSubjects(result);
      }
    } catch {}
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchChats(page);
  };

  const handleFilterChange = (
    type: string,
    value: string | University | Degree | Year | Semester | undefined,
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
        setSelectedSubject(
          value === "ALL_SUBJECTS" ? "ALL_SUBJECTS" : (value as string),
        );
        break;
    }
    setCurrentPage(1);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chat? This action cannot be undone.",
      )
    ) {
      return;
    }

    const result = await deleteAdminChatAction(chatId);
    if (result.success) {
      fetchChats(currentPage);
      fetchStats();
    }
  };

  const handleViewChat = (chatId: string) => {
    router.push(`/admin/ai/${chatId}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSort("NEWEST");
    setFilter("ALL");
    setSelectedUniversity(undefined);
    setSelectedDegree(undefined);
    setSelectedYear(undefined);
    setSelectedSemester(undefined);
    setSelectedSubject("ALL_SUBJECTS");
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchChats(1);
  }, [
    sort,
    filter,
    debouncedSearch,
    selectedUniversity,
    selectedDegree,
    selectedYear,
    selectedSemester,
    selectedSubject,
    fetchChats,
  ]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, currentPage]);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchSubjects();
  }, [fetchStats, fetchSubjects]);

  return (
    <div className="space-y-6">
      <AdminAIHeader stats={stats} />

      <AdminAIFilterAndSearch
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={(sort) => setSort(sort as AISortOption)}
        filter={filter}
        setFilter={(filter) => setFilter(filter as AIFilterOption)}
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
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading AI chats...</p>
        </div>
      ) : !chatsData || chatsData.chats.length === 0 ? (
        <AdminAIEmptyState
          hasFilters={
            !!search ||
            filter !== "ALL" ||
            !!selectedUniversity ||
            !!selectedDegree ||
            !!selectedYear ||
            !!selectedSemester ||
            (!!selectedSubject && selectedSubject !== "ALL_SUBJECTS")
          }
          onClearFilters={clearFilters}
        />
      ) : (
        <>
          <AdminAITable
            chats={chatsData.chats}
            onViewChat={handleViewChat}
            onDeleteChat={handleDeleteChat}
          />

          {chatsData.totalPages > 1 && (
            <AdminAIPagination
              currentPage={chatsData.currentPage}
              totalPages={chatsData.totalPages}
              hasNextPage={chatsData.hasNextPage}
              hasPreviousPage={chatsData.hasPreviousPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
