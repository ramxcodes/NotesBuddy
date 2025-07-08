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

// Type guards and validation
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

// FIXED: Issue #5 - Optimized hash generation
function generateDeviceHash(
  fingerprint: DeviceFingerprintData["fingerprint"],
): string {
  validateFingerprint(fingerprint);
  return createOptimizedHash(fingerprint as Record<string, unknown>);
}

// FIXED: Issue #23 - Use UAParser.js for accurate browser/OS detection
function extractBrowserOSInfo(userAgent: string): BrowserOSInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Normalize browser names
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

  // Normalize OS names
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

// Enhanced similarity calculation functions with better edge case handling
function calculatePlatformSimilarity(
  fp1: DeviceFingerprintData["fingerprint"],
  fp2: DeviceFingerprintData["fingerprint"],
): number {
  // Handle missing platform data gracefully
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

  // Handle missing screen data gracefully
  if (!screen1 || !screen2) {
    return 0;
  }

  const sameResolution =
    screen1.width === screen2.width && screen1.height === screen2.height;

  // More lenient color depth comparison for better device recognition
  const colorDepthDiff = Math.abs(screen1.colorDepth - screen2.colorDepth);
  const similarColorDepth =
    colorDepthDiff <= DEVICE_CONFIG.COLOR_DEPTH_VARIANCE;

  // Give partial credit for matching resolution even if color depth differs slightly
  if (sameResolution && similarColorDepth) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.screen;
  } else if (sameResolution) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.screen * 0.8; // 80% credit for resolution match
  }

  return 0;
}

function calculateUserAgentSimilarity(
  fp1: DeviceFingerprintData["fingerprint"],
  fp2: DeviceFingerprintData["fingerprint"],
): number {
  // Handle missing user agent data gracefully
  if (!fp1.userAgent || !fp2.userAgent) {
    return 0;
  }

  const browser1 = extractBrowserOSInfo(fp1.userAgent);
  const browser2 = extractBrowserOSInfo(fp2.userAgent);

  if (browser1.browser === browser2.browser && browser1.os === browser2.os) {
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent;
  } else if (browser1.os === browser2.os) {
    // Same OS, different browser - partial credit
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent * 0.6;
  } else if (browser1.browser === browser2.browser) {
    // Same browser, different OS - less likely but possible (e.g., Chrome on different OS)
    return DEVICE_CONFIG.SIMILARITY_WEIGHTS.userAgent * 0.3;
  }
  return 0;
}

function calculateFieldSimilarity<T>(
  value1: T,
  value2: T,
  weight: number,
): number {
  // Handle undefined/null values gracefully
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
    languages: calculateFieldSimilarity(
      fingerprint1.languages,
      fingerprint2.languages,
      DEVICE_CONFIG.SIMILARITY_WEIGHTS.languages,
    ),
  };

  const totalScore = Object.values(similarities).reduce(
    (total, score) => total + score,
    0,
  );

  // Ensure score never exceeds 1.0 and apply minimum threshold for data quality
  const normalizedScore = Math.min(totalScore, 1.0);

  // Require at least platform and screen data for any meaningful similarity
  const hasMinimumData = similarities.platform > 0 && similarities.screen > 0;

  return hasMinimumData ? normalizedScore : 0;
}

// FIXED: Issue #3 - Combined database queries for better performance
async function getActiveUserDevicesOptimized(userId: string) {
  return await prisma.deviceFingerprint.findMany({
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
}

// FIXED: Issue #1 & #2 - Moved similarity calculation outside transaction
// Early filtering based on basic criteria before expensive similarity calculation
async function findSimilarDeviceOptimized(
  userId: string,
  fingerprint: DeviceFingerprintData["fingerprint"],
  threshold: number,
) {
  validateFingerprint(fingerprint);

  // Get devices with basic filtering using indexes
  const userDevices = await getActiveUserDevicesOptimized(userId);

  // Early return if no devices
  if (userDevices.length === 0) {
    return null;
  }

  // OPTIMIZATION: Pre-filter devices based on high-weight criteria before expensive similarity calculation
  const candidateDevices = userDevices.filter((device) => {
    try {
      const deviceFingerprint =
        device.fingerprint as DeviceFingerprintData["fingerprint"];
      validateFingerprint(deviceFingerprint);

      // Quick platform check (highest weight) - but allow through if platform missing
      if (deviceFingerprint.platform && fingerprint.platform) {
        if (deviceFingerprint.platform !== fingerprint.platform) {
          return false;
        }
      }

      // Quick screen resolution check (second highest weight) - but allow through if screen missing
      if (deviceFingerprint.screen && fingerprint.screen) {
        const screenMatch =
          deviceFingerprint.screen.width === fingerprint.screen.width &&
          deviceFingerprint.screen.height === fingerprint.screen.height;

        if (!screenMatch) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`Invalid fingerprint data for device ${device.id}:`, error);
      return false;
    }
  });

  // FIXED: Issue #1 - Reduced linear search by pre-filtering
  // Now do full similarity calculation only on candidate devices
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

// FIXED: Issue #3 - Consolidated device count validation with fewer queries
async function validateDeviceLimitWithLock(
  userId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<number> {
  // Single query to get user info and check if blocked
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

  // Fix: Use > instead of >= to allow exactly MAX_DEVICES_PER_USER devices
  if (currentDeviceCount > APP_CONFIG.MAX_DEVICES_PER_USER) {
    // Block user and throw error atomically
    await tx.user.update({
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
    // Different user has same hash - validate limit and create new device
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

  // Same user - update last used time
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

// FIXED: Issue #2 - Heavy computation moved outside transaction
export async function createDeviceFingerprint(
  userId: string,
  deviceData: DeviceFingerprintData,
  similarityThreshold: number = DEVICE_CONFIG.SIMILARITY_THRESHOLD,
) {
  validateDeviceData(deviceData);

  // FIXED: Issue #2 - Generate hash outside transaction
  const fingerprintHash = generateDeviceHash(deviceData.fingerprint);

  // FIXED: Issue #2 - Do similarity calculation outside transaction
  const similarDevice = await findSimilarDeviceOptimized(
    userId,
    deviceData.fingerprint,
    similarityThreshold,
  );

  const result = await prisma.$transaction(async (tx) => {
    // Check for exact hash match
    const exactMatch = await tx.deviceFingerprint.findUnique({
      where: { hash: fingerprintHash },
    });

    if (exactMatch) {
      return await handleExactHashMatch(exactMatch, userId, deviceData, tx);
    }

    // Use pre-calculated similar device
    if (similarDevice) {
      return await handleSimilarDevice(
        similarDevice,
        fingerprintHash,
        deviceData,
        tx,
      );
    }

    // Create new device
    return await createNewDevice(userId, deviceData, fingerprintHash, tx);
  });

  // Invalidate device cache after any device operation
  revalidateTag("user-devices");

  return result;
}

// Cached device query with optimized performance and proper cache invalidation
export const getUserDevices = unstable_cache(
  async (userId: string) => {
    return await getActiveUserDevicesOptimized(userId);
  },
  ["user-devices"],
  {
    revalidate: 1800, // 30 minutes cache - devices don't change frequently
    tags: ["user-devices"], // Tag for selective cache invalidation
  },
);

// Additional cached query for device count with shorter cache time for limits
export const getUserDeviceCount = unstable_cache(
  async (userId: string) => {
    return await getUserActiveDeviceCount(userId);
  },
  ["user-device-count"],
  {
    revalidate: 300, // 5 minutes cache - device counts need fresher data for limits
    tags: ["user-devices"], // Same tag so both invalidate together
  },
);

// FIXED: Issue #3 - Optimized with single query
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

  // Invalidate device cache when user is blocked for device limit
  revalidateTag("user-devices");

  return result;
}

// FIXED: Issue #3 - Optimized device limit check
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

  // Invalidate device cache after clearing devices
  revalidateTag("user-devices");

  return result;
}

// Consistent device state management with optimized queries
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

  // Invalidate device cache when user is unblocked
  revalidateTag("user-devices");

  return result;
}
