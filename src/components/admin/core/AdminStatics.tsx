import React from "react";
import { getAdminStatisticsAction } from "../actions/admin-statistics";

interface StatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
}

function StatCard({ title, value, isCurrency = false }: StatCardProps) {
  const formatValue = (val: number) => {
    if (isCurrency) {
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="flex h-32 w-64 flex-col justify-center rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-black dark:text-white">
          {title}
        </h3>
        <div className="text-3xl font-black text-black dark:text-white">
          {formatValue(value)}
        </div>
      </div>
    </div>
  );
}

export default async function AdminStatics() {
  const statistics = await getAdminStatisticsAction();

  if (!statistics) {
    return (
      <div className="border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
        <p className="text-center text-black dark:text-white">
          Unable to load statistics
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-black text-black dark:text-white">
        Admin Statistics
      </h2>
      <div className="grid grid-cols-1 place-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={statistics.totalUsers} />
        <StatCard title="Premium Users" value={statistics.premiumUsers} />
        <StatCard title="Blocked Users" value={statistics.blockedUsers} />
        <StatCard
          title="Total Revenue"
          value={statistics.totalRevenue}
          isCurrency={true}
        />
      </div>
    </div>
  );
}
