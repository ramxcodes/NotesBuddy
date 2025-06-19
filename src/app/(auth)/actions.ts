"use server";

import { getSession, checkUserBlockedStatus } from "@/lib/db/user";
import { createDeviceFingerprint } from "@/dal/user/device/query";
import { DeviceFingerprintData } from "@/dal/user/device/types";
import { redirect } from "next/navigation";

export async function updateDeviceFingerprint(
  deviceData: DeviceFingerprintData
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return;
  }

  const isBlocked = await checkUserBlockedStatus(session.user.id);
  if (isBlocked) {
    redirect("/blocked");
  }

  try {
    await createDeviceFingerprint(session.user.id, deviceData);
  } catch (error) {
    console.error("Failed to update device fingerprint:", error);
    // Don't throw - we don't want to break the user experience
  }
}
