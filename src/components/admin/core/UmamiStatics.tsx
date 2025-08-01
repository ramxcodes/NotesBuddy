import React from "react";
import { getUmamiStatisticsAction } from "../actions/umami-statistics";

interface StatCardProps {
  title: string;
  value: number;
  isDuration?: boolean;
}

function StatCard({ title, value, isDuration = false }: StatCardProps) {
  const formatValue = (val: number) => {
    if (isDuration) {
      if (val < 60) {
        return `${val}s`;
      } else if (val < 3600) {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
      } else {
        const hours = Math.floor(val / 3600);
        const minutes = Math.floor((val % 3600) / 60);
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
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

export default async function UmamiStatics() {
  const statistics = await getUmamiStatisticsAction();

  if (!statistics) {
    return (
      <div className="border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
        <p className="text-center text-black dark:text-white">
          Unable to load Umami analytics data. Please check your configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-black text-black dark:text-white">
        Analytics Statistics (Last 30 Days)
      </h2>
      <div className="grid grid-cols-1 place-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Page Views" value={statistics.views} />
        <StatCard title="Unique Visitors" value={statistics.visitors} />
        <StatCard title="Total Pages" value={statistics.pages} />
        <StatCard
          title="Avg. Visit Duration"
          value={statistics.visitDuration}
          isDuration={true}
        />
      </div>
    </div>
  );
}
