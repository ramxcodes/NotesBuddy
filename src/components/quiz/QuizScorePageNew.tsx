"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getQuizScoreAction } from "@/components/quiz/actions/quiz-score";
import ScoreLoading from "@/components/quiz/sections/ScoreLoading";
import ScoreError from "@/components/quiz/sections/ScoreError";
import ScoreHeader from "@/components/quiz/sections/ScoreHeader";
import ScoreCard from "@/components/quiz/sections/ScoreCard";
import ScoreBreakdown from "@/components/quiz/sections/ScoreBreakdown";
import ScoreActions from "@/components/quiz/sections/ScoreActions";

interface ScoreData {
  attemptId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number | null;
  completedAt: Date;
  quiz: {
    id: string;
    title: string;
    subject: string;
    marksPerQuestion: number;
    questionCount: number;
  };
  breakdown?: {
    questionId: string;
    question: string;
    selectedOptionId: string | null;
    selectedOptionText: string | null;
    correctOptionText: string;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
}

export default function QuizScorePage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScore = async () => {
      if (!attemptId) {
        setError("No attempt ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getQuizScoreAction(attemptId, true);

        if (!result.success) {
          setError(result.error || "Failed to load quiz results");
          return;
        }

        if (!result.score) {
          setError("No score data found");
          return;
        }

        setScoreData(result.score);
      } catch (err) {
        console.error("Error loading quiz score:", err);
        setError("Failed to load quiz results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadScore();
  }, [attemptId]);

  if (loading) {
    return <ScoreLoading />;
  }

  if (error || !scoreData) {
    return <ScoreError error={error || "Failed to load quiz results"} />;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <ScoreHeader
          quizTitle={scoreData.quiz.title}
          quizSubject={scoreData.quiz.subject}
        />

        {/* Score Card */}
        <ScoreCard scoreData={scoreData} />

        {/* Question Breakdown */}
        {scoreData.breakdown && (
          <ScoreBreakdown
            breakdown={scoreData.breakdown}
            marksPerQuestion={scoreData.quiz.marksPerQuestion}
            showBreakdown={showBreakdown}
            onToggleBreakdown={setShowBreakdown}
          />
        )}

        {/* Actions */}
        <ScoreActions />
      </div>
    </div>
  );
}
