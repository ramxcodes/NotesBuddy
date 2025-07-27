"use client";

import React from "react";

interface AdminCouponEmptyStateProps {
  search: string;
  filter: string;
}

export default function AdminCouponEmptyState({
  search,
  filter,
}: AdminCouponEmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-black bg-zinc-100 p-8 text-center shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="font-excon text-2xl font-black text-black dark:text-white">
        No coupons found
      </div>
      <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
        {search || filter !== "ALL"
          ? "Try adjusting your search or filters"
          : "Create your first discount coupon"}
      </p>
    </div>
  );
}
