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
}

export default function QuizQuestion({
  question,
  answers,
  submitting,
  onAnswerSelect,
}: QuizQuestionProps) {
  return (
    <div className="mb-6 rounded-md border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="p-8">
        <h2 className="font-excon mb-6 text-xl font-black text-black dark:text-white">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onAnswerSelect(option.id)}
              disabled={submitting}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                answers[question.id] === option.id
                  ? "border-blue-600 bg-blue-100 shadow-[2px_2px_0px_0px_#000] dark:bg-blue-900/30"
                  : "border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-800"
              } ${submitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${
                    answers[question.id] === option.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-black bg-white text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-satoshi font-medium text-black dark:text-white">
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
