"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { PremiumTier } from "@prisma/client";
import {
  getUpgradeOptions,
  getTierConfig,
  calculateUpgradePrice,
  type UpgradeContext,
} from "@/dal/premium/types";
import {
  getDisplayNameFromPrismaValue,
  getTierDisplayName,
} from "@/utils/academic-config";

interface PremiumUpgradeProps {
  upgradeContext: UpgradeContext;
  onUpgradeSelect: (tier: PremiumTier) => void;
  selectedUpgradeTier?: PremiumTier;
  isLoading?: boolean;
}

export function PremiumUpgrade({
  upgradeContext,
  onUpgradeSelect,
  selectedUpgradeTier,
  isLoading = false,
}: PremiumUpgradeProps) {
  const currentTierConfig = getTierConfig(upgradeContext.currentTier);
  const upgradeOptions = getUpgradeOptions(upgradeContext.currentTier);

  if (upgradeOptions.length === 0) {
    // User is on highest tier
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
            <TrophyIcon weight="duotone" className="h-6 w-6 text-yellow-500" />
            You&apos;re on the highest tier!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-black bg-white p-6 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            <p className="font-satoshi font-bold text-black dark:text-white">
              You&apos;re already enjoying all the premium features with{" "}
              {currentTierConfig.title}. Keep up the great studying!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true }}
      className="flex justify-center"
    >
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
            <ArrowUpIcon weight="duotone" className="h-6 w-6 text-green-500" />
            Upgrade Your Plan
          </CardTitle>
          <div className="flex flex-col gap-2">
            <Badge className="w-fit border-2 border-black bg-white font-bold text-black shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[1px_1px_0px_0px_#757373]">
              Current: {currentTierConfig.title} -{" "}
              {getTierDisplayName(currentTierConfig.tier)}
            </Badge>
            <p className="font-satoshi font-bold text-black dark:text-white">
              Get more features and extend your access within the same academic
              program
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan Summary */}
          <div className="rounded-md border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            <h3 className="font-excon mb-2 font-black text-black dark:text-white">
              Current Plan Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Plan
                </p>
                <p className="font-satoshi font-black text-black dark:text-white">
                  {currentTierConfig.title} -{" "}
                  {getTierDisplayName(currentTierConfig.tier)}
                </p>
              </div>
              <div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Days Remaining
                </p>
                <p className="font-satoshi font-black text-black dark:text-white">
                  {upgradeContext.daysRemaining} days
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-4">
            <h3 className="font-excon text-lg font-black text-black dark:text-white">
              Available Upgrades
            </h3>

            <Select
              value={selectedUpgradeTier || ""}
              onValueChange={(value) => onUpgradeSelect(value as PremiumTier)}
              disabled={isLoading}
            >
              <SelectTrigger
                className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]"
                data-umami-event="premium-upgrade-tier-selector-click"
              >
                <SelectValue placeholder="Select upgrade plan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                {upgradeOptions.map((option) => {
                  const upgradePrice = calculateUpgradePrice(
                    upgradeContext.currentTier,
                    option.tier,
                    upgradeContext.daysRemaining,
                  );

                  return (
                    <SelectItem
                      key={option.tier}
                      value={option.tier}
                      className="font-satoshi font-bold text-black dark:text-white"
                      data-umami-event={`premium-upgrade-tier-select-${option.tier.toLowerCase()}`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarIcon
                            weight="duotone"
                            className="h-4 w-4 text-yellow-500"
                          />
                          <span>
                            {option.title} - {getTierDisplayName(option.tier)}
                          </span>
                        </div>
                        <Badge className="ml-2 border-2 border-green-500 bg-green-50 font-bold text-green-800 shadow-[1px_1px_0px_0px_#22c55e] dark:border-green-400 dark:bg-green-900/20 dark:text-green-300 dark:shadow-[1px_1px_0px_0px_#4ade80]">
                          ₹{upgradePrice}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Selected Upgrade Details */}
            {selectedUpgradeTier && (
              <div className="rounded-md border-2 border-green-500 bg-green-50 p-4 shadow-[2px_2px_0px_0px_#22c55e] dark:border-green-400 dark:bg-green-900/20 dark:shadow-[2px_2px_0px_0px_#4ade80]">
                {(() => {
                  const selectedConfig = getTierConfig(selectedUpgradeTier);
                  const upgradePrice = calculateUpgradePrice(
                    upgradeContext.currentTier,
                    selectedUpgradeTier,
                    upgradeContext.daysRemaining,
                  );
                  const originalPrice = selectedConfig.price;
                  const creditApplied = originalPrice - upgradePrice;

                  return (
                    <>
                      <h4 className="font-excon mb-3 font-black text-green-800 dark:text-green-300">
                        {selectedConfig.title} - Upgrade Details
                      </h4>

                      {/* Price Breakdown */}
                      <div className="mb-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-satoshi font-bold text-green-800 dark:text-green-300">
                            {selectedConfig.title} (Full Price)
                          </span>
                          <span className="font-satoshi font-black text-green-800 line-through dark:text-green-300">
                            ₹{originalPrice}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-satoshi font-bold text-green-800 dark:text-green-300">
                            Credit from current plan
                          </span>
                          <span className="font-satoshi font-black text-green-800 dark:text-green-300">
                            -₹{creditApplied}
                          </span>
                        </div>
                        <div className="border-t border-green-600 pt-2">
                          <div className="flex justify-between">
                            <span className="font-satoshi font-black text-green-800 dark:text-green-300">
                              Upgrade Price
                            </span>
                            <span className="font-satoshi font-black text-green-800 dark:text-green-300">
                              ₹{upgradePrice}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <h5 className="font-excon font-black text-green-800 dark:text-green-300">
                          Additional Features:
                        </h5>
                        {selectedConfig.features
                          .filter(
                            (feature) =>
                              !currentTierConfig.features.includes(feature),
                          )
                          .map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="font-satoshi text-sm font-bold text-green-800 dark:text-green-300">
                                {feature}
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Academic Context Notice */}
          <div className="rounded-md border-2 border-blue-500 bg-blue-50 p-4 shadow-[2px_2px_0px_0px_#3b82f6] dark:border-blue-400 dark:bg-blue-900/20 dark:shadow-[2px_2px_0px_0px_#60a5fa]">
            <p className="font-satoshi text-sm font-bold text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Upgrades are only available within the same
              academic program ({" "}
              {getDisplayNameFromPrismaValue(
                "university",
                upgradeContext.university,
              )}
              , {getDisplayNameFromPrismaValue("degree", upgradeContext.degree)}
              , {getDisplayNameFromPrismaValue("year", upgradeContext.year)},{" "}
              {getDisplayNameFromPrismaValue(
                "semester",
                upgradeContext.semester,
              )}
              ). <br /> Your upgraded plan will maintain the same expiry date.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
