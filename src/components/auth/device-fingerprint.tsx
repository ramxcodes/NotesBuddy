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
        // Generate more unique browser identifier
        const getCanvasFingerprint = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return "no-canvas";

            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillText("Browser fingerprint test", 2, 2);
            return canvas.toDataURL().slice(-50);
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
          deviceLabel: `${getBrowserName()} on ${navigator.platform} - ${new Date().toLocaleDateString()}`,
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
        setError(
          "Device registration failed. Please refresh the page. " + e
        );
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
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs underline mt-1"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return null;
}
