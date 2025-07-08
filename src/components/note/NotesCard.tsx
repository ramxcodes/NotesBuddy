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
import { GraduationCap, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotesCard({
  note,
}: {
  note: NOTES_QUERYResult[number];
}) {
  return (
    <Card className="group border-border/50 bg-card hover:border-border relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <CardHeader className="pb-4">
        {note.isPremium && (
          <Badge
            className="absolute top-4 right-4 border-0 bg-gradient-to-r from-amber-400 to-amber-500 font-medium text-amber-950 shadow-sm"
            variant="secondary"
          >
            <Lock className="mr-1.5 h-3 w-3" />
            Premium
          </Badge>
        )}

        <div className="space-y-3">
          <CardTitle className="text-foreground group-hover:text-primary pr-20 text-xl leading-tight font-semibold transition-colors duration-200">
            {note.title || "Untitled"}
          </CardTitle>

          <CardDescription className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {note.syllabus || "No syllabus available"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* University Badge - Primary */}
        <div className="flex items-center">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
          >
            <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
            {note.university}
          </Badge>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Degree</div>
            <div className="text-foreground">{note.degree}</div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Subject</div>
            <div className="text-foreground">{note.subject}</div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Year</div>
            <div className="text-foreground">{note.year}</div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Semester</div>
            <div className="text-foreground">{note.semester}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Link href={`/notes/${note?.slug?.current}`} className="w-full">
          <Button
            variant="default"
            className="w-full font-medium transition-all duration-300 group-hover:shadow-md"
          >
            View Notes
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
