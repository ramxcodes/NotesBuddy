import { Metadata } from "next";
import { Suspense } from "react";
import QuizAttemptsView from "@/components/admin/quiz/QuizAttemptsView";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Quiz Attempts - Admin",
  description: "View and analyze quiz attempts",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function QuizAttemptsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <CircleNotchIcon className="h-6 w-6 animate-spin text-black dark:text-white" />
        <span className="font-satoshi font-bold text-black dark:text-white">
          Loading quiz attempts...
        </span>
      </div>
    </div>
  );
}

export default async function QuizAttemptsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<QuizAttemptsLoading />}>
          <QuizAttemptsView quizId={id} />
        </Suspense>
      </div>
    </div>
  );
}
