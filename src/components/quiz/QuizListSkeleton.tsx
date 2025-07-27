export default function QuizListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Skeleton */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="neuro-sm h-14 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Filter Skeleton */}
      <div className="my-6 rounded-xl border-4 border-black px-8 py-12 shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:shadow-[8px_8px_0px_0px_#757373]">
        <div className="flex flex-wrap items-end justify-center gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="neuro-sm h-10 w-32 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="neuro animate-pulse rounded-xl p-6">
            {/* Header Skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Academic Info Skeleton */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-700" />
                  <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-700" />
                </div>
              ))}
            </div>

            {/* Stats Skeleton */}
            <div className="dark:border-white/20/10 mb-4 rounded-lg border-2 border-black/10 bg-black/5 p-3 dark:bg-white/5">
              <div className="flex gap-4">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700"
                  />
                ))}
              </div>
            </div>

            {/* Attempt Status Skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-16 w-full rounded-lg bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Button Skeleton */}
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
