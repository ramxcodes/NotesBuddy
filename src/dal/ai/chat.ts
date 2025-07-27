import prisma from "@/lib/db/prisma";
import {
  University,
  Degree,
  Year,
  Semester,
  MessageRole,
} from "@prisma/client";

export interface CreateChatParams {
  userId: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  subject: string;
  name?: string;
}

export interface CreateMessageParams {
  chatId: string;
  role: MessageRole;
  content: string;
  model?: string;
}

export async function createChat(params: CreateChatParams) {
  try {
    const chat = await prisma.chat.create({
      data: {
        userId: params.userId,
        university: params.university,
        degree: params.degree,
        year: params.year,
        semester: params.semester,
        subject: params.subject,
        name: params.name || `${params.subject} Chat`,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw new Error("Failed to create chat");
  }
}

export async function getUserChats(userId: string) {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            content: true,
            createdAt: true,
            role: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw new Error("Failed to fetch chats");
  }
}

export async function getChatById(chatId: string, userId: string) {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return chat;
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw new Error("Failed to fetch chat");
  }
}

export async function createMessage(params: CreateMessageParams) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        chatId: params.chatId,
        role: params.role,
        content: params.content,
        model: params.model,
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: {
        id: params.chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to create message");
  }
}

export async function deleteChat(chatId: string, userId: string) {
  try {
    const result = await prisma.chat.delete({
      where: {
        id: chatId,
        userId,
      },
    });

    return result;
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat");
  }
}

export async function updateChatName(
  chatId: string,
  userId: string,
  name: string,
) {
  try {
    const result = await prisma.chat.update({
      where: {
        id: chatId,
        userId,
      },
      data: {
        name,
      },
    });

    return result;
  } catch (error) {
    console.error("Error updating chat name:", error);
    throw new Error("Failed to update chat name");
  }
}
