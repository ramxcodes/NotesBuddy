"use client";

import { useEffect, useState } from "react";
import { ExternalLink, TrendingUp } from "lucide-react";
import {
  TimeRange,
  CustomDateRange,
  DetailedUmamiStatistics,
} from "@/types/umami";
import { getDetailedUmamiAnalyticsAction } from "../actions/detailed-umami-analytics";

interface TopContentSectionProps {
  timeRange: TimeRange;
  customRange?: CustomDateRange;
}

function ContentTable({
  title,
  data,
  isLoading = false,
  showLink = false,
}: {
  title: string;
  data: Array<{ name: string; value: number; percentage: number }>;
  isLoading?: boolean;
  showLink?: boolean;
}) {
  return (
    <div className="rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-black text-black dark:text-white">
        <TrendingUp className="h-5 w-5" />
        {title}
      </h3>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.length === 0 ? (
            <p className="py-8 text-center text-gray-600 dark:text-gray-400">
              No data available
            </p>
          ) : (
            data.slice(0, 8).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-black/20 bg-white p-3 dark:border-white/10 dark:bg-zinc-800"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="rounded bg-black px-2 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">
                    {index + 1}
                  </span>
                  <span className="flex items-center gap-2 truncate text-sm font-medium text-black dark:text-white">
                    {showLink && (
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    )}
                    {item.name}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-4">
                  <span className="text-sm font-bold text-black dark:text-white">
                    {item.value.toLocaleString()}
                  </span>
                  <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-black dark:bg-white"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-xs text-gray-600 dark:text-gray-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function TopContentSection({
  timeRange,
  customRange,
}: TopContentSectionProps) {
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
        console.error("Error fetching analytics:", error);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, customRange]);

  const topPagesData =
    analytics?.topPages?.map((page) => ({
      name: page.page,
      value: page.views,
      percentage: page.percentage,
    })) || [];

  return (
    <div className="space-y-8">
      <ContentTable
        title="Top Pages"
        data={topPagesData}
        isLoading={isLoading}
        showLink={true}
      />
    </div>
  );
}
