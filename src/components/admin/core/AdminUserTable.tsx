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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getDisplayNameFromPrismaValue,
  normalizedTierValues,
} from "@/utils/academic-config";
import {
  getAdminUsersAction,
  toggleUserBlockAction,
  deleteUserAction,
} from "../actions/admin-users";
import {
  AdminUser,
  AdminUsersResponse,
  SortOption,
  FilterOption,
} from "@/dal/user/admin/user-table-types";
import { MoreVertical, Trash2 } from "lucide-react";
import DeleteUserDialog from "./DeleteUserDialog";
import { toast } from "sonner";

export default function AdminUserTable() {
  const [usersData, setUsersData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("NEW_USERS");
  const [filter, setFilter] = useState<FilterOption>("ALL");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await getAdminUsersAction({
          page,
          search: debouncedSearch,
          sort,
          filter,
        });
        setUsersData(result);
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, sort, filter],
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
  };

  const handleBlockUser = async (userId: string) => {
    const result = await toggleUserBlockAction(userId);
    if (result.success) {
      fetchUsers(currentPage);
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (userId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAction(userId);
      if (result.success) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        toast.success("User and all associated data deleted successfully");
        // Refresh the user list
        await fetchUsers(currentPage);
      } else {
        toast.error(result.error || "Failed to delete user");
        console.error("Failed to delete user:", result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting user");
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sort, filter]);

  const getPremiumStatus = (user: AdminUser) => {
    const tierValues = normalizedTierValues();

    // Current status
    let currentStatus = "Free";
    if (user.isPremiumActive && user.currentPremiumTier) {
      currentStatus =
        tierValues[user.currentPremiumTier as keyof typeof tierValues] ||
        user.currentPremiumTier;
    }

    // Previous status (get the most recent non-active premium purchase)
    let previousStatus = "";
    if (user.premiumHistory && user.premiumHistory.length > 0) {
      // Get all previous tiers, excluding current active one
      const previousTiers = user.premiumHistory
        .filter((p) => !p.isActive || !user.isPremiumActive)
        .map((p) => tierValues[p.tier as keyof typeof tierValues] || p.tier)
        .filter((tier) => tier !== currentStatus);

      if (previousTiers.length > 0) {
        const uniquePrevious = [...new Set(previousTiers)];
        if (uniquePrevious.length === 1) {
          previousStatus = uniquePrevious[0];
        } else if (uniquePrevious.length > 1) {
          previousStatus = `${uniquePrevious[0]} +${uniquePrevious.length - 1}`;
        }
      }
    }

    return {
      current: currentStatus,
      previous: previousStatus,
    };
  };

  const renderPagination = () => {
    if (!usersData || usersData.totalPages <= 1) return null;

    const totalPages = usersData.totalPages;
    const current = currentPage;

    // Calculate which pages to show
    const getVisiblePages = () => {
      const delta = 2; // Number of pages to show on each side of current page
      const range = [];
      const rangeWithDots = [];

      // Always show first page
      range.push(1);

      // Calculate start and end of middle range
      const start = Math.max(2, current - delta);
      const end = Math.min(totalPages - 1, current + delta);

      // Add dots after first page if needed
      if (start > 2) {
        rangeWithDots.push(1);
        rangeWithDots.push("dots1");
      } else {
        rangeWithDots.push(1);
      }

      // Add middle range
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          rangeWithDots.push(i);
        }
      }

      // Add dots before last page if needed
      if (end < totalPages - 1) {
        rangeWithDots.push("dots2");
        rangeWithDots.push(totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      // Remove duplicates and return unique pages
      return [
        ...new Set(
          rangeWithDots.filter(
            (item) =>
              item === "dots1" ||
              item === "dots2" ||
              (typeof item === "number" && item >= 1 && item <= totalPages),
          ),
        ),
      ];
    };

    const visiblePages = getVisiblePages();

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={
                currentPage > 1
                  ? () => handlePageChange(currentPage - 1)
                  : undefined
              }
              className={`rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#757373]"
              }`}
            />
          </PaginationItem>

          {visiblePages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "dots1" || page === "dots2" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page as number)}
                  isActive={page === currentPage}
                  className={`cursor-pointer rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] ${
                    page === currentPage
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-zinc-100 hover:shadow-[1px_1px_0px_0px_#000] dark:bg-zinc-900 dark:text-white dark:hover:shadow-[1px_1px_0px_0px_#757373]"
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={
                currentPage < totalPages
                  ? () => handlePageChange(currentPage + 1)
                  : undefined
              }
              className={`rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] ${
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:shadow-[1px_1px_0px_0px_#000] dark:hover:shadow-[1px_1px_0px_0px_#757373]"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <TooltipProvider>
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
              className="flex-1 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]"
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
                className="w-48 rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                data-umami-event="admin-user-sort-trigger"
              >
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
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
                className="w-48 rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                data-umami-event="admin-user-filter-trigger"
              >
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
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
                <SelectItem
                  value="HAD_PREMIUM"
                  className="rounded-lg"
                  data-umami-event="admin-user-filter-had-premium"
                >
                  Had Premium
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
          <div className="rounded-md border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black dark:border-white/20">
                  <TableHead className="p-3 text-left font-black">
                    No.
                  </TableHead>
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
                        className="rounded-md border-2 border-black dark:border-white/20"
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help rounded-lg border-2 border-black px-2 py-1 text-sm font-bold text-blue-800 dark:border-white/20 dark:text-blue-200">
                              {user.deviceCount}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold">
                                Device Information
                              </p>
                              {user.deviceDetails &&
                              user.deviceDetails.length > 0 ? (
                                user.deviceDetails.slice(0, 3).map((device) => (
                                  <div
                                    key={device.id}
                                    className="border-b border-gray-300 pb-1 text-xs last:border-b-0"
                                  >
                                    <p className="font-medium">
                                      {device.deviceLabel || "Unknown Device"}
                                    </p>
                                    <p>
                                      Last used:{" "}
                                      {new Date(
                                        device.lastUsedAt,
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                    <p>
                                      Status:{" "}
                                      {device.isActive ? "Active" : "Inactive"}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs">
                                  No device details available
                                </p>
                              )}
                              {user.deviceDetails &&
                                user.deviceDetails.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{user.deviceDetails.length - 3} more
                                    devices
                                  </p>
                                )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex cursor-help flex-wrap gap-1">
                            {(() => {
                              const status = getPremiumStatus(user);
                              return (
                                <>
                                  <span
                                    className={`rounded-lg border-2 border-black px-2 py-1 text-xs font-bold dark:border-white/20 ${
                                      user.isPremiumActive
                                        ? "bg-green-200 dark:bg-green-800"
                                        : "bg-gray-200 dark:bg-gray-800"
                                    }`}
                                  >
                                    {status.current}
                                  </span>
                                  {status.previous && (
                                    <span className="rounded-lg border-2 border-black bg-orange-200 px-2 py-1 text-xs font-bold dark:border-white/20 dark:bg-orange-800">
                                      {status.previous}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <div className="space-y-2">
                            <p className="font-semibold">Premium Information</p>
                            <div className="text-xs">
                              <p className="font-medium">
                                Current Status:{" "}
                                {user.isPremiumActive ? "Active" : "Inactive"}
                              </p>
                              {user.currentPremiumTier && (
                                <p>
                                  Current Tier:{" "}
                                  {normalizedTierValues()[
                                    user.currentPremiumTier as keyof typeof normalizedTierValues
                                  ] || user.currentPremiumTier}
                                </p>
                              )}
                            </div>
                            {user.premiumHistory &&
                              user.premiumHistory.length > 0 && (
                                <div className="text-xs">
                                  <p className="font-medium">
                                    Premium History:
                                  </p>
                                  {user.premiumHistory
                                    .slice(0, 3)
                                    .map((purchase) => (
                                      <div
                                        key={purchase.id}
                                        className="border-b border-gray-300 pb-1 last:border-b-0"
                                      >
                                        <p>
                                          Tier:{" "}
                                          {normalizedTierValues()[
                                            purchase.tier as keyof typeof normalizedTierValues
                                          ] || purchase.tier}
                                        </p>
                                        <p>
                                          Status:{" "}
                                          {purchase.isActive
                                            ? "Active"
                                            : "Expired"}
                                        </p>
                                        <p>
                                          Expires:{" "}
                                          {new Date(
                                            purchase.expiryDate,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                    ))}
                                  {user.premiumHistory.length > 3 && (
                                    <p className="text-gray-500">
                                      +{user.premiumHistory.length - 3} more
                                      purchases
                                    </p>
                                  )}
                                </div>
                              )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2">
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

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[1px_1px_0px_0px_#757373]"
                              data-umami-event="admin-user-actions-dropdown"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]"
                          >
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              variant="destructive"
                              className="cursor-pointer rounded-lg"
                              data-umami-event="admin-user-delete-trigger"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

        {/* Delete User Dialog */}
        <DeleteUserDialog
          isOpen={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          user={userToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </TooltipProvider>
  );
}
