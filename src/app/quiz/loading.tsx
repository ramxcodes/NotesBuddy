import QuizListSkeleton from "@/components/quiz/QuizListSkeleton";

export default function QuizLoading() {
  return (
    <div className="container min-h-screen max-w-6xl mx-4">
      <div className="mb-8">
        <div className="mb-2 h-10 w-80 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        <div className="h-6 w-96 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
      </div>

      <QuizListSkeleton />
    </div>
  );
}
