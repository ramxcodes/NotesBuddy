import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import {
  University,
  Degree,
  Year,
  Semester,
  MessageRole,
  type Prisma,
} from "@prisma/client";

// Types for admin AI operations
export interface AdminChatListItem {
  id: string;
  name: string;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  messageCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    role: MessageRole;
    createdAt: Date;
  };
}

export interface AdminChatDetails {
  id: string;
  name: string;
  subject: string;
  university: University;
  degree: Degree;
  year: Year;
  semester: Semester;
  user: {
    id: string;
    name: string;
    email: string;
  };
  messages: AdminChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  model: string | null;
  createdAt: Date;
}

export interface AdminChatStats {
  totalChats: number;
  totalMessages: number;
  totalUsers: number;
  activeChatsToday: number;
  activeChatsThisWeek: number;
  activeChatsThisMonth: number;
  messagesByModel: { model: string; count: number }[];
  chatsBySubject: { subject: string; count: number }[];
  chatsByUniversity: { university: University; count: number }[];
}

export interface AdminChatFilters {
  search?: string;
  university?: University;
  degree?: Degree;
  year?: Year;
  semester?: Semester;
  subject?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface AdminChatsResponse {
  chats: AdminChatListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Cache config for admin AI operations
const adminAICacheConfig = {
  getAdminChats: {
    cacheTime: 60, // 1 minute
    tags: ["admin-chats"],
    cacheKey: "admin-chats",
  },
  getAdminChatStats: {
    cacheTime: 300, // 5 minutes
    tags: ["admin-chat-stats"],
    cacheKey: "admin-chat-stats",
  },
  getChatSubjects: {
    cacheTime: 3600, // 1 hour
    tags: ["chat-subjects"],
    cacheKey: "chat-subjects",
  },
};

// Get all chats for admin with filters and pagination
async function getAdminChatsInternal(
  filters: AdminChatFilters = {},
): Promise<AdminChatsResponse> {
  const {
    search,
    university,
    degree,
    year,
    semester,
    subject,
    userId,
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ChatWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (university) where.university = university;
  if (degree) where.degree = degree;
  if (year) where.year = year;
  if (semester) where.semester = semester;
  if (subject) where.subject = { contains: subject, mode: "insensitive" };
  if (userId) where.userId = userId;

  // Get chats with pagination
  const [chats, totalCount] = await Promise.all([
    prisma.chat.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.chat.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    chats: chats.map((chat) => ({
      id: chat.id,
      name: chat.name,
      subject: chat.subject,
      university: chat.university,
      degree: chat.degree,
      year: chat.year,
      semester: chat.semester,
      messageCount: chat._count.messages,
      user: chat.user,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessage: chat.messages[0] || undefined,
    })),
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// Get chat details with all messages for admin
export async function getAdminChatDetailsById(
  chatId: string,
): Promise<AdminChatDetails | null> {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            model: true,
            createdAt: true,
          },
        },
      },
    });

    if (!chat) return null;

    return {
      id: chat.id,
      name: chat.name,
      subject: chat.subject,
      university: chat.university,
      degree: chat.degree,
      year: chat.year,
      semester: chat.semester,
      user: chat.user,
      messages: chat.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching admin chat details:", error);
    return null;
  }
}

// Get AI chat statistics for admin dashboard
async function getAdminChatStatsInternal(): Promise<AdminChatStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalChats,
    totalMessages,
    totalUsers,
    activeChatsToday,
    activeChatsThisWeek,
    activeChatsThisMonth,
    messagesByModel,
    chatsBySubject,
    chatsByUniversity,
  ] = await Promise.all([
    // Total chats
    prisma.chat.count(),

    // Total messages
    prisma.chatMessage.count(),

    // Total unique users who have used AI
    prisma.chat
      .findMany({
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((result) => result.length),

    // Active chats today
    prisma.chat.count({
      where: {
        updatedAt: { gte: startOfDay },
      },
    }),

    // Active chats this week
    prisma.chat.count({
      where: {
        updatedAt: { gte: startOfWeek },
      },
    }),

    // Active chats this month
    prisma.chat.count({
      where: {
        updatedAt: { gte: startOfMonth },
      },
    }),

    // Messages by model
    prisma.chatMessage.groupBy({
      by: ["model"],
      _count: {
        id: true,
      },
      where: {
        model: { not: null },
      },
    }),

    // Chats by subject
    prisma.chat.groupBy({
      by: ["subject"],
      _count: {
        id: true,
      },
    }),

    // Chats by university
    prisma.chat.groupBy({
      by: ["university"],
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    totalChats,
    totalMessages,
    totalUsers,
    activeChatsToday,
    activeChatsThisWeek,
    activeChatsThisMonth,
    messagesByModel: messagesByModel.map(
      (item: { model: string | null; _count: { id: number } }) => ({
        model: item.model || "Unknown",
        count: item._count.id,
      }),
    ),
    chatsBySubject: chatsBySubject.map(
      (item: { subject: string; _count: { id: number } }) => ({
        subject: item.subject,
        count: item._count.id,
      }),
    ),
    chatsByUniversity: chatsByUniversity.map(
      (item: { university: University; _count: { id: number } }) => ({
        university: item.university,
        count: item._count.id,
      }),
    ),
  };
}

// Get unique subjects from chats for filter dropdown
export async function getChatSubjects(): Promise<string[]> {
  try {
    const subjects = await prisma.chat.findMany({
      select: { subject: true },
      distinct: ["subject"],
      orderBy: { subject: "asc" },
    });

    return subjects.map((item) => item.subject);
  } catch (error) {
    console.error("Error fetching chat subjects:", error);
    return [];
  }
}

// Delete a chat (admin only)
export async function deleteAdminChat(chatId: string): Promise<boolean> {
  try {
    await prisma.chat.delete({
      where: { id: chatId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
}

// Get academic filter options from existing chats
export async function getChatAcademicOptions() {
  try {
    const [universities, degrees, years, semesters, subjects] =
      await Promise.all([
        prisma.chat.findMany({
          select: { university: true },
          distinct: ["university"],
          orderBy: { university: "asc" },
        }),
        prisma.chat.findMany({
          select: { degree: true },
          distinct: ["degree"],
          orderBy: { degree: "asc" },
        }),
        prisma.chat.findMany({
          select: { year: true },
          distinct: ["year"],
          orderBy: { year: "asc" },
        }),
        prisma.chat.findMany({
          select: { semester: true },
          distinct: ["semester"],
          orderBy: { semester: "asc" },
        }),
        prisma.chat.findMany({
          select: { subject: true },
          distinct: ["subject"],
          orderBy: { subject: "asc" },
        }),
      ]);

    return {
      universities: universities.map((item) => item.university),
      degrees: degrees.map((item) => item.degree),
      years: years.map((item) => item.year),
      semesters: semesters.map((item) => item.semester),
      subjects: subjects.map((item) => item.subject),
    };
  } catch (error) {
    console.error("Error fetching chat academic options:", error);
    return {
      universities: [],
      degrees: [],
      years: [],
      semesters: [],
      subjects: [],
    };
  }
}

// Cached functions
export const getAdminChats = unstable_cache(
  getAdminChatsInternal,
  ["admin-chats"],
  getCacheOptions(adminAICacheConfig.getAdminChats),
);

export const getAdminChatStats = unstable_cache(
  getAdminChatStatsInternal,
  ["admin-chat-stats"],
  getCacheOptions(adminAICacheConfig.getAdminChatStats),
);
