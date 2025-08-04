"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Users } from "@phosphor-icons/react";
import {
  TimeRange,
  CustomDateRange,
  DetailedUmamiStatistics,
} from "@/types/umami";
import { getDetailedUmamiAnalyticsAction } from "../actions/detailed-umami-analytics";

interface AudienceInsightsProps {
  timeRange: TimeRange;
  customRange?: CustomDateRange;
}

function ChartContainer({
  title,
  icon,
  children,
  isLoading = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-black text-black dark:text-white">
        {icon}
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

export function AudienceInsights({
  timeRange,
  customRange,
}: AudienceInsightsProps) {
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

  // Format data for visitors over time chart
  const visitorsOverTime =
    analytics?.visitorsTimeSeries?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      visitors: item.visitors,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Visitors Over Time Chart */}
      <ChartContainer
        title="Visitors Over Time"
        icon={<Users className="h-5 w-5" />}
        isLoading={isLoading}
      >
        {analytics && visitorsOverTime.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid black",
                  borderRadius: "8px",
                  boxShadow: "4px 4px 0px 0px #000",
                }}
                labelStyle={{ color: "black", fontWeight: "bold" }}
                itemStyle={{ color: "black" }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#000000"
                strokeWidth={3}
                dot={{ fill: "#000000", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#000000" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );
}
