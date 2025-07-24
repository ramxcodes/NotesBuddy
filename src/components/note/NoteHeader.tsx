import React from "react";
import { Badge } from "../ui/badge";
import { getDisplayNameFromSanityValue } from "@/utils/helpers";
import { GraduationCapIcon } from "@/components/icons/GraduationCapIcon";

type NoteHeaderProps = {
  title: string | null;
  syllabus: string | null;
  university: string | null;
  degree: string | null;
  year: string | null;
  semester: string | null;
};

export default function NoteHeader({ note }: { note: NoteHeaderProps }) {
  return (
    <header className="mb-8 rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff] dark:hover:shadow-[6px_6px_0px_0px_#fff]">
      <h1 className="mb-4 text-4xl font-black tracking-tight text-black dark:text-white">
        {note.title}
      </h1>
      <p className="mb-6 text-lg font-medium text-zinc-600 dark:text-zinc-400">
        {note.syllabus}
      </p>
      <div className="flex flex-wrap items-center justify-start gap-3">
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("university", note.university || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("degree", note.degree || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("year", note.year || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff] dark:hover:shadow-[3px_3px_0px_0px_#fff]"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("semester", note.semester || "")}
        </Badge>
      </div>
    </header>
  );
}
