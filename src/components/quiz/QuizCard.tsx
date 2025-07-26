"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  TrophyIcon,
  QuestionIcon,
  GraduationCapIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import type { UserQuizListItem } from "@/dal/quiz/user-query";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";
import { formatDistanceToNow } from "date-fns";

interface QuizCardProps {
  quiz: UserQuizListItem;
  isAuthenticated: boolean;
}

export default function QuizCard({ quiz, isAuthenticated }: QuizCardProps) {
  const {
    id,
    title,
    description,
    subject,
    university,
    degree,
    year,
    semester,
    timeLimit,
    marksPerQuestion,
    isPremium,
    requiredTier,
    questionCount,
    hasAttempted,
    bestScore,
    bestAccuracy,
    lastAttemptDate,
    totalAttempts,
    userAttempts,
  } = quiz;

  const formatScore = (score: number, totalMarks: number) => {
    const percentage = (score / totalMarks) * 100;
    return `${score}/${totalMarks} (${percentage.toFixed(1)}%)`;
  };

  const formatAccuracy = (accuracy: number) => {
    return `${accuracy.toFixed(1)}%`;
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 dark:text-green-400";
    if (accuracy >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const lastAttempt = userAttempts?.[0];

  return (
    <div className="neuro group rounded-xl p-6 transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#757373]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-excon mb-2 line-clamp-2 text-xl font-black text-black dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="font-satoshi line-clamp-2 text-sm text-black/70 dark:text-white/70">
              {description}
            </p>
          )}
        </div>

        {/* Premium Badge */}
        {isPremium && (
          <Badge className="ml-2 border-2 border-yellow-500 bg-yellow-100 text-xs font-bold text-yellow-800 dark:border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-400">
            <StarIcon className="mr-1 h-3 w-3" weight="fill" />
            {requiredTier ? `Tier ${requiredTier.split("_")[1]}` : "Premium"}
          </Badge>
        )}
      </div>

      {/* Academic Info */}

      <div className="my-4 flex flex-wrap items-center justify-start gap-2">
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("university", university)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("degree", degree)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("year", year)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("semester", semester)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {subject || "Notes Buddy Quiz"}
        </Badge>
      </div>

      {/* Quiz Stats */}
      <div className="mb-4 flex items-center gap-4 rounded-lg border-2 border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-1">
          <QuestionIcon className="h-4 w-4 text-black/60 dark:text-white/60" />
          <span className="font-satoshi text-sm font-bold text-black dark:text-white">
            {questionCount} Questions
          </span>
        </div>

        <div className="flex items-center gap-1">
          <TrophyIcon className="h-4 w-4 text-black/60 dark:text-white/60" />
          <span className="font-satoshi text-sm font-bold text-black dark:text-white">
            {marksPerQuestion} Mark{marksPerQuestion > 1 ? "s" : ""}/Q
          </span>
        </div>

        {timeLimit && (
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-black/60 dark:text-white/60" />
            <span className="font-satoshi text-sm font-bold text-black dark:text-white">
              {timeLimit}m
            </span>
          </div>
        )}
      </div>

      {/* User Attempt Status */}
      {isAuthenticated && (
        <div className="mb-4">
          {hasAttempted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  weight="fill"
                />
                <span className="font-satoshi text-sm font-bold text-green-600 dark:text-green-400">
                  Attempted {totalAttempts} time{totalAttempts > 1 ? "s" : ""}
                </span>
              </div>

              {/* Best Performance */}
              {bestScore !== null && bestAccuracy !== null && (
                <div className="neuro rounded-lg border-2 border-black bg-green-100 p-3 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-green-900/30 dark:shadow-[4px_4px_0px_0px_#757373]">
                  <h4 className="font-satoshi mb-2 text-sm font-bold text-green-800 dark:text-green-400">
                    Best Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-satoshi text-green-700 dark:text-green-300">
                        Score:
                      </span>
                      <span
                        className={`font-satoshi ml-1 font-bold ${getScoreColor(bestAccuracy)}`}
                      >
                        {formatScore(
                          bestScore,
                          questionCount * marksPerQuestion,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-satoshi text-green-700 dark:text-green-300">
                        Accuracy:
                      </span>
                      <span
                        className={`font-satoshi ml-1 font-bold ${getScoreColor(bestAccuracy)}`}
                      >
                        {formatAccuracy(bestAccuracy)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Attempt */}
              {lastAttempt && (
                <div className="neuro dark:border-whitedark:shadow-[4px_4px_0px_0px_#757373] rounded-lg border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
                  <h4 className="font-satoshi mb-2 text-sm font-bold">
                    Last Attempt
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-satoshi">Score:</span>
                      <span className={`font-satoshi } ml-1 font-bold`}>
                        {formatScore(lastAttempt.score, lastAttempt.totalMarks)}
                      </span>
                    </div>
                    <div>
                      <span className="font-satoshi">Time:</span>
                      <span className="font-satoshi ml-1 font-bold">
                        {lastAttemptDate &&
                          formatDistanceToNow(new Date(lastAttemptDate), {
                            addSuffix: true,
                          })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-gray-400 dark:border-gray-500" />
              <span className="font-satoshi text-sm font-bold text-gray-600 dark:text-gray-400">
                Not attempted yet
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        {isAuthenticated ? (
          <Link href={`/quiz/${id}/attempt`}>
            <Button className="neuro-button font-satoshi w-full font-bold transition-all">
              {hasAttempted ? (
                <>
                  <ArrowCounterClockwiseIcon className="mr-2 h-4 w-4" />
                  Give Quiz Again
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" weight="fill" />
                  Give Quiz
                </>
              )}
            </Button>
          </Link>
        ) : (
          <Link href="/auth/signin">
            <Button className="neuro-button font-satoshi w-full font-bold transition-all">
              <PlayIcon className="mr-2 h-4 w-4" weight="fill" />
              Login to Take Quiz
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
