"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusIcon,
  QuestionIcon,
  TrendUpIcon,
  EyeIcon,
  ChartBarIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type { QuizStats } from "@/dal/quiz/types";

interface AdminQuizHeaderProps {
  stats: QuizStats | null;
  onCreateQuiz: () => void;
}

export default function AdminQuizHeader({
  stats,
  onCreateQuiz,
}: AdminQuizHeaderProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Management</h1>
          <p className="text-muted-foreground">
            Create and manage educational quizzes for students
          </p>
        </div>
        <Button
          onClick={onCreateQuiz}
          className="border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <PlusIcon weight="duotone" className="h-5 w-5" />
          Create Quiz
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quizzes
              </CardTitle>
              <QuestionIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalQuizzes)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Quizzes
              </CardTitle>
              <TrendUpIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.activeQuizzes)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.totalQuizzes > 0
                  ? Math.round((stats.activeQuizzes / stats.totalQuizzes) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <EyeIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.publishedQuizzes)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.totalQuizzes > 0
                  ? Math.round(
                      (stats.publishedQuizzes / stats.totalQuizzes) * 100,
                    )
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Questions
              </CardTitle>
              <ChartBarIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalQuestions)}
              </div>
              <p className="text-muted-foreground text-xs">
                Across all quizzes
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Attempts
              </CardTitle>
              <UserIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalAttempts)}
              </div>
              <p className="text-muted-foreground text-xs">
                Student interactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
