"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getDisplayNameFromPrismaValue,
  normalizedTierValues,
} from "@/utils/academic-config";
import {
  getAdminUsersAction,
  toggleUserBlockAction,
} from "../actions/admin-users";
import {
  AdminUser,
  AdminUsersResponse,
  SortOption,
  FilterOption,
} from "@/dal/user/admin/user-table-types";

export default function AdminUserTable() {
  const [usersData, setUsersData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("NEW_USERS");
  const [filter, setFilter] = useState<FilterOption>("ALL");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(
    async (page: number = currentPage) => {
      setLoading(true);
      try {
        const result = await getAdminUsersAction({
          page,
          search: debouncedSearch,
          sort,
          filter,
        });
        setUsersData(result);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, debouncedSearch, sort, filter],
  );

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleBlockUser = async (userId: string) => {
    const result = await toggleUserBlockAction(userId);
    if (result.success) {
      // Refresh the current page
      fetchUsers(currentPage);
    }
  };

  // Fetch users when sort, filter, or debounced search changes
  useEffect(() => {
    fetchUsers(1);
  }, [sort, filter, debouncedSearch, fetchUsers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, search]);

  const getPremiumStatus = (user: AdminUser) => {
    if (!user.isPremiumActive) return "Free";
    if (user.currentPremiumTier) {
      const tierValues = normalizedTierValues();
      return (
        tierValues[user.currentPremiumTier as keyof typeof tierValues] ||
        user.currentPremiumTier
      );
    }
    return "Premium";
  };

  const renderPagination = () => {
    if (!usersData || usersData.totalPages <= 1) return null;

    const pages = Array.from({ length: usersData.totalPages }, (_, i) => i + 1);

    return (
      <div className="mt-6 flex justify-center gap-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="rounded-xl border-2 border-black bg-zinc-100 shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
        >
          Previous
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            variant={page === currentPage ? "default" : "outline"}
            className={`rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] ${
              page === currentPage
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 dark:bg-zinc-900 dark:text-white"
            }`}
          >
            {page}
          </Button>
        ))}

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === usersData.totalPages}
          variant="outline"
          className="rounded-xl border-2 border-black bg-zinc-100 shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-black text-black dark:text-white">
        Admin User Management
      </h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="flex-1 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]"
            data-umami-event="admin-user-search-input"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            value={sort}
            onValueChange={(value: SortOption) => handleSortChange(value)}
          >
            <SelectTrigger
              className="w-48 rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
              data-umami-event="admin-user-sort-trigger"
            >
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="A_TO_Z"
                className="rounded-lg"
                data-umami-event="admin-user-sort-a-to-z"
              >
                A - Z
              </SelectItem>
              <SelectItem
                value="Z_TO_A"
                className="rounded-lg"
                data-umami-event="admin-user-sort-z-to-a"
              >
                Z - A
              </SelectItem>
              <SelectItem
                value="NEW_USERS"
                className="rounded-lg"
                data-umami-event="admin-user-sort-new-users"
              >
                New Users
              </SelectItem>
              <SelectItem
                value="OLD_USERS"
                className="rounded-lg"
                data-umami-event="admin-user-sort-old-users"
              >
                Old Users
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter}
            onValueChange={(value: FilterOption) => handleFilterChange(value)}
          >
            <SelectTrigger
              className="w-48 rounded-xl border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
              data-umami-event="admin-user-filter-trigger"
            >
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem
                value="ALL"
                className="rounded-lg"
                data-umami-event="admin-user-filter-all"
              >
                All Users
              </SelectItem>
              <SelectItem
                value="PREMIUM"
                className="rounded-lg"
                data-umami-event="admin-user-filter-premium"
              >
                Premium Users
              </SelectItem>
              <SelectItem
                value="FREE"
                className="rounded-lg"
                data-umami-event="admin-user-filter-free"
              >
                Free Users
              </SelectItem>
              <SelectItem
                value="BLOCKED"
                className="rounded-lg"
                data-umami-event="admin-user-filter-blocked"
              >
                Blocked Users
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center">
          <div className="text-lg font-bold">Loading...</div>
        </div>
      )}

      {/* Table */}
      {!loading && usersData && (
        <div className="rounded-xl border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black dark:border-white/20">
                <TableHead className="p-3 text-left font-black">No.</TableHead>
                <TableHead className="p-3 text-left font-black">
                  Profile
                </TableHead>
                <TableHead className="p-3 text-left font-black">
                  Name & Contact
                </TableHead>
                <TableHead className="p-3 text-left font-black">
                  User Profile
                </TableHead>
                <TableHead className="p-3 text-left font-black">
                  Devices
                </TableHead>
                <TableHead className="p-3 text-left font-black">
                  Premium Status
                </TableHead>
                <TableHead className="p-3 text-left font-black">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="border-b border-zinc-300 dark:border-zinc-600"
                >
                  <TableCell className="p-3">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell className="p-3">
                    <Image
                      src={user.image || "/avatar/1.jpg"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-xl border-2 border-black dark:border-white/20"
                    />
                  </TableCell>
                  <TableCell className="p-3">
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {user.email}
                      </div>
                      {user.profile && (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {user.profile.phoneNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    {user.profile ? (
                      <div className="text-sm">
                        <div className="font-semibold">
                          {user.profile.firstName} {user.profile.lastName}
                        </div>
                        <div>
                          {getDisplayNameFromPrismaValue(
                            "university",
                            user.profile.university,
                          )}{" "}
                          -{" "}
                          {getDisplayNameFromPrismaValue(
                            "degree",
                            user.profile.degree,
                          )}
                        </div>
                        <div>
                          {getDisplayNameFromPrismaValue(
                            "year",
                            user.profile.year,
                          )}{" "}
                          -{" "}
                          {getDisplayNameFromPrismaValue(
                            "semester",
                            user.profile.semester,
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-500">No profile</span>
                    )}
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex items-center justify-center">
                      <span className="rounded-lg border-2 border-black px-2 py-1 text-sm font-bold text-blue-800 dark:border-white/20 dark:text-blue-200">
                        {user.deviceCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <span
                      className={`rounded-lg border-2 border-black px-2 py-1 text-xs font-bold dark:border-white/20 ${
                        user.isPremiumActive
                          ? "bg-green-200 dark:bg-green-800"
                          : "bg-gray-200 dark:bg-gray-800"
                      }`}
                    >
                      {getPremiumStatus(user)}
                    </span>
                  </TableCell>
                  <TableCell className="p-3">
                    <Button
                      onClick={() => handleBlockUser(user.id)}
                      variant="outline"
                      size="sm"
                      className={`rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] ${
                        user.isBlocked
                          ? "bg-green-500 dark:bg-green-800"
                          : "bg-red-500 dark:bg-red-800"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Results info */}
      {usersData && (
        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Showing {usersData.users.length} of {usersData.totalCount} users
        </div>
      )}
    </div>
  );
}
