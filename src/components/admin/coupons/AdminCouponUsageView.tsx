"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { getCouponDetailsAction } from "../actions/admin-coupons";
import { type CouponDetailsResponse } from "@/dal/coupon/types";
import { DiscountType, PremiumTier } from "@prisma/client";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CircleNotchIcon,
  GiftIcon,
  TargetIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import {
  DollarSignIcon,
  MailIcon,
  PercentIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";

interface AdminCouponUsageViewProps {
  couponId: string;
  onClose: () => void;
}

export function AdminCouponUsageView({
  couponId,
  onClose,
}: AdminCouponUsageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponData, setCouponData] = useState<CouponDetailsResponse | null>(
    null,
  );

  const fetchCouponDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getCouponDetailsAction(couponId);
      if (result) {
        setCouponData(result);
      } else {
        setError("Failed to fetch coupon details");
      }
    } catch {
      setError("Failed to fetch coupon details");
    } finally {
      setLoading(false);
    }
  }, [couponId]);

  useEffect(() => {
    if (couponId) {
      fetchCouponDetails();
    }
  }, [couponId, fetchCouponDetails]);

  const getDiscountDisplay = () => {
    if (!couponData) return "";
    if (couponData.discountType === DiscountType.PERCENTAGE) {
      return `${couponData.value}%`;
    }
    return `₹${couponData.value}`;
  };

  const getTierBadgeColor = (tier: PremiumTier) => {
    switch (tier) {
      case "TIER_1":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600";
      case "TIER_2":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-600";
      case "TIER_3":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusBadge = () => {
    if (!couponData) return null;

    const isExpired = couponData.validUntil
      ? new Date(couponData.validUntil) < new Date()
      : false;
    const isActive = couponData.isActive && !isExpired;

    if (isExpired) {
      return (
        <Badge className="border-2 border-red-300 bg-red-100 text-red-800 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300">
          Expired
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge className="border-2 border-green-300 bg-green-100 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="border-2 border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-900/20 dark:text-gray-300">
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <CircleNotchIcon className="h-6 w-6 animate-spin text-black dark:text-white" />
            <span className="font-satoshi font-bold text-black dark:text-white">
              Loading coupon details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !couponData) {
    return (
      <div className="w-full space-y-6">
        <div className="py-8 text-center">
          <p className="font-satoshi font-bold text-red-600 dark:text-red-400">
            {error || "Failed to load coupon details"}
          </p>
          <Button onClick={onClose} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="font-satoshi flex items-center gap-2 rounded-md border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Coupons
          </Button>
          <div>
            <h2 className="font-excon flex items-center gap-3 text-2xl font-black text-black dark:text-white">
              <GiftIcon className="h-6 w-6" />
              {couponData.code} Usage Details
            </h2>
            <p className="font-satoshi text-lg font-bold text-black/70 dark:text-white/70">
              Complete overview and usage statistics
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Coupon Overview */}
      <div className="rounded-md border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Discount Value */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-zinc-50 p-4 dark:border-white/20 dark:bg-zinc-700">
            {couponData.discountType === DiscountType.PERCENTAGE ? (
              <PercentIcon className="h-6 w-6 text-green-600" />
            ) : (
              <DollarSignIcon className="h-6 w-6 text-blue-600" />
            )}
            <div>
              <div className="font-excon text-2xl font-black text-black dark:text-white">
                {getDiscountDisplay()}
              </div>
              <div className="font-satoshi text-xs font-bold text-black/70 dark:text-white/70">
                {couponData.discountType === DiscountType.PERCENTAGE
                  ? "Percentage"
                  : "Fixed Amount"}
              </div>
            </div>
          </div>

          {/* Total Usage */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-blue-50 p-4 dark:border-white/20 dark:bg-blue-900/20">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-excon text-2xl font-black text-blue-600">
                {couponData.usageStats.totalUsage}
              </div>
              <div className="font-satoshi text-xs font-bold text-blue-600/70">
                Total Uses
              </div>
            </div>
          </div>

          {/* Total Discount Given */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-orange-50 p-4 dark:border-white/20 dark:bg-orange-900/20">
            <TrendingUpIcon className="h-6 w-6 text-orange-600" />
            <div>
              <div className="font-excon text-xl font-black text-orange-600">
                ₹{couponData.usageStats.totalDiscountGiven.toLocaleString()}
              </div>
              <div className="font-satoshi text-xs font-bold text-orange-600/70">
                Total Saved
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-purple-50 p-4 dark:border-white/20 dark:bg-purple-900/20">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
            <div>
              <div className="font-excon text-sm font-black text-purple-600">
                {couponData.validUntil
                  ? new Date(couponData.validUntil).toLocaleDateString()
                  : "No Expiry"}
              </div>
              <div className="font-satoshi text-xs font-bold text-purple-600/70">
                Valid Until
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-excon text-lg font-black text-black dark:text-white">
              Coupon Details
            </h3>
            <div className="space-y-2">
              {couponData.description && (
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  {couponData.description}
                </div>
              )}
              {couponData.maxDiscount && (
                <div className="flex items-center gap-2">
                  <TargetIcon className="h-4 w-4 text-black dark:text-white" />
                  <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                    Max Discount: ₹{couponData.maxDiscount}
                  </span>
                </div>
              )}
              {couponData.minOrderAmount && (
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4 text-black dark:text-white" />
                  <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                    Min Order: ₹{couponData.minOrderAmount}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-black dark:text-white" />
                <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                  Max uses per user: {couponData.maxUsesPerUser || "Unlimited"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-excon text-lg font-black text-black dark:text-white">
              Applicable Tiers
            </h3>
            <div className="flex flex-wrap gap-2">
              {couponData.applicableTiers.map((tier) => (
                <Badge
                  key={tier}
                  className={`font-satoshi border-2 text-xs font-bold ${getTierBadgeColor(tier)}`}
                >
                  {tier.replace("TIER_", "Tier ")}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Who Used This Coupon */}
      {couponData.usageStats.recentUsages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-excon text-xl font-black text-black dark:text-white">
            Users Who Used This Coupon
          </h3>
          <div className="rounded-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-zinc-700">
                  <TableHead className="font-excon font-black text-black dark:text-white">
                    User
                  </TableHead>
                  <TableHead className="font-excon font-black text-black dark:text-white">
                    Email
                  </TableHead>
                  <TableHead className="font-excon font-black text-black dark:text-white">
                    Discount Received
                  </TableHead>
                  <TableHead className="font-excon font-black text-black dark:text-white">
                    Used On
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponData.usageStats.recentUsages.map((usage) => (
                  <tr
                    key={`${usage.userId}-${usage.usedAt}`}
                    className="dark:border-white/20/20 border-b border-black/20 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-zinc-100 dark:border-white/20 dark:bg-zinc-700">
                          <UserIcon className="h-4 w-4 text-black dark:text-white" />
                        </div>
                        <div className="font-satoshi font-bold text-black dark:text-white">
                          {usage.userName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-black/50 dark:text-white/50" />
                        <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                          {usage.userEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-excon text-lg font-black text-green-600">
                        ₹{usage.discountAmount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                        {new Date(usage.usedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* No Usage */}
      {couponData.usageStats.recentUsages.length === 0 && (
        <div className="rounded-md border-2 border-black bg-zinc-100 p-8 text-center shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <div className="font-excon text-xl font-black text-black dark:text-white">
            No usage yet
          </div>
          <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
            This coupon hasn&apos;t been used by any users yet
          </p>
        </div>
      )}
    </div>
  );
}
