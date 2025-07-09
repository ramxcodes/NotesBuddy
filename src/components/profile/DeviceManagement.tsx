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
        return <DeviceMobileIcon type="duotone" className="h-5 w-5" />;
      }
      return <DeviceTabletIcon type="duotone" className="h-5 w-5" />;
    }

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <DeviceMobileIcon type="duotone" className="h-5 w-5" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <DeviceTabletIcon type="duotone" className="h-5 w-5" />;
    } else {
      return <DesktopIcon type="duotone" className="h-5 w-5" />;
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
              <DeviceTabletIcon type="duotone" className="h-6 w-6" />
              Device Management
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <ArrowClockwiseIcon
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <DeviceTabletIcon
              type="duotone"
              className="text-muted-foreground mx-auto mb-4 h-12 w-12"
            />
            <h3 className="font-excon mb-2 text-lg font-semibold">
              No Devices Found
            </h3>
            <p className="text-muted-foreground font-satoshi">
              No active devices are currently registered. Try refreshing or log
              in from a device to see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
            <DeviceTabletIcon type="duotone" className="h-6 w-6" />
            Device Management
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
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
              className="bg-card hover:bg-muted/50 rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="bg-muted rounded-lg p-2">
                  {getDeviceIcon(
                    device.fingerprint.userAgent,
                    device.fingerprint.screen,
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-excon font-semibold">
                        {device.deviceLabel}
                      </h4>
                      <p className="text-muted-foreground font-satoshi text-sm">
                        {getDeviceType(
                          device.fingerprint.userAgent,
                          device.fingerprint.screen,
                        )}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <GlobeIcon type="duotone"  className="h-3 w-3" />
                      {device.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="font-satoshi grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Browser: </span>
                      <span>
                        {getBrowserInfo(
                          device.fingerprint.userAgent,
                          device.fingerprint.browserName,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Platform: </span>
                      <span>{device.fingerprint.platform || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Language: </span>
                      <span>{device.fingerprint.language || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last used: </span>
                      <span>{getTimeSince(device.lastUsedAt)}</span>
                    </div>
                  </div>

                  {device.fingerprint.screenResolution && (
                    <div className="font-satoshi text-sm">
                      <span className="text-muted-foreground">Screen: </span>
                      <span>{device.fingerprint.screenResolution}</span>
                    </div>
                  )}

                  {/* Additional technical details for debugging */}
                  {device.fingerprint.hardwareConcurrency && (
                    <div className="font-satoshi text-sm">
                      <span className="text-muted-foreground">CPU Cores: </span>
                      <span>{device.fingerprint.hardwareConcurrency}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Security Note */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <h4 className="font-excon mb-2 font-semibold text-blue-800 dark:text-blue-200">
            Security Information
          </h4>
          <p className="font-satoshi text-sm text-blue-600 dark:text-blue-400">
            Your account can be accessed from up to{" "}
            {APP_CONFIG.MAX_DEVICES_PER_USER} devices. If you notice any
            unfamiliar devices, please contact support immediately. Devices with
            80% or higher similarity are considered the same device.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
