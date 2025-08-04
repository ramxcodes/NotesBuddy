"use client";

import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  GraduationCapIcon,
  PlayIcon,
  CardsIcon,
  EyeIcon,
  CrownIcon,
  ArrowCounterClockwiseIcon,
  SignInIcon,
} from "@phosphor-icons/react";
import type { FlashcardSetListItem } from "@/dal/flashcard/types";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";
import { formatDistanceToNow } from "date-fns";
import { signIn } from "@/lib/auth/auth-client";

interface FlashcardCardProps {
  flashcardSet: FlashcardSetListItem;
  isAuthenticated: boolean;
}

export default function FlashcardCard({
  flashcardSet,
  isAuthenticated,
}: FlashcardCardProps) {
  const {
    id,
    title,
    description,
    subject,
    university,
    degree,
    year,
    semester,
    isPremium,
    requiredTier,
    cardCount,
    visitCount,
    createdAt,
    userHasVisited,
    userLastVisitedAt,
  } = flashcardSet;

  return (
    <div className="neuro group rounded-md p-6 transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#757373]">
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

        {isPremium && (
          <Badge variant="default" className="ml-2 flex-shrink-0">
            <CrownIcon weight="duotone" className="mr-1 h-3 w-3" />
            Premium
            {requiredTier && ` ${requiredTier.replace("TIER_", "T")}`}
          </Badge>
        )}
      </div>

      <div className="my-4 flex flex-wrap items-center justify-start gap-2">
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon weight="duotone" className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("university", university)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon weight="duotone" className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("degree", degree)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon weight="duotone" className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("year", year)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon weight="duotone" className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromPrismaValue("semester", semester)}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          <GraduationCapIcon weight="duotone" className="mr-1.5 h-3.5 w-3.5" />
          {subject || "Notes Buddy Quiz"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
            <CardsIcon weight="duotone" className="h-4 w-4" />
            <span>{cardCount} cards</span>
          </div>
          {isAuthenticated && userHasVisited && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <EyeIcon weight="duotone" className="h-4 w-4" />
              <span>Studied</span>
            </div>
          )}
          {!isAuthenticated && visitCount > 0 && (
            <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
              <EyeIcon weight="duotone" className="h-4 w-4" />
              <span>{visitCount} studies</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50">
          <ClockIcon weight="duotone" className="h-3 w-3" />
          <span>
            {isAuthenticated && userLastVisitedAt
              ? // Show user's last visit time if they have studied it
                `Last studied ${formatDistanceToNow(
                  new Date(userLastVisitedAt),
                  {
                    addSuffix: true,
                  },
                )}`
              : // Show creation time if user hasn't studied it or not authenticated
                formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        {isAuthenticated ? (
          <Link href={`/flashcards/${id}`} className="block">
            <Button
              data-umami-event={`flashcard-start-study-${id}`}
              className="neuro hover:translate-y-0.5hover:shadow-[4px_4px_0px_0px_#000] w-full transition-all duration-200 hover:translate-x-0.5 dark:hover:shadow-[4px_4px_0px_0px_#757373]"
              size="lg"
            >
              {userHasVisited ? (
                <>
                  <ArrowCounterClockwiseIcon
                    weight="duotone"
                    className="mr-2 h-4 w-4"
                  />
                  Revise Again
                </>
              ) : (
                <>
                  <PlayIcon weight="duotone" className="mr-2 h-4 w-4" />
                  Start Studying
                </>
              )}
            </Button>
          </Link>
        ) : (
          <Button
            data-umami-event={`flashcard-login-to-study-${id}`}
            className="neuro hover:translate-y-0.5hover:shadow-[4px_4px_0px_0px_#000] w-full transition-all duration-200 hover:translate-x-0.5 dark:hover:shadow-[4px_4px_0px_0px_#757373]"
            size="lg"
            onClick={() => signIn()}
          >
            <SignInIcon weight="duotone" className="mr-2 h-4 w-4" />
            Login to Study
          </Button>
        )}
      </div>
    </div>
  );
}
