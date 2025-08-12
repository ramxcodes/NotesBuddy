"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ChatCircleIcon, SidebarIcon, XIcon } from "@phosphor-icons/react";
import ChatWindow from "./ChatWindow";
import { University, Degree, Year, Semester } from "@prisma/client";
import { cn } from "@/lib/utils";
import { clientApiKeyUtils } from "@/lib/api-client";

interface AcademicContext {
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string;
}

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

interface AIChatInterfaceProps {
  userChats: UserChat[];
  userId: string;
  userProfile?: {
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
  } | null;
  isOnboarded?: boolean;
}

// Simple sidebar component
function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
}: {
  chats: UserChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <ChatCircleIcon
            className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600"
            weight="duotone"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No chats yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Start a new conversation to get help with your studies
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-xs p-2">
        {chats.map((chat) => {
          const isSelected = selectedChat === chat.id;

          return (
            <Button
              key={chat.id}
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "mb-1 h-auto w-full justify-start rounded-md border-2 p-3 text-left font-bold transition-all duration-200",
                isSelected
                  ? "border-black bg-black text-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                  : "dark:bg-background dark:hover:bg-background/80 border-black/20 bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[4px_4px_0px_0px_#757373]",
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      "flex-1 truncate text-sm font-medium",
                      isSelected
                        ? "text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {chat.name}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      isSelected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={isSelected ? "outline" : "secondary"}
                    className={cn(
                      "shrink-0 text-xs",
                      isSelected &&
                        "border-primary-foreground/20 text-primary-foreground",
                    )}
                  >
                    {chat.subject}
                  </Badge>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      isSelected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {chat._count.messages} message
                    {chat._count.messages !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export default function AIChatInterface({
  userChats,
  userId,
  userProfile,
  isOnboarded = false,
}: AIChatInterfaceProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [academicContext, setAcademicContext] =
    useState<AcademicContext | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if API key exists in localStorage on mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // Check for encrypted API key
        if (clientApiKeyUtils.hasApiKey()) {
          const apiKey = await clientApiKeyUtils.getApiKey(userId);
          if (apiKey) {
            setApiKey(apiKey);
          } else {
            setShowApiKeyDialog(true);
          }
        } else {
          setShowApiKeyDialog(true);
        }
      } catch {
        setShowApiKeyDialog(true);
      }
    };

    loadApiKey();
  }, [userId]);

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    if (!tempApiKey.startsWith("AIza")) {
      toast.error('Invalid Gemini API key format. It should start with "AIza"');
      return;
    }

    try {
      await clientApiKeyUtils.storeApiKey(tempApiKey, userId);
      setApiKey(tempApiKey);
      setShowApiKeyDialog(false);
      setTempApiKey("");
      toast.success("API key saved securely!");
    } catch {
      toast.error("Failed to save API key. Please try again.");
    }
  };

  const handleRemoveApiKey = () => {
    clientApiKeyUtils.removeApiKey();
    setApiKey("");
    setShowApiKeyDialog(true);
    toast.info("API key removed");
  };

  const handleStartNewChat = (context: AcademicContext) => {
    setAcademicContext(context);
    setSelectedChat(null);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);

    // Find the chat and set its academic context
    const chat = userChats.find((c) => c.id === chatId);
    if (chat) {
      setAcademicContext({
        university: chat.university,
        degree: chat.degree,
        year: chat.year,
        semester: chat.semester,
        subject: chat.subject,
      });
    }
  };

  const handleNewChatClick = () => {
    setSelectedChat(null);
    setAcademicContext(null);
  };

  return (
    <>
      <div className="h-full overflow-hidden" data-lenis-prevent>
        {/* Mobile Layout */}
        <div className="flex h-full flex-col md:hidden">
          {/* Mobile Header */}
          <div className="flex-shrink-0 border-b-4 border-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                  className="h-8 w-8 rounded-md border-2 border-black/20 p-0 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all duration-200 hover:shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[4px_4px_0px_0px_#757373]"
                  disabled={!apiKey}
                >
                  <SidebarIcon className="h-4 w-4" weight="duotone" />
                </Button>
                <h2 className="text-lg font-bold">AI Chat</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChatClick}
                  className="rounded-md border-2 border-black px-2 text-xs font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                  disabled={!apiKey}
                >
                  New
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyDialog(true)}
                  className="rounded-md border-2 border-black px-2 text-xs font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                >
                  API
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Chat Window */}
          <div className="flex-1 overflow-hidden">
            {!apiKey ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <div className="text-center">
                  <Button
                    onClick={() => setShowApiKeyDialog(true)}
                    className="rounded-md border-2 border-black bg-black text-sm font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                  >
                    Add API Key to Get Started
                  </Button>
                </div>
              </div>
            ) : (
              <ChatWindow
                chatId={selectedChat}
                academicContext={
                  academicContext || {
                    university: University.MEDICAPS,
                    degree: Degree.BTECH_CSE,
                    year: Year.FIRST_YEAR,
                    semester: Semester.FIRST_SEMESTER,
                    subject: "",
                  }
                }
                apiKey={apiKey}
                userId={userId}
                userProfile={userProfile}
                isOnboarded={isOnboarded}
                onChatCreated={(chatId: string) => {
                  setSelectedChat(chatId);
                  router.refresh();
                }}
                onAcademicContextChange={handleStartNewChat}
              />
            )}
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl dark:bg-gray-950"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-full flex-col">
                  {/* Mobile Sidebar Header */}
                  <div className="border-b p-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">Chat History</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileMenuOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <XIcon className="h-4 w-4" weight="duotone" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Sidebar Content */}
                  <ChatSidebar
                    chats={userChats}
                    selectedChat={selectedChat}
                    onSelectChat={(chatId: string) => {
                      handleSelectChat(chatId);
                      setMobileMenuOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        {sidebarCollapsed ? (
          /* Full Screen Chat when sidebar is collapsed */
          <div className="hidden h-full md:flex">
            <div className="flex h-full w-full flex-col">
              {/* Header with toggle button */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarCollapsed(false)}
                    className="rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                  >
                    <SidebarIcon className="mr-2 h-4 w-4" weight="duotone" />
                    Show Sidebar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChatClick}
                      disabled={!apiKey}
                      className="rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      New Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeyDialog(true)}
                      className="rounded-md border-2 border-black font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      API Key
                    </Button>
                  </div>
                </div>
              </div>

              {/* Full screen chat */}
              <div className="flex-1 overflow-hidden">
                {!apiKey ? (
                  <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                      <Button
                        onClick={() => setShowApiKeyDialog(true)}
                        className="rounded-md border-2 border-black bg-black font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        Add API Key to Get Started
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ChatWindow
                    chatId={selectedChat}
                    academicContext={
                      academicContext || {
                        university: University.MEDICAPS,
                        degree: Degree.BTECH_CSE,
                        year: Year.FIRST_YEAR,
                        semester: Semester.FIRST_SEMESTER,
                        subject: "",
                      }
                    }
                    apiKey={apiKey}
                    userId={userId}
                    userProfile={userProfile}
                    isOnboarded={isOnboarded}
                    onChatCreated={(chatId: string) => {
                      setSelectedChat(chatId);
                      router.refresh();
                    }}
                    onAcademicContextChange={handleStartNewChat}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Fixed layout when sidebar is open */
          <div className="hidden h-full md:flex">
            {/* Desktop Sidebar */}
            <div className="w-80 flex-shrink-0 border-r">
              <div className="flex h-full flex-col">
                <div className="border-b p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">History</h2>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewChatClick}
                        disabled={!apiKey}
                        className="h-8 rounded-md border-2 border-black px-2 text-xs font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        New Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKeyDialog(true)}
                        className="h-8 rounded-md border-2 border-black px-2 text-xs font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        API Key
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(true)}
                        title="Hide sidebar"
                        className="h-8 w-8 rounded-md border-2 border-black/20 p-0 font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all duration-200 hover:shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[4px_4px_0px_0px_#757373]"
                      >
                        <SidebarIcon className="h-4 w-4" weight="duotone" />
                      </Button>
                    </div>
                  </div>
                </div>

                <ChatSidebar
                  chats={userChats}
                  selectedChat={selectedChat}
                  onSelectChat={handleSelectChat}
                />
              </div>
            </div>

            {/* Desktop Main Content */}
            <div className="flex-1">
              <div className="flex h-full flex-col">
                {!apiKey ? (
                  <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                      <Button
                        onClick={() => setShowApiKeyDialog(true)}
                        className="rounded-md border-2 border-black bg-black font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        Add API Key to Get Started
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ChatWindow
                    chatId={selectedChat}
                    academicContext={
                      academicContext || {
                        university: University.MEDICAPS,
                        degree: Degree.BTECH_CSE,
                        year: Year.FIRST_YEAR,
                        semester: Semester.FIRST_SEMESTER,
                        subject: "",
                      }
                    }
                    apiKey={apiKey}
                    userId={userId}
                    userProfile={userProfile}
                    isOnboarded={isOnboarded}
                    onChatCreated={(chatId: string) => {
                      setSelectedChat(chatId);
                      router.refresh();
                    }}
                    onAcademicContextChange={handleStartNewChat}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold sm:text-2xl md:text-3xl">
              {apiKey ? "Manage API Key" : "Add Gemini API Key"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium sm:text-base">
              {apiKey
                ? "Your API key is stored locally and encrypted. You can update or remove it below."
                : "To use the AI assistant, please enter your Google Gemini API key. Get one from Google AI Studio."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {apiKey && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 sm:p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-sm font-medium sm:text-base">
                  ✅ API Key is configured and ready to use
                </p>
                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                  Key: {apiKey.substring(0, 8)}...
                  {apiKey.substring(apiKey.length - 4)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="apiKey"
                className="text-sm font-medium sm:text-base"
              >
                {apiKey ? "Update API Key" : "Gemini API Key"}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="rounded-md border-2 border-black text-sm font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 focus:shadow-[2px_2px_0px_0px_#000] sm:text-base dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:focus:shadow-[2px_2px_0px_0px_#757373]"
              />
              <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="textb underline-offtext-blue-600 font-medium underline dark:text-blue-400"
                >
                  Google AI Studio
                </a>
              </p>
              <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                Note: We do not store your API key. It is stored locally in your
                browser & is securely encrypted.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {apiKey && (
              <Button
                variant="destructive"
                onClick={handleRemoveApiKey}
                className="w-full rounded-md border-2 border-red-600 bg-red-600 font-bold text-white shadow-[4px_4px_0px_0px_#dc2626] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#dc2626] sm:w-auto dark:border-red-500 dark:bg-red-500 dark:shadow-[4px_4px_0px_0px_#ef4444] dark:hover:shadow-[2px_2px_0px_0px_#ef4444]"
              >
                Remove Key
              </Button>
            )}
            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className="w-full rounded-md border-2 border-black bg-black font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] disabled:opacity-50 sm:w-auto dark:border-white dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
            >
              {apiKey ? "Update Key" : "Save Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
