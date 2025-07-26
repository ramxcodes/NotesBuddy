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
import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  type CouponSortOption,
  type CouponFilterOption,
} from "@/dal/coupon/types";

interface AdminCouponFilterAndSearchProps {
  search: string;
  sort: CouponSortOption;
  filter: CouponFilterOption;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: CouponSortOption) => void;
  onFilterChange: (filter: CouponFilterOption) => void;
}

export default function AdminCouponFilterAndSearch({
  search,
  sort,
  filter,
  onSearchChange,
  onSortChange,
  onFilterChange,
}: AdminCouponFilterAndSearchProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            weight="duotone"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/50"
          />
          <Input
            placeholder="Search coupons by code or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="font-satoshi rounded-xl border-2 border-black bg-white pl-10 font-bold text-black shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <FunnelSimpleIcon
            weight="duotone"
            className="h-4 w-4 text-black dark:text-white"
          />
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="font-satoshi w-48 rounded-xl border-2 border-black bg-white font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
              <SelectItem value="ALL">All Coupons</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="font-satoshi w-48 rounded-xl border-2 border-black bg-white font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <SelectItem value="NEWEST">Newest First</SelectItem>
            <SelectItem value="OLDEST">Oldest First</SelectItem>
            <SelectItem value="MOST_USED">Most Used</SelectItem>
            <SelectItem value="LEAST_USED">Least Used</SelectItem>
            <SelectItem value="HIGHEST_VALUE">Highest Value</SelectItem>
            <SelectItem value="LOWEST_VALUE">Lowest Value</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
