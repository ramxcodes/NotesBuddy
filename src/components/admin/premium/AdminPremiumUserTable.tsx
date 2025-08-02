"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MagnifyingGlass,
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  Crown,
  CalendarBlank,
  User,
} from "@phosphor-icons/react";
import type {
  AdminPremiumResponse,
  AdminPremiumFilters,
} from "@/dal/premium/admin-query";
import { PremiumTier } from "@prisma/client";
import Image from "next/image";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";

interface AdminPremiumUserTableProps {
  data: AdminPremiumResponse | null;
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  tier: AdminPremiumFilters["tier"];
  setTier: (tier: AdminPremiumFilters["tier"]) => void;
  status: AdminPremiumFilters["status"];
  setStatus: (status: AdminPremiumFilters["status"]) => void;
  sortBy: AdminPremiumFilters["sortBy"];
  setSortBy: (sortBy: AdminPremiumFilters["sortBy"]) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function AdminPremiumUserTable({
  data,
  loading,
  search,
  setSearch,
  tier,
  setTier,
  status,
  setStatus,
  sortBy,
  setSortBy,
  currentPage,
  onPageChange,
  onRefresh,
}: AdminPremiumUserTableProps) {
  const getTierColor = (tier: PremiumTier) => {
    switch (tier) {
      case "TIER_1":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "TIER_2":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "TIER_3":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (isActive: boolean, daysRemaining: number | null) => {
    if (!isActive)
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (daysRemaining && daysRemaining <= 7)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <Card className="neuro">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-black">
            <Crown className="h-5 w-5" />
            Premium Users
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="neuro-sm"
          >
            <ArrowClockwise className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neuro-sm pl-10"
            />
          </div>

          {/* Tier Filter */}
          <Select
            value={tier || "ALL"}
            onValueChange={(value) =>
              setTier(value === "ALL" ? "ALL" : (value as PremiumTier))
            }
          >
            <SelectTrigger className="neuro-sm">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="TIER_1">Tier 1</SelectItem>
              <SelectItem value="TIER_2">Tier 2</SelectItem>
              <SelectItem value="TIER_3">Tier 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              setStatus(
                value === "ALL" ? "ALL" : (value as "ACTIVE" | "EXPIRED"),
              )
            }
          >
            <SelectTrigger className="neuro-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy || "NEWEST"}
            onValueChange={(value) =>
              setSortBy(value as AdminPremiumFilters["sortBy"])
            }
          >
            <SelectTrigger className="neuro-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="NAME_ASC">Name A-Z</SelectItem>
              <SelectItem value="NAME_DESC">Name Z-A</SelectItem>
              <SelectItem value="EXPIRY_SOON">Expiring Soon</SelectItem>
              <SelectItem value="EXPIRY_LATE">Expiring Late</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-muted h-16 animate-pulse rounded" />
            ))}
          </div>
        ) : data && data.users.length > 0 ? (
          <>
            <div className="neuro-sm overflow-hidden rounded-lg border dark:border-white/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Premium Details</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Purchase Info</TableHead>
                    <TableHead className="font-bold">Academic Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => (
                    <TableRow key={user.id}>
                      {/* User Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-muted-foreground text-sm">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Premium Details */}
                      <TableCell>
                        <div className="space-y-1">
                          {user.currentPremiumTier && (
                            <Badge
                              className={getTierColor(user.currentPremiumTier)}
                            >
                              {user.currentPremiumTier.replace("_", " ")}
                            </Badge>
                          )}
                          {user.premiumExpiryDate && (
                            <div className="text-muted-foreground text-sm">
                              <CalendarBlank className="mr-1 inline h-3 w-3" />
                              Expires: {formatDate(user.premiumExpiryDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            className={getStatusColor(
                              user.isPremiumActive,
                              user.daysRemaining,
                            )}
                          >
                            {user.isPremiumActive ? "Active" : "Expired"}
                          </Badge>
                          {user.daysRemaining !== null && (
                            <div className="text-muted-foreground text-sm">
                              {user.daysRemaining > 0
                                ? `${user.daysRemaining} days left`
                                : "Expired"}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Purchase Info */}
                      <TableCell>
                        {user.activePurchase ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {formatCurrency(user.activePurchase.finalAmount)}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {formatDate(user.activePurchase.createdAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No purchase
                          </span>
                        )}
                      </TableCell>

                      {/* Academic Info */}
                      <TableCell>
                        {user.profile ? (
                          <div className="text-sm">
                            <div>{user.profile.university}</div>
                            <div className="text-muted-foreground">
                              {getDisplayNameFromPrismaValue(
                                "degree",
                                user.profile.degree || "",
                              )}{" "}
                              -{" "}
                              {getDisplayNameFromPrismaValue(
                                "year",
                                user.profile.year || "",
                              )}{" "}
                              -{" "}
                              {getDisplayNameFromPrismaValue(
                                "semester",
                                user.profile.semester || "",
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No profile
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  Showing {(currentPage - 1) * 20 + 1} to{" "}
                  {Math.min(currentPage * 20, data.totalCount)} of{" "}
                  {data.totalCount} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!data.hasPreviousPage}
                    className="neuro-sm"
                  >
                    <CaretLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm font-semibold">
                    Page {currentPage} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!data.hasNextPage}
                    className="neuro-sm"
                  >
                    Next
                    <CaretRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <Crown className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              No premium users found
            </h3>
            <p className="text-muted-foreground">
              {search
                ? "Try adjusting your search or filters"
                : "No users have premium subscriptions yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
