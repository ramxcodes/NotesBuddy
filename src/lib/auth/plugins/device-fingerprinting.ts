import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { createDeviceFingerprint } from "@/dal/user/device/query";
import { DeviceFingerprintData } from "@/dal/user/device/types";
import { checkUserBlockedStatus } from "@/lib/db/user";
import type { BetterAuthPlugin } from "better-auth";

export const deviceFingerprintingPlugin = () => {
  return {
    id: "device-fingerprinting",
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
            console.error("Device fingerprinting error:", error);

            // Handle specific errors
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
    },
  } satisfies BetterAuthPlugin;
};
