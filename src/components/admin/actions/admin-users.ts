"use server";

import { getAdminUsers } from "@/dal/user/admin/user-table-query";
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
