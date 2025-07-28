"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { PremiumTier } from "@prisma/client";
import { getAllTierConfigs, TierDetails } from "@/dal/premium/types";

interface TierBenefitsProps {
  tier: TierDetails;
}

function TierBenefits({ tier }: TierBenefitsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-excon text-lg font-bold">What&apos;s included:</h3>
      <div className="space-y-2">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircleIcon className="text-foreground h-4 w-4" />
            <span className="font-satoshi text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PremiumTierSelectionProps {
  selectedTier: PremiumTier;
  onTierChange: (tier: PremiumTier) => void;
}

export function PremiumTierSelection({
  selectedTier,
  onTierChange,
}: PremiumTierSelectionProps) {
  const tierConfigs = getAllTierConfigs();
  const selectedTierConfig = tierConfigs.find((t) => t.tier === selectedTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon text-xl font-black text-black dark:text-white">
            Select Your Plan
          </CardTitle>
          <CardDescription className="font-satoshi font-bold text-black dark:text-white">
            Choose the plan that best fits your study needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Select
              value={selectedTier}
              onValueChange={(value) => onTierChange(value as PremiumTier)}
            >
              <SelectTrigger 
                className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]"
                data-umami-event="premium-tier-selector-click"
              >
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                {tierConfigs.map((tier) => (
                  <SelectItem
                    key={tier.tier}
                    value={tier.tier}
                    className="font-satoshi font-bold text-black dark:text-white"
                    data-umami-event={`premium-tier-select-${tier.tier.toLowerCase()}`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>{tier.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTierConfig && (
              <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                <TierBenefits tier={selectedTierConfig} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
