import { headers } from "next/headers";
import { auth } from "../auth/auth";
import prisma from "./prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const checkUserBlockedStatus = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true },
  });
  return user?.isBlocked || false;
});

export const adminStatus = async () => {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const getCachedUserRole = unstable_cache(
    async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      return user?.role || null;
    },
    [`user-role-${session.user.id}`],
    {
      revalidate: 1800,
      tags: [`user-role-${session.user.id}`],
    },
  );

  const userRole = await getCachedUserRole(session.user.id);
  return userRole === "ADMIN";
};

export const isAdmin = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
};
