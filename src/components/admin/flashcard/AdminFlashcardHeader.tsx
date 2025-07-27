"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusIcon,
  StackIcon,
  EyeIcon,
  ChartBarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import type { FlashcardSetStats } from "@/dal/flashcard/types";

interface AdminFlashcardHeaderProps {
  stats: FlashcardSetStats | null;
  onCreateNew: () => void;
}

export default function AdminFlashcardHeader({
  stats,
  onCreateNew,
}: AdminFlashcardHeaderProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Flashcard Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage flashcard sets for students
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Flashcard Set
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              <StackIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalSets)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sets</CardTitle>
              <TrendUpIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.activeSets)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.totalSets > 0
                  ? Math.round((stats.activeSets / stats.totalSets) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <EyeIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.publishedSets)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.totalSets > 0
                  ? Math.round((stats.publishedSets / stats.totalSets) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <ChartBarIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalCards)}
              </div>
              <p className="text-muted-foreground text-xs">Across all sets</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visits
              </CardTitle>
              <EyeIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalVisits)}
              </div>
              <p className="text-muted-foreground text-xs">
                Student interactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
