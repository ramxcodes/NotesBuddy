"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartBar,
  Robot,
  ChatCircle,
  Users,
  CalendarCheck,
  TrendUp,
} from "@phosphor-icons/react";
import type { AdminChatStats } from "@/dal/ai/admin-query";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";

interface AdminAIHeaderProps {
  stats: AdminChatStats | null;
}

export default function AdminAIHeader({ stats }: AdminAIHeaderProps) {
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
          <h1 className="font-excon text-3xl font-bold">AI Chat Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI chat conversations across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <TrendUp size={16} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Chats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <ChatCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalChats)}
              </div>
              <p className="text-muted-foreground text-xs">
                All chat conversations
              </p>
            </CardContent>
          </Card>

          {/* Total Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <Robot className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalMessages)}
              </div>
              <p className="text-muted-foreground text-xs">
                Messages exchanged
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Users</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalUsers)}
              </div>
              <p className="text-muted-foreground text-xs">Users who used AI</p>
            </CardContent>
          </Card>

          {/* Active Today */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Today
              </CardTitle>
              <CalendarCheck className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.activeChatsToday)}
              </div>
              <p className="text-muted-foreground text-xs">Chats used today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
              <CardDescription>Chat activity over time periods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Today</span>
                <Badge variant="secondary">
                  {formatNumber(stats.activeChatsToday)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <Badge variant="secondary">
                  {formatNumber(stats.activeChatsThisWeek)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <Badge variant="secondary">
                  {formatNumber(stats.activeChatsThisMonth)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Top Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Subjects</CardTitle>
              <CardDescription>Most discussed subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.chatsBySubject.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="truncate text-sm">{item.subject}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
              {stats.chatsBySubject.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No subject data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Universities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By University</CardTitle>
              <CardDescription>Chat distribution by university</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.chatsByUniversity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {getDisplayNameFromPrismaValue(
                      "university",
                      item.university,
                    )}
                  </span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
              {stats.chatsByUniversity.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No university data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model Usage Stats */}
      {stats && stats.messagesByModel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChartBar size={20} />
              AI Model Usage
            </CardTitle>
            <CardDescription>
              Distribution of messages by AI model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {stats.messagesByModel.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{item.model}</span>
                  <Badge variant="secondary">{formatNumber(item.count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
