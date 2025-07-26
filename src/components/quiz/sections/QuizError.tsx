import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircleIcon } from "@phosphor-icons/react";

interface QuizErrorProps {
  error: string;
}

export default function QuizError({ error }: QuizErrorProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md rounded-xl border-2 border-black bg-zinc-100 p-6 text-center shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <div>
          <XCircleIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="font-excon mb-2 text-xl font-black text-red-600">
            Error
          </h2>
          <p className="font-satoshi mb-4 text-black dark:text-white">
            {error}
          </p>
          <Button
            onClick={() => router.push("/quiz")}
            className="rounded-xl border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    </div>
  );
}
