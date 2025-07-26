import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import QuizAttemptController from "@/components/quiz/QuizAttemptController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attempting Quiz",
  description: "Attempt a quiz and track your progress.",
};

interface AttemptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AttemptPage({ params }: AttemptPageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  return <QuizAttemptController quizId={id} />;
}
