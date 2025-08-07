"use server";

import {
  getAdminUsers,
  deleteUserAndAllRecords,
} from "@/dal/user/admin/user-table-query";
import { adminStatus } from "@/lib/db/user";
import {
  AdminUsersResponse,
  SortOption,
  FilterOption,
} from "@/dal/user/admin/user-table-types";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/db/prisma";

interface GetUsersActionParams {
  page: number;
  search?: string;
  sort: SortOption;
  filter: FilterOption;
}

export async function getAdminUsersAction({
  page,
  search,
  sort,
  filter,
}: GetUsersActionParams): Promise<AdminUsersResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getAdminUsers({
      page,
      limit: 10,
      search,
      sort,
      filter,
    });
    return result;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return null;
  }
}

export async function toggleUserBlockAction(
  userId: string,
): Promise<{ success: boolean; isBlocked?: boolean }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true },
    });

    if (!user) {
      return { success: false };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
      select: { isBlocked: true },
    });

    // Revalidate cache
    revalidateTag("admin-users");

    return { success: true, isBlocked: updatedUser.isBlocked };
  } catch (error) {
    console.error("Error toggling user block status:", error);
    return { success: false };
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Prevent deletion of admin users for safety
    if (user.role === "ADMIN") {
      return { success: false, error: "Cannot delete admin users" };
    }

    // Delete user and all related records
    const deleteSuccess = await deleteUserAndAllRecords(userId);

    if (!deleteSuccess) {
      return {
        success: false,
        error: "Failed to delete user and related records",
      };
    }

    // Revalidate relevant cache tags
    revalidateTag("admin-users");
    revalidateTag("admin-premium-users");
    revalidateTag("admin-reports");
    revalidateTag("admin-chats");
    revalidateTag("admin-quiz-stats");
    revalidateTag("admin-flashcard-stats");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
