"use server";

import {
  getAdminReports,
  getAdminReportStats,
  deleteReport,
  getReportDomains,
  getReportDetails,
  type AdminReportFilters,
  type AdminReportsResponse,
  type AdminReportStats,
  type AdminReportListItem,
} from "@/dal/user/report/admin-query";
import { revalidateTag } from "next/cache";

export async function getAdminReportsAction(
  filters: AdminReportFilters & { page: number; limit: number },
): Promise<AdminReportsResponse> {
  return getAdminReports(filters);
}

export async function getAdminReportStatsAction(): Promise<AdminReportStats> {
  return getAdminReportStats();
}

export async function deleteReportAction(reportId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const success = await deleteReport(reportId);

    if (success) {
      // Revalidate cache tags related to reports
      revalidateTag("admin-reports");
      revalidateTag("report-stats");
      return { success: true };
    } else {
      return { success: false, error: "Failed to delete report" };
    }
  } catch (error) {
    console.error("Error in deleteReportAction:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getReportDomainsAction(): Promise<string[]> {
  return getReportDomains();
}

export async function getReportDetailsAction(
  reportId: string,
): Promise<AdminReportListItem | null> {
  return getReportDetails(reportId);
}
