"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DotsThree,
  Eye,
  Trash,
  ChatCircle,
  Clock,
  User,
} from "@phosphor-icons/react";
import type { AdminChatListItem } from "@/dal/ai/admin-query";
import { formatDistanceToNow } from "date-fns";

interface AdminAITableProps {
  chats: AdminChatListItem[];
  onViewChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function AdminAITable({
  chats,
  onViewChat,
  onDeleteChat,
}: AdminAITableProps) {
  const formatMessagePreview = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="neuro rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:shadow-[8px_8px_0px_0px_#fff]">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black dark:border-white/20">
            <TableHead className="font-satoshi font-bold">Chat Info</TableHead>
            <TableHead className="font-satoshi font-bold">User</TableHead>
            <TableHead className="font-satoshi font-bold">
              Academic Info
            </TableHead>
            <TableHead className="font-satoshi font-bold">Activity</TableHead>
            <TableHead className="font-satoshi font-bold">
              Last Message
            </TableHead>
            <TableHead className="font-satoshi font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chats.map((chat) => (
            <TableRow
              key={chat.id}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              {/* Chat Info */}
              <TableCell className="space-y-1">
                <div className="flex items-center gap-2">
                  <ChatCircle size={16} className="text-blue-600" />
                  <span className="font-satoshi text-sm font-bold">
                    {chat.name}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  Subject: {chat.subject}
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock size={12} />
                  Created{" "}
                  {formatDistanceToNow(new Date(chat.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </TableCell>

              {/* User Info */}
              <TableCell className="space-y-1">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-green-600" />
                  <span className="font-satoshi text-sm font-bold">
                    {chat.user.name}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  {chat.user.email}
                </div>
              </TableCell>

              {/* Academic Info */}
              <TableCell className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {chat.university.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {chat.degree.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {chat.year.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {chat.semester.replace("_", " ")}
                  </Badge>
                </div>
              </TableCell>

              {/* Activity */}
              <TableCell className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {chat.messageCount}{" "}
                    {chat.messageCount === 1 ? "message" : "messages"}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  Updated{" "}
                  {formatDistanceToNow(new Date(chat.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </TableCell>

              {/* Last Message */}
              <TableCell className="max-w-xs">
                {chat.lastMessage ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          chat.lastMessage.role === "USER"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {chat.lastMessage.role}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-xs break-words">
                      {formatMessagePreview(chat.lastMessage.content)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatDistanceToNow(
                        new Date(chat.lastMessage.createdAt),
                        { addSuffix: true },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs">
                    No messages yet
                  </div>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsThree size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewChat(chat.id)}>
                      <Eye size={16} className="mr-2" />
                      View Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteChat(chat.id)}
                      className="text-red-600"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete Chat
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
