"use client";

import { useState } from "react";
import { TimeRange, CustomDateRange } from "@/types/umami";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { OverviewCards } from "./OverviewCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { TopContentSection } from "./TopContentSection";
import { AudienceInsights } from "./AudienceInsights";
import { UserBehavior } from "./UserBehavior";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<CustomDateRange>();

  return (
    <div className="space-y-8">
      <AnalyticsHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />

      <OverviewCards timeRange={timeRange} customRange={customRange} />

      <AnalyticsCharts timeRange={timeRange} customRange={customRange} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TopContentSection timeRange={timeRange} customRange={customRange} />
        <AudienceInsights timeRange={timeRange} customRange={customRange} />
      </div>

      <UserBehavior timeRange={timeRange} customRange={customRange} />
    </div>
  );
}
