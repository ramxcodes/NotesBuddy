"use server";

import { adminStatus } from "@/lib/db/user";
import {
  UmamiStatistics,
  UmamiApiResponse,
  UmamiPagesResponse,
} from "@/types/umami";

const UMAMI_API_URL =
  process.env.NEXT_PUBLIC_UMAMI_URL || "https://analytics.notesbuddy.in";
const UMAMI_API_TOKEN = process.env.UMAMI_API_TOKEN;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_ID;

async function fetchUmamiData(endpoint: string): Promise<unknown> {
  if (!UMAMI_API_URL || !UMAMI_API_TOKEN || !UMAMI_WEBSITE_ID) {
    throw new Error("Missing Umami configuration");
  }

  const response = await fetch(`${UMAMI_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${UMAMI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 5 },
  });

  if (!response.ok) {
    throw new Error(`Umami API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getUmamiStatisticsAction(): Promise<UmamiStatistics | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    // Get date range for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startAt = startDate.getTime();
    const endAt = endDate.getTime();

    // Fetch website stats
    const statsResponse = (await fetchUmamiData(
      `/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
    )) as UmamiApiResponse;

    // Fetch pages count
    const uniquePagesResponse = (await fetchUmamiData(
      `/api/websites/${UMAMI_WEBSITE_ID}/metrics?startAt=${startAt}&endAt=${endAt}&type=url`,
    )) as UmamiPagesResponse;

    // Calculate visit duration (totaltime / visits)
    const visitDuration =
      statsResponse.visits.value > 0
        ? Math.round(statsResponse.totaltime.value / statsResponse.visits.value)
        : 0;

    return {
      views: statsResponse.pageviews.value,
      visitors: statsResponse.visitors.value,
      pages: uniquePagesResponse.data?.length || 0,
      visitDuration,
    };
  } catch (error) {
    console.error("Error fetching Umami statistics:", error);
    return null;
  }
}
