import { headers } from "next/headers";
import { auth } from "../auth/auth";
import prisma from "./prisma";

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const checkUserBlockedStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true },
  });

  return user?.isBlocked || false;
};
