import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import QuizScoreController from "@/components/quiz/QuizScoreController";

export default async function ScorePage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <QuizScoreController />;
}
