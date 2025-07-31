"use client";

import React from "react";
import { NotebookIcon } from "@phosphor-icons/react";

export default function AdminNotesHeader() {
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
    </div>
  );
}
