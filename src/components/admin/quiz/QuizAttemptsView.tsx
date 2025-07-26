"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getQuizDetailsAction,
  getQuizAttemptsAction,
} from "../actions/admin-quizzes";
import {
  type QuizDetailsResponse,
  type QuizAttemptWithUser,
} from "@/dal/quiz/types";
import { AttemptStatus } from "@prisma/client";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";
import {
  EyeIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  CalendarIcon,
  ArrowLeftIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react";

interface QuizAttemptsViewProps {
  quizId: string;
}

export default function QuizAttemptsView({ quizId }: QuizAttemptsViewProps) {
  const router = useRouter();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizDetailsResponse | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptWithUser[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<
    QuizAttemptWithUser[]
  >([]);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    setFetchLoading(true);
    setError("");
    try {
      const [quizResult, attemptsResult] = await Promise.all([
        getQuizDetailsAction(quizId),
        getQuizAttemptsAction(quizId),
      ]);

      if (quizResult) {
        setQuizData(quizResult);
      } else {
        setError("Quiz not found");
        return;
      }

      if (attemptsResult.success && attemptsResult.data) {
        setAttempts(attemptsResult.data);
      } else {
        setError(attemptsResult.error || "Failed to load attempts");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An unexpected error occurred");
    } finally {
      setFetchLoading(false);
    }
  }, [quizId]);

  const applyFilters = useCallback(() => {
    let filtered = [...attempts];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((attempt) => attempt.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (attempt) =>
          attempt.user.displayName?.toLowerCase().includes(term) ||
          attempt.user.email?.toLowerCase().includes(term) ||
          attempt.user.rollNumber?.toLowerCase().includes(term),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "score-high":
          return (b.scorePercentage || 0) - (a.scorePercentage || 0);
        case "score-low":
          return (a.scorePercentage || 0) - (b.scorePercentage || 0);
        case "time-high":
          return (b.timeSpentInSeconds || 0) - (a.timeSpentInSeconds || 0);
        case "time-low":
          return (a.timeSpentInSeconds || 0) - (b.timeSpentInSeconds || 0);
        default:
          return 0;
      }
    });

    setFilteredAttempts(filtered);
    setCurrentPage(1);
  }, [attempts, statusFilter, searchTerm, sortBy]);

  useEffect(() => {
    if (quizId) {
      fetchData();
    }
  }, [quizId, fetchData]);

  useEffect(() => {
    applyFilters();
  }, [attempts, statusFilter, searchTerm, sortBy, applyFilters]);

  const getStatusIcon = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case AttemptStatus.IN_PROGRESS:
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case AttemptStatus.ABANDONED:
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case AttemptStatus.TIME_UP:
        return <WarningCircleIcon className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AttemptStatus) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold";

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateStats = () => {
    const total = attempts.length;
    const completed = attempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED,
    ).length;
    const inProgress = attempts.filter(
      (a) => a.status === AttemptStatus.IN_PROGRESS,
    ).length;
    const abandoned = attempts.filter(
      (a) => a.status === AttemptStatus.ABANDONED,
    ).length;
    const timedOut = attempts.filter(
      (a) => a.status === AttemptStatus.TIME_UP,
    ).length;

    const completedAttempts = attempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED,
    );
    const avgScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce(
            (sum, a) => sum + (a.scorePercentage || 0),
            0,
          ) / completedAttempts.length
        : 0;

    const avgTime =
      completedAttempts.length > 0
        ? completedAttempts.reduce(
            (sum, a) => sum + (a.timeSpentInSeconds || 0),
            0,
          ) / completedAttempts.length
        : 0;

    return {
      total,
      completed,
      inProgress,
      abandoned,
      timedOut,
      avgScore,
      avgTime,
    };
  };

  const stats = quizData ? calculateStats() : null;

  // Pagination
  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttempts = filteredAttempts.slice(startIndex, endIndex);

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="neuro rounded-xl p-6">
          <div className="animate-pulse">
            <div className="mb-2 h-8 w-1/3 rounded bg-gray-300"></div>
            <div className="h-4 w-2/3 rounded bg-gray-300"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="neuro rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/4 rounded bg-gray-300"></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-20 rounded bg-gray-300"></div>
              <div className="h-20 rounded bg-gray-300"></div>
              <div className="h-20 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="neuro rounded-xl p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/admin/quiz")}
              variant="outline"
              className="neuro-button font-satoshi font-bold"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Quizzes
            </Button>
            <div>
              <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
                <TrophyIcon className="h-8 w-8 text-yellow-600" />
                Quiz Attempts
              </h1>
              <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
                View and analyze user attempts for this quiz
              </p>
            </div>
          </div>
        </div>

        <div className="neuro-danger rounded-xl p-6">
          <p className="font-satoshi font-bold text-red-600 dark:text-red-400">
            {error || "Quiz not found"}
          </p>
          <Button
            onClick={() => router.push("/admin/quiz")}
            className="neuro-button font-satoshi mt-4 font-bold"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neuro rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/admin/quiz")}
            variant="outline"
            className="neuro-button font-satoshi font-bold"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Quizzes
          </Button>
          <div>
            <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
              <TrophyIcon className="h-8 w-8" />
              Quiz Attempts: {quizData.title}
            </h1>
            <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
              View and analyze user attempts for this quiz
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Information */}
      <div className="neuro rounded-xl p-6">
        <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
          Quiz Information
        </h2>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrophyIcon type="duotone" className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Subject
              </span>
            </div>
            <p className="font-satoshi font-bold text-black dark:text-white">
              {quizData.subject}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                University
              </span>
            </div>
            <p className="font-satoshi font-bold text-black dark:text-white">
              {getDisplayNameFromPrismaValue("university", quizData.university)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Questions
              </span>
            </div>
            <p className="font-satoshi font-bold text-black dark:text-white">
              {quizData.questionCount}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Marks/Q
              </span>
            </div>
            <p className="font-satoshi font-bold text-black dark:text-white">
              {quizData.marksPerQuestion}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Time Limit
              </span>
            </div>
            <p className="font-satoshi font-bold text-black dark:text-white">
              {quizData.timeLimit ? `${quizData.timeLimit}m` : "No limit"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Status
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {quizData.isActive && (
                <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              )}
              {quizData.isPublished && (
                <span className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Published
                </span>
              )}
              {quizData.isPremium && (
                <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="neuro rounded-xl p-6">
          <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
            Attempt Statistics
          </h2>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                Total Attempts
              </span>
              <p className="font-excon text-2xl font-black text-black dark:text-white">
                {stats.total}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">Completed</span>
              <p className="font-excon text-2xl font-black">
                {stats.completed}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">
                In Progress
              </span>
              <p className="font-excon text-2xl font-black">
                {stats.inProgress}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">Abandoned</span>
              <p className="font-excon text-2xl font-black">
                {stats.abandoned}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">Timed Out</span>
              <p className="font-excon text-2xl font-black">{stats.timedOut}</p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">Avg Score</span>
              <p className="font-excon text-2xl font-black">
                {stats.avgScore.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-satoshi text-sm font-bold">Avg Time</span>
              <p className="font-excon text-xl font-black">
                {formatDuration(Math.round(stats.avgTime))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="neuro rounded-xl p-6">
        <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
          Filter & Search
        </h2>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Search Users
            </Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email, or roll number"
              className="neuro-sm font-satoshi font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Status Filter
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={AttemptStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={AttemptStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={AttemptStatus.ABANDONED}>
                  Abandoned
                </SelectItem>
                <SelectItem value={AttemptStatus.TIME_UP}>Time Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="neuro-sm font-satoshi font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="score-high">Score (High to Low)</SelectItem>
                <SelectItem value="score-low">Score (Low to High)</SelectItem>
                <SelectItem value="time-high">Time (High to Low)</SelectItem>
                <SelectItem value="time-low">Time (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Results
            </Label>
            <div className="flex h-10 items-center gap-2">
              <span className="font-satoshi font-bold text-black dark:text-white">
                {filteredAttempts.length} of {attempts.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="neuro rounded-xl p-6">
        <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
          Attempts ({filteredAttempts.length})
        </h2>

        {paginatedAttempts.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border-2 border-black/10 dark:border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      User
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Status
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Score
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Time Spent
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Started At
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Completed At
                    </TableHead>
                    <TableHead className="font-excon font-black text-black dark:text-white">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttempts.map((attempt) => (
                    <TableRow
                      key={attempt.id}
                      className="border-b border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-satoshi font-bold text-black dark:text-white">
                            {attempt.user.displayName || "N/A"}
                          </p>
                          <p className="font-satoshi text-sm text-black/70 dark:text-white/70">
                            {attempt.user.email}
                          </p>
                          {attempt.user.rollNumber && (
                            <p className="font-satoshi text-xs text-black/50 dark:text-white/50">
                              Roll: {attempt.user.rollNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className={getStatusBadge(attempt.status)}>
                          {getStatusIcon(attempt.status)}
                          {getStatusDisplay(attempt.status)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {attempt.scorePercentage !== null ? (
                            <>
                              <p className="font-satoshi font-bold text-black dark:text-white">
                                {attempt.scorePercentage.toFixed(1)}%
                              </p>
                              <p className="font-satoshi text-sm text-black/70 dark:text-white/70">
                                {attempt.scoreObtained}/{attempt.totalScore}
                              </p>
                            </>
                          ) : (
                            <span className="font-satoshi text-black/50 dark:text-white/50">
                              N/A
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-satoshi font-bold text-black dark:text-white">
                          {formatDuration(attempt.timeSpentInSeconds)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-satoshi font-bold text-black dark:text-white">
                          {formatDate(attempt.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-satoshi font-bold text-black dark:text-white">
                          {attempt.completedAt
                            ? formatDate(attempt.completedAt)
                            : "N/A"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Button
                          className="neuro-button-sm font-satoshi font-bold"
                          onClick={() => {
                            router.push(
                              `/admin/quiz/${quizId}/attempt/${attempt.id}/view`,
                            );
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="font-satoshi text-sm text-black/70 dark:text-white/70">
                    ({startIndex + 1}-
                    {Math.min(endIndex, filteredAttempts.length)} of{" "}
                    {filteredAttempts.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="neuro-button font-satoshi font-bold"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="neuro-button font-satoshi font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <TrophyIcon className="mx-auto mb-4 h-16 w-16 text-black/30 dark:text-white/30" />
            <h3 className="font-excon mb-2 text-xl font-black text-black dark:text-white">
              No attempts found
            </h3>
            <p className="font-satoshi text-black/70 dark:text-white/70">
              {attempts.length === 0
                ? "No one has attempted this quiz yet."
                : "No attempts match your current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
