import { Suspense } from "react";
import { Metadata } from "next";
import EditQuizForm from "@/components/admin/quiz/EditQuizForm";

export const metadata: Metadata = {
  title: "Edit Quiz - Notes Buddy Admin",
  description: "Edit an existing quiz for your students",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuizPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Suspense
        fallback={
          <div className="neuro rounded-xl p-6">
            <div className="animate-pulse">
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-300"></div>
              <div className="h-4 w-1/2 rounded bg-gray-300"></div>
            </div>
          </div>
        }
      >
        <EditQuizForm quizId={id} />
      </Suspense>
    </div>
  );
}
