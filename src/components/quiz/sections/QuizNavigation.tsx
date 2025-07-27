interface QuizNavigationProps {
  marksPerQuestion: number;
}

export default function QuizNavigation({
  marksPerQuestion,
}: QuizNavigationProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="font-satoshi rounded-lg border-2 border-black bg-zinc-200 px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]">
          {marksPerQuestion} marks
        </div>
      </div>
    </div>
  );
}
