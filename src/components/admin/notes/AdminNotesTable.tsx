import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilSimple,
  Calendar,
  GraduationCap,
  BookOpen,
  Crown,
} from "@phosphor-icons/react";
import { type NoteListItem } from "@/dal/note/admin";

interface Props {
  notes: NoteListItem[];
  onEditNote: (noteId: string) => void;
  isLoading: boolean;
}

export default function AdminNotesTable({
  notes,
  onEditNote,
  isLoading,
}: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUniversityDisplay = (value: string) => {
    switch (value) {
      case "medicaps":
        return "Medicaps University";
      case "ips":
        return "IPS University";
      default:
        return value;
    }
  };

  const getDegreeDisplay = (value: string) => {
    switch (value) {
      case "btech-cse":
        return "B.Tech CSE";
      case "btech-it":
        return "B.Tech IT";
      default:
        return value;
    }
  };

  const getYearDisplay = (value: string) => {
    return value.replace("-", " ");
  };

  const getSemesterDisplay = (value: string) => {
    return value.replace("-", " ");
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "TIER_1":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "TIER_2":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "TIER_3":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="neuro rounded-xl">
        <div className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-black dark:border-white"></div>
          <p className="font-satoshi mt-4 text-sm font-bold">
            Loading notes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="neuro rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-zinc-700">
            <TableHead className="font-excon font-black text-black dark:text-white">
              Note Details
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Academic Info
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Status
            </TableHead>
            <TableHead className="font-excon font-black text-black dark:text-white">
              Created
            </TableHead>
            <TableHead className="font-excon text-right font-black text-black dark:text-white">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow
              key={note._id}
              className="border-b border-black/20 hover:bg-zinc-50 dark:border-white/20 dark:hover:bg-zinc-700"
            >
              {/* Note Details */}
              <TableCell className="font-medium">
                <div className="space-y-2">
                  <div className="font-excon text-lg font-black text-black dark:text-white">
                    {note.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen
                      weight="duotone"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                      {note.subject}
                    </span>
                  </div>
                  <div className="font-satoshi text-xs text-black/50 dark:text-white/50">
                    /{note.slug.current}
                  </div>
                  {note.isPremium && (
                    <div className="flex items-center gap-1">
                      <Crown
                        weight="duotone"
                        className="h-4 w-4 text-yellow-500"
                      />
                      <Badge className="rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Premium
                      </Badge>
                      {note.tier && (
                        <Badge
                          className={`rounded-md ${getTierColor(note.tier)}`}
                        >
                          {note.tier.replace("TIER_", "Tier ")}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Academic Info */}
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <GraduationCap
                      weight="duotone"
                      className="h-4 w-4 text-purple-600"
                    />
                    <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                      {getUniversityDisplay(note.university)}
                    </span>
                  </div>
                  <div className="font-satoshi text-xs text-black/60 dark:text-white/60">
                    {getDegreeDisplay(note.degree)}
                  </div>
                  <div className="font-satoshi text-xs text-black/60 dark:text-white/60">
                    {getYearDisplay(note.year)} •{" "}
                    {getSemesterDisplay(note.semester)}
                  </div>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge className="rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {note.isPremium ? "Premium" : "Free"}
                </Badge>
              </TableCell>

              {/* Created */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar
                    weight="duotone"
                    className="h-4 w-4 text-gray-500"
                  />
                  <span className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    {formatDate(note._createdAt)}
                  </span>
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Button
                  onClick={() => onEditNote(note._id)}
                  size="sm"
                  className="neuro-button-sm font-satoshi rounded-md font-bold"
                >
                  <PencilSimple weight="duotone" className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
