"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilSimpleLineIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { type QuizzesListResponse } from "@/dal/quiz/types";
import {
  getDisplayNameFromPrismaValue,
  normalizedTierValues,
} from "@/utils/academic-config";

interface AdminQuizTableProps {
  quizzesData: QuizzesListResponse;
  onToggleStatus: (quizId: string) => void;
  onTogglePublished: (quizId: string) => void;
  onEditQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onViewAttempts: (quizId: string) => void;
}

export default function AdminQuizTable({
  quizzesData,
  onToggleStatus,
  onTogglePublished,
  onEditQuiz,
  onDeleteQuiz,
  onViewAttempts,
}: AdminQuizTableProps) {
  const tierValues = normalizedTierValues();

  return (
    <div className="neuro rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black hover:bg-zinc-50 dark:border-white dark:hover:bg-zinc-700">
            <TableHead className="font-excon font-black text-black dark:text-white">
              Quiz Details
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Academic Info
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Status
            </TableHead>

            <TableHead className="font-excon font-black text-black dark:text-white">
              Questions
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Attempts
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Settings
            </TableHead>
            <TableHead className="font-excon text-right font-black text-black dark:text-white">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzesData.quizzes.map((quiz) => {
            const isActive = quiz.isActive;
            const isPublished = quiz.isPublished;

            return (
              <tr
                key={quiz.id}
                className="border-b border-black/20 hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-zinc-700"
              >
                {/* Quiz Details */}
                <TableCell className="font-medium">
                  <div className="space-y-2">
                    <div className="font-excon text-lg font-black text-black dark:text-white">
                      {quiz.title}
                    </div>
                    {quiz.description && (
                      <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                        {quiz.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-satoshi text-sm font-bold">
                        {quiz.subject}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Academic Info */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-satoshi text-sm font-bold text-black dark:text-white">
                      {getDisplayNameFromPrismaValue(
                        "university",
                        quiz.university,
                      )}
                    </div>
                    <div className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                      {getDisplayNameFromPrismaValue("degree", quiz.degree)}
                    </div>
                    <div className="font-satoshi text-xs font-bold text-black/50 dark:text-white/50">
                      {getDisplayNameFromPrismaValue("year", quiz.year)} •{" "}
                      {getDisplayNameFromPrismaValue("semester", quiz.semester)}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {/* Active/Inactive */}
                    {isActive ? (
                      <Badge className="border-2 text-xs font-bold">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="border-2 border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-900/20 dark:text-gray-300">
                        Inactive
                      </Badge>
                    )}

                    {/* Published/Draft */}
                    {isPublished ? (
                      <Badge className="border-2 text-xs font-bold">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="neuro-warning border-2 text-xs font-bold">
                        Draft
                      </Badge>
                    )}

                    {/* Premium/Free */}
                    {quiz.isPremium ? (
                      <Badge className="border-2 border-purple-300 bg-purple-100 text-xs font-bold text-purple-800 dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
                        {quiz.requiredTier
                          ? tierValues[quiz.requiredTier]
                          : "Premium"}
                      </Badge>
                    ) : (
                      <Badge className="border-2 border-green-300 bg-green-100 text-xs font-bold text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300">
                        Free
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Questions */}
                <TableCell>
                  <div className="font-satoshi font-bold text-black dark:text-white">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"}
                  </div>
                  <div className="font-satoshi text-xs font-bold text-black/70 dark:text-white/70">
                    {quiz.marksPerQuestion} marks each
                  </div>
                </TableCell>

                {/* Attempts */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <div className="font-satoshi font-bold text-black dark:text-white">
                      {quiz.attemptCount}
                    </div>
                  </div>
                  {quiz.isAttempted && (
                    <div className="mt-1 flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3 text-green-600" />
                      <span className="font-satoshi text-xs font-bold text-green-600">
                        Has attempts
                      </span>
                    </div>
                  )}
                </TableCell>

                {/* Settings */}
                <TableCell>
                  <div className="space-y-1">
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span className="font-satoshi text-xs font-bold">
                          {quiz.timeLimit}m limit
                        </span>
                      </div>
                    )}
                    <div className="font-satoshi text-xs font-bold text-black/50 dark:text-white/50">
                      Created {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {/* View Attempts */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAttempts(quiz.id)}
                      className="neuro-button-sm h-8 w-8 p-0"
                    >
                      <EyeIcon className="h-3 w-3 text-black dark:text-white" />
                    </Button>

                    {/* Toggle Active Status */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(quiz.id)}
                      className="neuro-button-sm h-8 w-8 p-0"
                    >
                      {isActive ? (
                        <ToggleRightIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeftIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {/* Toggle Published Status */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTogglePublished(quiz.id)}
                      className="neuro-button-sm h-8 w-8 p-0"
                    >
                      {isPublished ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {/* Edit Quiz */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditQuiz(quiz.id)}
                      className="neuro-button-sm h-8 w-8 p-0"
                    >
                      <PencilSimpleLineIcon className="h-4 w-4 text-black dark:text-white" />
                    </Button>

                    {/* Delete Quiz */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="h-8 w-8 border-2 border-red-500 bg-white p-0 shadow-[2px_2px_0px_0px_#ef4444] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-red-400 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#ef4444]"
                    >
                      <TrashIcon className="h-3 w-3 text-red-500 dark:text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
