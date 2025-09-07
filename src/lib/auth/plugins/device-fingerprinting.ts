import {
  createAuthEndpoint,
  sessionMiddleware,
  createAuthMiddleware,
} from "better-auth/api";
import {
  createDeviceFingerprint,
  validateDeviceFingerprint,
  createSafariOptimizedFingerprint,
} from "@/dal/user/device/query";
import { DeviceFingerprintData } from "@/dal/user/device/types";
import { checkUserBlockedStatus } from "@/lib/db/user";
import type { BetterAuthPlugin } from "better-auth";
import {
  telegramLogger,
  logDeviceLimitExceeded,
} from "@/utils/telegram-logger";

export const deviceFingerprintingPlugin = () => {
  return {
    id: "device-fingerprinting",
    hooks: {
      after: [
        {
          matcher: (context: { path: string }) => {
            return (
              context.path === "/sign-in/social" ||
              context.path.startsWith("/callback/") ||
              context.path === "/callback"
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const session = ctx.context.newSession;

            if (!session?.user?.id) {
              return;
            }

            try {
              const isBlocked = await checkUserBlockedStatus(session.user.id);
              if (isBlocked) {
                const contextDetails = [
                  `ID: ${session.user.id}`,
                  `Email: ${session.user.email}`,
                  `Name: ${session.user.name}`,
                  `IP: ${ctx.headers?.get("x-forwarded-for") || ctx.headers?.get("x-real-ip") || "unknown"}`,
                  `Time: ${new Date().toISOString()}`,
                ].join(" | ");

                const detailedMessage = `User authentication blocked - Account suspended\n\nContext: ${contextDetails}`;

                await telegramLogger(detailedMessage);
                if (ctx.context.internalAdapter?.deleteSession) {
                  try {
                    await ctx.context.internalAdapter.deleteSession(
                      session.session.token,
                    );
                  } catch (sessionDeleteError) {
                    console.warn(
                      "Failed to delete session for blocked user:",
                      sessionDeleteError,
                    );
                  }
                }

                const errorUrl = new URL(
                  "/auth/error",
                  ctx.context.baseURL || "https://notesbuddy.in",
                );
                errorUrl.searchParams.set("error", "ACCOUNT_SUSPENDED");
                errorUrl.searchParams.set(
                  "message",
                  "Account has been suspended due to security violations.",
                );

                throw ctx.redirect(errorUrl.toString());
              }

              if (!ctx.headers) {
                const contextDetails = [
                  `ID: ${session.user.id}`,
                  `Email: ${session.user.email}`,
                  `Name: ${session.user.name}`,
                  `Time: ${new Date().toISOString()}`,
                ].join(" | ");

                const detailedMessage = `Device validation failed - Missing headers\n\nContext: ${contextDetails}`;

                await telegramLogger(detailedMessage);

                // Delete the session that was just created
                if (ctx.context.internalAdapter?.deleteSession) {
                  try {
                    await ctx.context.internalAdapter.deleteSession(
                      session.session.token,
                    );
                  } catch (sessionDeleteError) {
                    console.warn(
                      "Failed to delete session for missing headers:",
                      sessionDeleteError,
                    );
                  }
                }

                const errorUrl = new URL(
                  "/auth/error",
                  ctx.context.baseURL || "https://notesbuddy.in",
                );
                errorUrl.searchParams.set(
                  "error",
                  "DEVICE_VERIFICATION_FAILED_PLEASE_TRY_AGAIN_OR_CONTACT_SUPPORT_IF_THIS_PERSISTS",
                );
                errorUrl.searchParams.set(
                  "message",
                  "Device verification required but headers missing",
                );

                throw ctx.redirect(errorUrl.toString());
              }

              const deviceFingerprint = await createSafariOptimizedFingerprint(
                ctx.headers,
              );

              await validateDeviceFingerprint(
                session.user.id,
                deviceFingerprint,
              );

              await createDeviceFingerprint(session.user.id, deviceFingerprint);

              return;
            } catch (error) {
              const userAgent = ctx.headers?.get("user-agent") || "";
              if (
                userAgent.toLowerCase().includes("safari") &&
                !userAgent.toLowerCase().includes("chrome")
              ) {
                try {
                  if (ctx.headers) {
                    const safariFingerprint =
                      await createSafariOptimizedFingerprint(ctx.headers, true);
                    await validateDeviceFingerprint(
                      session.user.id,
                      safariFingerprint,
                    );
                    await createDeviceFingerprint(
                      session.user.id,
                      safariFingerprint,
                    );
                    return;
                  }
                } catch {}
              }

              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Unknown device verification error";

              if (errorMessage.includes("Device limit exceeded")) {
                await logDeviceLimitExceeded({
                  userId: session.user.id,
                  email: session.user.email,
                  name: session.user.name,
                });
              } else {
                const contextDetails = [
                  `ID: ${session.user.id}`,
                  `Email: ${session.user.email}`,
                  `Name: ${session.user.name}`,
                  `Agent: ${(ctx.headers?.get("user-agent") || "unknown").substring(0, 50)}`,
                  `IP: ${ctx.headers?.get("x-forwarded-for") || ctx.headers?.get("x-real-ip") || "unknown"}`,
                  `Time: ${new Date().toISOString()}`,
                ].join(" | ");

                const detailedMessage = `Device validation failed - Session deleted\n\nContext: ${contextDetails}`;
                await telegramLogger(detailedMessage, error);
              }
              if (ctx.context.internalAdapter?.deleteSession) {
                try {
                  await ctx.context.internalAdapter.deleteSession(
                    session.session.token,
                  );
                } catch (sessionDeleteError) {
                  console.warn("Failed to delete session:", sessionDeleteError);
                }
              }

              const errorCode = errorMessage.includes("Device limit exceeded")
                ? "DEVICE_LIMIT_EXCEEDED"
                : "DEVICE_VERIFICATION_FAILED_PLEASE_TRY_AGAIN_OR_CONTACT_SUPPORT_IF_THIS_PERSISTS";

              const errorUrl = new URL(
                "/auth/error",
                ctx.context.baseURL || "https://notesbuddy.in",
              );
              errorUrl.searchParams.set("error", errorCode);
              errorUrl.searchParams.set("message", errorMessage);

              throw ctx.redirect(errorUrl.toString());
            }
          }),
        },
      ],
    },
    endpoints: {
      registerDevice: createAuthEndpoint(
        "/device-fingerprinting/register",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          if (!session?.user?.id) {
            return ctx.json(
              { success: false, error: "No session found" },
              { status: 401 },
            );
          }

          try {
            const isBlocked = await checkUserBlockedStatus(session.user.id);
            if (isBlocked) {
              return ctx.json(
                { success: false, error: "User is blocked" },
                { status: 403 },
              );
            }

            // Validate request body
            if (!ctx.body || typeof ctx.body !== "object") {
              return ctx.json(
                { success: false, error: "Invalid request body" },
                { status: 400 },
              );
            }

            const body = ctx.body as Record<string, unknown>;

            if (!body.fingerprint || typeof body.fingerprint !== "object") {
              return ctx.json(
                { success: false, error: "Invalid fingerprint data" },
                { status: 400 },
              );
            }

            const deviceData: DeviceFingerprintData = {
              fingerprint:
                body.fingerprint as DeviceFingerprintData["fingerprint"],
              deviceLabel:
                typeof body.deviceLabel === "string"
                  ? body.deviceLabel
                  : undefined,
            };

            await createDeviceFingerprint(session.user.id, deviceData);
            return ctx.json({ success: true });
          } catch (error) {
            const contextDetails = [
              `User ID: ${session.user.id}`,
              `Email: ${session.user.email}`,
              `Name: ${session.user.name}`,
              `User Agent: ${ctx.headers?.get("user-agent") || "unknown"}`,
              `IP: ${ctx.headers?.get("x-forwarded-for") || ctx.headers?.get("x-real-ip") || "unknown"}`,
              `Referer: ${ctx.headers?.get("referer") || "unknown"}`,
              `Endpoint: device-fingerprinting/register`,
              `Timestamp: ${new Date().toISOString()}`,
            ].join("\n");

            const detailedMessage = `Device registration endpoint error\n\nContext:\n${contextDetails}`;

            await telegramLogger(detailedMessage, error);

            if (error instanceof Error) {
              if (error.message.includes("Device limit exceeded")) {
                return ctx.json(
                  { success: false, error: "Device limit exceeded" },
                  { status: 429 },
                );
              }
              if (error.message.includes("belongs to another user")) {
                return ctx.json(
                  { success: false, error: "Device fingerprint conflict" },
                  { status: 409 },
                );
              }
              if (error.message.includes("User is blocked")) {
                return ctx.json(
                  { success: false, error: "User is blocked" },
                  { status: 403 },
                );
              }
            }

            return ctx.json(
              { success: false, error: "Failed to register device" },
              { status: 500 },
            );
          }
        },
      ),
      validateDevice: createAuthEndpoint(
        "/device-fingerprinting/validate",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          if (!session?.user?.id) {
            return ctx.json(
              { success: false, error: "No session found" },
              { status: 401 },
            );
          }

          try {
            const body = ctx.body as Record<string, unknown>;

            if (!body.fingerprint || typeof body.fingerprint !== "object") {
              return ctx.json(
                { success: false, error: "Invalid fingerprint data" },
                { status: 400 },
              );
            }

            const deviceData: DeviceFingerprintData = {
              fingerprint:
                body.fingerprint as DeviceFingerprintData["fingerprint"],
              deviceLabel:
                typeof body.deviceLabel === "string"
                  ? body.deviceLabel
                  : undefined,
            };

            const isValid = await validateDeviceFingerprint(
              session.user.id,
              deviceData,
            );
            return ctx.json({ success: true, isValid });
          } catch (error) {
            // Create detailed context for logging
            const contextDetails = [
              `User ID: ${session.user.id}`,
              `Email: ${session.user.email}`,
              `Name: ${session.user.name}`,
              `User Agent: ${ctx.headers?.get("user-agent") || "unknown"}`,
              `IP: ${ctx.headers?.get("x-forwarded-for") || ctx.headers?.get("x-real-ip") || "unknown"}`,
              `Referer: ${ctx.headers?.get("referer") || "unknown"}`,
              `Endpoint: device-fingerprinting/validate`,
              `Timestamp: ${new Date().toISOString()}`,
            ].join("\n");

            const detailedMessage = `Device validation endpoint error\n\nContext:\n${contextDetails}`;

            await telegramLogger(detailedMessage, error);
            return ctx.json(
              { success: false, error: "Device validation failed" },
              { status: 500 },
            );
          }
        },
      ),
    },
  } as BetterAuthPlugin;
};
