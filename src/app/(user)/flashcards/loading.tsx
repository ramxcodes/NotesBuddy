import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsPageLoading() {
  return (
    <div className="font-satoshi container mx-auto mt-10 min-h-screen max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-2 h-10 w-48" />
        <Skeleton className="mx-auto h-5 w-96" />
      </div>

      {/* Filter Section */}
      <div className="mx-4 mb-6">
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>

      {/* Flashcard Grid */}
      <div className="mx-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="neuro rounded-md p-6">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="ml-2 h-6 w-16 flex-shrink-0" />
            </div>

            {/* Academic Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, badgeIndex) => (
                <Skeleton key={badgeIndex} className="h-7 w-20" />
              ))}
            </div>

            {/* Stats */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>

            {/* Action Button */}
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
