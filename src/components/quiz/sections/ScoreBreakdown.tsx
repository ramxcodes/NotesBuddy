import { motion } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircleIcon,
  XCircleIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";

interface QuestionBreakdown {
  questionId: string;
  question: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionText: string;
  isCorrect: boolean;
  marksAwarded: number;
}

interface ScoreBreakdownProps {
  breakdown: QuestionBreakdown[];
  marksPerQuestion: number;
  showBreakdown: boolean;
  onToggleBreakdown: (open: boolean) => void;
}

export default function ScoreBreakdown({
  breakdown,
  marksPerQuestion,
  showBreakdown,
  onToggleBreakdown,
}: ScoreBreakdownProps) {
  return (
    <div className="rounded-xl border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <Collapsible open={showBreakdown} onOpenChange={onToggleBreakdown}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer p-6 hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-excon text-xl font-black text-black dark:text-white">
                Question-wise Breakdown
              </h3>
              <CaretDownIcon
                className={`h-5 w-5 text-black transition-transform dark:text-white ${
                  showBreakdown ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 p-6 pt-0">
            {breakdown.map((question, index) => (
              <motion.div
                key={question.questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border-2 p-4 ${
                  question.isCorrect
                    ? "border-green-600 bg-green-100 dark:bg-green-900/20"
                    : "border-red-600 bg-red-100 dark:bg-red-900/20"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="font-satoshi font-bold text-black dark:text-white">
                    Q{index + 1}: {question.question}
                  </h4>
                  <div
                    className={`ml-2 flex-shrink-0 rounded-lg border-2 px-2 py-1 text-sm font-bold ${
                      question.isCorrect
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-red-600 bg-red-600 text-white"
                    }`}
                  >
                    {question.isCorrect ? (
                      <CheckCircleIcon className="mr-1 inline h-3 w-3" />
                    ) : (
                      <XCircleIcon className="mr-1 inline h-3 w-3" />
                    )}
                    {question.marksAwarded}/{marksPerQuestion}
                  </div>
                </div>

                <div className="space-y-2">
                  {question.selectedOptionText && (
                    <div className="flex items-center gap-2">
                      <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                        Your answer:
                      </span>
                      <span
                        className={`font-satoshi text-sm font-bold ${
                          question.isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {question.selectedOptionText}
                      </span>
                    </div>
                  )}

                  {!question.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                        Correct answer:
                      </span>
                      <span className="font-satoshi text-sm font-bold text-green-600">
                        {question.correctOptionText}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
