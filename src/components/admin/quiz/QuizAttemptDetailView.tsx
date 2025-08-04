"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getQuizAttemptDetailsAction,
  getQuizDetailsAction,
} from "../actions/admin-quizzes";
import {
  type QuizAttemptDetails,
  type QuizDetailsResponse,
} from "@/dal/quiz/types";
import { AttemptStatus } from "@prisma/client";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  CalendarIcon,
  UserIcon,
  ListIcon,
  QuestionIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

interface QuizAttemptDetailViewProps {
  quizId: string;
  attemptId: string;
}

export default function QuizAttemptDetailView({
  quizId,
  attemptId,
}: QuizAttemptDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attemptDetails, setAttemptDetails] =
    useState<QuizAttemptDetails | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizDetailsResponse | null>(
    null,
  );
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [attemptResult, quizResult] = await Promise.all([
        getQuizAttemptDetailsAction(attemptId),
        getQuizDetailsAction(quizId),
      ]);

      if (!attemptResult) {
        setError("Quiz attempt not found");
        return;
      }

      if (!quizResult) {
        setError("Quiz not found");
        return;
      }

      setAttemptDetails(attemptResult);
      setQuizDetails(quizResult);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [attemptId, quizId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusIcon = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case AttemptStatus.IN_PROGRESS:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case AttemptStatus.ABANDONED:
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case AttemptStatus.TIME_UP:
        return <WarningCircleIcon className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AttemptStatus) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold";

    switch (status) {
      case AttemptStatus.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case AttemptStatus.IN_PROGRESS:
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case AttemptStatus.ABANDONED:
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      case AttemptStatus.TIME_UP:
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
    }
  };

  const getStatusDisplay = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.COMPLETED:
        return "Completed";
      case AttemptStatus.IN_PROGRESS:
        return "In Progress";
      case AttemptStatus.ABANDONED:
        return "Abandoned";
      case AttemptStatus.TIME_UP:
        return "Time Up";
      default:
        return status;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="neuro rounded-md p-6">
          <div className="animate-pulse">
            <div className="mb-2 h-8 w-1/3 rounded bg-gray-300"></div>
            <div className="h-4 w-2/3 rounded bg-gray-300"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="neuro rounded-md p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-1/4 rounded bg-gray-300"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 rounded bg-gray-300"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="neuro rounded-md p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-1/3 rounded bg-gray-300"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-gray-300"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attemptDetails || !quizDetails) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="neuro rounded-md p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/admin/quiz/${quizId}/attempts`)}
              variant="outline"
              className="neuro-button font-satoshi font-bold"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Attempts
            </Button>
            <div>
              <h1 className="font-excon text-3xl font-black text-black dark:text-white">
                Attempt Details
              </h1>
            </div>
          </div>
        </div>

        <div className="neuro-danger rounded-md p-6">
          <p className="font-satoshi font-bold text-red-600 dark:text-red-400">
            {error || "Attempt details not found"}
          </p>
          <Button
            onClick={() => router.push(`/admin/quiz/${quizId}/attempts`)}
            className="neuro-button font-satoshi mt-4 font-bold"
          >
            Back to Attempts
          </Button>
        </div>
      </div>
    );
  }

  const correctAnswers = attemptDetails.answers.filter(
    (a) => a.isCorrect,
  ).length;
  const totalQuestions = attemptDetails.answers.length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neuro rounded-md p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/admin/quiz/${quizId}/attempts`)}
            variant="outline"
            className="neuro-button font-satoshi font-bold"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Attempts
          </Button>
          <div className="flex-1">
            <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
              <TrophyIcon className="h-8 w-8" />
              Attempt Details
            </h1>
            <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
              {quizDetails.title} - {attemptDetails.userName}
            </p>
          </div>
          <div className={getStatusBadge(attemptDetails.status)}>
            {getStatusIcon(attemptDetails.status)}
            {getStatusDisplay(attemptDetails.status)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Question Breakdown */}
        <div className="lg:col-span-2">
          <div className="neuro rounded-md p-6">
            <h2 className="font-excon mb-6 flex items-center gap-2 text-xl font-black text-black dark:text-white">
              <QuestionIcon className="h-6 w-6" />
              Question-by-Question Analysis
            </h2>

            <div className="space-y-4">
              {attemptDetails.answers.map((answer, index) => (
                <Card key={answer.questionId} className="neuro-sm border-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-satoshi text-lg font-bold text-black dark:text-white">
                        Question {index + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {answer.isCorrect ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircleIcon className="mr-1 h-3 w-3" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <XCircleIcon className="mr-1 h-3 w-3" />
                            Incorrect
                          </Badge>
                        )}
                        <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                          {answer.marksAwarded}/{quizDetails.marksPerQuestion}{" "}
                          marks
                        </span>
                      </div>
                    </div>
                    <CardDescription className="font-satoshi font-semibold text-black/80 dark:text-white/80">
                      {answer.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                            Selected:
                          </span>
                          <span
                            className={`font-satoshi font-bold ${
                              answer.isCorrect
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            }`}
                          >
                            {answer.selectedOptionText || "No answer selected"}
                          </span>
                        </div>
                        {!answer.isCorrect && (
                          <div className="flex items-start gap-2">
                            <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                              Correct:
                            </span>
                            <span className="font-satoshi font-bold text-green-700 dark:text-green-400">
                              {answer.correctOptionText}
                            </span>
                          </div>
                        )}
                      </div>
                      {answer.timeTaken && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClockIcon className="h-4 w-4 text-black/50 dark:text-white/50" />
                          <span className="font-satoshi font-bold text-black/70 dark:text-white/70">
                            Time taken: {formatDuration(answer.timeTaken)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Summary & Quiz Info */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="neuro rounded-md p-6">
            <h3 className="font-excon mb-4 flex items-center gap-2 text-lg font-black text-black dark:text-white">
              <TrophyIcon className="h-5 w-5" />
              Performance Summary
            </h3>

            <div className="space-y-4">
              <div className="text-center">
                <div className="font-excon text-4xl font-black text-black dark:text-white">
                  {attemptDetails.accuracy.toFixed(1)}%
                </div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Overall Accuracy
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="font-excon text-2xl font-black text-green-600">
                    {correctAnswers}
                  </div>
                  <div className="font-satoshi text-xs font-bold text-black/70 dark:text-white/70">
                    Correct
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-excon text-2xl font-black text-red-600">
                    {incorrectAnswers}
                  </div>
                  <div className="font-satoshi text-xs font-bold text-black/70 dark:text-white/70">
                    Incorrect
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Score
                  </span>
                  <span className="font-satoshi font-bold text-black dark:text-white">
                    {attemptDetails.score}/{attemptDetails.totalMarks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Time Spent
                  </span>
                  <span className="font-satoshi font-bold text-black dark:text-white">
                    {formatDuration(attemptDetails.timeTaken)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="neuro rounded-md p-6">
            <h3 className="font-excon mb-4 flex items-center gap-2 text-lg font-black text-black dark:text-white">
              <UserIcon className="h-5 w-5" />
              User Information
            </h3>

            <div className="space-y-3">
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Name
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {attemptDetails.userName}
                </div>
              </div>
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Email
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {attemptDetails.userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Information */}
          <div className="neuro rounded-md p-6">
            <h3 className="font-excon mb-4 flex items-center gap-2 text-lg font-black text-black dark:text-white">
              <ListIcon className="h-5 w-5" />
              Quiz Information
            </h3>

            <div className="space-y-3">
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Subject
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {quizDetails.subject}
                </div>
              </div>
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Academic Details
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {getDisplayNameFromPrismaValue(
                    "university",
                    quizDetails.university,
                  )}{" "}
                  •{" "}
                  {getDisplayNameFromPrismaValue("degree", quizDetails.degree)}{" "}
                  • {getDisplayNameFromPrismaValue("year", quizDetails.year)} •{" "}
                  {getDisplayNameFromPrismaValue(
                    "semester",
                    quizDetails.semester,
                  )}
                </div>
              </div>
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Total Questions
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {totalQuestions}
                </div>
              </div>
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Marks per Question
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {quizDetails.marksPerQuestion}
                </div>
              </div>
              {quizDetails.timeLimit && (
                <div>
                  <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Time Limit
                  </div>
                  <div className="font-satoshi font-bold text-black dark:text-white">
                    {quizDetails.timeLimit} minutes
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attempt Timeline */}
          <div className="neuro rounded-md p-6">
            <h3 className="font-excon mb-4 flex items-center gap-2 text-lg font-black text-black dark:text-white">
              <CalendarIcon className="h-5 w-5" />
              Attempt Timeline
            </h3>

            <div className="space-y-3">
              <div>
                <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Started At
                </div>
                <div className="font-satoshi font-bold text-black dark:text-white">
                  {formatDate(attemptDetails.startedAt)}
                </div>
              </div>
              {attemptDetails.completedAt && (
                <div>
                  <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Completed At
                  </div>
                  <div className="font-satoshi font-bold text-black dark:text-white">
                    {formatDate(attemptDetails.completedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
