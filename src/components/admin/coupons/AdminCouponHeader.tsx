"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

interface AdminCouponHeaderProps {
  onCreateCoupon: () => void;
}

export default function AdminCouponHeader({
  onCreateCoupon,
}: AdminCouponHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="mb-6 text-2xl font-black text-black dark:text-white">
          Discount Coupons
        </h2>
        <p className="font-satoshi text-lg font-bold text-black/70 dark:text-white/70">
          Manage discount codes and promotions
        </p>
      </div>
      <Button
        onClick={onCreateCoupon}
        className="font-excon flex items-center gap-2 rounded-md border-2 border-black bg-black px-6 py-3 font-black text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373]"
        data-umami-event="admin-coupon-create-button-click"
      >
        <PlusIcon weight="duotone" className="h-5 w-5" />
        Create Coupon
      </Button>
    </div>
  );
}
