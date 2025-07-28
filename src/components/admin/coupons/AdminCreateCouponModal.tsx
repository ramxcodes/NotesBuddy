"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { createCouponAction } from "../actions/admin-coupons";
import { type CreateCouponInput } from "@/dal/coupon/types";
import { DiscountType, PremiumTier } from "@prisma/client";
import { GiftIcon } from "@phosphor-icons/react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { CalendarIcon } from "@phosphor-icons/react";

interface AdminCreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCreateCouponModal({
  isOpen,
  onClose,
}: AdminCreateCouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<CreateCouponInput>>({
    code: "",
    description: "",
    discountType: DiscountType.PERCENTAGE,
    value: 0,
    maxDiscount: undefined,
    minOrderAmount: undefined,
    validFrom: new Date(),
    validUntil: undefined,
    maxUses: undefined,
    maxUsesPerUser: 1,
    applicableTiers: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createCouponAction(formData as CreateCouponInput);

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to create coupon");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (tier: PremiumTier, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      applicableTiers: checked
        ? [...(prev.applicableTiers || []), tier]
        : (prev.applicableTiers || []).filter((t) => t !== tier),
    }));
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (
    field: "validFrom" | "validUntil",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ? new Date(value) : undefined,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-xl border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[8px_8px_0px_0px_#757373]">
        <DialogHeader>
          <DialogTitle className="font-excon flex items-center gap-3 text-2xl font-black text-black dark:text-white">
            <GiftIcon weight="duotone" className="h-6 w-6" />
            Create New Coupon
          </DialogTitle>
          <DialogDescription className="font-satoshi font-bold text-black/70 dark:text-white/70">
            Create a new discount coupon for premium subscriptions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-3 dark:bg-red-900/20">
              <p className="font-satoshi text-sm font-bold text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Coupon Code */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Coupon Code *
              </Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., STUDENT10, SAVE25"
                className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                required
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Discount Type *
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: DiscountType) =>
                  setFormData((prev) => ({ ...prev, discountType: value }))
                }
              >
                <SelectTrigger className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    Percentage
                  </SelectItem>
                  <SelectItem value={DiscountType.FIXED_AMOUNT}>
                    Fixed Amount
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Discount Value */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Discount Value *
                {formData.discountType === DiscountType.PERCENTAGE
                  ? " (%)"
                  : " (₹)"}
              </Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
                placeholder={
                  formData.discountType === DiscountType.PERCENTAGE
                    ? "10"
                    : "100"
                }
                min="0"
                max={
                  formData.discountType === DiscountType.PERCENTAGE
                    ? "100"
                    : undefined
                }
                className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                required
              />
            </div>

            {/* Max Discount (for percentage) */}
            {formData.discountType === DiscountType.PERCENTAGE && (
              <div className="space-y-2">
                <Label className="font-satoshi font-bold text-black dark:text-white">
                  Max Discount (₹)
                </Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxDiscount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="500"
                  min="0"
                  className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                />
              </div>
            )}

            {/* Min Order Amount */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Minimum Order Amount (₹)
              </Label>
              <Input
                type="number"
                value={formData.minOrderAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minOrderAmount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="100"
                min="0"
                className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the coupon offer..."
              className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Valid From */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Valid From *
              </Label>
              <div className="relative">
                <CalendarIcon
                  weight="duotone"
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/50"
                />
                <Input
                  type="date"
                  value={formatDateForInput(formData.validFrom)}
                  onChange={(e) =>
                    handleDateChange("validFrom", e.target.value)
                  }
                  className="font-satoshi rounded-xl border-2 border-black bg-white pl-10 font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                  required
                />
              </div>
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Valid Until
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/50" />
                <Input
                  type="date"
                  value={formatDateForInput(formData.validUntil)}
                  onChange={(e) =>
                    handleDateChange("validUntil", e.target.value)
                  }
                  className="font-satoshi rounded-xl border-2 border-black bg-white pl-10 font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Max Uses */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Max Total Uses
              </Label>
              <Input
                type="number"
                value={formData.maxUses || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxUses: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="100"
                min="1"
                className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
              />
            </div>

            {/* Max Uses Per User */}
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Max Uses Per User *
              </Label>
              <Input
                type="number"
                value={formData.maxUsesPerUser}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxUsesPerUser: Number(e.target.value),
                  }))
                }
                placeholder="1"
                min="1"
                max="10"
                className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                required
              />
            </div>
          </div>

          {/* Applicable Tiers */}
          <div className="space-y-3">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Applicable Tiers *
            </Label>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.values(PremiumTier).map((tier) => (
                <div key={tier} className="flex items-center space-x-2">
                  <Checkbox
                    id={tier}
                    checked={formData.applicableTiers?.includes(tier) || false}
                    onCheckedChange={(checked) =>
                      handleTierChange(tier, checked as boolean)
                    }
                    className="border-2 border-black data-[state=checked]:border-black data-[state=checked]:bg-black dark:border-white/20 dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-white"
                  />
                  <Label
                    htmlFor={tier}
                    className="font-satoshi font-bold text-black dark:text-white"
                  >
                    {tier.replace("TIER_", "Tier ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-satoshi flex-1 rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
              data-umami-event="admin-create-coupon-cancel-click"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.applicableTiers?.length}
              className="font-excon flex-1 rounded-xl border-2 border-black bg-black font-black text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
              data-umami-event="admin-create-coupon-submit-click"
            >
              {loading ? (
                <>
                  <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
