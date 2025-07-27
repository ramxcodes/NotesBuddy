export default function AdminChatDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-24 animate-pulse rounded bg-gray-300"></div>
            <div>
              <div className="h-8 w-64 animate-pulse rounded bg-gray-300"></div>
              <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="neuro rounded-lg border-2 border-gray-300 p-6"
            >
              <div className="space-y-3">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-5 w-40 animate-pulse rounded bg-gray-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Card Skeleton */}
        <div className="neuro rounded-lg border-2 border-gray-300 p-6">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-300"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 text-center">
                <div className="mx-auto h-8 w-12 animate-pulse rounded bg-gray-300"></div>
                <div className="mx-auto h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="neuro rounded-lg border-2 border-gray-300 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-300"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] gap-3 ${
                    i % 2 === 0 ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 animate-pulse rounded-lg bg-gray-300"></div>
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Skeleton */}
        <div className="neuro rounded-lg border-2 border-gray-300 p-6">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-300"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-48 animate-pulse rounded bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
