"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getAdminReportsAction,
  getAdminReportStatsAction,
  deleteReportAction,
  getReportDomainsAction,
} from "@/components/admin/actions/admin-reports";
import type {
  AdminReportsResponse,
  AdminReportStats,
  AdminReportFilters,
} from "@/dal/user/report/admin-query";
import AdminReportsHeader from "./AdminReportsHeader";
import AdminReportsFilterAndSearch from "./AdminReportsFilterAndSearch";
import AdminReportsTable from "./AdminReportsTable";
import AdminReportsPagination from "./AdminReportsPagination";
import AdminReportsEmptyState from "./AdminReportsEmptyState";

type ReportSortOption = "NEWEST" | "OLDEST" | "USER_NAME" | "URL";
type ReportFilterOption = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

export default function AdminReportsController() {
  const [reportsData, setReportsData] = useState<AdminReportsResponse | null>(
    null,
  );
  const [stats, setStats] = useState<AdminReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ReportSortOption>("NEWEST");
  const [filter, setFilter] = useState<ReportFilterOption>("ALL");
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: AdminReportFilters & { page: number; limit: number } = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        sortBy: sort,
        dateFilter: filter,
        domain: selectedDomain || undefined,
      };

      const [reportsResult, statsResult, domainsResult] = await Promise.all([
        getAdminReportsAction(filters),
        getAdminReportStatsAction(),
        getReportDomainsAction(),
      ]);

      setReportsData(reportsResult);
      setStats(statsResult);
      setDomains(domainsResult);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sort, filter, selectedDomain]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: ReportSortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: ReportFilterOption) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setCurrentPage(1);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const result = await deleteReportAction(reportId);
      if (result.success) {
        // Reload data to reflect changes
        await loadData();
      } else {
        alert(result.error || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("An error occurred while deleting the report");
    }
  };

  if (loading && !reportsData) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="mb-4 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-8 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const hasReports = reportsData && reportsData.reports.length > 0;

  return (
    <div className="space-y-8">
      {stats && <AdminReportsHeader stats={stats} />}

      <div className="space-y-6">
        <AdminReportsFilterAndSearch
          search={search}
          onSearchChange={handleSearchChange}
          sort={sort}
          onSortChange={handleSortChange}
          filter={filter}
          onFilterChange={handleFilterChange}
          domains={domains}
          selectedDomain={selectedDomain}
          onDomainChange={handleDomainChange}
        />

        {hasReports ? (
          <>
            <AdminReportsTable
              reports={reportsData.reports}
              onDeleteReport={handleDeleteReport}
              loading={loading}
            />
            <AdminReportsPagination
              pagination={reportsData.pagination}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <AdminReportsEmptyState
            hasFilters={
              !!(debouncedSearch || filter !== "ALL" || selectedDomain)
            }
            onClearFilters={() => {
              setSearch("");
              setFilter("ALL");
              setSelectedDomain("");
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
