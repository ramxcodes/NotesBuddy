import { z } from "zod";

export interface BrowserOSInfo {
  browser: string;
  os: string;
}

export interface SimilarityMetrics {
  platform: number;
  screen: number;
  userAgent: number;
  timezone: number;
  language: number;
  hardwareConcurrency: number;
  cookieEnabled: number;
  vendor: number;
  maxTouchPoints: number;
  doNotTrack: number;
}

// Standardized device fingerprint for UI components
export interface DeviceFingerprint {
  userAgent?: string;
  platform?: string;
  vendor?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  browserName?: string;
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth?: number;
  };
  cookieEnabled?: boolean;
  hardwareConcurrency?: number;
  maxTouchPoints?: number;
  doNotTrack?: string | null;
  languages?: string;
  canvasFingerprint?: string;
}

// Standardized device interface for all UI components
export interface Device {
  id: string;
  deviceLabel: string;
  lastUsedAt: Date | string;
  createdAt?: Date | string;
  isActive?: boolean;
  fingerprint: DeviceFingerprint;
}

// Validation schemas
export const FingerprintSchema = z.object({
  platform: z.string().min(1),
  screen: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    colorDepth: z.number().positive(),
  }),
  userAgent: z.string().min(1),
  timezone: z.string().min(1),
  language: z.string().min(1),
  hardwareConcurrency: z.number().positive(),
  cookieEnabled: z.boolean(),
  vendor: z.string(),
  maxTouchPoints: z.number().nonnegative(),
  doNotTrack: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => val ?? null),
  languages: z.string(),
});

export const DeviceDataSchema = z.object({
  fingerprint: FingerprintSchema,
  deviceLabel: z.string().min(1).max(255),
});
