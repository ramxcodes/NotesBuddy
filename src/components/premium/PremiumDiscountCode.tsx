"use client";

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
import { GiftIcon, SpinnerIcon } from "@phosphor-icons/react";

interface PremiumDiscountCodeProps {
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyCode: () => void;
  isCalculating: boolean;
}

export function PremiumDiscountCode({
  discountCode,
  onDiscountCodeChange,
  onApplyCode,
  isCalculating,
}: PremiumDiscountCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <GiftIcon className="h-5 w-5 text-black dark:text-white" />
            <span className="font-excon text-xl font-black text-black dark:text-white">
              Discount Code
            </span>
          </CardTitle>
          <CardDescription className="font-satoshi font-bold text-black dark:text-white">
            Have a discount or referral code? Enter it below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter code (e.g., STUDENT10, FRIEND123)"
              value={discountCode}
              onChange={(e) =>
                onDiscountCodeChange(e.target.value.toUpperCase())
              }
              className="font-satoshi flex-1 rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            />
            <Button
              variant="outline"
              onClick={onApplyCode}
              disabled={isCalculating}
              className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            >
              {isCalculating ? (
                <SpinnerIcon className="h-4 w-4 animate-spin text-black dark:text-white" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
