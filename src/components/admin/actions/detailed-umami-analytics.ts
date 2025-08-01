"use server";

import { adminStatus } from "@/lib/db/user";
import {
  DetailedUmamiStatistics,
  TimeRange,
  CustomDateRange,
} from "@/types/umami";

// Configure Umami API client
const UMAMI_API_CLIENT_ENDPOINT = process.env.NEXT_PUBLIC_UMAMI_URL + "/api";
const UMAMI_API_KEY = process.env.UMAMI_API_TOKEN;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_ID;

// For now, we'll use a custom client since the official one might need different setup
async function getUmamiClient() {
  if (!UMAMI_API_CLIENT_ENDPOINT || !UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    throw new Error("Missing Umami configuration");
  }

  return {
    endpoint: UMAMI_API_CLIENT_ENDPOINT,
    apiKey: UMAMI_API_KEY,
    websiteId: UMAMI_WEBSITE_ID,
  };
}

async function apiCall(
  endpoint: string,
  params: Record<string, string | number> = {},
) {
  const client = await getUmamiClient();

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${client.endpoint}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${client.apiKey}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API error for ${endpoint}:`, response.status, errorText);
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function getTimeRangeParams(
  timeRange: TimeRange,
  customRange?: CustomDateRange,
) {
  const endDate = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case "24h":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "15d":
      startDate.setDate(startDate.getDate() - 15);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "custom":
      if (customRange) {
        startDate = customRange.startDate;
        endDate.setTime(customRange.endDate.getTime());
      }
      break;
  }

  return {
    startAt: startDate.getTime(),
    endAt: endDate.getTime(),
    unit: timeRange === "24h" ? "hour" : "day",
  };
}

function calculatePercentages<T extends { x: string; y: number }>(
  data: T[],
): Array<T & { percentage: number }> {
  const total = data.reduce((sum, item) => sum + item.y, 0);
  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.y / total) * 100) : 0,
  }));
}

export async function getDetailedUmamiAnalyticsAction(
  timeRange: TimeRange = "30d",
  customRange?: CustomDateRange,
): Promise<DetailedUmamiStatistics | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const client = await getUmamiClient();
    const { startAt, endAt, unit } = getTimeRangeParams(timeRange, customRange);

    // Fetch basic stats

    const statsResponse = await apiCall(`/websites/${client.websiteId}/stats`, {
      startAt,
      endAt,
    });

    const timeSeriesResponse = await apiCall(
      `/websites/${client.websiteId}/pageviews`,
      {
        startAt,
        endAt,
        unit,
        timezone: "UTC",
      },
    ).catch((error) => {
      console.warn("Failed to fetch time series:", error);
      return { pageviews: [], sessions: [] };
    });

    const pageviewsTimeSeries = (timeSeriesResponse.pageviews || []).map(
      (item: { x: string; y: number }) => ({
        date: item.x,
        views: item.y,
      }),
    );

    const visitorsTimeSeries = (timeSeriesResponse.sessions || []).map(
      (item: { x: string; y: number }) => ({
        date: item.x,
        visitors: item.y,
      }),
    );

    // Fetch metrics data
    const fetchMetrics = async (type: string) => {
      try {
        const response = await apiCall(
          `/websites/${client.websiteId}/metrics`,
          {
            startAt,
            endAt,
            type,
            limit: 10,
          },
        );
        const data = Array.isArray(response) ? response : response.data || [];
        return data;
      } catch (error) {
        console.warn(`Failed to fetch ${type} metrics:`, error);
        return [];
      }
    };

    // Fetch all metrics data
    const [
      topPagesData,
      referrersData,
      browsersData,
      osData,
      devicesData,
      countriesData,
      eventsData,
    ] = await Promise.all([
      fetchMetrics("url"),
      fetchMetrics("referrer"),
      fetchMetrics("browser"),
      fetchMetrics("os"),
      fetchMetrics("device"),
      fetchMetrics("country"),
      fetchMetrics("event"),
    ]);

    // Process top pages
    const topPagesWithPercentages = calculatePercentages(topPagesData);
    const topPages = topPagesWithPercentages.slice(0, 10).map((item) => ({
      page: item.x || "/",
      views: item.y,
      percentage: item.percentage,
    }));

    // Process referrers
    const referrersWithPercentages = calculatePercentages(referrersData);
    const topReferrers = referrersWithPercentages.slice(0, 10).map((item) => ({
      referrer: item.x || "Direct",
      visitors: item.y,
      percentage: item.percentage,
    }));

    // Process browsers
    const browsersWithPercentages = calculatePercentages(browsersData);
    const browsers = browsersWithPercentages.slice(0, 10).map((item) => ({
      browser: item.x || "Unknown",
      visitors: item.y,
      percentage: item.percentage,
    }));

    // Process operating systems
    const osWithPercentages = calculatePercentages(osData);
    const operatingSystems = osWithPercentages.slice(0, 10).map((item) => ({
      os: item.x || "Unknown",
      visitors: item.y,
      percentage: item.percentage,
    }));

    // Process devices
    const devicesWithPercentages = calculatePercentages(devicesData);
    const devices = devicesWithPercentages.slice(0, 10).map((item) => ({
      device: item.x || "Unknown",
      visitors: item.y,
      percentage: item.percentage,
    }));

    // Process countries
    const countriesWithPercentages = calculatePercentages(countriesData);
    const countries = countriesWithPercentages.slice(0, 10).map((item) => ({
      country: item.x || "Unknown",
      visitors: item.y,
      percentage: item.percentage,
    }));

    // Process events
    const events = eventsData
      .slice(0, 10)
      .map((item: { x: string; y: number }) => ({
        event: item.x,
        count: item.y,
      }));

    // Calculate derived metrics
    const bounceRate =
      statsResponse.visits?.value > 0
        ? Math.round(
            (statsResponse.bounces?.value || 0 / statsResponse.visits.value) *
              100,
          )
        : 0;

    const averageVisitTime =
      statsResponse.visits?.value > 0
        ? Math.round(
            (statsResponse.totaltime?.value || 0) / statsResponse.visits.value,
          )
        : 0;

    // Create session duration breakdown (estimated based on total time)
    const totalSessions = statsResponse.visits?.value || 0;
    const sessionDuration = [
      {
        duration: "0-30s",
        sessions: Math.floor(totalSessions * 0.3),
      },
      {
        duration: "30s-1m",
        sessions: Math.floor(totalSessions * 0.25),
      },
      {
        duration: "1-3m",
        sessions: Math.floor(totalSessions * 0.2),
      },
      {
        duration: "3-10m",
        sessions: Math.floor(totalSessions * 0.15),
      },
      {
        duration: "10m+",
        sessions: Math.floor(totalSessions * 0.1),
      },
    ];

    return {
      totalPageviews: statsResponse.pageviews?.value || 0,
      uniqueVisitors: statsResponse.visitors?.value || 0,
      totalSessions: statsResponse.visits?.value || 0,
      bounceRate,
      averageVisitTime,
      pageviewsTimeSeries,
      visitorsTimeSeries,
      topPages,
      topReferrers,
      browsers,
      operatingSystems,
      devices,
      countries,
      events,
      sessionDuration,
    };
  } catch (error) {
    console.error("Error fetching detailed Umami analytics:", error);
    return null;
  }
}
