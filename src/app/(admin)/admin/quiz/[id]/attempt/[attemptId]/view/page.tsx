import { Metadata } from "next";
import { Suspense } from "react";
import QuizAttemptDetailView from "@/components/admin/quiz/QuizAttemptDetailView";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Quiz Attempt Details - Admin",
  description: "View detailed quiz attempt analysis",
};

interface PageProps {
  params: Promise<{ id: string; attemptId: string }>;
}

function QuizAttemptDetailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <CircleNotchIcon className="h-6 w-6 animate-spin text-black dark:text-white" />
        <span className="font-satoshi font-bold text-black dark:text-white">
          Loading attempt details...
        </span>
      </div>
    </div>
  );
}

export default async function QuizAttemptDetailPage({ params }: PageProps) {
  const { id, attemptId } = await params;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<QuizAttemptDetailLoading />}>
          <QuizAttemptDetailView quizId={id} attemptId={attemptId} />
        </Suspense>
      </div>
    </div>
  );
}
