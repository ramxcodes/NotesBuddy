import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ScoreActions() {
  const router = useRouter();

  return (
    <div className="mt-6 flex justify-center gap-4">
      <Button
        onClick={() => router.push("/quiz")}
        className="rounded-md border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
        data-umami-event="quiz-score-take-another"
      >
        Take Another Quiz
      </Button>
    </div>
  );
}
