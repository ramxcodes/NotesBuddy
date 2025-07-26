"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import type { FlashcardSetDetail } from "@/dal/flashcard/types";
import { trackFlashcardSetVisitAction } from "@/app/flashcards/actions";

interface FlashcardViewerProps {
  flashcardSet: FlashcardSetDetail;
  onExit?: () => void;
}

export default function FlashcardViewer({
  flashcardSet,
  onExit,
}: FlashcardViewerProps) {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const currentCard = flashcardSet.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcardSet.cards.length) * 100;

  // Track visit when component mounts
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await trackFlashcardSetVisitAction(flashcardSet.id);
      } catch (error) {
        console.error("Error tracking flashcard set visit:", error);
      }
    };

    trackVisit();
  }, [flashcardSet.id]);

  const handleFlipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
    setShowBack(!showBack);
  }, [isFlipped, showBack]);

  const handleNextCard = useCallback(() => {
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowBack(false);
    }
  }, [currentCardIndex, flashcardSet.cards.length]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowBack(false);
    }
  }, [currentCardIndex]);

  const handleReset = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowBack(false);
  }, []);

  const handleGoToComplete = useCallback(() => {
    router.push(`/flashcards/${flashcardSet.id}/complete`);
  }, [router, flashcardSet.id]);

  if (!currentCard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No cards found</h2>
          <p className="text-gray-500">
            This flashcard set doesn&apos;t have any cards yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onExit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <CaretLeftIcon weight="duotone" className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
              <p className="text-sm text-gray-600">
                {flashcardSet.subject} • {flashcardSet.university}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowsClockwiseIcon weight="duotone" className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Card {currentCardIndex + 1} of {flashcardSet.cards.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div
            className="perspective-1000 relative h-[400px] cursor-pointer"
            onClick={handleFlipCard}
          >
            <div
              className={`transform-style-preserve-3d relative h-full w-full transition-transform duration-700 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of card */}
              <Card className="dark:bg-background absolute inset-0 h-full w-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 backface-hidden hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="absolute top-4 right-4">
                    <EyeIcon
                      weight="duotone"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>

                  <div className="max-w-2xl">
                    <div className="mb-4 text-sm font-medium text-gray-600">
                      QUESTION
                    </div>
                    <p className="text-xl leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                    <p className="text-sm text-gray-400">
                      Click to reveal answer
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="bg-secondary dark:bg-secondary absolute inset-0 h-full w-full rotate-y-180 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 backface-hidden hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="absolute top-4 right-4">
                    <EyeSlashIcon
                      weight="duotone"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>

                  <div className="max-w-2xl">
                    <div className="mb-4 text-sm font-medium text-green-500 dark:text-green-400">
                      ANSWER
                    </div>
                    <p className="text-xl leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                    <p className="text-sm text-gray-400">
                      Click to show question
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
          >
            <ArrowLeftIcon weight="duotone" className="mr-2 h-5 w-5" />
            Previous
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handleFlipCard}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {showBack ? (
              <>
                <EyeSlashIcon weight="duotone" className="mr-2 h-5 w-5" />
                Show Question
              </>
            ) : (
              <>
                <EyeIcon weight="duotone" className="mr-2 h-5 w-5" />
                Reveal Answer
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNextCard}
            disabled={currentCardIndex === flashcardSet.cards.length - 1}
            className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
          >
            Next
            <ArrowRightIcon weight="duotone" className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Study Progress */}
        {currentCardIndex === flashcardSet.cards.length - 1 && showBack && (
          <div className="mt-8 text-center">
            <Card className="border-2 border-green-600 bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-green-400 dark:bg-green-900">
              <CardContent className="p-6">
                <CheckCircleIcon
                  weight="duotone"
                  className="mx-auto mb-4 h-12 w-12 text-green-600"
                />
                <h3 className="mb-2 text-xl font-bold">Congratulations!</h3>
                <p className="mb-6 text-secondary">
                  You&apos;ve completed all {flashcardSet.cards.length} cards in
                  this set.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <ArrowsClockwiseIcon
                      weight="duotone"
                      className="mr-2 h-4 w-4"
                    />
                    Study Again
                  </Button>
                  <Button
                    onClick={handleGoToComplete}
                    className="border-2 border-black bg-green-600 dark:bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <CheckCircleIcon
                      weight="duotone"
                      className="mr-2 h-4 w-4"
                    />
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
