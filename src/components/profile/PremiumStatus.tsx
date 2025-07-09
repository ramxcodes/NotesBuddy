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
import Link from "next/link";

interface PremiumStatusProps {
  premiumStatus: UserPremiumStatus;
}

export function PremiumStatus({ premiumStatus }: PremiumStatusProps) {
  if (!premiumStatus.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
            <StarIcon
              type="duotone"
              className="text-muted-foreground h-6 w-6"
            />
            Premium Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="border-muted-foreground/20 rounded-lg border-2 border-dashed p-8">
              <StarIcon
                type="duotone"
                className="text-muted-foreground mx-auto mb-4 h-12 w-12"
              />
              <h3 className="font-excon mb-2 text-lg font-semibold">
                No Active Premium
              </h3>
              <p className="text-muted-foreground font-satoshi mb-4">
                Upgrade to premium to unlock all features and get access to
                exclusive content.
              </p>
              <Link href="/premium">
                <Button className="gap-2">
                  <CrownIcon type="duotone" className="h-4 w-4" />
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
        return <StarIcon type="duotone" className="h-5 w-5" />;
      case "TIER_2":
        return <LightningIcon type="duotone" className="h-5 w-5" />;
      case "TIER_3":
        return <CrownIcon type="duotone" className="h-5 w-5" />;
      default:
        return <StarIcon type="duotone" className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "TIER_1":
        return "bg-blue-500";
      case "TIER_2":
        return "bg-purple-500";
      case "TIER_3":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
          <div
            className={`rounded-lg p-2 ${getTierColor(premiumStatus.tier!)}`}
          >
            {getTierIcon(premiumStatus.tier!)}
          </div>
          Premium Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Premium Info */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-excon text-lg font-semibold text-green-800 dark:text-green-200">
                {tierConfig.title}
              </h3>
              <p className="font-satoshi text-green-600 dark:text-green-400">
                {tierConfig.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Active
            </Badge>
          </div>

          {/* Time Remaining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 font-medium">
                <CalendarIcon type="duotone" className="h-4 w-4" />
                Days Remaining
              </span>
              <span className="font-semibold">
                {daysRemaining} of {totalDays} days
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-muted-foreground text-center text-xs">
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
          <h4 className="font-excon mb-3 text-lg font-semibold">
            Your Premium Features
          </h4>
          <div className="grid gap-2">
            {tierConfig.features.map((feature, index) => (
              <div
                key={index}
                className="font-satoshi flex items-center gap-2 text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Option */}
        {premiumStatus.tier !== "TIER_3" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <h4 className="font-excon mb-2 font-semibold">
              Want More Features?
            </h4>
            <p className="text-muted-foreground font-satoshi mb-3 text-sm">
              Upgrade to get access to even more premium features and content.
            </p>
            <Link href="/premium">
              <Button variant="outline" size="sm" className="gap-2">
                <CrownIcon type="duotone" className="h-4 w-4" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
