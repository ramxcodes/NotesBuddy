"use client";

import { useEffect, useRef, useState } from "react";
import { updateDeviceFingerprint } from "@/app/(auth)/actions";

export function DeviceFingerprint() {
  const hasRun = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run once per session
    if (hasRun.current) return;

    const collectDeviceFingerprint = async () => {
      try {
        // Generate more stable browser identifier
        const getCanvasFingerprint = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext("2d");
            if (!ctx) return "no-canvas";

            // Use stable text for consistent fingerprinting
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.font = "11pt Arial";
            ctx.fillText("Device fingerprint 🔒", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
            ctx.font = "18pt Arial";
            ctx.fillText("Secure device detection", 4, 45);

            // Get a stable subset of the canvas data
            return canvas.toDataURL().slice(-100);
          } catch {
            return "canvas-error";
          }
        };

        const deviceData = {
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
            // More unique identifiers
            vendor: navigator.vendor || "",
            browserName: getBrowserName(),
            canvasFingerprint: getCanvasFingerprint(),
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
          },
          // Fix: Remove daily timestamp to make deviceLabel stable for same device
          deviceLabel: `${getBrowserName()} on ${navigator.platform}`,
        };

        const result = await updateDeviceFingerprint(deviceData);

        if (result?.success) {
          hasRun.current = true;
        } else {
          // Handle specific errors
          if (result?.error?.includes("conflict")) {
            setError("Device registration conflict. Please refresh the page.");
          } else {
            setError("Failed to register device. Please try again.");
          }
        }
      } catch (e) {
        setError("Device registration failed. Please refresh the page. " + e);
      }
    };

    // Helper function to get browser name
    function getBrowserName(): string {
      const userAgent = navigator.userAgent;

      if (userAgent.includes("Firefox")) return "Firefox";
      if (userAgent.includes("Chrome") && !userAgent.includes("Edge"))
        return "Chrome";
      if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
        return "Safari";
      if (userAgent.includes("Edge")) return "Edge";
      if (userAgent.includes("Opera")) return "Opera";

      return "Unknown";
    }

    // Add a small delay to ensure session is properly established
    const timer = setTimeout(() => {
      collectDeviceFingerprint();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show error message if there's an issue
  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-1 text-xs underline"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return null;
}
