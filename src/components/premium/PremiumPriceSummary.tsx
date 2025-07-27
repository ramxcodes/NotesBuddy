"use client";

import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LightningIcon } from "@phosphor-icons/react";
import { PriceCalculation } from "@/dal/premium/types";

interface PremiumPriceSummaryProps {
  priceCalculation: PriceCalculation | null;
}

export function PremiumPriceSummary({
  priceCalculation,
}: PremiumPriceSummaryProps) {
  return (
    <AnimatePresence>
      {priceCalculation && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <LightningIcon className="h-5 w-5 text-black dark:text-white" />
                <span className="font-excon text-xl font-black text-black dark:text-white">
                  Price Summary
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="font-satoshi font-bold text-black dark:text-white">
                    Original Price:
                  </span>
                  <span className="font-excon font-black text-black dark:text-white">
                    ₹{priceCalculation.originalAmount}
                  </span>
                </div>

                {priceCalculation.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-satoshi font-bold text-black dark:text-white">
                      {discount.description}:
                    </span>
                    <span className="font-excon font-black text-black dark:text-white">
                      -₹{discount.amount}
                    </span>
                  </div>
                ))}

                <Separator className="border-2 border-black dark:border-white/20" />

                <div className="flex justify-between text-2xl font-bold">
                  <span className="font-excon font-black text-black dark:text-white">
                    Total:
                  </span>
                  <span className="font-excon font-black text-black dark:text-white">
                    ₹{priceCalculation.finalAmount}
                  </span>
                </div>

                {priceCalculation.totalDiscount > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-satoshi text-center font-bold text-black dark:text-white"
                  >
                    🎉 You save ₹{priceCalculation.totalDiscount}!
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
