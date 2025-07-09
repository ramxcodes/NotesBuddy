"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

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

export function AutoDeviceFingerprint(): null {
  const hasRegistered = useRef(false);
  const hasRetried = useRef(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Only run once per session
    if (hasRegistered.current || isRegistering) return;

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

    const registerDeviceFingerprint = async (): Promise<boolean> => {
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Device fingerprinting failed: ${response.status} ${errorText}`,
          );
          return false;
        }

        const result: RegistrationResponse = await response.json();

        if (result.success) {
          hasRegistered.current = true;
          return true;
        } else {
          console.error("Device fingerprinting failed:", result.error);
          return false;
        }
      } catch (error) {
        console.error("Device fingerprinting failed:", error);
        return false;
      } finally {
        setIsRegistering(false);
      }
    };

    const checkAndRegister = async (retries = 3): Promise<void> => {
      try {
        const { data: session } = await authClient.getSession();

        if (session?.user) {
          const success = await registerDeviceFingerprint();

          // Retry on failure if retries remaining
          if (!success && retries > 0 && !hasRetried.current) {
            hasRetried.current = true;
            setTimeout(() => {
              hasRegistered.current = false;
              checkAndRegister(retries - 1);
            }, 3000);
          }
        } else if (retries > 0) {
          // Retry if no session found (OAuth might still be processing)
          setTimeout(() => checkAndRegister(retries - 1), 1000);
        }
      } catch (error) {
        console.error("Failed to check session:", error);

        // Retry on error if retries remaining
        if (retries > 0) {
          setTimeout(() => checkAndRegister(retries - 1), 2000);
        }
      }
    };

    // Start with longer delay for OAuth flows
    const timer = setTimeout(() => {
      checkAndRegister();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isRegistering]);

  return null; // This component doesn't render anything
}
