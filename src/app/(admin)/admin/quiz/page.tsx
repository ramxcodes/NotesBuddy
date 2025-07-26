import AdminQuizController from "@/components/admin/quiz/AdminQuizController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Management",
  description: "Admin panel for managing quizzes and quiz attempts",
};

export default function QuizPage() {
  return (
    <div className="space-y-8">
      <AdminQuizController />
    </div>
  );
}
