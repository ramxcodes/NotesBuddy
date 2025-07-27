"use server";

import { adminStatus } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  getAdminChats,
  getAdminChatStats,
  getAdminChatDetailsById,
  deleteAdminChat,
  getChatSubjects,
  getChatAcademicOptions,
} from "@/dal/ai/admin-query";
import type {
  AdminChatFilters,
  AdminChatsResponse,
  AdminChatStats,
  AdminChatDetails,
} from "@/dal/ai/admin-query";

// Get all chats for admin
export async function getAdminChatsAction(
  filters: AdminChatFilters = {},
): Promise<AdminChatsResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getAdminChats(filters);
    return result;
  } catch (error) {
    console.error("Error fetching admin chats:", error);
    return null;
  }
}

// Get chat statistics for admin dashboard
export async function getAdminChatStatsAction(): Promise<{
  success: boolean;
  data?: AdminChatStats;
  error?: string;
}> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const stats = await getAdminChatStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching admin chat stats:", error);
    return { success: false, error: "Failed to fetch chat statistics" };
  }
}

// Get chat details with all messages
export async function getAdminChatDetailsAction(chatId: string): Promise<{
  success: boolean;
  data?: AdminChatDetails;
  error?: string;
}> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const chatDetails = await getAdminChatDetailsById(chatId);

    if (!chatDetails) {
      return { success: false, error: "Chat not found" };
    }

    return { success: true, data: chatDetails };
  } catch (error) {
    console.error("Error fetching admin chat details:", error);
    return { success: false, error: "Failed to fetch chat details" };
  }
}

// Delete a chat
export async function deleteAdminChatAction(
  chatId: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await deleteAdminChat(chatId);

    if (!result) {
      return { success: false, error: "Failed to delete chat" };
    }

    // Revalidate cache
    revalidateTag("admin-chats");
    revalidateTag("admin-chat-stats");

    return { success: true };
  } catch (error) {
    console.error("Error deleting admin chat:", error);
    return { success: false, error: "Failed to delete chat" };
  }
}

// Get chat subjects for filters
export async function getChatSubjectsAction(): Promise<string[] | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const subjects = await getChatSubjects();
    return subjects;
  } catch (error) {
    console.error("Error fetching chat subjects:", error);
    return null;
  }
}

// Get academic filter options
export async function getChatAcademicOptionsAction(): Promise<{
  success: boolean;
  data?: {
    universities: string[];
    degrees: string[];
    years: string[];
    semesters: string[];
    subjects: string[];
  };
  error?: string;
}> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const options = await getChatAcademicOptions();
    return { success: true, data: options };
  } catch (error) {
    console.error("Error fetching chat academic options:", error);
    return { success: false, error: "Failed to fetch academic options" };
  }
}
