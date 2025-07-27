import { ClockIcon } from "@phosphor-icons/react";

interface QuizAttemptHeaderProps {
  quizTitle: string;
  quizSubject: string;
  timeRemaining: number | null;
}

export default function QuizAttemptHeader({
  quizTitle,
  quizSubject,
  timeRemaining,
}: QuizAttemptHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-excon text-2xl font-black text-black dark:text-white">
          {quizTitle}
        </h1>
        <p className="font-satoshi text-black dark:text-white">{quizSubject}</p>
      </div>

      {timeRemaining && (
        <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-zinc-100 px-3 py-2 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
          <ClockIcon className="h-5 w-5 text-red-500" />
          <span
            className={`font-mono text-lg font-bold ${
              timeRemaining < 300
                ? "text-red-500"
                : "text-black dark:text-white"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}
    </div>
  );
}
