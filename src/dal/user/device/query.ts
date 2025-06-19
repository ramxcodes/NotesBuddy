import prisma from "@/lib/db/prisma";
import { DeviceFingerprintData } from "./types";
import { APP_CONFIG } from "@/utils/config";

export async function createDeviceFingerprint(
  userId: string,
  deviceData: DeviceFingerprintData
) {
  const fingerprintHash = Buffer.from(
    JSON.stringify(deviceData.fingerprint)
  ).toString("base64");

  // Check if this device already exists
  const existingDevice = await prisma.deviceFingerprint.findUnique({
    where: { hash: fingerprintHash },
  });

  if (existingDevice) {
    // Update last used timestamp
    return await prisma.deviceFingerprint.update({
      where: { id: existingDevice.id },
      data: { lastUsedAt: new Date() },
    });
  }

  // Create new device fingerprint
  return await prisma.deviceFingerprint.create({
    data: {
      userId,
      fingerprint: deviceData.fingerprint,
      hash: fingerprintHash,
      deviceLabel: deviceData.deviceLabel,
      isActive: true,
      lastUsedAt: new Date(),
    },
  });
}

export async function getUserDevices(userId: string) {
  return await prisma.deviceFingerprint.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      lastUsedAt: "desc",
    },
  });
}

export async function getUserActiveDeviceCount(userId: string) {
  return await prisma.deviceFingerprint.count({
    where: {
      userId,
      isActive: true,
    },
  });
}

export async function blockUserForTooManyDevices(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: true },
  });
}

export async function checkAndBlockUserForDeviceLimit(userId: string) {
  const deviceCount = await getUserActiveDeviceCount(userId);

  if (deviceCount > APP_CONFIG.MAX_DEVICES_PER_USER) {
    await blockUserForTooManyDevices(userId);
    console.log(
      `User ${userId} blocked for too many devices (${deviceCount}), limit: ${APP_CONFIG.MAX_DEVICES_PER_USER}`
    );
    return true;
  }

  return false;
}
