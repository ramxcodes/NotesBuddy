import { headers } from "next/headers";
import { auth } from "../auth/auth";
import prisma from "./prisma";
import { unstable_cache } from "next/cache";

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const checkUserBlockedStatus = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true },
    });
    return user?.isBlocked || false;
  },
  ["user-blocked-status"],
  {
    revalidate: 600,
    tags: ["user-blocked"],
  }
);
