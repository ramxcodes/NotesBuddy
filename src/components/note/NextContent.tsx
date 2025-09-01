"use client";

import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpenIcon,
  BrainIcon,
  LightningIcon,
  ClockIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import {
  getNextContentAction,
  getSubjectQuizzesAction,
  getSubjectFlashcardsAction,
} from "@/app/(user)/notes/[slug]/next-content-actions";
import { telegramLogger } from "@/utils/telegram-logger";

interface NextContentProps {
  university: string;
  degree: string;
  year: string;
  semester: string;
  subject: string;
  type: string | null;
  currentSlug: string;
}

interface NextUnit {
  _id: string;
  title: string | null;
  slug: { current: string } | null;
  syllabus?: string | null;
  isPremium: boolean | null;
  tier?: string | null;
}

interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  isPremium: boolean;
  requiredTier?: string | null;
  _count: {
    questions: number;
  };
}

interface FlashcardSet {
  id: string;
  title: string;
  description?: string | null;
  isPremium: boolean;
  requiredTier?: string | null;
  _count: {
    cards: number;
  };
}

export default function NextContent({
  university,
  degree,
  year,
  semester,
  subject,
  type,
  currentSlug,
}: NextContentProps) {
  const [nextUnits, setNextUnits] = useState<NextUnit[]>([]);
  const [otherContent, setOtherContent] = useState<NextUnit[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [hasQuizzes, setHasQuizzes] = useState(false);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getNextContentAction(
          university,
          degree,
          year,
          semester,
          subject,
          type,
          currentSlug,
        );

        if (result.success && result.data) {
          setNextUnits(result.data.nextUnits);
          setOtherContent(result.data.otherContent);
          setHasQuizzes(result.data.hasQuizzes);
          setHasFlashcards(result.data.hasFlashcards);
        }
      } catch (error) {
        await telegramLogger("Error fetching next content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [university, degree, year, semester, subject, type, currentSlug]);

  const fetchQuizzes = async () => {
    if (quizzes.length > 0) {
      setShowQuizzes(!showQuizzes);
      return;
    }

    try {
      const result = await getSubjectQuizzesAction(
        university,
        degree,
        year,
        semester,
        subject,
      );

      if (result.success && result.data) {
        setQuizzes(result.data);
        setShowQuizzes(true);
      }
    } catch (error) {
      await telegramLogger("Error fetching quizzes:", error);
    }
  };

  const fetchFlashcards = async () => {
    if (flashcards.length > 0) {
      setShowFlashcards(!showFlashcards);
      return;
    }

    try {
      const result = await getSubjectFlashcardsAction(
        university,
        degree,
        year,
        semester,
        subject,
      );

      if (result.success && result.data) {
        setFlashcards(result.data);
        setShowFlashcards(true);
      }
    } catch (error) {
      await telegramLogger("Error fetching flashcards:", error);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 space-y-4">
        <div className="h-8 w-1/3 border-2 border-black bg-gray-200 dark:border-white/20 dark:bg-gray-700"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 border-2 border-black bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:bg-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if no content available
  const filteredNextUnits = nextUnits.filter(
    (unit) => unit.title && unit.slug?.current,
  );
  const filteredOtherContent = otherContent.filter(
    (content) => content.title && content.slug?.current,
  );

  if (
    filteredNextUnits.length === 0 &&
    filteredOtherContent.length === 0 &&
    !hasQuizzes &&
    !hasFlashcards
  ) {
    return null;
  }

  return (
    <div className="mt-12 space-y-8">
      <Separator className="dark: my-8 bg-black" />

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
            Continue Learning {subject}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Explore more content to master this subject
          </p>
        </div>

        {/* Next Units */}
        {filteredNextUnits.length > 0 && (
          <Card className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="border-b-2 border-black dark:border-white/20">
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" weight="duotone" />
                <span className="font-black text-black dark:text-white">
                  Next Units
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {filteredNextUnits.map((unit) => (
                <Link
                  key={unit._id}
                  href={`/notes/${unit.slug!.current}`}
                  className="group block rounded-md"
                >
                  <div className="rounded-md border-2 border-black p-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black dark:text-white">
                          {unit.title}
                        </h3>
                        {unit.syllabus && (
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {unit.syllabus}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unit.isPremium && (
                          <Badge
                            variant="secondary"
                            className="rounded-md border-2 border-black text-xs font-black text-black dark:border-white/20"
                          >
                            Premium
                          </Badge>
                        )}
                        <ArrowRightIcon
                          className="h-4 w-4 text-black dark:text-white"
                          weight="duotone"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Other Content (MST, PYQ, etc.) */}
        {filteredOtherContent.length > 0 && (
          <Card className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="border-b-2 border-black dark:border-white/20">
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" weight="duotone" />
                <span className="font-black text-black dark:text-white">
                  Practice Materials
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {filteredOtherContent.map((content) => (
                <Link
                  key={content._id}
                  href={`/notes/${content.slug!.current}`}
                  className="group block rounded-md"
                >
                  <div className="rounded-md border-2 border-black p-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:bg-green-900/20 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black dark:text-white">
                          {content.title}
                        </h3>
                        {content.syllabus && (
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {content.syllabus}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {content.isPremium && (
                          <Badge
                            variant="secondary"
                            className="rounded-md border-2 border-black text-xs font-black text-black dark:border-white/20"
                          >
                            Premium
                          </Badge>
                        )}
                        <ArrowRightIcon
                          className="h-4 w-4 text-black dark:text-white"
                          weight="duotone"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quiz and Flashcard Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {hasQuizzes && (
            <div className="flex-1">
              <Button
                onClick={fetchQuizzes}
                variant="outline"
                className="flex h-auto w-full flex-col items-center gap-3 rounded-md border-2 border-black px-6 py-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                <BrainIcon className="h-6 w-6" weight="duotone" />
                <div className="text-center">
                  <div className="font-black text-black dark:text-white">
                    Take Quiz
                  </div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    Test your knowledge
                  </div>
                </div>
              </Button>
            </div>
          )}

          {hasFlashcards && (
            <div className="flex-1">
              <Button
                onClick={fetchFlashcards}
                variant="outline"
                className="flex h-auto w-full flex-col items-center gap-3 rounded-md border-2 border-black px-6 py-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                <LightningIcon className="h-6 w-6" weight="duotone" />
                <div className="text-center">
                  <div className="font-black text-black dark:text-white">
                    Study Flashcards
                  </div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    Quick revision
                  </div>
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Quiz List */}
        {showQuizzes && quizzes.length > 0 && (
          <Card className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="border-b-2 border-black dark:border-white/20">
              <CardTitle className="flex items-center gap-2">
                <BrainIcon className="h-5 w-5" weight="duotone" />
                <span className="font-black text-black dark:text-white">
                  Available Quizzes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/quiz/${quiz.id}`}
                  className="group block rounded-md"
                >
                  <div className="rounded-md border-2 border-black p-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black dark:text-white">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {quiz.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" weight="duotone" />
                            {quiz._count.questions} questions
                          </span>
                          {quiz.timeLimit && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" weight="duotone" />
                              {quiz.timeLimit} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {quiz.isPremium && (
                          <Badge
                            variant="secondary"
                            className="rounded-md border-2 border-black bg-yellow-300 text-xs font-black text-black dark:border-white/20 dark:bg-yellow-600"
                          >
                            Premium
                          </Badge>
                        )}
                        <ArrowRightIcon
                          className="h-4 w-4 text-black dark:text-white"
                          weight="duotone"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Flashcard List */}
        {showFlashcards && flashcards.length > 0 && (
          <Card className="rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="border-b-2 border-black dark:border-white/20">
              <CardTitle className="flex items-center gap-2">
                <LightningIcon className="h-5 w-5" weight="duotone" />
                <span className="font-black text-black dark:text-white">
                  Available Flashcard Sets
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {flashcards.map((flashcardSet) => (
                <Link
                  key={flashcardSet.id}
                  href={`/flashcards/${flashcardSet.id}`}
                  className="group block rounded-md"
                >
                  <div className="rounded-md border-2 border-black p-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black dark:text-white">
                          {flashcardSet.title}
                        </h3>
                        {flashcardSet.description && (
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {flashcardSet.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <LightningIcon
                              className="h-3 w-3"
                              weight="duotone"
                            />
                            {flashcardSet._count.cards} cards
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {flashcardSet.isPremium && (
                          <Badge
                            variant="secondary"
                            className="rounded-md border-2 border-black bg-yellow-300 text-xs font-black text-black dark:border-white/20 dark:bg-yellow-600"
                          >
                            Premium
                          </Badge>
                        )}
                        <ArrowRightIcon
                          className="h-4 w-4 text-black dark:text-white"
                          weight="duotone"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
