import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UserPremiumStatus } from "@/dal/premium/types";
import ShieldCheckIcon from "../icons/ShieldCheckIcon";
import StarIcon from "../icons/StarIcon";
import CalendarIcon from "../icons/CalendarIcon";

interface PremiumPurchasedUserDisplayMessageProps {
  premiumStatus: UserPremiumStatus;
}

export function PremiumPurchasedUserDisplayMessage({
  premiumStatus,
}: PremiumPurchasedUserDisplayMessageProps) {
  if (!premiumStatus.isActive) return null;

  return (
    <Card className="mx-auto mb-8 max-w-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-black dark:text-white" />
          <span className="font-excon text-xl font-black text-black dark:text-white">
            Premium Active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <StarIcon className="h-4 w-4 text-black dark:text-white" />
          <span className="font-satoshi font-bold text-black dark:text-white">
            Your {premiumStatus.tier?.replace("_", " ")} is active with{" "}
            <span className="font-black">
              {premiumStatus.daysRemaining} days
            </span>{" "}
            remaining
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-black dark:text-white" />
          <span className="font-satoshi text-sm text-black dark:text-white">
            Expires on:{" "}
            {premiumStatus.expiryDate &&
              new Date(premiumStatus.expiryDate).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
