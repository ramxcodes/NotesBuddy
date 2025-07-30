import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardViewLoading() {
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button skeleton */}
            <Skeleton className="h-9 w-24" />

            <div className="space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-8 w-64" />
              {/* Description skeleton */}
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Premium badge skeleton */}
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Main flashcard area */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Flashcard skeleton */}
            <div className="neuro aspect-[3/2] rounded-xl p-8">
              <div className="flex h-full flex-col justify-center space-y-4">
                {/* Card content skeleton */}
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />

                <div className="mt-8 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation controls skeleton */}
        <div className="mb-6 flex items-center justify-center gap-4">
          {/* Previous button */}
          <Skeleton className="h-10 w-24" />

          {/* Flip button */}
          <Skeleton className="h-10 w-32" />

          {/* Next button */}
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Bottom action buttons skeleton */}
        <div className="flex items-center justify-between">
          {/* Reset button */}
          <Skeleton className="h-10 w-20" />

          {/* Complete button */}
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Academic info skeleton */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-18" />
          <Skeleton className="h-6 w-22" />
        </div>
      </div>
    </div>
  );
}
