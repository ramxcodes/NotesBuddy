"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  WarningIcon,
  FlagIcon,
  CalendarCheckIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import type { AdminReportStats } from "@/dal/user/report/admin-query";

interface AdminReportsHeaderProps {
  stats: AdminReportStats | null;
}

export default function AdminReportsHeader({ stats }: AdminReportsHeaderProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-excon text-3xl font-bold">Reports Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user reports across the platform
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">Total Reports</CardTitle>
              <FlagIcon
                weight="duotone"
                className="text-muted-foreground h-4 w-4"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalReports)}
              </div>
              <p className="text-muted-foreground text-xs">All time reports</p>
            </CardContent>
          </Card>

          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">Today</CardTitle>
              <CalendarCheckIcon
                weight="duotone"
                className="text-muted-foreground h-4 w-4"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.reportsToday)}
              </div>
              <p className="text-muted-foreground text-xs">
                Reports submitted today
              </p>
            </CardContent>
          </Card>

          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">This Week</CardTitle>
              <TrendUpIcon
                weight="duotone"
                className="text-muted-foreground h-4 w-4"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.reportsThisWeek)}
              </div>
              <p className="text-muted-foreground text-xs">Reports this week</p>
            </CardContent>
          </Card>

          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">This Month</CardTitle>
              <WarningIcon
                weight="duotone"
                className="text-muted-foreground h-4 w-4"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.reportsThisMonth)}
              </div>
              <p className="text-muted-foreground text-xs">
                Reports this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Domains and Recent Reports */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Reported Domains */}
          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Top Reported Domains
              </CardTitle>
              <CardDescription>Domains with the most reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topDomains.length > 0 ? (
                  stats.topDomains.map((domain, index) => (
                    <div
                      key={domain.domain}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="dark:border-white-20dark:bg-black border-2 border-black bg-white text-black dark:text-white"
                        >
                          #{index + 1}
                        </Badge>
                        <span className="max-w-[200px] truncate font-mono text-sm">
                          {domain.domain}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="dark:border-white-20dark:bg-gray-800 border-2 border-black bg-gray-100 text-black dark:text-white"
                      >
                        {domain.count} reports
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No domains found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="dark:border-white-20dark:bg-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Recent Reports
              </CardTitle>
              <CardDescription>
                Latest reports submitted to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentReports.length > 0 ? (
                  stats.recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="border-l-4 border-orange-500 py-2 pl-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-bold">
                          {report.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate text-sm">
                        {report.report.length > 50
                          ? `${report.report.substring(0, 50)}...`
                          : report.report}
                      </p>
                      <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
                        {report.url}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent reports
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
