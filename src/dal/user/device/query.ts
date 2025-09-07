import prisma from "@/lib/db/prisma";
import { DeviceFingerprintData } from "./types";
import { APP_CONFIG } from "@/utils/config";
import crypto from "crypto";
import { DEVICE_CONFIG } from "@/utils/config";
import {
  BrowserOSInfo,
  DeviceDataSchema,
  FingerprintSchema,
  SimilarityMetrics,
} from "@/types/device";
import { UAParser } from "ua-parser-js";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { getCacheOptions } from "@/cache/cache";
import { userCacheConfig } from "@/cache/user";

function createOptimizedHash(data: Record<string, unknown>): string {
  const createSortedString = (obj: unknown): string => {
    if (obj === null || obj === undefined) return "null";
    if (typeof obj !== "object") return String(obj);
    if (Array.isArray(obj)) return `[${obj.map(createSortedString).join(",")}]`;

    const keys = Object.keys(obj as Record<string, unknown>).sort();
    const pairs = keys.map(
      (key) =>
        `${key}:${createSortedString((obj as Record<string, unknown>)[key])}`,
    );
    return `{${pairs.join(",")}}`;
  };

  const sortedString = createSortedString(data);
  return crypto.createHash("sha256").update(sortedString, "utf8").digest("hex");
}

function validateFingerprint(
  fingerprint: unknown,
): asserts fingerprint is DeviceFingerprintData["fingerprint"] {
  const result = FingerprintSchema.safeParse(fingerprint);
  if (!result.success) {
    throw new Error(`Invalid fingerprint data: ${result.error.message}`);
  }
}

function validateDeviceData(
  deviceData: unknown,
): asserts deviceData is DeviceFingerprintData {
  const result = DeviceDataSchema.safeParse(deviceData);
  if (!result.success) {
    throw new Error(`Invalid device data: ${result.error.message}`);
  }
}

function generateDeviceHash(
  fingerprint: DeviceFingerprintData["fingerprint"],
): string {
  validateFingerprint(fingerprint);
  return createOptimizedHash(fingerprint as Record<string, unknown>);
}

export function createSafariOptimizedFingerprint(
  headers: Headers,
  useFallback: boolean = false,
): Promise<DeviceFingerprintData> {
  return new Promise((resolve) => {
    const userAgent = headers.get("user-agent") || "";
    const acceptLanguage = headers.get("accept-language") || "";
    const acceptEncoding = headers.get("accept-encoding") || "";
    const connection = headers.get("connection") || "";

    const fingerprint: DeviceFingerprintData["fingerprint"] = {
      userAgent,
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelDepth: 24,
      },
      timezone: "UTC",
      language: acceptLanguage.split(",")[0] || "en-US",
      languages: acceptLanguage || "en-US",
      platform: userAgent.includes("Mac")
        ? "MacIntel"
        : userAgent.includes("iPhone")
          ? "iPhone"
          : userAgent.includes("iPad")
            ? "iPad"
            : "unknown",
      cookieEnabled: true,
      doNotTrack: null,
      vendor: "Apple Computer, Inc.",
      browserName: "Safari",
      canvasFingerprint: useFallback
        ? `safari-fallback-${Date.now()}`
        : "safari-restricted",
      hardwareConcurrency: 8,
      maxTouchPoints:
        userAgent.includes("iPhone") || userAgent.includes("iPad") ? 5 : 0,
    };

    const serverFingerprint = {
      acceptLanguage,
      acceptEncoding,
      connection,
      dnt: headers.get("dnt") || null,
    };

    const enhancedFingerprint = {
      ...fingerprint,
      serverCharacteristics: serverFingerprint,
    };

    resolve({
      fingerprint: enhancedFingerprint as DeviceFingerprintData["fingerprint"],
      deviceLabel: `Safari on ${fingerprint.platform}`,
    });
  });
}

export async function validateDeviceFingerprint(
  userId: string,
  deviceData: DeviceFingerprintData,
): Promise<boolean> {
  try {
    validateDeviceData(deviceData);

    const fingerprintHash = generateDeviceHash(deviceData.fingerprint);
    const userDevices = await getActiveUserDevicesOptimized(userId);

    const existingDevice = userDevices.find(
      (device) => device.hash === fingerprintHash,
    );
    if (existingDevice) {
      return true;
    }

    const similarDevice = await findSimilarDeviceOptimized(
      userId,
      deviceData.fingerprint,
      DEVICE_CONFIG.SIMILARITY_THRESHOLD,
    );

    if (similarDevice) {
      return true;
    }

    if (userDevices.length >= APP_CONFIG.MAX_DEVICES_PER_USER) {
      throw new Error("Device limit exceeded");
    }

    return true;
  } catch (error) {
    console.error("Device validation failed:", error);
    throw error;
  }
}

function extractBrowserOSInfo(userAgent: string): BrowserOSInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browserName = result.browser.name?.toLowerCase() || "unknown";
  let browser = "other";

  if (browserName.includes("chrome") || browserName.includes("chromium")) {
    browser = "chrome";
  } else if (browserName.includes("firefox")) {
    browser = "firefox";
  } else if (browserName.includes("safari")) {
    browser = "safari";
  } else if (browserName.includes("edge")) {
    browser = "edge";
  }

  const osName = result.os.name?.toLowerCase() || "unknown";
  let os = "other";

  if (osName.includes("mac") || osName.includes("os x")) {
    os = "mac";
  } else if (osName.includes("windows")) {
    os = "windows";
  } else if (osName.includes("linux")) {
    os = "linux";
  } else if (osName.includes("android")) {
    os = "android";
  } else if (osName.includes("ios")) {
    os = "ios";
  }

  return { browser, os };
}

function calculatePlatformSimilarity(
  fp1: DeviceFingerprintData["fingerprint"],
  fp2: DeviceFingerprintData["fingerprint"],
): number {
  if (!fp1.platform || !fp2.platform) {
    return 0;
  }
  return fp1.platform === fp2.platform
    ? DEVICE_CONFIG.SIMILARITY_WEIGHTS.platform
    : 0;
}

function calculateScreenSimilarity(
  fp1: DeviceFingerprintData["fingerprint"],
  fp2: DeviceFingerprintData["fingerprint"],
): number {
  const screen1 = fp1.screen;
  const screen2 = fp2.screen;

  if (!screen1 || !screen2) {
    return 0;
  }

  const sameResolution =
    screen1.width === screen2.width && screen1.height === screen2.height;

  const colorDepthDiff = Math.abs(screen1.colorDepth - screen2.colorDepth);
  const similarColorDepth =
    colorDepthDiff <= DEVICE_CONFIG.COLOR_DEPTH_VARIANCE;

  if (sameResolution && similarColorDepth) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.screen;
  } else if (sameResolution) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.screen * 0.8;
  }

  return 0;
}

function calculateUserAgentSimilarity(
  fp1: DeviceFingerprintData["fingerprint"],
  fp2: DeviceFingerprintData["fingerprint"],
): number {
  if (!fp1.userAgent || !fp2.userAgent) {
    return 0;
  }

  const browser1 = extractBrowserOSInfo(fp1.userAgent);
  const browser2 = extractBrowserOSInfo(fp2.userAgent);

  if (browser1.browser === browser2.browser && browser1.os === browser2.os) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent;
  }

  if (browser1.os === browser2.os) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent * 0.7;
  }

  if (browser1.browser === browser2.browser) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent * 0.4;
  }

  return 0;
}

function calculateFieldSimilarity<T>(
  value1: T,
  value2: T,
  weight: number,
): number {
  if (value1 == null || value2 == null) {
    return 0;
  }
  return value1 === value2 ? weight : 0;
}

function calculateDeviceSimilarity(
  fingerprint1: DeviceFingerprintData["fingerprint"],
  fingerprint2: DeviceFingerprintData["fingerprint"],
): number {
  validateFingerprint(fingerprint1);
  validateFingerprint(fingerprint2);

  const similarities: SimilarityMetrics = {
    platform: calculatePlatformSimilarity(fingerprint1, fingerprint2),
    screen: calculateScreenSimilarity(fingerprint1, fingerprint2),
    userAgent: calculateUserAgentSimilarity(fingerprint1, fingerprint2),
    timezone: calculateFieldSimilarity(
      fingerprint1.timezone,
      fingerprint2.timezone,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.timezone,
    ),
    language: calculateFieldSimilarity(
      fingerprint1.language,
      fingerprint2.language,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.language,
    ),
    hardwareConcurrency: calculateFieldSimilarity(
      fingerprint1.hardwareConcurrency,
      fingerprint2.hardwareConcurrency,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.hardwareConcurrency,
    ),
    cookieEnabled: calculateFieldSimilarity(
      fingerprint1.cookieEnabled,
      fingerprint2.cookieEnabled,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.cookieEnabled,
    ),
    vendor: calculateFieldSimilarity(
      fingerprint1.vendor,
      fingerprint2.vendor,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.vendor,
    ),
    maxTouchPoints: calculateFieldSimilarity(
      fingerprint1.maxTouchPoints,
      fingerprint2.maxTouchPoints,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.maxTouchPoints,
    ),
    doNotTrack: calculateFieldSimilarity(
      fingerprint1.doNotTrack,
      fingerprint2.doNotTrack,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.doNotTrack,
    ),
  };

  const totalScore = Object.values(similarities).reduce(
    (total, score) => total + score,
    0,
  );

  const normalizedScore = Math.min(totalScore, 1.0);
  const hasMinimumData = similarities.platform > 0 && similarities.screen > 0;

  return hasMinimumData ? normalizedScore : 0;
}

async function getActiveUserDevicesOptimized(userId: string) {
  const devices = await prisma.deviceFingerprint.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      fingerprint: true,
      hash: true,
      deviceLabel: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: {
      lastUsedAt: "desc",
    },
  });

  const uniqueDevices = new Map<string, (typeof devices)[0]>();

  for (const device of devices) {
    try {
      const fingerprint =
        device.fingerprint as DeviceFingerprintData["fingerprint"];

      const deviceKey = JSON.stringify({
        platform: fingerprint.platform,
        screen: fingerprint.screen
          ? `${fingerprint.screen.width}x${fingerprint.screen.height}`
          : null,
        hardwareConcurrency: fingerprint.hardwareConcurrency,
      });

      const existing = uniqueDevices.get(deviceKey);
      if (
        !existing ||
        new Date(device.lastUsedAt) > new Date(existing.lastUsedAt)
      ) {
        uniqueDevices.set(deviceKey, device);
      }
    } catch (error) {
      console.warn(`Error processing device ${device.id}:`, error);
      uniqueDevices.set(device.id, device);
    }
  }

  return Array.from(uniqueDevices.values()).sort(
    (a, b) =>
      new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
  );
}

async function findSimilarDeviceOptimized(
  userId: string,
  fingerprint: DeviceFingerprintData["fingerprint"],
  threshold: number,
) {
  validateFingerprint(fingerprint);

  const userDevices = await getActiveUserDevicesOptimized(userId);

  if (userDevices.length === 0) {
    return null;
  }

  const candidateDevices = userDevices.filter((device) => {
    try {
      const deviceFingerprint =
        device.fingerprint as DeviceFingerprintData["fingerprint"];
      validateFingerprint(deviceFingerprint);

      if (deviceFingerprint.platform && fingerprint.platform) {
        if (deviceFingerprint.platform !== fingerprint.platform) {
          return false;
        }
      }

      if (deviceFingerprint.screen && fingerprint.screen) {
        const screenMatch =
          deviceFingerprint.screen.width === fingerprint.screen.width &&
          deviceFingerprint.screen.height === fingerprint.screen.height;

        if (!screenMatch) {
          return false;
        }
      }

      if (
        deviceFingerprint.hardwareConcurrency &&
        fingerprint.hardwareConcurrency
      ) {
        if (
          deviceFingerprint.hardwareConcurrency !==
          fingerprint.hardwareConcurrency
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`Invalid fingerprint data for device ${device.id}:`, error);
      return false;
    }
  });

  for (const device of candidateDevices) {
    try {
      const deviceFingerprint =
        device.fingerprint as DeviceFingerprintData["fingerprint"];
      const similarity = calculateDeviceSimilarity(
        fingerprint,
        deviceFingerprint,
      );

      if (similarity >= threshold) {
        return device;
      }
    } catch (error) {
      console.warn(
        `Error calculating similarity for device ${device.id}:`,
        error,
      );
      continue;
    }
  }

  return null;
}

async function validateDeviceLimitWithLock(
  userId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<number> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isBlocked: true,
      _count: {
        select: {
          deviceFingerprints: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isBlocked) {
    throw new Error("User is blocked");
  }

  const currentDeviceCount = user._count.deviceFingerprints;

  if (currentDeviceCount > APP_CONFIG.MAX_DEVICES_PER_USER) {
    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    throw new Error(
      `Device limit exceeded. Maximum ${APP_CONFIG.MAX_DEVICES_PER_USER} devices allowed. Current: ${currentDeviceCount}`,
    );
  }

  return currentDeviceCount;
}

async function handleExactHashMatch(
  exactMatch: { id: string; userId: string },
  userId: string,
  deviceData: DeviceFingerprintData,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  if (exactMatch.userId !== userId) {
    await validateDeviceLimitWithLock(userId, tx);

    const collisionHash = createOptimizedHash({
      ...deviceData.fingerprint,
      userId,
      timestamp: Date.now(),
    });

    return await tx.deviceFingerprint.create({
      data: {
        userId,
        fingerprint: deviceData.fingerprint,
        hash: collisionHash,
        deviceLabel: deviceData.deviceLabel,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });
  }

  return await tx.deviceFingerprint.update({
    where: { id: exactMatch.id },
    data: { lastUsedAt: new Date() },
  });
}

async function handleSimilarDevice(
  similarDevice: { id: string },
  fingerprintHash: string,
  deviceData: DeviceFingerprintData,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  return await tx.deviceFingerprint.update({
    where: { id: similarDevice.id },
    data: {
      fingerprint: deviceData.fingerprint,
      hash: fingerprintHash,
      deviceLabel: deviceData.deviceLabel,
      lastUsedAt: new Date(),
    },
  });
}

async function createNewDevice(
  userId: string,
  deviceData: DeviceFingerprintData,
  fingerprintHash: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  await validateDeviceLimitWithLock(userId, tx);

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
}

export async function createDeviceFingerprint(
  userId: string,
  deviceData: DeviceFingerprintData,
  similarityThreshold: number = DEVICE_CONFIG.SIMILARITY_THRESHOLD,
) {
  validateDeviceData(deviceData);

  const fingerprintHash = generateDeviceHash(deviceData.fingerprint);
  const similarDevice = await findSimilarDeviceOptimized(
    userId,
    deviceData.fingerprint,
    similarityThreshold,
  );

  const result = await prisma.$transaction(async (tx) => {
    const exactMatch = await tx.deviceFingerprint.findUnique({
      where: { hash: fingerprintHash },
    });

    if (exactMatch) {
      return await handleExactHashMatch(exactMatch, userId, deviceData, tx);
    }

    if (similarDevice) {
      return await handleSimilarDevice(
        similarDevice,
        fingerprintHash,
        deviceData,
        tx,
      );
    }

    return await createNewDevice(userId, deviceData, fingerprintHash, tx);
  });

  revalidateTag("user-devices");
  return result;
}

export const getUserDevices = unstable_cache(
  async (userId: string) => {
    return await getActiveUserDevicesOptimized(userId);
  },
  [userCacheConfig.getUserDevices.cacheKey!],
  getCacheOptions(userCacheConfig.getUserDevices),
);

export const getUserDeviceCount = unstable_cache(
  async (userId: string) => {
    return await getUserActiveDeviceCount(userId);
  },
  [userCacheConfig.getUserDeviceCount.cacheKey!],
  getCacheOptions(userCacheConfig.getUserDeviceCount),
);

export async function getUserActiveDeviceCount(
  userId: string,
): Promise<number> {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          deviceFingerprints: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  return result?._count.deviceFingerprints ?? 0;
}

export async function blockUserForTooManyDevices(userId: string) {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: true },
  });

  revalidateTag("user-devices");
  return result;
}

export async function checkAndBlockUserForDeviceLimit(
  userId: string,
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            deviceFingerprints: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const deviceCount = user?._count.deviceFingerprints ?? 0;

    if (deviceCount > APP_CONFIG.MAX_DEVICES_PER_USER) {
      await tx.user.update({
        where: { id: userId },
        data: { isBlocked: true },
      });
      return true;
    }

    return false;
  });
}

export async function clearAllUserDevices(userId: string) {
  const result = await prisma.deviceFingerprint.deleteMany({
    where: { userId },
  });

  revalidateTag("user-devices");
  return result;
}

export async function getAllUserDevicesWithDetails(
  userId: string,
  includeInactive: boolean = false,
) {
  return await prisma.deviceFingerprint.findMany({
    where: includeInactive ? { userId } : { userId, isActive: true },
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
  const result = await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: false },
  });

  revalidateTag("user-devices");
  return result;
}
