"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash,
  User,
  Link,
  CalendarBlank,
  Warning,
} from "@phosphor-icons/react";
import type { AdminReportListItem } from "@/dal/user/report/admin-query";

interface AdminReportsTableProps {
  reports: AdminReportListItem[];
  onDeleteReport: (reportId: string) => void;
  loading: boolean;
}

export default function AdminReportsTable({
  reports,
  onDeleteReport,
  loading,
}: AdminReportsTableProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain;
    } catch {
      return url.length > 30 ? `${url.substring(0, 30)}...` : url;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-black dark:shadow-[4px_4px_0px_0px_#FFF]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Warning className="h-5 w-5" />
          Reports ({reports.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black hover:bg-transparent dark:border-white">
                <TableHead className="font-bold text-black dark:text-white">
                  User
                </TableHead>
                <TableHead className="font-bold text-black dark:text-white">
                  Report
                </TableHead>
                <TableHead className="font-bold text-black dark:text-white">
                  URL/Domain
                </TableHead>
                <TableHead className="font-bold text-black dark:text-white">
                  Date
                </TableHead>
                <TableHead className="text-right font-bold text-black dark:text-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex animate-pulse justify-end gap-2">
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold">
                              {report.user.name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {report.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">
                            {truncateText(report.report, 80)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link className="text-muted-foreground h-4 w-4" />
                          <div className="max-w-xs">
                            <Badge
                              variant="outline"
                              className="border-2 border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            >
                              {extractDomain(report.url)}
                            </Badge>
                            <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
                              {truncateText(report.url, 40)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarBlank className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                         
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteReport(report.id)}
                            className="h-8 w-8 border-2 border-red-500 bg-red-50 p-0 text-red-600 hover:bg-red-100 dark:border-red-400 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
