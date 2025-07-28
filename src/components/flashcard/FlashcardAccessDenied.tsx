"use client";

import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LockIcon,
  CrownIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import type { FlashcardSetDetail } from "@/dal/flashcard/types";
import type { FlashcardAccessResult } from "@/components/flashcard/actions/flashcard-access";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";

interface FlashcardAccessDeniedProps {
  flashcardSet: FlashcardSetDetail;
  accessResult: FlashcardAccessResult;
}

export default function FlashcardAccessDenied({
  flashcardSet,
  accessResult,
}: FlashcardAccessDeniedProps) {
  const getTierDisplayName = (tier: string) => {
    return tier.replace("TIER_", "Tier ");
  };

  const getAccessMessage = () => {
    if (accessResult.reason === "NO_PREMIUM") {
      return {
        title: "Premium Subscription Required",
        description:
          "This flashcard set requires a premium subscription to access.",
        actionText: "Upgrade to Premium",
        actionHref: "/premium",
        icon: <LockIcon className="h-12 w-12 text-red-500" weight="duotone" />,
      };
    }

    if (
      accessResult.reason === "INSUFFICIENT_TIER" &&
      flashcardSet.requiredTier &&
      accessResult.userStatus?.tier
    ) {
      return {
        title: "Higher Tier Required",
        description: `This flashcard set requires ${getTierDisplayName(flashcardSet.requiredTier)} or higher. You currently have ${getTierDisplayName(accessResult.userStatus.tier)}.`,
        actionText: `Upgrade to ${getTierDisplayName(flashcardSet.requiredTier)}`,
        actionHref: `/premium?tier=${flashcardSet.requiredTier}`,
        icon: (
          <CrownIcon className="h-12 w-12 text-purple-500" weight="duotone" />
        ),
      };
    }

    return {
      title: "Access Denied",
      description:
        accessResult.message || "You don't have access to this flashcard set.",
      actionText: "Go to Premium",
      actionHref: "/premium",
      icon: (
        <ShieldCheckIcon
          className="h-12 w-12 text-orange-500"
          weight="duotone"
        />
      ),
    };
  };

  const accessInfo = getAccessMessage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/flashcards">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Flashcards
          </Button>
        </Link>
      </div>

      {/* Access Denied Card */}
      <Card className="neuro mb-8">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {accessInfo.icon}
          </div>
          <CardTitle className="text-2xl font-bold">
            {accessInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {accessInfo.description}
          </p>
          <Link href={accessInfo.actionHref}>
            <Button size="lg" className="gap-2">
              <CrownIcon className="h-5 w-5" weight="duotone" />
              {accessInfo.actionText}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Flashcard Set Preview */}
      <Card className="neuro">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2 text-xl">
                {flashcardSet.title}
              </CardTitle>
              {flashcardSet.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {flashcardSet.description}
                </p>
              )}
            </div>
            {flashcardSet.isPremium && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                <CrownIcon weight="duotone" className="mr-1 h-3 w-3" />
                Premium
                {flashcardSet.requiredTier &&
                  ` ${getTierDisplayName(flashcardSet.requiredTier)}`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Academic Info */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getDisplayNameFromPrismaValue(
                "university",
                flashcardSet.university,
              )}
            </Badge>
            <Badge variant="secondary">
              {getDisplayNameFromPrismaValue("degree", flashcardSet.degree)}
            </Badge>
            <Badge variant="secondary">
              {getDisplayNameFromPrismaValue("year", flashcardSet.year)}
            </Badge>
            <Badge variant="secondary">
              {getDisplayNameFromPrismaValue("semester", flashcardSet.semester)}
            </Badge>
            <Badge variant="secondary">{flashcardSet.subject}</Badge>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{flashcardSet.cards.length}</span>{" "}
            cards available
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
