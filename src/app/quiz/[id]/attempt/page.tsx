import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import QuizAttemptController from "@/components/quiz/QuizAttemptController";

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
