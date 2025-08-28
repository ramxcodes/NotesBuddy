"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getCouponsAction,
  toggleCouponStatusAction,
  deleteCouponAction,
} from "../actions/admin-coupons";
import {
  type CouponsListResponse,
  type CouponSortOption,
  type CouponFilterOption,
} from "@/dal/coupon/types";
import AdminCouponHeader from "./AdminCouponHeader";
import AdminCouponFilterAndSearch from "./AdminCouponFilterAndSearch";
import AdminCouponTable from "./AdminCouponTable";
import AdminCouponPagination from "./AdminCouponPagination";
import AdminCouponModals from "./AdminCouponModals";
import AdminCouponEmptyState from "./AdminCouponEmptyState";
import { telegramLogger } from "@/utils/telegram-logger";

export default function AdminCouponController() {
  const [couponsData, setCouponsData] = useState<CouponsListResponse | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CouponSortOption>("NEWEST");
  const [filter, setFilter] = useState<CouponFilterOption>("ALL");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsageView, setShowUsageView] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  const fetchCoupons = useCallback(
    async (page: number = currentPage) => {
      try {
        const result = await getCouponsAction({
          page,
          search: debouncedSearch,
          sort,
          filter,
        });
        setCouponsData(result);
      } catch (error) {
        await telegramLogger("Error fetching coupons:", error);
      }
    },
    [currentPage, debouncedSearch, sort, filter],
  );

  const handleSortChange = (newSort: CouponSortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: CouponFilterOption) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCoupons(page);
  };

  const handleToggleStatus = async (couponId: string) => {
    const result = await toggleCouponStatusAction(couponId);
    if (result.success) {
      fetchCoupons(currentPage);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      const result = await deleteCouponAction(couponId);
      if (result.success) {
        fetchCoupons(currentPage);
      }
    }
  };

  const handleEditCoupon = (couponId: string) => {
    setSelectedCouponId(couponId);
    setShowEditModal(true);
  };

  const handleViewUsage = (couponId: string) => {
    setSelectedCouponId(couponId);
    setShowUsageView(true);
  };

  const handleCreateCoupon = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowUsageView(false);
    setSelectedCouponId("");
    fetchCoupons(currentPage);
  };

  // Fetch coupons when sort, filter, or debounced search changes
  useEffect(() => {
    fetchCoupons(1);
  }, [sort, filter, debouncedSearch, fetchCoupons]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, search]);

  return (
    <div className="w-full space-y-6">
      <AdminCouponHeader onCreateCoupon={handleCreateCoupon} />

      <AdminCouponFilterAndSearch
        search={search}
        sort={sort}
        filter={filter}
        onSearchChange={setSearch}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      {couponsData?.coupons.length === 0 ? (
        <AdminCouponEmptyState search={search} filter={filter} />
      ) : (
        couponsData && (
          <AdminCouponTable
            couponsData={couponsData}
            onToggleStatus={handleToggleStatus}
            onEditCoupon={handleEditCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onViewUsage={handleViewUsage}
          />
        )
      )}

      {couponsData && (
        <AdminCouponPagination
          currentPage={currentPage}
          totalPages={couponsData.pagination.pages}
          onPageChange={handlePageChange}
        />
      )}

      <AdminCouponModals
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showUsageView={showUsageView}
        selectedCouponId={selectedCouponId}
        onModalClose={handleModalClose}
      />
    </div>
  );
}
