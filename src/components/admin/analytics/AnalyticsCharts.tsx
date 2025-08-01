"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TimeRange,
  CustomDateRange,
  DetailedUmamiStatistics,
} from "@/types/umami";
import { getDetailedUmamiAnalyticsAction } from "../actions/detailed-umami-analytics";

interface AnalyticsChartsProps {
  timeRange: TimeRange;
  customRange?: CustomDateRange;
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

export function AnalyticsCharts({
  timeRange,
  customRange,
}: AnalyticsChartsProps) {
  const [analytics, setAnalytics] = useState<DetailedUmamiStatistics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeRange === "24h") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
          <p className="font-bold text-black dark:text-white">
            {formatDate(label || "")}
          </p>
          {payload.map((entry, index: number) => (
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartContainer title="Page Views Over Time" isLoading={isLoading}>
          {analytics && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.pageviewsTimeSeries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#404040" : "#ccc"}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke={isDarkMode ? "#fff" : "#000"}
                />
                <YAxis stroke={isDarkMode ? "#fff" : "#000"} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke={isDarkMode ? "#fff" : "#000"}
                  strokeWidth={3}
                  dot={{
                    fill: isDarkMode ? "#fff" : "#000",
                    strokeWidth: 2,
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <ChartContainer title="Visitors Over Time" isLoading={isLoading}>
          {analytics && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.visitorsTimeSeries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#404040" : "#ccc"}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke={isDarkMode ? "#fff" : "#000"}
                />
                <YAxis stroke={isDarkMode ? "#fff" : "#000"} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke={isDarkMode ? "#fff" : "#000"}
                  strokeWidth={3}
                  dot={{
                    fill: isDarkMode ? "#fff" : "#000",
                    strokeWidth: 2,
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      <ChartContainer
        title="Session Duration Distribution"
        isLoading={isLoading}
      >
        {analytics && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.sessionDuration}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#404040" : "#ccc"}
              />
              <XAxis dataKey="duration" stroke={isDarkMode ? "#fff" : "#000"} />
              <YAxis stroke={isDarkMode ? "#fff" : "#000"} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sessions"
                fill={isDarkMode ? "#fff" : "#000"}
                stroke={isDarkMode ? "#fff" : "#000"}
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );
}
