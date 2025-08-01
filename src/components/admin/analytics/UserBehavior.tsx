"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MousePointer, TrendingDown } from "lucide-react";
import {
  TimeRange,
  CustomDateRange,
  DetailedUmamiStatistics,
} from "@/types/umami";
import { getDetailedUmamiAnalyticsAction } from "../actions/detailed-umami-analytics";

interface UserBehaviorProps {
  timeRange: TimeRange;
  customRange?: CustomDateRange;
}

function MetricCard({
  title,
  value,
  icon,
  suffix = "",
  isPercentage = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  isPercentage?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
          {icon}
          {title}
        </h3>
        <div className="text-3xl font-black text-black dark:text-white">
          {isPercentage ? `${value}%` : value.toLocaleString()}
          {suffix}
        </div>
      </div>
    </div>
  );
}

function ChartContainer({
  title,
  children,
  isLoading = false,
}: {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <h3 className="mb-6 text-xl font-black text-black dark:text-white">
        {title}
      </h3>
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent"></div>
        </div>
      ) : (
        <div className="h-80">{children}</div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <p className="font-bold text-black dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="font-semibold"
          >
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function UserBehavior({ timeRange, customRange }: UserBehaviorProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex h-32 items-center justify-center rounded-xl border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent"></div>
              </div>
            ))}
        </div>
        <ChartContainer title="Session Duration" isLoading={true}>
          <div></div>
        </ChartContainer>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
        <p className="text-center text-black dark:text-white">
          Unable to load user behavior data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <MetricCard
          title="Bounce Rate"
          value={analytics.bounceRate}
          icon={<TrendingDown className="h-5 w-5" />}
          isPercentage={true}
        />

        <MetricCard
          title="Total Sessions"
          value={analytics.totalSessions}
          icon={<MousePointer className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ChartContainer
          title="Session Duration Distribution"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.sessionDuration}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="duration"
                stroke="#000"
                className="dark:stroke-white"
              />
              <YAxis stroke="#000" className="dark:stroke-white" />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sessions"
                fill="#000"
                stroke="#000"
                strokeWidth={2}
                className="dark:fill-white dark:stroke-white"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
