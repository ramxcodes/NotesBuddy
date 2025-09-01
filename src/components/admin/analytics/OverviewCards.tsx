"use client";

import { useEffect, useState } from "react";
import { Eye, Users, MousePointer, Clock } from "lucide-react";
import {
  TimeRange,
  CustomDateRange,
  DetailedUmamiStatistics,
} from "@/types/umami";
import { getDetailedUmamiAnalyticsAction } from "../actions/detailed-umami-analytics";
import { telegramLogger } from "@/utils/telegram-logger";

interface OverviewCardsProps {
  timeRange: TimeRange;
  customRange?: CustomDateRange;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isDuration?: boolean;
  isPercentage?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  isDuration = false,
  isPercentage = false,
}: StatCardProps) {
  const formatValue = (val: number) => {
    if (isDuration) {
      if (val < 60) {
        return `${val}s`;
      } else if (val < 3600) {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
      } else {
        const hours = Math.floor(val / 3600);
        const minutes = Math.floor((val % 3600) / 60);
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
    }
    if (isPercentage) {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="flex h-50 w-full flex-col justify-between rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="flex items-center justify-between">
        <div className="rounded-lg border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
          {icon}
        </div>
      </div>
      <div className="mt-2 space-y-2">
        <h3 className="text-lg font-bold text-black dark:text-white">
          {title}
        </h3>
        <div className="text-3xl font-black text-black dark:text-white">
          {formatValue(value)}
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent"></div>
      <p className="mt-2 text-sm text-black dark:text-white">Loading...</p>
    </div>
  );
}

export function OverviewCards({ timeRange, customRange }: OverviewCardsProps) {
  const [analytics, setAnalytics] = useState<DetailedUmamiStatistics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await getDetailedUmamiAnalyticsAction(
          timeRange,
          customRange,
        );
        setAnalytics(data);
      } catch (error) {
        await telegramLogger("Error fetching analytics:", error);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, customRange]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <LoadingCard key={i} />
          ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
        <p className="text-center text-black dark:text-white">
          Unable to load analytics data. Please check your configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Pageviews"
        value={analytics.totalPageviews}
        icon={<Eye className="h-6 w-6 text-black dark:text-white" />}
      />
      <StatCard
        title="Unique Visitors"
        value={analytics.uniqueVisitors}
        icon={<Users className="h-6 w-6 text-black dark:text-white" />}
      />
      <StatCard
        title="Total Sessions"
        value={analytics.totalSessions}
        icon={<MousePointer className="h-6 w-6 text-black dark:text-white" />}
      />
      <StatCard
        title="Avg. Visit Time"
        value={analytics.averageVisitTime}
        icon={<Clock className="h-6 w-6 text-black dark:text-white" />}
        isDuration={true}
      />
    </div>
  );
}
