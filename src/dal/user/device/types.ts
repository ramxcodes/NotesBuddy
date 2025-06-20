export interface DeviceFingerprintData {
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
  deviceLabel?: string;
}
