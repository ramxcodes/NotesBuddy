"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DeviceTabletIcon,
  DeviceMobileIcon,
  DesktopIcon,
  GlobeIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  WarningIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { APP_CONFIG } from "@/utils/config";
import { Device } from "@/types/device";
import { useState, useEffect, useCallback } from "react";
import { telegramLogger } from "@/utils/telegram-logger";

interface DeviceManagementProps {
  devices: Device[];
  userId: string;
}

export function DeviceManagement({ devices, userId }: DeviceManagementProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [canRemove, setCanRemove] = useState(true);
  const [timeUntilNextRemoval, setTimeUntilNextRemoval] = useState<string>("");
  const [deviceList, setDeviceList] = useState<Device[]>(devices);

  const fetchRemovalStatus = useCallback(async () => {
    try {
      if (!userId) return;

      const response = await fetch(`/api/user/devices/list?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCanRemove(data.canRemove || false);
        if (!data.canRemove && data.timeUntilNext) {
          const hours = Math.ceil(data.timeUntilNext / (1000 * 60 * 60));
          setTimeUntilNextRemoval(`${hours} hours`);
        }
      }
    } catch (error) {
      await telegramLogger("Failed to fetch device removal status:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchRemovalStatus();
  }, [fetchRemovalStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger page refresh to get latest device data
      window.location.reload();
    } catch (error) {
      await telegramLogger("Failed to refresh devices:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!canRemove) {
      alert(
        `You can only remove one device per 24 hours. Try again in ${timeUntilNextRemoval}.`,
      );
      return;
    }

    // Find the device being removed for logging
    const deviceToRemove = deviceList.find((device) => device.id === deviceId);

    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this device? This action cannot be undone.",
    );

    if (!confirmRemoval) return;

    try {
      setIsRemoving(true);

      // Log device removal attempt
      if (deviceToRemove) {
        const deviceInfo = [
          `Device ID: ${deviceToRemove.id}`,
          `Label: ${deviceToRemove.deviceLabel}`,
          `Platform: ${deviceToRemove.fingerprint.platform || "Unknown"}`,
          `Browser: ${getBrowserInfo(deviceToRemove.fingerprint.userAgent, deviceToRemove.fingerprint.browserName)}`,
          `User Agent: ${deviceToRemove.fingerprint.userAgent || "Unknown"}`,
          `Screen: ${deviceToRemove.fingerprint.screen ? `${deviceToRemove.fingerprint.screen.width}x${deviceToRemove.fingerprint.screen.height}` : "Unknown"}`,
          `Last Used: ${getTimeSince(deviceToRemove.lastUsedAt)}`,
          `User ID: ${userId}`,
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n");

        await telegramLogger(`🗑️ USER DEVICE REMOVAL ATTEMPT\n\n${deviceInfo}`);
      }

      const response = await fetch("/api/user/devices/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        // Log successful removal
        if (deviceToRemove) {
          const successInfo = [
            `Device ID: ${deviceToRemove.id}`,
            `Label: ${deviceToRemove.deviceLabel}`,
            `Platform: ${deviceToRemove.fingerprint.platform || "Unknown"}`,
            `Browser: ${getBrowserInfo(deviceToRemove.fingerprint.userAgent, deviceToRemove.fingerprint.browserName)}`,
            `User ID: ${userId}`,
            `Remaining Devices: ${data.remainingDevices || "Unknown"}`,
            `Timestamp: ${new Date().toISOString()}`,
          ].join("\n");

          await telegramLogger(
            `✅ DEVICE REMOVAL SUCCESSFUL\n\n${successInfo}`,
          );
        }

        // Update local device list
        setDeviceList((prev) =>
          prev.filter((device) => device.id !== deviceId),
        );

        // Update removal status
        await fetchRemovalStatus();

        // Show success message
        alert("Device removed successfully!");
      } else {
        // Log removal failure
        const errorInfo = [
          `Device ID: ${deviceId}`,
          `User ID: ${userId}`,
          `Error: ${data.error || "Unknown error"}`,
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n");

        await telegramLogger(`❌ DEVICE REMOVAL FAILED\n\n${errorInfo}`);

        alert(data.error || "Failed to remove device");
      }
    } catch (error) {
      const errorInfo = [
        `Device ID: ${deviceId}`,
        `User ID: ${userId}`,
        `Error: ${error instanceof Error ? error.message : String(error)}`,
        `Timestamp: ${new Date().toISOString()}`,
      ].join("\n");

      await telegramLogger(`💥 DEVICE REMOVAL ERROR\n\n${errorInfo}`, error);

      alert("An error occurred while removing the device");
    } finally {
      setIsRemoving(false);
    }
  };

  const getDeviceIcon = (userAgent?: string, screen?: { width: number }) => {
    if (!userAgent) {
      // Fallback to screen size detection if userAgent not available
      if (screen && screen.width <= 768) {
        return (
          <DeviceMobileIcon
            weight="duotone"
            className="h-5 w-5 text-black dark:text-white"
          />
        );
      }
      return (
        <DeviceTabletIcon
          weight="duotone"
          className="h-5 w-5 text-black dark:text-white"
        />
      );
    }

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return (
        <DeviceMobileIcon
          weight="duotone"
          className="h-5 w-5 text-black dark:text-white"
        />
      );
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return (
        <DeviceTabletIcon
          weight="duotone"
          className="h-5 w-5 text-black dark:text-white"
        />
      );
    } else {
      return (
        <DesktopIcon
          weight="duotone"
          className="h-5 w-5 text-black dark:text-white"
        />
      );
    }
  };

  const getDeviceType = (userAgent?: string, screen?: { width: number }) => {
    if (!userAgent) {
      // Fallback to screen size detection if userAgent not available
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
    // Use browserName field if available (more reliable)
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

  const getTimeSince = (date: Date | string) => {
    const now = new Date();
    const targetDate = typeof date === "string" ? new Date(date) : date;
    const diffMs = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (deviceList.length === 0) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
              <DeviceTabletIcon
                weight="duotone"
                className="h-6 w-6 text-black dark:text-white"
              />
              Device Management
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 self-start border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] sm:self-auto dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              <ArrowClockwiseIcon
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-black bg-white p-8 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            <DeviceTabletIcon
              weight="duotone"
              className="mx-auto mb-4 h-12 w-12 text-black dark:text-white"
            />
            <h3 className="font-excon mb-2 text-lg font-black text-black dark:text-white">
              No Devices Found
            </h3>
            <p className="font-satoshi font-bold text-black dark:text-white">
              No active devices are currently registered. Try refreshing or log
              in from a device to see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
            <DeviceTabletIcon
              weight="duotone"
              className="h-6 w-6 text-black dark:text-white"
            />
            Device Management
          </CardTitle>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 self-start border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] sm:self-auto dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
          >
            <ArrowClockwiseIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deviceList.map((device) => (
            <div
              key={device.id}
              className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-md border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:shadow-[2px_2px_0px_0px_#757373]">
                  {getDeviceIcon(
                    device.fingerprint.userAgent,
                    device.fingerprint.screen,
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  {/* Desktop: Title and buttons in same row */}
                  <div className="hidden md:flex md:items-center md:justify-between">
                    <div>
                      <h4 className="font-excon font-black text-black dark:text-white">
                        {device.deviceLabel}
                      </h4>
                      <p className="font-satoshi text-sm font-bold text-black dark:text-white">
                        {getDeviceType(
                          device.fingerprint.userAgent,
                          device.fingerprint.screen,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        <GlobeIcon weight="duotone" className="h-3 w-3" />
                        {device.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {deviceList.length > 1 && (
                        <Button
                          onClick={() => handleRemoveDevice(device.id)}
                          disabled={!canRemove || isRemoving}
                          variant="destructive"
                          size="sm"
                          className="gap-1 border-2 border-red-600 bg-red-500 font-bold text-white shadow-[2px_2px_0px_0px_#dc2626] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#dc2626] disabled:opacity-50"
                        >
                          <TrashIcon className="h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Title and buttons on separate rows */}
                  <div className="space-y-2 md:hidden">
                    <div>
                      <h4 className="font-excon font-black text-black dark:text-white">
                        {device.deviceLabel}
                      </h4>
                      <p className="font-satoshi text-sm font-bold text-black dark:text-white">
                        {getDeviceType(
                          device.fingerprint.userAgent,
                          device.fingerprint.screen,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        <GlobeIcon weight="duotone" className="h-3 w-3" />
                        {device.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {deviceList.length > 1 && (
                        <Button
                          onClick={() => handleRemoveDevice(device.id)}
                          disabled={!canRemove || isRemoving}
                          variant="destructive"
                          size="sm"
                          className="gap-1 border-2 border-red-600 bg-red-500 font-bold text-white shadow-[2px_2px_0px_0px_#dc2626] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#dc2626] disabled:opacity-50"
                        >
                          <TrashIcon className="h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
                      <span className="font-satoshi block text-xs font-bold text-black dark:text-white">
                        BROWSER
                      </span>
                      <span className="font-excon block font-black text-black dark:text-white">
                        {getBrowserInfo(
                          device.fingerprint.userAgent,
                          device.fingerprint.browserName,
                        )}
                      </span>
                    </div>
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
                      <span className="font-satoshi block text-xs font-bold text-black dark:text-white">
                        PLATFORM
                      </span>
                      <span className="font-excon block font-black text-black dark:text-white">
                        {device.fingerprint.platform || "Unknown"}
                      </span>
                    </div>
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
                      <span className="font-satoshi block text-xs font-bold text-black dark:text-white">
                        LAST USED
                      </span>
                      <span className="font-excon block font-black text-black dark:text-white">
                        {getTimeSince(device.lastUsedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Device Removal Information */}
        <div className="mt-6 rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
          <h4 className="font-excon mb-2 flex items-center gap-2 font-black text-black dark:text-white">
            <WarningIcon className="h-4 w-4" />
            DEVICE REMOVAL POLICY
          </h4>
          <p className="font-satoshi mb-3 font-bold text-black dark:text-white">
            You can remove one device every 24 hours for security reasons.
            Removing a device will prevent it from accessing your account.
          </p>
          {!canRemove && timeUntilNextRemoval && (
            <div className="mb-3 rounded-lg border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0px_0px_#facc15] dark:border-yellow-600 dark:bg-yellow-900/30 dark:shadow-[2px_2px_0px_0px_#a16207]">
              <p className="font-satoshi flex items-center gap-2 text-sm font-bold text-yellow-800 dark:text-yellow-200">
                <ClockIcon className="h-4 w-4" /> You can remove another device
                in {timeUntilNextRemoval}
              </p>
            </div>
          )}
          {deviceList.length <= 1 && (
            <div className="mb-3 rounded-lg border-2 border-blue-400 bg-blue-100 p-3 shadow-[2px_2px_0px_0px_#3b82f6] dark:border-blue-600 dark:bg-blue-900/30 dark:shadow-[2px_2px_0px_0px_#1e40af]">
              <p className="font-satoshi text-sm font-bold text-blue-800 dark:text-blue-200">
                You need at least one device to access your account
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
          <h4 className="font-excon mb-2 font-black text-black dark:text-white">
            SECURITY INFORMATION
          </h4>
          <p className="font-satoshi font-bold text-black dark:text-white">
            Your account can be accessed from up to{" "}
            {APP_CONFIG.MAX_DEVICES_PER_USER} devices. If you notice any
            unfamiliar devices, please contact support immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
