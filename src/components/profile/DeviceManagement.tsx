import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DeviceTabletIcon,
  DeviceMobileIcon,
  DesktopIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import { APP_CONFIG } from "@/utils/config";

interface Device {
  id: string;
  deviceLabel: string;
  lastUsedAt: Date | string;
  fingerprint: {
    userAgent?: string;
    platform?: string;
    vendor?: string;
    language?: string;
    timezone?: string;
    screenResolution?: string;
  };
}

interface DeviceManagementProps {
  devices: Device[];
}

export function DeviceManagement({ devices }: DeviceManagementProps) {
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <DeviceTabletIcon className="h-5 w-5" />;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <DeviceMobileIcon className="h-5 w-5" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <DeviceTabletIcon className="h-5 w-5" />;
    } else {
      return <DesktopIcon className="h-5 w-5" />;
    }
  };

  const getDeviceType = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";

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

  const getBrowserInfo = (userAgent?: string) => {
    if (!userAgent) return "Unknown Browser";

    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari")) return "Safari";
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
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
            <DeviceTabletIcon className="h-6 w-6" />
            Device Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <DeviceTabletIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="font-excon mb-2 text-lg font-semibold">
              No Devices Found
            </h3>
            <p className="text-muted-foreground font-satoshi">
              No active devices are currently registered.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
          <DeviceTabletIcon className="h-6 w-6" />
          Device Management
        </CardTitle>
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
                  {getDeviceIcon(device.fingerprint.userAgent)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-excon font-semibold">
                        {device.deviceLabel}
                      </h4>
                      <p className="text-muted-foreground font-satoshi text-sm">
                        {getDeviceType(device.fingerprint.userAgent)}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <GlobeIcon className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>

                  <div className="font-satoshi grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Browser: </span>
                      <span>
                        {getBrowserInfo(device.fingerprint.userAgent)}
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <h4 className="font-excon mb-2 font-semibold text-blue-800 dark:text-blue-200">
            Security Information
          </h4>
          <p className="font-satoshi text-sm text-blue-600 dark:text-blue-400">
            Your account can be accessed from up to{" "}
            {APP_CONFIG.MAX_DEVICES_PER_USER} devices. If you notice any
            unfamiliar devices, please contact support immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
