"use server";

import { getAdminStatistics } from "@/dal/user/admin/query";
import { adminStatus } from "@/lib/db/user";
import { AdminStatistics } from "@/dal/user/admin/types";

export async function getAdminStatisticsAction(): Promise<AdminStatistics | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const statistics = await getAdminStatistics();
    return statistics;
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return null;
  }
}
