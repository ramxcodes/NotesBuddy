import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import prisma from "@/lib/db/prisma";
import {
  createDeviceFingerprint,
  getUserActiveDeviceCount,
  blockUserForTooManyDevices,
} from "@/dal/user/device/query";
import { APP_CONFIG } from "@/utils/config";

async function handleDeviceFingerprinting(userId: string, request: Request) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";

    const deviceData = {
      fingerprint: {
        userAgent,
        screen: {
          width: 0,
          height: 0,
          colorDepth: 0,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: acceptLanguage.split(",")[0] || "en",
        platform: "unknown",
        cookieEnabled: true,
        doNotTrack: null,
      },
      deviceLabel: `Device - ${new Date().toLocaleDateString()}`,
    };

    await createDeviceFingerprint(userId, deviceData);

    const deviceCount = await getUserActiveDeviceCount(userId);
    if (deviceCount > APP_CONFIG.MAX_DEVICES_PER_USER) {
      await blockUserForTooManyDevices(userId);
      console.log(
        `User ${userId} blocked for too many devices (${deviceCount}), limit: ${APP_CONFIG.MAX_DEVICES_PER_USER}`
      );
    }
  } catch (error) {
    console.error("Device fingerprinting failed:", error);
  }
}

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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path?.startsWith("/sign-in") && ctx.context.newSession) {
        await handleDeviceFingerprinting(
          ctx.context.newSession.user.id,
          ctx.request!
        );
      }
    }),
  },
});
