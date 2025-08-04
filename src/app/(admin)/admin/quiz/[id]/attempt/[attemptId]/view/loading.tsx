export default function QuizAttemptDetailLoading() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="neuro rounded-md p-6">
            <div className="flex animate-pulse items-center gap-4">
              <div className="h-10 w-32 rounded bg-gray-300"></div>
              <div className="flex-1">
                <div className="mb-2 h-8 w-1/3 rounded bg-gray-300"></div>
                <div className="h-4 w-2/3 rounded bg-gray-300"></div>
              </div>
              <div className="h-8 w-24 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="neuro rounded-md p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-1/4 rounded bg-gray-300"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-32 rounded bg-gray-300"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="neuro rounded-md p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/3 rounded bg-gray-300"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 rounded bg-gray-300"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
