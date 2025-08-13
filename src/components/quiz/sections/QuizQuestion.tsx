interface Question {
  id: string;
  question: string;
  order: number;
  options: {
    id: string;
    text: string;
    order: number;
  }[];
}

interface QuizQuestionProps {
  question: Question;
  answers: Record<string, string>;
  submitting: boolean;
  onAnswerSelect: (optionId: string) => void;
  answerFeedback?: {
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string | null;
    isCorrect: boolean;
  } | null;
}

export default function QuizQuestion({
  question,
  answers,
  submitting,
  onAnswerSelect,
  answerFeedback,
}: QuizQuestionProps) {
  return (
    <div className="mb-6 rounded-md border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="p-8">
        <h2 className="font-excon mb-6 text-xl font-black text-black dark:text-white">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, index) => {
            // Check if feedback is available for this question
            const isFeedbackActive = answerFeedback?.questionId === question.id;
            const isSelectedOption =
              isFeedbackActive && answerFeedback.selectedOptionId === option.id;
            const isCorrectOption =
              isFeedbackActive && answerFeedback.correctOptionId === option.id;
            const isCurrentAnswer = answers[question.id] === option.id;

            // Determine styling based on feedback
            let buttonClassName = "";
            let circleClassName = "";

            if (isFeedbackActive) {
              if (isCorrectOption) {
                // Correct answer - always green
                buttonClassName =
                  "border-green-600 bg-green-100 shadow-[2px_2px_0px_0px_#000] dark:bg-green-900/30";
                circleClassName = "border-green-600 bg-green-600 text-white";
              } else if (isSelectedOption && !answerFeedback.isCorrect) {
                // Wrong selected answer - red
                buttonClassName =
                  "border-red-600 bg-red-100 shadow-[2px_2px_0px_0px_#000] dark:bg-red-900/30";
                circleClassName = "border-red-600 bg-red-600 text-white";
              } else {
                // Other options during feedback - dimmed
                buttonClassName =
                  "border-gray-300 bg-gray-50 shadow-[2px_2px_0px_0px_#000] dark:border-gray-600 dark:bg-gray-800 opacity-60";
                circleClassName =
                  "border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400";
              }
            } else {
              // Normal state (no feedback)
              if (isCurrentAnswer) {
                buttonClassName =
                  "border-blue-600 bg-blue-100 shadow-[2px_2px_0px_0px_#000] dark:bg-blue-900/30";
                circleClassName = "border-blue-600 bg-blue-600 text-white";
              } else {
                buttonClassName =
                  "border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-800";
                circleClassName =
                  "border-black bg-white text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(option.id)}
                disabled={submitting || isFeedbackActive}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${buttonClassName} ${
                  submitting || isFeedbackActive
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${circleClassName}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-satoshi font-medium text-black dark:text-white">
                    {option.text}
                  </span>
                  {isFeedbackActive && isCorrectOption && (
                    <span className="ml-auto font-bold text-green-600">✓</span>
                  )}
                  {isFeedbackActive &&
                    isSelectedOption &&
                    !answerFeedback.isCorrect && (
                      <span className="ml-auto font-bold text-red-600">✗</span>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
