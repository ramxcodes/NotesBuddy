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
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import {
  adminRemoveUserDevice,
  adminClearAllUserDevices,
} from "@/dal/user/device/query";

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

    const isBlocking = !user.isBlocked;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: isBlocking },
      select: { isBlocked: true },
    });

    // If blocking user, delete all active sessions
    if (isBlocking) {
      await prisma.session.deleteMany({
        where: { userId },
      });
    }

    // Revalidate ALL user-related caches
    revalidateTag("admin-users");
    revalidateTag("user-onboarding");
    revalidateTag("user-full-profile");
    revalidateTag("user-devices");
    revalidateTag("user-wallet-balance");
    revalidateTag(`user-role-${userId}`);
    revalidateTag(`user-id-${userId}`);

    // Also invalidate session-related paths
    revalidatePath("/profile");
    revalidatePath("/blocked");

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

export async function adminRemoveUserDeviceAction(params: {
  userId: string;
  deviceId: string;
}): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { userId, deviceId } = params;

    const result = await adminRemoveUserDevice(userId, deviceId);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to remove device",
      };
    }

    // Ensure admin users cache is refreshed
    revalidateTag("admin-users");
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function adminClearAllUserDevicesAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await adminStatus();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await adminClearAllUserDevices(userId);

    // Ensure admin users and user devices caches are refreshed
    revalidateTag("admin-users");
    revalidateTag("user-devices");

    return { success: true };
  } catch (error) {
    console.error("Error clearing all user devices:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
