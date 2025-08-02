"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CurrencyCircleDollar,
  Users,
  Crown,
  TrendUp,
  ArrowClockwise,
  Calendar,
  Warning,
} from "@phosphor-icons/react";
import type { AdminPremiumStats } from "@/dal/premium/admin-query";

interface AdminPremiumStatsProps {
  stats: AdminPremiumStats | null;
  loading: boolean;
  onRefresh: () => void;
}

export function AdminPremiumStats({
  stats,
  loading,
  onRefresh,
}: AdminPremiumStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="neuro animate-pulse">
            <CardHeader className="pb-2">
              <div className="bg-muted h-4 w-1/2 rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-3/4 rounded" />
              <div className="bg-muted h-3 w-1/2 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="neuro">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Warning className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground">Failed to load statistics</p>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="neuro-sm mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "TIER_1":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "TIER_2":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "TIER_3":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Premium Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="neuro-sm"
        >
          <ArrowClockwise className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="neuro">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Total Revenue</CardTitle>
            <CurrencyCircleDollar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-muted-foreground text-xs">All time earnings</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="neuro">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">This Month</CardTitle>
            <TrendUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {formatCurrency(stats.revenueThisMonth)}
            </div>
            <p className="text-muted-foreground text-xs">Monthly revenue</p>
          </CardContent>
        </Card>

        {/* Active Premium Users */}
        <Card className="neuro">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Active Premium</CardTitle>
            <Crown className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {stats.activePremiumUsers}
            </div>
            <p className="text-muted-foreground text-xs">
              Currently active subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Total Premium Users */}
        <Card className="neuro">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Total Premium</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats.totalPremiumUsers}</div>
            <p className="text-muted-foreground text-xs">
              Ever had premium ({stats.expiredPremiumUsers} expired)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card className="neuro">
        <CardHeader>
          <CardTitle className="font-black">Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.tierDistribution.map((tier) => (
              <div
                key={tier.tier}
                className="neuro-sm flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <div className="font-semibold">
                    {tier.tier.replace("_", " ")}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {tier.count} users
                  </div>
                </div>
                <Badge className={getTierColor(tier.tier)}>{tier.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Users */}
      {stats.expiringUsers.length > 0 && (
        <Card className="neuro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black">
              <Calendar className="h-5 w-5" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.expiringUsers.slice(0, 5).map((user) => (
                <div
                  key={user.userId}
                  className="neuro-sm flex items-center justify-between rounded-lg p-3"
                >
                  <div>
                    <div className="font-semibold">{user.userName}</div>
                    <div className="text-muted-foreground text-sm">
                      {user.userEmail}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getTierColor(user.tier)}>
                      {user.tier.replace("_", " ")}
                    </Badge>
                    <div className="text-muted-foreground mt-1 text-sm">
                      {user.daysRemaining} days left
                    </div>
                  </div>
                </div>
              ))}
              {stats.expiringUsers.length > 5 && (
                <div className="text-muted-foreground text-center text-sm">
                  +{stats.expiringUsers.length - 5} more users expiring soon
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
