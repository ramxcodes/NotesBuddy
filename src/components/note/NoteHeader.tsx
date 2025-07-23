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
    <header className="mb-8">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {note.title}
      </h1>
      <p className="mb-3 text-lg text-gray-600 dark:text-gray-400">
        {note.syllabus}
      </p>
      <div className="flex flex-wrap items-center justify-start gap-2">
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("university", note.university || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("degree", note.degree || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("year", note.year || "")}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
        >
          <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
          {getDisplayNameFromSanityValue("semester", note.semester || "")}
        </Badge>
      </div>
    </header>
  );
}
