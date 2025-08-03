"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getAdminPremiumUsersAction,
  getAdminPremiumStatsAction,
  type AdminPremiumFilters,
} from "@/components/admin/actions/admin-premium";
import type {
  AdminPremiumResponse,
  AdminPremiumStats,
} from "@/dal/premium/admin-query";
import { AdminPremiumStats as StatsComponent } from "./AdminPremiumStats";
import { AdminPremiumUserTable } from "./AdminPremiumUserTable";
import { AdminPremiumGrantForm } from "./AdminPremiumGrantForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPremiumController() {
  const [activeTab, setActiveTab] = useState("overview");
  const [usersData, setUsersData] = useState<AdminPremiumResponse | null>(null);
  const [statsData, setStatsData] = useState<AdminPremiumStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<AdminPremiumFilters["tier"]>("ALL");
  const [status, setStatus] = useState<AdminPremiumFilters["status"]>("ALL");
  const [sortBy, setSortBy] = useState<AdminPremiumFilters["sortBy"]>("NEWEST");

  const debouncedSearch = useDebounce(search, 500);

  // Fetch premium users
  const fetchUsers = useCallback(
    async (page: number = currentPage) => {
      setLoading(true);
      try {
        const filters: AdminPremiumFilters = {
          page,
          search: debouncedSearch || undefined,
          tier: tier === "ALL" ? undefined : tier,
          status: status === "ALL" ? undefined : status,
          sortBy,
          limit: 20,
        };

        const result = await getAdminPremiumUsersAction(filters);
        setUsersData(result);
      } catch (error) {
        console.error("Error fetching premium users:", error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, tier, status, sortBy, currentPage],
  );

  // Fetch premium stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await getAdminPremiumStatsAction();
      if (result.success && result.data) {
        setStatsData(result.data);
      }
    } catch (error) {
      console.error("Error fetching premium stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tier, status, sortBy]);

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "users") {
      fetchStats();
    }
  }, [activeTab, fetchStats]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-black dark:text-white">
          Premium Management
        </h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="neuro flex items-center justify-between gap-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Premium Users</TabsTrigger>
          <TabsTrigger value="grant">Grant Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsComponent
            stats={statsData}
            loading={statsLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminPremiumUserTable
            data={usersData}
            loading={loading}
            search={search}
            setSearch={setSearch}
            tier={tier}
            setTier={setTier}
            status={status}
            setStatus={setStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="grant" className="space-y-6">
          <AdminPremiumGrantForm onSuccess={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
