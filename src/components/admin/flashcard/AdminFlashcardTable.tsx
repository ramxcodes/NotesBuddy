"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DotsThree,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  Crown,
  Stack,
  Clock,
} from "@phosphor-icons/react";
import type { FlashcardSetListItem } from "@/dal/flashcard/types";
import { getDisplayNameFromPrismaValue } from "@/utils/academic-config";
import { formatDistanceToNow } from "date-fns";

interface AdminFlashcardTableProps {
  flashcardSets: FlashcardSetListItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onTogglePublished: (id: string, isPublished: boolean) => void;
}

export default function AdminFlashcardTable({
  flashcardSets,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePublished,
}: AdminFlashcardTableProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:border-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black dark:border-white">
            <TableHead className="font-bold">Title</TableHead>
            <TableHead className="font-bold">Academic Info</TableHead>
            <TableHead className="font-bold">Cards</TableHead>
            <TableHead className="font-bold">Visits</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Published</TableHead>
            <TableHead className="font-bold">Premium</TableHead>
            <TableHead className="font-bold">Updated</TableHead>
            <TableHead className="font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcardSets.map((set) => (
            <TableRow
              key={set.id}
              className="border-b border-gray-200"
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-semibold">{set.title}</div>
                  <div className="max-w-[200px] truncate text-sm text-gray-500">
                    {set.description || "No description"}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {set.subject}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1 text-sm">
                  <div>
                    {getDisplayNameFromPrismaValue(
                      "university",
                      set.university,
                    )}
                  </div>
                  <div>
                    {getDisplayNameFromPrismaValue("degree", set.degree)}
                  </div>
                  <div>
                    {getDisplayNameFromPrismaValue("year", set.year)} -{" "}
                    {getDisplayNameFromPrismaValue("semester", set.semester)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Stack className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formatNumber(set.cardCount)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formatNumber(set.visitCount)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={set.isActive}
                    onCheckedChange={(checked) =>
                      onToggleStatus(set.id, checked)
                    }
                  />
                  <Badge variant={set.isActive ? "default" : "secondary"}>
                    {set.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={set.isPublished}
                    onCheckedChange={(checked) =>
                      onTogglePublished(set.id, checked)
                    }
                  />
                  <Badge variant={set.isPublished ? "default" : "secondary"}>
                    {set.isPublished ? (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Published
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <EyeSlash className="h-3 w-3" />
                        Draft
                      </div>
                    )}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={set.isPremium ? "destructive" : "outline"}>
                  {set.isPremium ? (
                    <div className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                      {set.requiredTier &&
                        ` ${set.requiredTier.replace("TIER_", "T")}`}
                    </div>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(set.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 border-2 border-transparent p-0 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <DotsThree className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <DropdownMenuItem onClick={() => onEdit(set.id)}>
                      <PencilSimple className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(set.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
