import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <div className="mx-4">
        <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-center gap-4 space-y-6 px-4 py-5 sm:mt-8 sm:space-y-8 sm:px-6 lg:mt-10 lg:space-y-10 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:gap-4">
            <Skeleton className="mb-2 h-10 w-64 sm:h-12 sm:w-80 lg:h-16 lg:w-[28rem]" />
            <Skeleton className="h-5 w-56 sm:h-6 sm:w-80" />
          </div>

          {/* Search Skeleton */}
          <div className="w-full max-w-2xl">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Filter Dropdown Skeleton */}
          <div className="flex w-full max-w-4xl gap-4">
            {/* Simulate 5 dropdowns */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-40 rounded-md" />
            ))}
          </div>

          {/* Notes List Skeleton */}
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-primary dark:border-secondary relative flex h-[350px] flex-col rounded-xl border-r-8 border-b-8 border-2"
              >
                <div className="flex flex-1 flex-col gap-3 p-6 pb-4">
                  <Skeleton className="mb-2 h-6 w-32" />
                  <Skeleton className="mb-1 h-4 w-40" />
                  <Skeleton className="mb-1 h-4 w-48" />
                  <Skeleton className="mb-1 h-4 w-36" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-20 rounded-md" />
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
