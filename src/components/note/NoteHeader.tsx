import React from "react";
import { Badge } from "../ui/badge";
import { getDisplayNameFromSanityValue } from "@/utils/helpers";

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
    <header className="mb-8">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {note.title}
      </h1>
      <p className="mb-3 text-lg text-gray-600 dark:text-gray-400">
        {note.syllabus}
      </p>
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {note.university && (
          <Badge
            variant="outline"
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800"
          >
            {getDisplayNameFromSanityValue("university", note.university)}
          </Badge>
        )}
        {note.degree && (
          <Badge
            variant="outline"
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800"
          >
            {getDisplayNameFromSanityValue("degree", note.degree)}
          </Badge>
        )}
        {note.year && (
          <Badge
            variant="outline"
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800"
          >
            {getDisplayNameFromSanityValue("year", note.year)}
          </Badge>
        )}
        {note.semester && (
          <Badge
            variant="outline"
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800"
          >
            {getDisplayNameFromSanityValue("semester", note.semester)}
          </Badge>
        )}
      </div>
    </header>
  );
}
