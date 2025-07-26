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
} from "@phosphor-icons/react";
import { APP_CONFIG } from "@/utils/config";
import { Device } from "@/types/device";
import { useState } from "react";

interface DeviceManagementProps {
  devices: Device[];
}

export function DeviceManagement({ devices }: DeviceManagementProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger page refresh to get latest device data
      window.location.reload();
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    } finally {
      setIsRefreshing(false);
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

  if (devices.length === 0) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <div className="flex items-center justify-between">
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
              className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              <ArrowClockwiseIcon
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-black bg-white p-8 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
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
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <CardHeader>
        <div className="flex items-center justify-between">
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
            className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
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
          {devices.map((device) => (
            <div
              key={device.id}
              className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-md border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:shadow-[2px_2px_0px_0px_#757373]">
                  {getDeviceIcon(
                    device.fingerprint.userAgent,
                    device.fingerprint.screen,
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
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
                    <Badge
                      variant="secondary"
                      className="gap-1 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      <GlobeIcon weight="duotone" className="h-3 w-3" />
                      {device.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
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
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
                      <span className="font-satoshi block text-xs font-bold text-black dark:text-white">
                        PLATFORM
                      </span>
                      <span className="font-excon block font-black text-black dark:text-white">
                        {device.fingerprint.platform || "Unknown"}
                      </span>
                    </div>
                    <div className="rounded border-2 border-black bg-white p-2 shadow-[1px_1px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:shadow-[1px_1px_0px_0px_#757373]">
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

        <div className="mt-6 rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
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
