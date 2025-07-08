"use server";

import { getSession, checkUserBlockedStatus } from "@/lib/db/user";
import { createDeviceFingerprint } from "@/dal/user/device/query";
import { DeviceFingerprintData } from "@/dal/user/device/types";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function updateDeviceFingerprint(
  deviceData: DeviceFingerprintData,
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return { success: false, error: "No session found" };
  }

  const isBlocked = await checkUserBlockedStatus(session.user.id);
  if (isBlocked) {
    redirect("/blocked");
  }

  try {
    // Create device fingerprint with built-in limit checking and security
    await createDeviceFingerprint(session.user.id, deviceData);

    // Invalidate device cache to ensure fresh data appears immediately
    revalidateTag("user-devices");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Device limit exceeded")) {
        await import("@/dal/user/device/query").then(
          ({ blockUserForTooManyDevices }) =>
            blockUserForTooManyDevices(session.user.id),
        );
        redirect("/blocked");
      }

      if (error.message.includes("belongs to another user")) {
        return {
          success: false,
          error: "Device fingerprint conflict. Please try again.",
        };
      }
    }

    return {
      success: false,
      error: "Failed to update device fingerprint",
    };
  }
}
