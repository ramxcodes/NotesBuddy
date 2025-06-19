"use client";

import { useEffect } from "react";
import { updateDeviceFingerprint } from "@/app/(auth)/actions";

export function DeviceFingerprint() {
  useEffect(() => {
    const collectDeviceFingerprint = async () => {
      try {
        const deviceData = {
          fingerprint: {
            userAgent: navigator.userAgent,
            screen: {
              width: screen.width,
              height: screen.height,
              colorDepth: screen.colorDepth,
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
          },
          deviceLabel: `${navigator.platform} - ${new Date().toLocaleDateString()}`,
        };

        await updateDeviceFingerprint(deviceData);
      } catch (error) {
        console.error("Failed to collect device fingerprint:", error);
        // Don't show error to user - this is background functionality
      }
    };

    // Only run on first load
    collectDeviceFingerprint();
  }, []);

  return null; // This component doesn't render anything
}
