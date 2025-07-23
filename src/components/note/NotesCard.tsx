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

export default function NotesCard({
  note,
}: {
  note: NOTES_QUERYResult[number];
}) {
  return (
    <Card className="relative h-[350px] shadow-none border-b-8 border-r-8 border-primary dark:border-secondary transition-all duration-300 hover:border-b-1 hover:border-r-1">
      <CardHeader className="pb-4">
        {note.isPremium && (
          <Badge
            className="absolute top-4 right-4 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 font-medium shadow-sm"
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

          <CardDescription className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mt-2">
            {note.syllabus || "No syllabus available"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 -mt-4">
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
      </CardContent>

      <CardFooter className="pt-4 absolute bottom-6 left-0 right-0">
        <Link href={`/notes/${note?.slug?.current}`} className="w-full">
          <Button
            variant="default"
            className="w-full font-medium transition-all duration-300 group-hover:shadow-md hover:cursor-pointer"
          >
            View Notes
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
