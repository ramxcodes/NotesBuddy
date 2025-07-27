import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import {
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react";

interface ScoreData {
  score: number;
  totalMarks: number;
  timeTaken: number | null;
  breakdown?: {
    isCorrect: boolean;
  }[];
}

interface ScoreCardProps {
  scoreData: ScoreData;
}

export default function ScoreCard({ scoreData }: ScoreCardProps) {
  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return "Excellent! Outstanding performance! 🎉";
    if (accuracy >= 80) return "Great job! Well done! 👏";
    if (accuracy >= 70) return "Good work! Keep it up! 👍";
    if (accuracy >= 60) return "Not bad! Room for improvement. 📚";
    if (accuracy >= 50) return "Keep practicing! You can do better. 💪";
    return "Don't give up! Practice makes perfect. 🌟";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const percentage = (scoreData.score / scoreData.totalMarks) * 100;
  const correctAnswers =
    scoreData.breakdown?.filter((q) => q.isCorrect).length || 0;
  const wrongAnswers = (scoreData.breakdown?.length || 0) - correctAnswers;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 rounded-xl border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black bg-yellow-400 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            <TrophyIcon className="h-12 w-12 text-black" weight="fill" />
          </div>
          <h2 className="font-excon text-2xl font-black text-black dark:text-white">
            Your Score
          </h2>
        </div>
        <div className="space-y-6 p-8 pt-0">
          {/* Main Score */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`font-excon text-6xl font-black ${getScoreColor(percentage)}`}
            >
              {scoreData.score}/{scoreData.totalMarks}
            </motion.div>
            <div
              className={`font-excon text-3xl font-black ${getScoreColor(percentage)}`}
            >
              {percentage.toFixed(1)}%
            </div>
            <p className="font-satoshi mt-2 text-lg font-bold text-black dark:text-white">
              {getPerformanceMessage(percentage)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-black dark:text-white">
              <span>Accuracy</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border-2 border-black bg-white p-4 text-center shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <CheckCircleIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="font-excon text-2xl font-black text-green-600">
                {correctAnswers}
              </div>
              <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                Correct
              </div>
            </div>

            <div className="rounded-lg border-2 border-black bg-white p-4 text-center shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <XCircleIcon className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <div className="font-excon text-2xl font-black text-red-500">
                {wrongAnswers}
              </div>
              <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                Wrong
              </div>
            </div>

            {scoreData.timeTaken && (
              <div className="rounded-lg border-2 border-black bg-white p-4 text-center shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <ClockIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <div className="font-excon text-2xl font-black text-blue-600">
                  {formatTime(scoreData.timeTaken)}
                </div>
                <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                  Time Taken
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
