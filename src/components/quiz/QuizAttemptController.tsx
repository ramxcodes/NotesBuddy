"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getQuizForAttemptAction,
  startQuizAttemptAction,
  getQuizAttemptAction,
  submitAnswerAction,
  completeQuizAttemptAction,
} from "@/components/quiz/actions/quiz-attempt";
import QuizLoading from "@/components/quiz/sections/QuizLoading";
import QuizError from "@/components/quiz/sections/QuizError";
import QuizCountdown from "@/components/quiz/sections/QuizCountdown";
import QuizAttemptHeader from "@/components/quiz/sections/QuizAttemptHeader";
import QuizProgress from "@/components/quiz/sections/QuizProgress";
import QuizQuestion from "@/components/quiz/sections/QuizQuestion";
import QuizNavigation from "@/components/quiz/sections/QuizNavigation";

interface QuizAttemptControllerProps {
  quizId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  timeLimit: number | null;
  marksPerQuestion: number;
  questions: {
    id: string;
    question: string;
    order: number;
    options: {
      id: string;
      text: string;
      order: number;
    }[];
  }[];
}

interface Attempt {
  id: string;
  startedAt: Date;
  totalMarks: number;
  questionSeed: number;
  optionSeed: number;
}

export default function QuizAttemptController({
  quizId,
}: QuizAttemptControllerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string | null;
    isCorrect: boolean;
  } | null>(null);

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check access and get quiz data
        const accessResult = await getQuizForAttemptAction(quizId);

        if (!accessResult.canAccess) {
          setError(accessResult.message || "Access denied");
          return;
        }

        if (!accessResult.quiz) {
          setError("Quiz data not found");
          return;
        }

        setQuiz(accessResult.quiz as Quiz);

        // Start countdown only if quiz hasn't been started yet
        if (!quizStarted) {
          setCountdown(3);
        }
      } catch (err) {
        console.error("Error initializing quiz:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Only initialize if we haven't started the quiz yet
    if (!quizStarted) {
      initializeQuiz();
    }
  }, [quizId, quizStarted]);

  const startQuiz = async () => {
    try {
      // Start quiz attempt
      const startResult = await startQuizAttemptAction(quizId);

      if (!startResult.success) {
        setError(startResult.message || "Failed to start quiz");
        return;
      }

      if (!startResult.attemptId) {
        setError("No attempt ID received");
        return;
      }

      // Get attempt details
      const attemptResult = await getQuizAttemptAction(startResult.attemptId);

      if (!attemptResult.success) {
        setError(attemptResult.error || "Failed to load quiz");
        return;
      }

      setAttempt(attemptResult.attempt as Attempt);
      setQuiz(attemptResult.quiz as Quiz);
      setQuizStarted(true);
      setAnswers(
        Object.fromEntries(
          Object.entries(attemptResult.answers || {}).filter(
            ([, value]) => value !== null,
          ),
        ) as Record<string, string>,
      );

      // Set timer if quiz has time limit
      if (attemptResult.quiz?.timeLimit) {
        setTimeRemaining(attemptResult.quiz.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError("Failed to start quiz. Please try again.");
    }
  };

  const handleCompleteQuiz = async (isTimeUp: boolean = false) => {
    if (!attempt) return;

    try {
      const result = await completeQuizAttemptAction(attempt.id, isTimeUp);

      if (result.success) {
        // Redirect to score page
        router.push(`/quiz/score?attemptId=${attempt.id}`);
      } else {
        toast.error(result.error || "Failed to complete quiz");
      }
    } catch (err) {
      console.error("Error completing quiz:", err);
      toast.error("Failed to complete quiz. Please try again.");
    }
  };

  const handleAnswerSelect = async (optionId: string) => {
    if (!attempt || submitting) return;

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSubmitting(true);

    try {
      const result = await submitAnswerAction(
        attempt.id,
        currentQuestion.id,
        optionId,
      );

      if (result.success) {
        // Update local state
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: optionId,
        }));

        // Show feedback
        if (result.isCorrect) {
          toast.success("Correct! ✓");
        } else {
          toast.error(
            `Incorrect ✗ ${result.correctOptionId ? "Correct answer highlighted" : ""}`,
          );
        }

        // Store feedback for visual display
        setAnswerFeedback({
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
          correctOptionId: result.correctOptionId || null,
          isCorrect: result.isCorrect || false,
        });

        // Auto-advance to next question after delay
        setTimeout(() => {
          setAnswerFeedback(null); // Clear feedback
          if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
          } else {
            // Last question, auto-submit quiz
            handleCompleteQuiz();
          }
        }, 2000);
      } else {
        toast.error(result.error || "Failed to submit answer");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Show "GO!" for a moment, then start the quiz
      const timer = setTimeout(() => {
        setCountdown(null); // End countdown
        startQuiz();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev <= 1) {
          // Time's up, auto-submit
          handleCompleteQuiz(true);
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  if (loading) {
    return <QuizLoading />;
  }

  if (error) {
    return <QuizError error={error} />;
  }

  // Countdown screen
  if (countdown !== null) {
    return <QuizCountdown countdown={countdown} />;
  }

  if (!quiz || !attempt || !quizStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-satoshi font-bold text-black dark:text-white">
            Initializing quiz...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="mx-4 mt-10 min-h-screen">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <QuizAttemptHeader
          quizTitle={quiz.title}
          quizSubject={quiz.subject}
          timeRemaining={timeRemaining}
        />

        {/* Progress */}
        <QuizProgress
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
        />

        {/* Question */}
        <QuizQuestion
          question={currentQuestion}
          answers={answers}
          submitting={submitting}
          onAnswerSelect={handleAnswerSelect}
          answerFeedback={answerFeedback}
        />

        {/* Navigation */}
        <QuizNavigation marksPerQuestion={quiz.marksPerQuestion} />
      </div>
    </div>
  );
}
