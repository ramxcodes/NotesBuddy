"use client";

import { useEffect, useRef, useState } from "react";
import { authClient, signOut } from "@/lib/auth/auth-client";
import {
  telegramLogger,
  logDeviceLimitExceeded,
} from "@/utils/telegram-logger";

interface DeviceFingerprintData {
  fingerprint: {
    userAgent: string;
    screen: {
      width: number;
      height: number;
      colorDepth: number;
      pixelDepth: number;
    };
    timezone: string;
    language: string;
    languages: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
    vendor: string;
    browserName: string;
    canvasFingerprint: string;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    serverCharacteristics?: {
      acceptLanguage?: string;
      acceptEncoding?: string;
      connection?: string;
      dnt?: string | null;
    };
  };
  deviceLabel: string;
}

interface RegistrationResponse {
  success: boolean;
  error?: string;
}

// Rate limiting for error logging
let lastErrorLog = 0;
const ERROR_LOG_COOLDOWN = 30000; // 30 seconds

const logErrorWithRateLimit = async (
  message: string,
  error?: unknown,
  userContext?: Record<string, unknown>,
) => {
  const now = Date.now();
  if (now - lastErrorLog > ERROR_LOG_COOLDOWN) {
    lastErrorLog = now;

    // Create detailed context using safe formatting
    const contextParts = [
      `Component: DeviceFingerprint`,
      `Timestamp: ${new Date().toISOString()}`,
    ];

    if (userContext) {
      Object.entries(userContext).forEach(([key, value]) => {
        contextParts.push(`${key}: ${String(value)}`);
      });
    }

    const detailedMessage = `${message}\n\nContext:\n${contextParts.join("\n")}`;

    await telegramLogger(detailedMessage, error);
  }
};

const getUserContext = async () => {
  try {
    const { data: session } = await authClient.getSession();
    if (!session?.user) return null;

    return {
      userEmail: session.user.email,
      userName: session.user.name,
      userImage: session.user.image,
      userId: session.user.id,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      href: window.location.href,
      origin: window.location.origin,
      referer: document.referrer,
    };
  } catch {
    return null;
  }
};

const handleDeviceLimitError = async (errorMessage: string) => {
  const userContext = await getUserContext();

  // Use the specific device limit exceeded logger
  if (userContext) {
    await logDeviceLimitExceeded({
      userId: userContext.userId,
      email: userContext.userEmail,
      name: userContext.userName,
    });
  } else {
    // Fallback to regular logger if no user context
    await telegramLogger(
      `🚨 DEVICE LIMIT EXCEEDED - User being signed out\n\nError: ${errorMessage}\nComponent: DeviceFingerprint\nTime: ${new Date().toISOString()}`,
    );
  }

  // Sign out the user with forced redirect
  try {
    await signOut();
    // Force redirect to ensure sign out
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  } catch (signOutError) {
    const signOutParts = [
      `Original: ${errorMessage}`,
      `Component: DeviceFingerprint`,
      `SignOut Error: ${signOutError instanceof Error ? signOutError.message : String(signOutError)}`,
      `Time: ${new Date().toISOString()}`,
    ];

    if (userContext) {
      signOutParts.push(
        `User: ${userContext.userName} (${userContext.userId})`,
        `Email: ${userContext.userEmail}`,
      );
    }

    const signOutMessage = `❌ Failed to sign out user after device limit exceeded\n\nContext: ${signOutParts.join(" | ")}`;

    await telegramLogger(signOutMessage);

    // Force redirect even if signOut failed
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
};

// Local storage keys for persistent state
const STORAGE_KEY_PREFIX = "device-fingerprint-";
const getStorageKey = (userId: string, key: string) =>
  `${STORAGE_KEY_PREFIX}${userId}-${key}`;

const getPersistedState = (userId: string, key: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const value = localStorage.getItem(getStorageKey(userId, key));
    return value === "true";
  } catch {
    return false;
  }
};

const setPersistedState = (userId: string, key: string, value: boolean) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(userId, key), value.toString());
  } catch {
    // Ignore localStorage errors
  }
};

export function DeviceFingerprint(): null {
  const hasRetried = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Skip if already processing
    if (isRegistering) return;

    const isSafari = (): boolean => {
      const userAgent = navigator.userAgent;
      return userAgent.includes("Safari") && !userAgent.includes("Chrome");
    };

    const getCanvasFingerprint = (): string => {
      try {
        // Enhanced canvas fingerprinting with Safari compatibility
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "no-canvas";

        // Use more basic operations for Safari compatibility
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.font = "11pt Arial";
        ctx.fillText("Device fingerprint 🔒", 2, 15);

        // For Safari, use simpler operations to avoid restrictions
        if (isSafari()) {
          ctx.fillStyle = "#333";
          ctx.font = "12pt Arial";
          ctx.fillText("Safari Compatible", 4, 35);
        } else {
          ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
          ctx.font = "18pt Arial";
          ctx.fillText("Secure device detection", 4, 45);
        }

        return canvas.toDataURL().slice(-100);
      } catch {
        return isSafari() ? "safari-canvas-error" : "canvas-error";
      }
    };

    const getBrowserName = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Firefox")) return "Firefox";
      if (userAgent.includes("Chrome") && !userAgent.includes("Edge"))
        return "Chrome";
      if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
        return "Safari";
      if (userAgent.includes("Edge")) return "Edge";
      if (userAgent.includes("Opera")) return "Opera";
      return "Unknown";
    };

    const getTimezone = (): string => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        // Safari may restrict timezone access
        return isSafari() ? "Safari/Restricted" : "UTC";
      }
    };

    const getScreenInfo = () => {
      try {
        return {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth || 0,
        };
      } catch {
        // Safari fallback with common Apple device dimensions
        if (isSafari()) {
          const userAgent = navigator.userAgent;
          if (userAgent.includes("iPhone")) {
            return { width: 414, height: 896, colorDepth: 24, pixelDepth: 24 };
          } else if (userAgent.includes("iPad")) {
            return {
              width: 1024,
              height: 1366,
              colorDepth: 24,
              pixelDepth: 24,
            };
          } else {
            return {
              width: 1920,
              height: 1080,
              colorDepth: 24,
              pixelDepth: 24,
            };
          }
        }
        return { width: 1920, height: 1080, colorDepth: 24, pixelDepth: 0 };
      }
    };

    const registerDeviceFingerprint = async (): Promise<{
      success: boolean;
      shouldRetry: boolean;
    }> => {
      try {
        setIsRegistering(true);

        const screenInfo = getScreenInfo();
        const browserName = getBrowserName();
        const safari = isSafari();

        const deviceData: DeviceFingerprintData = {
          fingerprint: {
            userAgent: navigator.userAgent,
            screen: screenInfo,
            timezone: getTimezone(),
            language: navigator.language,
            languages: navigator.languages?.join(",") || "",
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || null,
            vendor: navigator.vendor || (safari ? "Apple Computer, Inc." : ""),
            browserName,
            canvasFingerprint: getCanvasFingerprint(),
            hardwareConcurrency:
              navigator.hardwareConcurrency || (safari ? 8 : 0),
            maxTouchPoints: navigator.maxTouchPoints || 0,
          },
          deviceLabel: `${browserName} on ${navigator.platform}`,
        };

        const response = await fetch(
          "/api/auth/device-fingerprinting/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(deviceData),
            credentials: "include",
          },
        );

        const userId = currentUserId.current;

        if (!response.ok) {
          const errorText = await response.text();

          // Reduced error logging for known issues
          if (response.status !== 429 && response.status !== 409) {
            const userContext = await getUserContext();
            await logErrorWithRateLimit(
              `Device fingerprinting failed: ${response.status} ${errorText}`,
              undefined,
              userContext || undefined,
            );
          }

          // Handle specific error cases that should not be retried
          if (response.status === 429) {
            // Device limit exceeded - sign out user and log detailed error
            await handleDeviceLimitError(
              `Device limit exceeded (HTTP 429): ${errorText}`,
            );
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          if (response.status === 409) {
            // Device fingerprint conflict - don't retry
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          if (response.status === 403) {
            // User blocked or access denied - don't retry
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          // For other errors (network, 500, etc.), allow retry
          return { success: false, shouldRetry: true };
        }

        const result: RegistrationResponse = await response.json();

        if (result.success) {
          if (userId) setPersistedState(userId, "registered", true);
          return { success: true, shouldRetry: false };
        } else {
          // Reduced error logging for known issues
          if (
            !result.error?.includes("Device limit exceeded") &&
            !result.error?.includes("User is blocked")
          ) {
            const userContext = await getUserContext();
            await logErrorWithRateLimit(
              "Device fingerprinting failed:",
              result.error,
              userContext || undefined,
            );
          }

          // Check if the error message indicates unrecoverable conditions
          if (result.error?.includes("Device limit exceeded")) {
            // Device limit exceeded - sign out user and log detailed error
            await handleDeviceLimitError(
              `Device limit exceeded in response: ${result.error}`,
            );
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          if (
            result.error?.includes("User is blocked") ||
            result.error?.includes("belongs to another user")
          ) {
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          return { success: false, shouldRetry: true };
        }
      } catch (error) {
        const userContext = await getUserContext();
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check if the error is about device limits
        if (errorMessage.includes("Device limit exceeded")) {
          await handleDeviceLimitError(
            `Device limit exceeded in catch: ${errorMessage}`,
          );
          if (currentUserId.current)
            setPersistedState(
              currentUserId.current,
              "unrecoverable-error",
              true,
            );
          return { success: false, shouldRetry: false };
        }

        await logErrorWithRateLimit(
          "Device fingerprinting failed:",
          error,
          userContext || undefined,
        );
        // Network errors and unexpected errors can be retried
        return { success: false, shouldRetry: true };
      } finally {
        setIsRegistering(false);
      }
    };

    const checkAndRegister = async (retries = 2): Promise<void> => {
      try {
        const { data: session } = await authClient.getSession();

        if (session?.user) {
          const result = await registerDeviceFingerprint();

          // Only retry if the operation was not successful and retries are allowed
          if (
            !result.success &&
            result.shouldRetry &&
            retries > 0 &&
            !hasRetried.current
          ) {
            hasRetried.current = true;
            setTimeout(() => {
              checkAndRegister(retries - 1);
            }, 5000); // Increased retry delay
          } else if (!result.success && !result.shouldRetry) {
            // Unrecoverable error - stop all attempts
          }
        } else if (retries > 0) {
          // Retry if no session found (OAuth might still be processing)
          setTimeout(() => checkAndRegister(retries - 1), 2000);
        }
      } catch (error) {
        const userContext = await getUserContext();
        await logErrorWithRateLimit(
          "Failed to check session:",
          error,
          userContext || undefined,
        );

        // Retry on error if retries remaining
        if (retries > 0) {
          setTimeout(() => checkAndRegister(retries - 1), 3000);
        }
      }
    };

    const initializeDeviceRegistration = async () => {
      try {
        const { data: session } = await authClient.getSession();

        if (!session?.user?.id) {
          return; // No session, nothing to do
        }

        const userId = session.user.id;
        currentUserId.current = userId;

        // Check persistent state for this user
        const persistedRegistered = getPersistedState(userId, "registered");
        const persistedUnrecoverableError = getPersistedState(
          userId,
          "unrecoverable-error",
        );

        if (persistedRegistered) {
          return;
        }

        if (persistedUnrecoverableError) {
          return;
        }

        // Proceed with device registration
        await checkAndRegister();
      } catch (error) {
        const userContext = await getUserContext();
        await logErrorWithRateLimit(
          "Failed to initialize device registration:",
          error,
          userContext || undefined,
        );
      }
    };

    // Start with a delay to allow session to be established
    const timer = setTimeout(() => {
      initializeDeviceRegistration();
    }, 3000); // Increased initial delay

    return () => {
      clearTimeout(timer);
    };
  }, [isRegistering]);

  return null; // This component doesn't render anything
}
