"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import {
  ShieldWarningIcon,
  HouseIcon,
  DevicesIcon,
  WarningIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  DeviceTabletIcon,
  DeviceMobileIcon,
  DesktopIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import Science from "@/components/svgs/Science";
import Cap from "@/components/svgs/Cap";
import HandDrawnArrow from "@/components/svgs/HandDrawnArrow";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { signOut } from "@/lib/auth/auth-client";
import { telegramLogger } from "@/utils/telegram-logger";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [devices, setDevices] = useState<
    Array<{
      id: string;
      deviceLabel: string | null;
      fingerprint: {
        userAgent?: string;
        screen?: { width: number };
        browserName?: string;
      };
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canRemove, setCanRemove] = useState(true);
  const [timeUntilNextRemoval, setTimeUntilNextRemoval] = useState<string>("");

  const errorCode = searchParams.get("error") || "UNKNOWN_ERROR";
  const errorMessage =
    searchParams.get("message") || "An unexpected error occurred.";
  const userId = searchParams.get("userId");

  const fetchUserDevices = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/devices/list?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
        setCanRemove(data.canRemove || false);
        if (!data.canRemove && data.timeUntilNext) {
          const hours = Math.ceil(data.timeUntilNext / (1000 * 60 * 60));
          setTimeUntilNextRemoval(`${hours} hours`);
        }
      }
    } catch (error) {
      await telegramLogger("Failed to fetch devices from error page:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Only sign out immediately if it's NOT a device limit exceeded error
    if (errorCode !== "DEVICE_LIMIT_EXCEEDED") {
      signOut();
    } else if (userId) {
      // For device limit exceeded, fetch user devices
      fetchUserDevices();
    }
  }, [errorCode, userId, fetchUserDevices]);

  const handleRemoveDevice = async (deviceId: string) => {
    // Find the device being removed for logging
    const deviceToRemove = devices.find((device) => device.id === deviceId);

    try {
      setIsLoading(true);

      // Log device removal attempt from error page
      if (deviceToRemove && userId) {
        const deviceInfo = [
          `Context: Device Limit Exceeded Error Page`,
          `Device ID: ${deviceToRemove.id}`,
          `Label: ${deviceToRemove.deviceLabel || "Unknown"}`,
          `Platform: Unknown`,
          `Browser: ${getBrowserInfo(deviceToRemove.fingerprint.userAgent, deviceToRemove.fingerprint.browserName)}`,
          `User Agent: ${deviceToRemove.fingerprint.userAgent || "Unknown"}`,
          `Screen: ${deviceToRemove.fingerprint.screen ? `${deviceToRemove.fingerprint.screen.width}x(height unknown)` : "Unknown"}`,
          `User ID: ${userId}`,
          `Error Code: ${errorCode}`,
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n");

        await telegramLogger(
          `🚨 DEVICE REMOVAL FROM ERROR PAGE\n\n${deviceInfo}`,
        );
      }

      const response = await fetch("/api/user/devices/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId, userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Log successful removal from error page
        if (deviceToRemove && userId) {
          const successInfo = [
            `Context: Device Limit Exceeded Error Page`,
            `Device ID: ${deviceToRemove.id}`,
            `Label: ${deviceToRemove.deviceLabel || "Unknown"}`,
            `Platform: Unknown`,
            `Browser: ${getBrowserInfo(deviceToRemove.fingerprint.userAgent, deviceToRemove.fingerprint.browserName)}`,
            `User ID: ${userId}`,
            `Remaining Devices: ${data.remainingDevices || "Unknown"}`,
            `Action: Redirecting to sign-in`,
            `Timestamp: ${new Date().toISOString()}`,
          ].join("\n");

          await telegramLogger(
            `✅ ERROR PAGE DEVICE REMOVAL SUCCESSFUL\n\n${successInfo}`,
          );
        }

        // Device removed successfully, sign out and redirect to login
        await signOut();
        window.location.href = "/sign-in";
      } else {
        // Log removal failure from error page
        const errorInfo = [
          `Context: Device Limit Exceeded Error Page`,
          `Device ID: ${deviceId}`,
          `User ID: ${userId || "Unknown"}`,
          `Error: ${data.error || "Unknown error"}`,
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n");

        await telegramLogger(
          `❌ ERROR PAGE DEVICE REMOVAL FAILED\n\n${errorInfo}`,
        );

        alert(data.error || "Failed to remove device");
        await fetchUserDevices(); // Refresh the list
      }
    } catch (error) {
      // Log error with context from error page
      const errorInfo = [
        `Context: Device Limit Exceeded Error Page`,
        `Device ID: ${deviceId}`,
        `User ID: ${userId || "Unknown"}`,
        `Error: ${error instanceof Error ? error.message : String(error)}`,
        `Timestamp: ${new Date().toISOString()}`,
      ].join("\n");

      await telegramLogger(
        `💥 ERROR PAGE DEVICE REMOVAL ERROR\n\n${errorInfo}`,
        error,
      );

      alert("An error occurred while removing the device");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAndExit = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getDeviceIcon = (userAgent?: string, screen?: { width: number }) => {
    if (!userAgent) {
      if (screen && screen.width <= 768) {
        return <DeviceMobileIcon weight="duotone" className="h-5 w-5" />;
      }
      return <DeviceTabletIcon weight="duotone" className="h-5 w-5" />;
    }

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <DeviceMobileIcon weight="duotone" className="h-5 w-5" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <DeviceTabletIcon weight="duotone" className="h-5 w-5" />;
    } else {
      return <DesktopIcon weight="duotone" className="h-5 w-5" />;
    }
  };

  const getDeviceType = (userAgent?: string, screen?: { width: number }) => {
    if (!userAgent) {
      if (screen && screen.width <= 768) {
        return "Mobile Device";
      } else if (screen && screen.width <= 1024) {
        return "Tablet";
      }
      return "Desktop";
    }

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return "Mobile Device";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return "Tablet";
    } else {
      return "Desktop";
    }
  };

  const getBrowserInfo = (userAgent?: string, browserName?: string) => {
    if (browserName) {
      return browserName.charAt(0).toUpperCase() + browserName.slice(1);
    }

    if (!userAgent) return "Unknown Browser";

    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome") && !ua.includes("edge")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    if (ua.includes("opera")) return "Opera";
    return "Unknown Browser";
  };

  const getErrorDetails = () => {
    switch (errorCode) {
      case "DEVICE_VERIFICATION_FAILED_PLEASE_TRY_AGAIN_OR_CONTACT_SUPPORT_IF_THIS_PERSISTS":
        return {
          title: "Device Verification Failed",
          description:
            "We couldn't verify your device. This could be due to device limits or security restrictions.",
          icon: <ShieldWarningIcon className="h-16 w-16" />,
          suggestions: [
            "You may have reached the maximum number of devices (2) for your account",
            "Try signing in from a previously registered device",
            "Contact support if you need to register a new device",
            "Clear your browser data and try again",
          ],
        };
      case "DEVICE_LIMIT_EXCEEDED":
        return {
          title: "Device Limit Reached",
          description:
            "You've reached the maximum number of devices allowed for your account.",
          icon: <DevicesIcon className="h-16 w-16" />,
          suggestions: [
            "Maximum of 2 devices are allowed per account",
            "Sign in from a previously registered device",
            "Contact support for assistance",
          ],
        };
      case "ACCOUNT_SUSPENDED":
        return {
          title: "Account Suspended",
          description:
            "Your account has been suspended due to security violations.",
          icon: <ShieldWarningIcon className="h-16 w-16" />,
          suggestions: [
            "Contact support to appeal the suspension",
            "Review our terms of service",
            "Provide additional verification if requested",
            "Wait for the suspension period to end",
          ],
        };
      default:
        return {
          title: "Authentication Error",
          description: errorMessage,
          icon: <WarningIcon className="h-16 w-16" />,
          suggestions: [
            "Try refreshing the page",
            "Clear your browser cache and cookies",
            "Try signing in again",
            "Contact support if the problem persists",
          ],
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            rotate: [0, 20, -15, 8, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 opacity-15"
        >
          <Science className="h-16 w-16" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -25, 15, -10, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-20 opacity-10"
        >
          <Cap className="h-20 w-20" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 15, -20, 12, 0],
            x: [0, 10, -10, 5, 0],
            y: [0, -5, 5, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-32 left-20 opacity-10"
        >
          <HandDrawnArrow className="h-12 w-12" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-destructive mb-6 inline-flex justify-center"
          >
            {errorDetails.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {errorDetails.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed"
          >
            {errorDetails.description}
          </motion.p>
        </motion.div>

        {/* Error suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8 text-left"
        >
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            What you can try:
          </h3>
          <ul className="text-muted-foreground space-y-2">
            {errorDetails.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Device Management (only for DEVICE_LIMIT_EXCEEDED) */}
        {errorCode === "DEVICE_LIMIT_EXCEEDED" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-muted/50 rounded-lg p-6 text-left">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <DevicesIcon className="h-5 w-5" />
                Manage Your Devices
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Remove one of your existing devices to sign in from this device.
                You can remove one device every 24 hours.
              </p>

              {!canRemove && timeUntilNextRemoval && (
                <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-100 p-3 dark:border-yellow-600 dark:bg-yellow-900/30">
                  <p className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <ClockIcon className="h-4 w-4" /> You can remove another
                    device in {timeUntilNextRemoval}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <ArrowClockwiseIcon className="h-4 w-4 animate-spin" />
                    Loading devices...
                  </div>
                </div>
              ) : devices.length > 0 ? (
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-background flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted rounded-lg p-2">
                          {getDeviceIcon(
                            device.fingerprint?.userAgent,
                            device.fingerprint?.screen,
                          )}
                        </div>
                        <div>
                          <div className="text-foreground font-medium">
                            {device.deviceLabel || "Unknown Device"}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {getDeviceType(
                              device.fingerprint?.userAgent,
                              device.fingerprint?.screen,
                            )}{" "}
                            •{" "}
                            {getBrowserInfo(
                              device.fingerprint?.userAgent,
                              device.fingerprint?.browserName,
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveDevice(device.id)}
                        disabled={!canRemove || isLoading}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">
                  No devices found. Please try refreshing or contact support.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {errorCode === "DEVICE_LIMIT_EXCEEDED" ? (
            <>
              <Button
                onClick={handleSignOutAndExit}
                variant="outline"
                className="group min-w-[140px]"
              >
                <HouseIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Exit
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="group min-w-[140px]">
                <Link href="/sign-in">
                  <ArrowClockwiseIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
                  Try Again
                </Link>
              </Button>

              <Button asChild variant="outline" className="group min-w-[140px]">
                <Link href="/">
                  <HouseIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Go Home
                </Link>
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="bg-background relative flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-muted-foreground">Loading error details...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
