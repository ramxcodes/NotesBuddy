"use client";

import React from "react";
import { revalidateAllNotesCaching } from "@/cache/revalidate-notes";
import { NotebookIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminNotesHeader() {
  const handleRevalidate = async () => {
    await revalidateAllNotesCaching();
    toast("Notes cache revalidated!");
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
          <NotebookIcon weight="duotone" className="h-8 w-8" />
          Notes Management
        </h1>
        <p className="font-satoshi text-lg font-bold text-black/70 dark:text-white/70">
          Create, manage, and edit educational notes for students
        </p>
      </div>
      <Button
        variant={"destructive"}
        className="neuro-button neuro-lg"
        onClick={handleRevalidate}
      >
        🚧 Revalidate Notes Cache 🚧
      </Button>
    </div>
  );
}
