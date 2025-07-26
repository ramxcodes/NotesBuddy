import Container from "@/components/core/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="bg-background min-h-screen">
      <Container>
        <div className="space-y-8 py-8">
          {/* Header Skeleton */}
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-12 w-64 md:h-14" />
            <Skeleton className="mx-auto h-6 w-96 max-w-2xl" />
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-6xl">
            {/* Tabs Skeleton */}
            <div className="grid h-auto w-full grid-cols-2 rounded-lg border p-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>

            <div className="mt-8 space-y-6">
              {/* Profile Info Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6 md:flex-row">
                    {/* Avatar Skeleton */}
                    <Skeleton className="size-24 rounded-full" />

                    {/* Basic Info Skeleton */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <Skeleton className="h-7 w-48" />
                        <div className="mt-1 flex items-center gap-2">
                          <Skeleton className="h-5 w-64" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Skeleton className="mb-1 h-4 w-20" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <div>
                          <Skeleton className="mb-1 h-4 w-24" />
                          <Skeleton className="h-5 w-36" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information Card Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-44" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Skeleton className="mb-1 h-4 w-16" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-4 w-12" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-4 w-8" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-4 w-16" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
