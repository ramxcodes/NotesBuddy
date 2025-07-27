"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Robot, MagnifyingGlass } from "@phosphor-icons/react";

interface AdminAIEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function AdminAIEmptyState({
  hasFilters,
  onClearFilters,
}: AdminAIEmptyStateProps) {
  return (
    <div className="neuro rounded-lg border-2 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:shadow-[8px_8px_0px_0px_#fff]">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {hasFilters ? (
          <MagnifyingGlass
            size={32}
            className="text-gray-600 dark:text-gray-400"
          />
        ) : (
          <Robot size={32} className="text-gray-600 dark:text-gray-400" />
        )}
      </div>

      <h3 className="font-excon mb-3 text-xl font-bold">
        {hasFilters ? "No Matching Chats Found" : "No AI Chats Yet"}
      </h3>

      <p className="font-satoshi text-muted-foreground mb-6">
        {hasFilters
          ? "Try adjusting your search criteria or clearing filters to see more results."
          : "When users start using the AI chat feature, their conversations will appear here for monitoring and management."}
      </p>

      {hasFilters && (
        <div className="space-y-3">
          <Button
            onClick={onClearFilters}
            className="neuro-button font-satoshi font-bold"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {!hasFilters && (
        <div className="text-muted-foreground text-sm">
          <p>You can:</p>
          <ul className="mt-2 space-y-1">
            <li>• Monitor all AI chat conversations</li>
            <li>• View detailed chat histories</li>
            <li>• Track usage statistics and analytics</li>
            <li>• Manage and moderate AI interactions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
