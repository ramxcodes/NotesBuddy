"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowDown, Robot } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import type { Message } from "@/components/ui/chat-message";
import {
  University,
  Degree,
  Year,
  Semester,
  MessageRole,
} from "@prisma/client";
import { getDisplayNameFromSanityValue } from "@/utils/helpers";
import EmbeddedAcademicFilters from "./EmbeddedAcademicFilters";

interface AcademicContext {
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  model?: string | null;
  createdAt: Date;
}

interface ChatWindowProps {
  chatId: string | null;
  academicContext: AcademicContext;
  apiKey: string;
  userId: string;
  userProfile?: {
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
  } | null;
  isOnboarded?: boolean;
  onChatCreated: (chatId: string) => void;
  onAcademicContextChange?: (context: AcademicContext) => void;
}

const GEMINI_MODELS = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Most Capable)" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Balanced)" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Fast)" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Stable)" },
];

export default function ChatWindow({
  chatId,
  academicContext,
  apiKey,
  userId,
  userProfile,
  isOnboarded = false,
  onChatCreated,
  onAcademicContextChange,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-pro");
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);

  // Load existing chat messages
  useEffect(() => {
    const loadMessages = async () => {
      if (chatId) {
        try {
          const response = await fetch(
            `/api/ai/chat/${chatId}?userId=${userId}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch chat");
          }
          const chat = await response.json();
          if (chat) {
            // Convert our chat messages to the new Message format
            const convertedMessages: Message[] = chat.messages.map(
              (msg: ChatMessage) => ({
                id: msg.id,
                role: msg.role.toLowerCase() as "user" | "assistant",
                content: msg.content,
                createdAt: new Date(msg.createdAt),
              }),
            );
            setMessages(convertedMessages);
          }
        } catch (error) {
          console.error("Error loading chat messages:", error);
          toast.error("Failed to load chat messages");
        }
      } else {
        setMessages([]);
      }
    };

    loadMessages();
    setCurrentChatId(chatId);
  }, [chatId, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim() || isLoading || !apiKey) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Create a new chat if we don't have one
      let activeChatId = currentChatId;
      if (!activeChatId) {
        const chatResponse = await fetch("/api/ai/chat/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            university: academicContext.university,
            degree: academicContext.degree,
            year: academicContext.year,
            semester: academicContext.semester,
            subject: academicContext.subject,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error("Failed to create chat");
        }

        const newChat = await chatResponse.json();
        activeChatId = newChat.id;
        setCurrentChatId(activeChatId);
        onChatCreated(activeChatId!);
      }

      // Add user message to UI immediately
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Save user message to database
      const messageResponse = await fetch("/api/ai/message/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: activeChatId,
          role: "USER",
          content: userMessage,
          model: selectedModel,
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to create message");
      }

      // Make AI request
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: activeChatId,
          model: selectedModel,
          apiKey,
          university: academicContext.university,
          degree: academicContext.degree,
          year: academicContext.year,
          semester: academicContext.semester,
          subject: academicContext.subject,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      // Add assistant message placeholder
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullResponse += data.text;
                // Update the assistant message content
                setMessages((prev) =>
                  prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { ...msg, content: fullResponse }
                      : msg,
                  ),
                );
              } else if (data.done) {
                // Save assistant message to database
                await fetch("/api/ai/message/create", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    chatId: activeChatId,
                    role: "ASSISTANT",
                    content: fullResponse,
                    model: selectedModel,
                  }),
                });
                return;
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error("Parse error:", parseError);
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast.error(
        "Failed to send message. Please check your API key and try again.",
      );

      // Remove the failed messages
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    setIsLoading(false);
  };

  const append = (message: { role: "user"; content: string }) => {
    setInput(message.content);
  };

  // Handle academic context changes from embedded filters
  const handleFiltersChange = (newContext: {
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
    subject: string;
  }) => {
    if (onAcademicContextChange) {
      onAcademicContextChange(newContext);
    }
  };

  // Check if we need to show academic filters (no valid academic context)
  const shouldShowFilters =
    !academicContext.subject || academicContext.subject.trim() === "";

  // Disabled submit handler when filters are not complete
  const handleDisabledSubmit = () => {
    // Do nothing when academic context is incomplete
  };

  // Auto-scroll hook for messages
  const {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  } = useAutoScroll([messages]);

  return (
    <div className="flex h-full flex-col" data-lenis-prevent>
      {/* Header */}
      <div className="border p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Robot className="h-5 w-5 sm:h-6 sm:w-6" weight="duotone" />
            <div>
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                {shouldShowFilters
                  ? "AI Assistant"
                  : `${academicContext.subject} Assistant`}
              </h3>
              {!shouldShowFilters && (
                <div className="mt-1 flex flex-wrap gap-1 sm:gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getDisplayNameFromSanityValue(
                      "university",
                      academicContext.university.toLowerCase(),
                    )}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getDisplayNameFromSanityValue(
                      "degree",
                      academicContext.degree.toLowerCase().replace("_", "-"),
                    )}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getDisplayNameFromSanityValue(
                      "year",
                      academicContext.year.toLowerCase().replace("_", "-"),
                    )}{" "}
                    -{" "}
                    {getDisplayNameFromSanityValue(
                      "semester",
                      academicContext.semester.toLowerCase().replace("_", "-"),
                    )}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full border border-gray-300 text-xs sm:w-56 sm:text-sm dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GEMINI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chat Content Area with Custom Layout */}
      <div className="mx-2 mt-3 flex min-h-0 flex-1 flex-col sm:mx-4 sm:mt-4">
        {/* Messages */}
        <div
          className="relative flex-1 overflow-y-auto"
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          data-lenis-prevent
        >
          <div className="pb-4">
            {messages.length > 0 && (
              <MessageList messages={messages} isTyping={isLoading} />
            )}
            {messages.length === 0 && (
              <div className="mt-6 flex items-center justify-center sm:mt-10">
                <div className="space-y-4 px-4 text-center">
                  <Robot
                    className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
                    weight="duotone"
                  />
                  <div className="space-y-2">
                    <p className="text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {shouldShowFilters
                        ? "Welcome to AI Assistant"
                        : `${academicContext.subject} Assistant`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {shouldShowFilters
                        ? "Select your academic context below to get started with personalized help"
                        : "Ask me anything about your studies"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scroll to bottom button */}
          {!shouldAutoScroll && messages.length > 0 && (
            <div className="pointer-events-none absolute bottom-0 left-0 flex w-full justify-end pr-2 pb-2 sm:pr-4 sm:pb-4">
              <Button
                onClick={scrollToBottom}
                className="animate-in fade-in-0 slide-in-from-bottom-1 pointer-events-auto h-8 w-8 rounded-full ease-in-out"
                size="icon"
                variant="ghost"
              >
                <ArrowDown className="h-4 w-4" weight="duotone" />
              </Button>
            </div>
          )}
        </div>

        {/* Academic Filters - When needed */}
        {shouldShowFilters && (
          <div className="border-t py-3 sm:py-4">
            <EmbeddedAcademicFilters
              userProfile={userProfile}
              isOnboarded={isOnboarded}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Suggestions - When no messages */}
        {messages.length === 0 && !shouldShowFilters && (
          <div className="border-t py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Try these prompts:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  `Explain key concepts in ${academicContext.subject}`,
                  `Help me with ${academicContext.subject} assignments`,
                  `What topics should I focus on for exams?`,
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      append({ role: "user", content: suggestion })
                    }
                    className="neuro-button rounded-lg px-2 py-2 text-white dark:text-black"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t pt-3 sm:pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (shouldShowFilters) {
                handleDisabledSubmit();
              } else {
                handleSubmit(e);
              }
            }}
          >
            <MessageInput
              value={input}
              onChange={handleInputChange}
              isGenerating={isLoading}
              stop={stop}
              disabled={shouldShowFilters}
              placeholder={
                shouldShowFilters
                  ? "Please select your academic context above to start chatting..."
                  : `Ask about ${academicContext.subject}...`
              }
            />
          </form>
        </div>
      </div>
    </div>
  );
}
