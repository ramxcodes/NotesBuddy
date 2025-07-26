"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stack, Plus, Funnel } from "@phosphor-icons/react";

interface AdminFlashcardEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
}

export default function AdminFlashcardEmptyState({
  hasFilters,
  onClearFilters,
  onCreateNew,
}: AdminFlashcardEmptyStateProps) {
  if (hasFilters) {
    return (
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <Funnel className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            No flashcard sets match your filters
          </h3>
          <p className="mb-6 max-w-md text-center text-gray-500">
            Try adjusting your search terms or filters to find the flashcard
            sets you&apos;re looking for.
          </p>
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-blue-100 p-6">
          <Stack className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">
          No flashcard sets created yet
        </h3>
        <p className="mb-6 max-w-md text-center text-gray-500">
          Get started by creating your first flashcard set. You can add multiple
          cards with questions and answers for students to study.
        </p>
        <Button
          onClick={onCreateNew}
          className="border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Flashcard Set
        </Button>
      </CardContent>
    </Card>
  );
}
