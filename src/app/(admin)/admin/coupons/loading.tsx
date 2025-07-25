import { Skeleton } from "@/components/ui/skeleton";

export default function CouponsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      {/* Filters and Search Skeleton */}
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <div className="p-6">
          {/* Table Header */}
          <div className="mb-4 flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 flex gap-4 items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-4 w-8 rounded" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-10 w-20 rounded-xl" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-16 rounded-xl" />
      </div>
    </div>
  );
}
