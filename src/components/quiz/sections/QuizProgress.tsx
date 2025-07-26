import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentQuestionIndex,
  totalQuestions,
}: QuizProgressProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-satoshi text-sm font-bold text-black dark:text-white">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <span className="font-satoshi text-sm font-bold text-black dark:text-white">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
}
