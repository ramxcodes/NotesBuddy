import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ScrollToTop from "@/components/core/ScrollToTop";

export default function NoteLoading() {
  return (
    <div className="relative w-full">
      <ScrollToTop />
      {/* Font Control Skeleton - Fixed position on the left */}
      <div className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 lg:block">
        <div className="bg-background flex flex-col gap-2 rounded-lg border p-2 shadow-lg">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Scroll Progress Skeleton - Fixed position on the right */}
      <div className="fixed right-4 bottom-4 z-40">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <div className="note-content-wrapper pt-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Note Header Skeleton */}
            <header className="mb-8">
              <Skeleton className="mb-4 h-12 w-3/4" />
              <Skeleton className="mb-3 h-6 w-5/6" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </header>

            <Separator className="my-8" />

            {/* Greet User Skeleton */}
            <div className="mb-8 flex flex-col gap-3 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div>
                    <Skeleton className="mb-1 h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Article Content Skeleton */}
            <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-8">
              <div className="space-y-6">
                {/* Paragraph skeletons */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>

                {/* Heading skeleton */}
                <Skeleton className="h-8 w-2/3" />

                {/* More paragraph skeletons */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-11/12" />
                </div>

                {/* Subheading skeleton */}
                <Skeleton className="h-6 w-1/2" />

                {/* More content skeletons */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-11/12" />
                </div>

                {/* List skeleton */}
                <div className="space-y-2 pl-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Another heading skeleton */}
                <Skeleton className="h-8 w-3/5" />

                {/* Final content block */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
