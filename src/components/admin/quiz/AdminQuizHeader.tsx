"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, QuestionIcon } from "@phosphor-icons/react";

interface AdminQuizHeaderProps {
  onCreateQuiz: () => void;
}

export default function AdminQuizHeader({
  onCreateQuiz,
}: AdminQuizHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
          <QuestionIcon weight="duotone" className="h-8 w-8" />
          Quiz Management
        </h1>
        <p className="font-satoshi text-lg font-bold text-black/70 dark:text-white/70">
          Create, manage, and monitor educational quizzes for students
        </p>
      </div>
      <Button
        onClick={onCreateQuiz}
        className="neuro-button font-satoshi rounded-xl font-bold"
      >
        <PlusIcon weight="duotone" className="h-5 w-5" />
        Create Quiz
      </Button>
    </div>
  );
}
