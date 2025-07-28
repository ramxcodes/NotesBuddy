"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckIcon,
  CurrencyCircleDollarIcon,
  GiftIcon,
  PercentIcon,
  SpinnerIcon,
  XIcon,
} from "@phosphor-icons/react";
import { TagIcon } from "@phosphor-icons/react";

interface PremiumDiscountCodeProps {
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyCode: () => void;
  isCalculating: boolean;
  validationMessage?: string;
  isValidCode?: boolean;
  appliedDiscount?: {
    type: string;
    code: string;
    amount: number;
    description: string;
  } | null;
}

export function PremiumDiscountCode({
  discountCode,
  onDiscountCodeChange,
  onApplyCode,
  isCalculating,
  validationMessage,
  isValidCode,
  appliedDiscount,
}: PremiumDiscountCodeProps) {
  const getValidationIcon = () => {
    if (isCalculating) {
      return (
        <SpinnerIcon className="h-4 w-4 animate-spin text-black dark:text-white" />
      );
    }

    if (validationMessage && !isValidCode) {
      return (
        <XIcon
          weight="duotone"
          className="h-4 w-4 text-black dark:text-white"
        />
      );
    }

    if (isValidCode && appliedDiscount) {
      return (
        <CheckIcon
          weight="duotone"
          className="h-4 w-4 text-black dark:text-white"
        />
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <GiftIcon className="h-5 w-5 text-black dark:text-white" />
            <span className="font-excon text-xl font-black text-black dark:text-white">
              Discount Code
            </span>
          </CardTitle>
          <CardDescription className="font-satoshi font-bold text-black dark:text-white">
            Have a discount or referral code? Enter it below to save money!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Enter code (e.g., STUDENT10, SAVE25)"
                value={discountCode}
                onChange={(e) =>
                  onDiscountCodeChange(e.target.value.toUpperCase())
                }
                className="font-satoshi rounded-xl border-2 border-black bg-white pr-10 font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                data-umami-event="premium-discount-code-input-change"
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                {getValidationIcon()}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onApplyCode}
              disabled={isCalculating}
              className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
              data-umami-event={`premium-discount-code-apply-${discountCode ? 'with-code' : 'empty'}`}
            >
              {isCalculating ? (
                <SpinnerIcon className="h-4 w-4 animate-spin text-black dark:text-white" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="font-satoshi text-sm font-bold text-black dark:text-white"
            >
              {validationMessage}
            </motion.div>
          )}

          {/* Applied Discount Details */}
          {isValidCode && appliedDiscount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border-2 border-black bg-white p-3 dark:border-white/20 dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-center gap-2">
                <TagIcon
                  weight="duotone"
                  className="h-4 w-4 text-black dark:text-white"
                />
                <span className="font-excon text-sm font-black text-black dark:text-white">
                  {appliedDiscount.code}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {appliedDiscount.type === "PERCENTAGE" ? (
                  <PercentIcon
                    weight="duotone"
                    className="h-4 w-4 text-black dark:text-white"
                  />
                ) : (
                  <CurrencyCircleDollarIcon
                    weight="duotone"
                    className="h-4 w-4 text-black dark:text-white"
                  />
                )}
                <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                  ₹{appliedDiscount.amount} discount applied
                </span>
              </div>

              <p className="font-satoshi mt-1 text-xs text-black/70 dark:text-white/70">
                {appliedDiscount.description}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
