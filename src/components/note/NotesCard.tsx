import { NOTES_QUERYResult } from "@/sanity/types";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "next-view-transitions";
import { LockIcon } from "../icons/LockIcon";
import { GraduationCapIcon } from "../icons/GraduationCapIcon";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { getDisplayNameFromSanityValue } from "@/utils/helpers";

import { useSession } from "@/lib/auth/auth-client";
import PropSignInButton from "../auth/PropSignInButton";
import { getTypeDisplayName } from "@/utils/academic-config";

export default function NotesCard({
  note,
}: {
  note: NOTES_QUERYResult[number];
}) {
  const { data: session } = useSession();

  return (
    <Card className="relative h-[350px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]">
      <CardHeader className="pb-4">
        {note.isPremium && (
          <Badge
            className="absolute top-4 right-4 border-amber-300 bg-amber-50 font-medium shadow-sm dark:border-amber-700 dark:bg-amber-950"
            variant={"outline"}
          >
            <LockIcon className="mr-1.5 h-3 w-3" />
            Premium
          </Badge>
        )}

        <div className="space-y-3">
          <Link href={`/notes/${note?.slug?.current}`}>
            <CardTitle className="text-foreground group-hover:text-primary pr-20 text-xl leading-tight font-semibold transition-colors duration-200">
              {note.title || "Untitled"}
            </CardTitle>
          </Link>

          <CardDescription className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
            {note.syllabus || "No syllabus available"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="-mt-4 space-y-2">
        <div className="flex flex-wrap items-center justify-start gap-2">
          <Badge
            variant="secondary"
            className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
            {getDisplayNameFromSanityValue("university", note.university || "")}
          </Badge>
          <Badge
            variant="secondary"
            className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
            {getDisplayNameFromSanityValue("degree", note.degree || "")}
          </Badge>
          <Badge
            variant="secondary"
            className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
            {getDisplayNameFromSanityValue("year", note.year || "")}
          </Badge>
          <Badge
            variant="secondary"
            className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
            {getDisplayNameFromSanityValue("semester", note.semester || "")}
          </Badge>
          <Badge
            variant="secondary"
            className="border-2 border-black bg-white px-3 py-1 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <GraduationCapIcon className="mr-1.5 h-3.5 w-3.5" />
            {getTypeDisplayName(note.type || "NOTES")}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="absolute right-0 bottom-6 left-0 pt-4">
        {session?.user ? (
          <Link href={`/notes/${note?.slug?.current}`} className="w-full">
            <Button
              variant="default"
              className="border-primary/50 dark:border-secondary/50 w-full border-r-4 border-b-4 font-medium transition-all duration-200 hover:translate-x-0.5 hover:-translate-y-0.5 hover:cursor-pointer hover:border-r-1 hover:border-b-1"
            >
              View Notes
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <PropSignInButton text="Sign In to View Notes" />
        )}
      </CardFooter>
    </Card>
  );
}
