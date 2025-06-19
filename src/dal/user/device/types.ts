export interface DeviceFingerprintData {
  fingerprint: {
    userAgent: string;
    screen: {
      width: number;
      height: number;
      colorDepth: number;
    };
    timezone: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
  };
  deviceLabel?: string;
}
