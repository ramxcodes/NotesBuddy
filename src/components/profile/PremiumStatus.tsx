import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  StarIcon,
  CrownIcon,
  CalendarIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import { UserPremiumStatus, getTierConfig } from "@/dal/premium/types";
import { Link } from "next-view-transitions";
import { getTierDisplayName } from "@/utils/academic-config";

interface PremiumStatusProps {
  premiumStatus: UserPremiumStatus;
}

export function PremiumStatus({ premiumStatus }: PremiumStatusProps) {
  if (!premiumStatus.isActive) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
            <StarIcon
              weight="duotone"
              className="h-6 w-6 text-black dark:text-white"
            />
            Premium Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="rounded-md border-2 border-black bg-white p-8 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <StarIcon
                weight="duotone"
                className="mx-auto mb-4 h-12 w-12 text-black dark:text-white"
              />
              <h3 className="font-excon mb-2 text-lg font-black text-black dark:text-white">
                No Active Premium
              </h3>
              <p className="font-satoshi mb-4 font-bold text-black dark:text-white">
                Upgrade to premium to unlock all features and get access to
                exclusive content.
              </p>
              <Link href="/premium">
                <Button className="gap-2 border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]">
                  <CrownIcon weight="duotone" className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = getTierConfig(premiumStatus.tier!);
  const daysRemaining = premiumStatus.daysRemaining || 0;
  const totalDays = tierConfig.duration;
  const daysUsed = totalDays - daysRemaining;
  const progressPercentage = (daysUsed / totalDays) * 100;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "TIER_1":
        return <StarIcon weight="duotone" className="h-5 w-5" />;
      case "TIER_2":
        return <LightningIcon weight="duotone" className="h-5 w-5" />;
      case "TIER_3":
        return <CrownIcon weight="duotone" className="h-5 w-5" />;
      default:
        return <StarIcon weight="duotone" className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <CardHeader>
        <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
          <div className="rounded-md border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            {getTierIcon(premiumStatus.tier!)}
          </div>
          Premium Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Premium Info */}
        <div className="rounded-md border-2 border-black bg-white p-6 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-excon text-lg font-black text-black dark:text-white">
                {tierConfig.title} | {getTierDisplayName(tierConfig.tier)}
              </h3>
              <p className="font-satoshi font-bold text-black dark:text-white">
                {tierConfig.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            >
              Active
            </Badge>
          </div>

          {/* Time Remaining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 font-black text-black dark:text-white">
                <CalendarIcon weight="duotone" className="h-4 w-4" />
                Days Remaining
              </span>
              <span className="font-black text-black dark:text-white">
                {daysRemaining} of {totalDays} days
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
            />
            <p className="text-center text-xs font-bold text-black dark:text-white">
              Expires on{" "}
              {premiumStatus.expiryDate &&
                new Date(premiumStatus.expiryDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-excon mb-3 text-lg font-black text-black dark:text-white">
            Your Premium Features
          </h4>
          <div className="grid gap-2">
            {tierConfig.features.map((feature, index) => (
              <div
                key={index}
                className="font-satoshi flex items-center gap-2 text-sm font-bold text-black dark:text-white"
              >
                <div className="h-3 w-3 rounded-full border-2 border-black bg-black dark:border-white/20 dark:bg-white" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
