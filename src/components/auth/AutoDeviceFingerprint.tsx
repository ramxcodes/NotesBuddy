"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { telegramLogger } from "@/utils/telegram-logger";

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
  };
  deviceLabel: string;
}

interface RegistrationResponse {
  success: boolean;
  error?: string;
}

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

export function AutoDeviceFingerprint(): null {
  const hasRetried = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Skip if already processing
    if (isRegistering) return;

    const getCanvasFingerprint = (): string => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "no-canvas";

        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.font = "11pt Arial";
        ctx.fillText("Device fingerprint 🔒", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
        ctx.font = "18pt Arial";
        ctx.fillText("Secure device detection", 4, 45);

        return canvas.toDataURL().slice(-100);
      } catch {
        return "canvas-error";
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

    const registerDeviceFingerprint = async (): Promise<{
      success: boolean;
      shouldRetry: boolean;
    }> => {
      try {
        setIsRegistering(true);

        const deviceData: DeviceFingerprintData = {
          fingerprint: {
            userAgent: navigator.userAgent,
            screen: {
              width: screen.width,
              height: screen.height,
              colorDepth: screen.colorDepth,
              pixelDepth: screen.pixelDepth || 0,
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            languages: navigator.languages?.join(",") || "",
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            vendor: navigator.vendor || "",
            browserName: getBrowserName(),
            canvasFingerprint: getCanvasFingerprint(),
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
          },
          deviceLabel: `${getBrowserName()} on ${navigator.platform}`,
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
          await telegramLogger(
            `Device fingerprinting failed: ${response.status} ${errorText}`,
          );

          // Handle specific error cases that should not be retried
          if (response.status === 429) {
            // Device limit exceeded - don't retry
            await telegramLogger(
              "Device limit exceeded. Stopping device registration attempts.",
            );
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          if (response.status === 409) {
            // Device fingerprint conflict - don't retry
            await telegramLogger(
              "Device fingerprint conflict. Stopping device registration attempts.",
            );
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          if (response.status === 403) {
            // User blocked or access denied - don't retry
            await telegramLogger(
              "User blocked or access denied. Stopping device registration attempts.",
            );
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          // For other errors (network, 500, etc.), allow retry
          return { success: false, shouldRetry: true };
        }

        const result: RegistrationResponse = await response.json();

        if (result.success) {
          if (userId) setPersistedState(userId, "registered", true);
          console.info("Device registration successful");
          return { success: true, shouldRetry: false };
        } else {
          await telegramLogger("Device fingerprinting failed:", result.error);

          // Check if the error message indicates unrecoverable conditions
          if (
            result.error?.includes("Device limit exceeded") ||
            result.error?.includes("User is blocked") ||
            result.error?.includes("belongs to another user")
          ) {
            if (userId) setPersistedState(userId, "unrecoverable-error", true);
            return { success: false, shouldRetry: false };
          }

          return { success: false, shouldRetry: true };
        }
      } catch (error) {
        await telegramLogger("Device fingerprinting failed:", error);
        // Network errors and unexpected errors can be retried
        return { success: false, shouldRetry: true };
      } finally {
        setIsRegistering(false);
      }
    };

    const checkAndRegister = async (retries = 3): Promise<void> => {
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
            }, 3000);
          } else if (!result.success && !result.shouldRetry) {
            // Unrecoverable error - stop all attempts
            console.info(
              "Device registration stopped due to unrecoverable error.",
            );
          }
        } else if (retries > 0) {
          // Retry if no session found (OAuth might still be processing)
          setTimeout(() => checkAndRegister(retries - 1), 1000);
        }
      } catch (error) {
        await telegramLogger("Failed to check session:", error);

        // Retry on error if retries remaining
        if (retries > 0) {
          setTimeout(() => checkAndRegister(retries - 1), 2000);
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
          console.info(
            "Device registration previously failed with unrecoverable error",
          );
          return;
        }

        // Proceed with device registration
        await checkAndRegister();
      } catch (error) {
        await telegramLogger(
          "Failed to initialize device registration:",
          error,
        );
      }
    };

    // Start with a delay to allow session to be established
    const timer = setTimeout(() => {
      initializeDeviceRegistration();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isRegistering]);

  return null; // This component doesn't render anything
}
