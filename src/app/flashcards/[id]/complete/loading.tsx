import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          </div>
          <Skeleton className="mx-auto mb-4 h-10 w-80" />
          <Skeleton className="mx-auto h-6 w-96" />
          <Skeleton className="mx-auto mt-2 h-8 w-64" />
        </div>

        {/* Study Stats Skeleton */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <Card
              key={index}
              className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <CardContent className="p-6 text-center">
                <Skeleton className="mx-auto mb-3 h-12 w-12 rounded" />
                <Skeleton className="mx-auto mb-2 h-8 w-16" />
                <Skeleton className="mx-auto h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Card Skeleton */}
        <Card className="mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Skeleton className="mb-2 h-5 w-24" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((line) => (
                    <Skeleton key={line} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="mb-2 h-5 w-20" />
                <div className="space-y-2">
                  {[1, 2, 3].map((line) => (
                    <Skeleton key={line} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {[1, 2].map((index) => (
            <Skeleton
              key={index}
              className="h-14 w-48 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
