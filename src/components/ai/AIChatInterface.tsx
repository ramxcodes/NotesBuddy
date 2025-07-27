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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { University, Degree, Year, Semester } from "@prisma/client";

interface AcademicContext {
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string; // Make subject required to match ChatWindow
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

  // Check if API key exists in localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowApiKeyDialog(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    // Basic validation for Gemini API key format
    if (!tempApiKey.startsWith("AIza")) {
      toast.error('Invalid Gemini API key format. It should start with "AIza"');
      return;
    }

    localStorage.setItem("gemini_api_key", tempApiKey);
    setApiKey(tempApiKey);
    setShowApiKeyDialog(false);
    setTempApiKey("");
    toast.success("API key saved successfully!");
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem("gemini_api_key");
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
              <h2 className="text-lg font-black tracking-wider uppercase">
                AI CHAT
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChatClick}
                  className="neuro-button px-2 text-xs"
                  disabled={!apiKey}
                >
                  NEW
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyDialog(true)}
                  className="neuro-button px-2 text-xs"
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
                    className="border-4 border-white text-sm font-black tracking-wide uppercase shadow-[8px_8px_0px_0px_#fff] hover:bg-white hover:text-black"
                  >
                    ADD API KEY TO GET STARTED
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
                    subject: "", // Empty subject will trigger the embedded filters
                  }
                }
                apiKey={apiKey}
                userId={userId}
                userProfile={userProfile}
                isOnboarded={isOnboarded}
                onChatCreated={(chatId: string) => {
                  setSelectedChat(chatId);
                  router.refresh(); // Refresh to update sidebar
                }}
                onAcademicContextChange={handleStartNewChat}
              />
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <ResizablePanelGroup
          direction="horizontal"
          className="hidden h-full md:flex"
          data-lenis-prevent
        >
          {/* Desktop Sidebar */}
          <ResizablePanel defaultSize={25} minSize={23} maxSize={25}>
            <div className="flex h-full flex-col">
              <div className="border-b-4 border-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black tracking-wider uppercase">
                    CHAT HISTORY
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChatClick}
                      className="neuro-button"
                      disabled={!apiKey}
                    >
                      NEW CHAT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeyDialog(true)}
                      className="neuro-button"
                    >
                      API KEY
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
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="border-2"
          />

          {/* Desktop Main Content */}
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full flex-col">
              {!apiKey ? (
                <div className="flex flex-1 items-center justify-center p-8">
                  <div className="text-center">
                    <Button
                      onClick={() => setShowApiKeyDialog(true)}
                      className="border-4 border-white font-black tracking-wide uppercase shadow-[8px_8px_0px_0px_#fff] hover:bg-white hover:text-black"
                    >
                      ADD API KEY TO GET STARTED
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
                      subject: "", // Empty subject will trigger the embedded filters
                    }
                  }
                  apiKey={apiKey}
                  userId={userId}
                  userProfile={userProfile}
                  isOnboarded={isOnboarded}
                  onChatCreated={(chatId: string) => {
                    setSelectedChat(chatId);
                    router.refresh(); // Refresh to update sidebar
                  }}
                  onAcademicContextChange={handleStartNewChat}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="neuro-lg max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-wider uppercase sm:text-2xl md:text-3xl">
              {apiKey ? "MANAGE API KEY" : "ADD GEMINI API KEY"}
            </DialogTitle>
            <DialogDescription className="text-sm font-bold tracking-wide text-gray-300 uppercase sm:text-base">
              {apiKey
                ? "YOUR API KEY IS STORED LOCALLY AND ENCRYPTED. YOU CAN UPDATE OR REMOVE IT BELOW."
                : "TO USE THE AI ASSISTANT, PLEASE ENTER YOUR GOOGLE GEMINI API KEY. GET ONE FROM GOOGLE AI STUDIO."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {apiKey && (
              <div className="rounded-md border-4 border-white p-3 shadow-[4px_4px_0px_0px_#fff] sm:p-4">
                <p className="text-sm font-black tracking-wide uppercase sm:text-base">
                  ✅ API KEY IS CONFIGURED AND READY TO USE
                </p>
                <p className="mt-1 text-xs font-bold text-gray-300 sm:text-sm">
                  KEY: {apiKey.substring(0, 8)}...
                  {apiKey.substring(apiKey.length - 4)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="apiKey"
                className="text-sm font-black tracking-wide uppercase sm:text-base"
              >
                {apiKey ? "UPDATE API KEY" : "GEMINI API KEY"}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="border-4 border-black text-sm font-bold shadow-[4px_4px_0px_0px_#fff] placeholder:text-gray-400 sm:text-base dark:border-white"
              />
              <p className="text-xs font-bold tracking-wide text-gray-300 uppercase sm:text-sm">
                GET YOUR API KEY FROM{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-blue-400 underline decoration-4 underline-offset-4"
                >
                  GOOGLE AI STUDIO
                </a>
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {apiKey && (
              <Button
                variant="destructive"
                onClick={handleRemoveApiKey}
                className="neuro-button w-full sm:w-auto"
              >
                REMOVE KEY
              </Button>
            )}
            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className="neuro-button w-full disabled:opacity-50 sm:w-auto"
            >
              {apiKey ? "UPDATE KEY" : "SAVE KEY"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
