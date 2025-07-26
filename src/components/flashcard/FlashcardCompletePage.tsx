"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  ArrowsClockwiseIcon,
  CaretLeftIcon,
  TrophyIcon,
  ClockIcon,
  BooksIcon,
} from "@phosphor-icons/react";
import type { FlashcardSetDetail } from "@/dal/flashcard/types";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";

interface FlashcardCompletePageProps {
  flashcardSet: FlashcardSetDetail;
}

export default function FlashcardCompletePage({
  flashcardSet,
}: FlashcardCompletePageProps) {
  const router = useRouter();

  const handleStudyAgain = () => {
    router.push(`/flashcards/${flashcardSet.id}`);
  };

  const handleBackToFlashcards = () => {
    router.push("/flashcards");
  };


  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <TrophyIcon
              weight="duotone"
              className="mx-auto h-20 w-20 text-yellow-500"
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Congratulations!</h1>
          <p className="text-xl text-secondary">
            You&apos;ve successfully completed studying
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {flashcardSet.title}
          </h2>
        </div>

        {/* Study Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="border-4 border-black bg-green-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6 text-center">
              <CheckCircleIcon
                weight="duotone"
                className="mx-auto mb-3 h-12 w-12 text-green-600"
              />
              <h3 className="mb-2 text-2xl font-bold text-green-600">
                {flashcardSet.cards.length}
              </h3>
              <p className="text-sm font-medium text-secondary">Cards Studied</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black bg-blue-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6 text-center">
              <BooksIcon
                weight="duotone"
                className="mx-auto mb-3 h-12 w-12 text-blue-600"
              />
              <h3 className="mb-2 text-lg font-bold text-blue-600">
                {flashcardSet.subject}
              </h3>
              <p className="text-sm font-medium text-secondary">Subject</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-black bg-purple-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6 text-center">
              <ClockIcon
                weight="duotone"
                className="mx-auto mb-3 h-12 w-12 text-purple-600"
              />
              <h3 className="mb-2 text-lg font-bold text-purple-600">
                Complete
              </h3>
              <p className="text-sm font-medium text-secondary">Study Session</p>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard Set Details */}
        <Card className="mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <h3 className="mb-4 text-xl font-bold">Study Set Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">
                  Academic Info
                </h4>
                <p className="text-sm text-secondary">
                  <strong>University:</strong>{" "}
                  {getDisplayNameFromPrismaValue(
                    "university",
                    flashcardSet.university,
                  )}
                </p>
                <p className="text-sm text-secondary">
                  <strong>Degree:</strong>{" "}
                  {getDisplayNameFromPrismaValue("degree", flashcardSet.degree)}
                </p>
                <p className="text-sm text-secondary">
                  <strong>Year:</strong>{" "}
                  {getDisplayNameFromPrismaValue("year", flashcardSet.year)}
                </p>
                <p className="text-sm text-secondary">
                  <strong>Semester:</strong>{" "}
                  {getDisplayNameFromPrismaValue(
                    "semester",
                    flashcardSet.semester,
                  )}
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">
                  Description
                </h4>
                <p className="text-sm text-secondary">
                  {flashcardSet.description || "No description provided."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={handleStudyAgain}
            size="lg"
            className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowsClockwiseIcon weight="duotone" className="mr-2 h-5 w-5" />
            Study Again
          </Button>


          <Button
            onClick={handleBackToFlashcards}
            variant="outline"
            size="lg"
            className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <CaretLeftIcon weight="duotone" className="mr-2 h-5 w-5" />
            Back to Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
}
