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
  languages: number;
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
  doNotTrack: z.union([z.string(), z.null()]),
  languages: z.string(),
});

export const DeviceDataSchema = z.object({
  fingerprint: FingerprintSchema,
  deviceLabel: z.string().min(1).max(255),
});
