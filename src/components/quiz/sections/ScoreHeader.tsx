import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";

interface ScoreHeaderProps {
  quizTitle: string;
  quizSubject: string;
}

export default function ScoreHeader({
  quizTitle,
  quizSubject,
}: ScoreHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={() => router.push("/quiz")}
        className="mb-4 rounded-xl border-2 border-black bg-zinc-100 font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Quizzes
      </Button>

      <h1 className="font-excon text-3xl font-black text-black dark:text-white">
        Quiz Results
      </h1>
      <p className="font-satoshi text-black dark:text-white">
        {quizTitle} • {quizSubject}
      </p>
    </div>
  );
}
