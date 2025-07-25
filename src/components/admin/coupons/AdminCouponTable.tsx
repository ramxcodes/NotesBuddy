"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilSimpleLineIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  EyeIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { DiscountType } from "@prisma/client";
import { type CouponsListResponse } from "@/dal/coupon/types";

interface AdminCouponTableProps {
  couponsData: CouponsListResponse;
  onToggleStatus: (couponId: string) => void;
  onEditCoupon: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
  onViewUsage: (couponId: string) => void;
}

export default function AdminCouponTable({
  couponsData,
  onToggleStatus,
  onEditCoupon,
  onDeleteCoupon,
  onViewUsage,
}: AdminCouponTableProps) {
  return (
    <div className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black hover:bg-zinc-50 dark:border-white dark:hover:bg-zinc-700">
            <TableHead className="font-excon font-black text-black dark:text-white">
              Code
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Discount
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Status
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Usage
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Valid Until
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Tiers
            </TableHead>
            <TableHead className="font-excon text-right font-black text-black dark:text-white">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {couponsData.coupons.map((coupon) => {
            const isExpired = coupon.validUntil
              ? new Date(coupon.validUntil) < new Date()
              : false;
            const isActive = coupon.isActive && !isExpired;

            return (
              <tr
                key={coupon.id}
                className="border-b border-black/20 hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-zinc-700"
              >
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="font-excon text-lg font-black text-black dark:text-white">
                      {coupon.code}
                    </div>
                    {coupon.description && (
                      <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                        {coupon.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="font-excon text-lg font-black text-black dark:text-white">
                      {coupon.discountType === DiscountType.PERCENTAGE
                        ? `${coupon.value}%`
                        : `₹${coupon.value}`}
                    </div>
                    {coupon.maxDiscount && (
                      <div className="font-satoshi text-xs text-black/70 dark:text-white/70">
                        Max: ₹{coupon.maxDiscount}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <Badge className="border-2 border-red-300 bg-red-100 text-red-800 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300">
                      Expired
                    </Badge>
                  ) : isActive ? (
                    <Badge className="border-2 border-green-300 bg-green-100 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="border-2 border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-900/20 dark:text-gray-300">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-satoshi font-bold text-black dark:text-white">
                    {coupon.currentUses}
                    {coupon.maxUses && (
                      <span className="text-black/70 dark:text-white/70">
                        {" "}
                        / {coupon.maxUses}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                    {coupon.validUntil
                      ? new Date(coupon.validUntil).toLocaleDateString()
                      : "No expiry"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {coupon.applicableTiers.slice(0, 2).map((tier) => (
                      <Badge
                        key={tier}
                        className="border border-black/20 bg-zinc-100 text-xs font-bold text-black dark:border-white/20 dark:bg-zinc-700 dark:text-white"
                      >
                        {tier.replace("TIER_", "T")}
                      </Badge>
                    ))}
                    {coupon.applicableTiers.length > 2 && (
                      <Badge className="border border-black/20 bg-zinc-100 text-xs font-bold text-black dark:border-white/20 dark:bg-zinc-700 dark:text-white">
                        +{coupon.applicableTiers.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewUsage(coupon.id)}
                      className="font-satoshi h-8 w-8 rounded-lg border-2 border-black bg-white p-0 shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      <EyeIcon className="h-3 w-3 text-black dark:text-white" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(coupon.id)}
                      disabled={isExpired}
                      className="font-satoshi h-8 w-8 rounded-lg border-2 border-black bg-white p-0 shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      {isActive ? (
                        <ToggleRightIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeftIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCoupon(coupon.id)}
                      className="font-satoshi h-8 w-8 rounded-lg border-2 border-black bg-white p-0 shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      <PencilSimpleLineIcon className="h-4 w-4 text-black dark:text-white" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteCoupon(coupon.id)}
                      className="font-satoshi h-8 w-8 rounded-lg border-2 border-red-500 bg-white p-0 shadow-[2px_2px_0px_0px_#ef4444] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-red-400 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#ef4444]"
                    >
                      <TrashIcon
                        type="duotone"
                        className="h-3 w-3 text-red-500 dark:text-red-400"
                      />
                    </Button>
                  </div>
                </TableCell>
              </tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
