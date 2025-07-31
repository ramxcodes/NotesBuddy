"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MagnifyingGlass,
  SortAscending,
  CalendarBlank,
  Globe,
  X,
} from "@phosphor-icons/react";

type ReportSortOption = "NEWEST" | "OLDEST" | "USER_NAME" | "URL";
type ReportFilterOption = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

interface AdminReportsFilterAndSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  sort: ReportSortOption;
  onSortChange: (sort: ReportSortOption) => void;
  filter: ReportFilterOption;
  onFilterChange: (filter: ReportFilterOption) => void;
  domains: string[];
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

export default function AdminReportsFilterAndSearch({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filter,
  onFilterChange,
  domains,
  selectedDomain,
  onDomainChange,
}: AdminReportsFilterAndSearchProps) {
  const hasActiveFilters = search || filter !== "ALL" || selectedDomain;

  const clearAllFilters = () => {
    onSearchChange("");
    onFilterChange("ALL");
    onDomainChange("");
  };

  return (
    <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <MagnifyingGlass className="h-5 w-5" />
          Search & Filter Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search reports, users, or URLs..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="dark:border-white-20dark:focus:border-white border-2 border-black pl-10 focus:border-black focus:ring-0"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sort */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-bold">
              <SortAscending className="h-4 w-4" />
              Sort By
            </label>
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="border-2 border-black dark:border-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">Newest First</SelectItem>
                <SelectItem value="OLDEST">Oldest First</SelectItem>
                <SelectItem value="USER_NAME">User Name</SelectItem>
                <SelectItem value="URL">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-bold">
              <CalendarBlank className="h-4 w-4" />
              Date Range
            </label>
            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger className="border-2 border-black dark:border-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="THIS_WEEK">This Week</SelectItem>
                <SelectItem value="THIS_MONTH">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Domain Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-bold">
              <Globe className="h-4 w-4" />
              Domain
            </label>
            <Select
              value={selectedDomain || "ALL_DOMAINS"}
              onValueChange={(value) =>
                onDomainChange(value === "ALL_DOMAINS" ? "" : value)
              }
            >
              <SelectTrigger className="border-2 border-black dark:border-white">
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_DOMAINS">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="space-y-2">
            <label className="text-sm font-bold opacity-0">Clear</label>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="dark:border-white-20dark:bg-black w-full border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 dark:text-white dark:hover:bg-gray-900"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
            <span className="text-sm font-bold">Active filters:</span>
            {search && (
              <Badge
                variant="secondary"
                className="dark:border-white-20dark:bg-yellow-900 border-2 border-black bg-yellow-100 text-black dark:text-white"
              >
                Search: &ldquo;{search}&rdquo;
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-1 rounded-full p-0.5 hover:bg-black hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filter !== "ALL" && (
              <Badge
                variant="secondary"
                className="dark:border-white-20dark:bg-blue-900 border-2 border-black bg-blue-100 text-black dark:text-white"
              >
                Date: {filter.replace("_", " ")}
                <button
                  onClick={() => onFilterChange("ALL")}
                  className="ml-1 rounded-full p-0.5 hover:bg-black hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedDomain && (
              <Badge
                variant="secondary"
                className="dark:border-white-20dark:bg-green-900 border-2 border-black bg-green-100 text-black dark:text-white"
              >
                Domain: {selectedDomain}
                <button
                  onClick={() => onDomainChange("")}
                  className="ml-1 rounded-full p-0.5 hover:bg-black hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
