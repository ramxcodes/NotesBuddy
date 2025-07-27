"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/db/user";
import {
  createChat,
  createMessage,
  getUserChats,
  deleteChat,
  updateChatName,
} from "@/dal/ai/chat";
import {
  University,
  Degree,
  Year,
  Semester,
  MessageRole,
} from "@prisma/client";

interface CreateChatActionParams {
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string;
  name?: string;
}

interface CreateMessageActionParams {
  chatId: string;
  role: MessageRole;
  content: string;
  model?: string;
}

export async function createChatAction(params: CreateChatActionParams) {
  try {
    const session = await getSession();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const chat = await createChat({
      userId: session.user.id,
      ...params,
    });

    revalidatePath("/ai");
    return { success: true, chatId: chat.id };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Failed to create chat" };
  }
}

export async function createMessageAction(params: CreateMessageActionParams) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const message = await createMessage(params);

    revalidatePath("/ai");
    return { success: true, message };
  } catch (error) {
    console.error("Error creating message:", error);
    return { success: false, error: "Failed to create message" };
  }
}

export async function getUserChatsAction() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const chats = await getUserChats(session.user.id);
    return { success: true, chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function deleteChatAction(chatId: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await deleteChat(chatId, session.user.id);

    revalidatePath("/ai");
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: "Failed to delete chat" };
  }
}

export async function updateChatNameAction(chatId: string, name: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await updateChatName(chatId, session.user.id, name);

    revalidatePath("/ai");
    return { success: true };
  } catch (error) {
    console.error("Error updating chat name:", error);
    return { success: false, error: "Failed to update chat name" };
  }
}
