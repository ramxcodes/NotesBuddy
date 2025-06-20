import prisma from "@/lib/db/prisma";
import { DeviceFingerprintData } from "./types";
import { APP_CONFIG } from "@/utils/config";
import crypto from "crypto";

function generateDeviceHash(
  fingerprint: DeviceFingerprintData["fingerprint"]
): string {
  type SortableValue =
    | string
    | number
    | boolean
    | null
    | SortableValue[]
    | { [key: string]: SortableValue };

  const sortObject = (obj: SortableValue): SortableValue => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);

    const sorted: { [key: string]: SortableValue } = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObject(obj[key]);
      });
    return sorted;
  };

  const sortedFingerprint = JSON.stringify(sortObject(fingerprint));
  return crypto.createHash("sha256").update(sortedFingerprint).digest("hex");
}

export async function createDeviceFingerprint(
  userId: string,
  deviceData: DeviceFingerprintData
) {
  const fingerprintHash = generateDeviceHash(deviceData.fingerprint);


  return await prisma.$transaction(async (tx) => {
    const existingDevice = await tx.deviceFingerprint.findUnique({
      where: { hash: fingerprintHash },
    });



    if (existingDevice) {
      if (existingDevice.userId !== userId) {

        const currentDeviceCount = await tx.deviceFingerprint.count({
          where: { userId, isActive: true },
        });


        const modifiedFingerprint = {
          ...deviceData.fingerprint,
          userId: userId,
          collisionTimestamp: new Date().toISOString(),
        };

        const newFingerprintHash = generateDeviceHash(modifiedFingerprint);

        if (currentDeviceCount >= APP_CONFIG.MAX_DEVICES_PER_USER) {

          await tx.user.update({
            where: { id: userId },
            data: { isBlocked: true },
          });

          throw new Error(
            `Device limit exceeded. Maximum ${APP_CONFIG.MAX_DEVICES_PER_USER} devices allowed. Current count: ${currentDeviceCount}`
          );
        }


        return await tx.deviceFingerprint.create({
          data: {
            userId,
            fingerprint: modifiedFingerprint,
            hash: newFingerprintHash,
            deviceLabel: deviceData.deviceLabel,
            isActive: true,
            lastUsedAt: new Date(),
          },
        });
      }

      return await tx.deviceFingerprint.update({
        where: { id: existingDevice.id },
        data: { lastUsedAt: new Date() },
      });
    }

    const currentDeviceCount = await tx.deviceFingerprint.count({
      where: {
        userId,
        isActive: true,
      },
    });


    if (currentDeviceCount >= APP_CONFIG.MAX_DEVICES_PER_USER) {

      await tx.user.update({
        where: { id: userId },
        data: { isBlocked: true },
      });

      throw new Error(
        `Device limit exceeded. Maximum ${APP_CONFIG.MAX_DEVICES_PER_USER} devices allowed. Current count: ${currentDeviceCount}`
      );
    }

    return await tx.deviceFingerprint.create({
      data: {
        userId,
        fingerprint: deviceData.fingerprint,
        hash: fingerprintHash,
        deviceLabel: deviceData.deviceLabel,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });
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
    return true;
  }

  return false;
}

export async function clearAllUserDevices(userId: string) {
  return await prisma.deviceFingerprint.deleteMany({
    where: { userId },
  });
}

export async function getAllUserDevicesWithDetails(userId: string) {
  return await prisma.deviceFingerprint.findMany({
    where: { userId },
    select: {
      id: true,
      hash: true,
      deviceLabel: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
      fingerprint: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function unblockUser(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: false },
  });
}
