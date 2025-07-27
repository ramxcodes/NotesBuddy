"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Robot,
  Clock,
  ChatCircle,
  GraduationCap,
} from "@phosphor-icons/react";
import type { AdminChatDetails } from "@/dal/ai/admin-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface AdminChatDetailViewProps {
  chat: AdminChatDetails;
}

export default function AdminChatDetailView({
  chat,
}: AdminChatDetailViewProps) {
  const router = useRouter();

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="neuro-button flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Chats
          </Button>
          <div>
            <h1 className="font-excon text-2xl font-bold">{chat.name}</h1>
            <p className="text-muted-foreground">
              Chat conversation details and history
            </p>
          </div>
        </div>
      </div>

      {/* Chat Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="font-satoshi font-bold">{chat.user.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Email:</span>
              <p className="font-satoshi text-muted-foreground text-sm">
                {chat.user.email}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">User ID:</span>
              <p className="text-muted-foreground font-mono text-xs">
                {chat.user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={20} />
              Academic Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {chat.university.replace("_", " ")}
              </Badge>
              <Badge variant="outline">{chat.degree.replace("_", " ")}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{chat.year.replace("_", " ")}</Badge>
              <Badge variant="secondary">
                {chat.semester.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Subject:</span>
              <p className="font-satoshi font-bold">{chat.subject}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatCircle size={20} />
            Chat Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{chat.messages.length}</div>
              <div className="text-muted-foreground text-sm">
                Total Messages
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {chat.messages.filter((m) => m.role === "USER").length}
              </div>
              <div className="text-muted-foreground text-sm">User Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {chat.messages.filter((m) => m.role === "ASSISTANT").length}
              </div>
              <div className="text-muted-foreground text-sm">AI Responses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatDistanceToNow(new Date(chat.createdAt))}
              </div>
              <div className="text-muted-foreground text-sm">Age</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChatCircle size={20} />
              Conversation History
            </div>
            <div className="text-muted-foreground text-sm">
              {chat.messages.length}{" "}
              {chat.messages.length === 1 ? "message" : "messages"}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] space-y-4 overflow-y-auto">
            {chat.messages.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No messages in this chat yet.
              </div>
            ) : (
              chat.messages.map((message) => (
                <div
                  data-lenis-prevent
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] gap-3 ${
                      message.role === "USER" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "USER"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      }`}
                    >
                      {message.role === "USER" ? (
                        <User size={16} />
                      ) : (
                        <Robot size={16} />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "USER"
                          ? "bg-blue-500 text-white"
                          : "neuro border-2 border-black bg-white dark:border-white/20 dark:bg-gray-900"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="break-words whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1 opacity-70">
                            <Clock size={12} />
                            {formatDateTime(new Date(message.createdAt))}
                          </div>
                          {message.role === "ASSISTANT" && message.model && (
                            <Badge variant="outline" className="text-xs">
                              {message.model}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Chat ID:</span>
              <p className="text-muted-foreground font-mono text-xs">
                {chat.id}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Created:</span>
              <p className="text-sm">
                {formatDateTime(new Date(chat.createdAt))}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Last Updated:</span>
              <p className="text-sm">
                {formatDateTime(new Date(chat.updatedAt))}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Last Activity:</span>
              <p className="text-sm">
                {formatDistanceToNow(new Date(chat.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
