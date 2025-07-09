import { headers } from "next/headers";
import { auth } from "../auth/auth";
import prisma from "./prisma";
import { cache } from "react";

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export const checkUserBlockedStatus = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true },
  });
  return user?.isBlocked || false;
});
