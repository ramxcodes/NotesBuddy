import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
export const auth = betterAuth({
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: "notes-buddy",
  },
});
