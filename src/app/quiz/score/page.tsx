import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import QuizScoreController from "@/components/quiz/QuizScoreController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Score",
  description: "View your quiz score and results.",
};

export default async function ScorePage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <QuizScoreController />;
}
