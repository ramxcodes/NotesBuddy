import { Metadata } from "next";
import { Suspense } from "react";
import CreateQuizForm from "@/components/admin/quiz/CreateQuizForm";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Create Quiz - Admin",
  description: "Create a new quiz for students",
};

function CreateQuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <CircleNotchIcon className="h-6 w-6 animate-spin text-black dark:text-white" />
        <span className="font-satoshi font-bold text-black dark:text-white">
          Loading create quiz form...
        </span>
      </div>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<CreateQuizLoading />}>
          <CreateQuizForm />
        </Suspense>
      </div>
    </div>
  );
}
