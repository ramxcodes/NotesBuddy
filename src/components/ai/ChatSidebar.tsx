"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { getDisplayNameFromSanityValue } from "@/utils/helpers";
import { University, Degree, Year, Semester } from "@prisma/client";

interface UserChat {
  id: string;
  name: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string;
  updatedAt: Date;
  messages: Array<{
    content: string;
    createdAt: Date;
    role: "USER" | "ASSISTANT";
  }>;
  _count: {
    messages: number;
  };
}

interface ChatSidebarProps {
  chats: UserChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
}: ChatSidebarProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <ChatCircle
            className="mx-auto mb-4 h-10 w-10 text-gray-400 sm:h-12 sm:w-12 dark:text-gray-600"
            weight="duotone"
          />
          <p className="text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">
            No chats yet
          </p>
          <p className="mt-1 text-xs text-gray-400 sm:text-sm dark:text-gray-500">
            Start a new conversation to get help with your studies
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden" data-lenis-prevent>
      <ScrollArea className="h-full">
        <div className="max-w-sm space-y-2 p-2 sm:space-y-3 sm:p-4">
          {chats.map((chat) => {
            const lastMessage = chat.messages[0];
            const isSelected = selectedChat === chat.id;

            return (
              <Button
                data-umami-event={`ai-chat-select-${chat.id}`}
                key={chat.id}
                variant={isSelected ? "default" : "ghost"}
                className={`neuro flex h-auto w-full flex-col items-start border-2 p-3 text-left sm:p-4 ${
                  isSelected
                    ? "bg-gray-200 hover:bg-gray-300 dark:bg-black/70"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="w-full">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="flex-1 truncate text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
                      {chat.name}
                    </h3>
                    <span className="ml-2 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(chat.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1">
                    <Badge
                      variant="secondary"
                      className="border border-gray-300 text-xs font-medium dark:border-gray-600"
                    >
                      {chat.subject}
                    </Badge>
                  </div>

                  {lastMessage && (
                    <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {lastMessage.role === "USER" ? "👤 " : "🤖 "}
                      {lastMessage.content}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat._count.messages} message
                      {chat._count.messages !== 1 ? "s" : ""}
                    </span>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {getDisplayNameFromSanityValue(
                          "university",
                          chat.university.toLowerCase(),
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getDisplayNameFromSanityValue(
                          "degree",
                          chat.degree.toLowerCase().replace("_", "-"),
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
