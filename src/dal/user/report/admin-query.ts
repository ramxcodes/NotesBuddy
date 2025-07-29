import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions, adminCacheConfig } from "@/cache/cache";
import type { Prisma } from "@prisma/client";

// Types for admin report operations
export interface AdminReportListItem {
  id: string;
  report: string;
  url: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface AdminReportStats {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  topDomains: Array<{
    domain: string;
    count: number;
  }>;
  recentReports: AdminReportListItem[];
}

export interface AdminReportFilters {
  search?: string;
  sortBy?: "NEWEST" | "OLDEST" | "USER_NAME" | "URL";
  dateFilter?: "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";
  domain?: string;
}

export interface AdminReportsResponse {
  reports: AdminReportListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Cache configurations for report queries
const reportsCacheConfig = {
  ...getCacheOptions(adminCacheConfig.getAdminReports),
};

const reportStatsCacheConfig = {
  ...getCacheOptions(adminCacheConfig.getAdminReports),
};

// Get admin reports with filters and pagination
export const getAdminReports = unstable_cache(
  async (
    filters: AdminReportFilters & { page: number; limit: number },
  ): Promise<AdminReportsResponse> => {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "NEWEST",
      dateFilter = "ALL",
      domain,
    } = filters;

    // Build where clause
    const where: Prisma.ReportWhereInput = {};

    // Add search filter
    if (search) {
      where.OR = [
        {
          report: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          url: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Add date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "TODAY":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "THIS_WEEK":
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "THIS_MONTH":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      where.createdAt = {
        gte: startDate,
      };
    }

    // Add domain filter
    if (domain) {
      where.url = {
        contains: domain,
        mode: "insensitive",
      };
    }

    // Build order by clause
    let orderBy: Prisma.ReportOrderByWithRelationInput;
    switch (sortBy) {
      case "OLDEST":
        orderBy = { createdAt: "asc" };
        break;
      case "USER_NAME":
        orderBy = { user: { name: "asc" } };
        break;
      case "URL":
        orderBy = { url: "asc" };
        break;
      case "NEWEST":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Execute queries
    const [reports, totalReports] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    const totalPages = Math.ceil(totalReports / limit);

    return {
      reports,
      pagination: {
        currentPage: page,
        totalPages,
        totalReports,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
  ["admin-reports"],
  reportsCacheConfig,
);

// Get admin report statistics
export const getAdminReportStats = unstable_cache(
  async (): Promise<AdminReportStats> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(
      now.getTime() - now.getDay() * 24 * 60 * 60 * 1000,
    );
    thisWeek.setHours(0, 0, 0, 0);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get basic counts
    const [totalReports, reportsToday, reportsThisWeek, reportsThisMonth] =
      await Promise.all([
        prisma.report.count(),
        prisma.report.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: thisWeek,
            },
          },
        }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: thisMonth,
            },
          },
        }),
      ]);

    // Get top domains
    const reports = await prisma.report.findMany({
      select: {
        url: true,
      },
    });

    const domainCounts: Record<string, number> = {};
    reports.forEach((report) => {
      try {
        const url = new URL(report.url);
        const domain = url.hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch {
        // Invalid URL, use the full URL as domain
        domainCounts[report.url] = (domainCounts[report.url] || 0) + 1;
      }
    });

    const topDomains = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      topDomains,
      recentReports,
    };
  },
  ["admin-report-stats"],
  reportStatsCacheConfig,
);

// Get detailed report by ID
export const getReportDetails = unstable_cache(
  async (reportId: string): Promise<AdminReportListItem | null> => {
    return prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
  ["report-details"],
  getCacheOptions(adminCacheConfig.getReportDetails),
);

// Delete a report
export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    await prisma.report.delete({
      where: {
        id: reportId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    return false;
  }
}

// Get unique domains for filtering
export const getReportDomains = unstable_cache(
  async (): Promise<string[]> => {
    const reports = await prisma.report.findMany({
      select: {
        url: true,
      },
      distinct: ["url"],
    });

    const domains = new Set<string>();
    reports.forEach((report) => {
      try {
        const url = new URL(report.url);
        domains.add(url.hostname);
      } catch {
        // Invalid URL, use the full URL as domain
        domains.add(report.url);
      }
    });

    return Array.from(domains).sort();
  },
  ["report-domains"],
  reportsCacheConfig,
);
