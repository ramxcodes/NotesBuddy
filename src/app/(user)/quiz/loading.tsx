import QuizListSkeleton from "@/components/quiz/QuizListSkeleton";

export default function QuizLoading() {
  return (
    <div className="container mx-4 flex min-h-screen max-w-6xl items-center justify-center">
      <div className="mb-8">
        <div className="mb-2 h-10 w-80 animate-pulse rounded" />
        <div className="h-6 w-96 animate-pulse rounded" />
      </div>
      <QuizListSkeleton />
    </div>
  );
}
