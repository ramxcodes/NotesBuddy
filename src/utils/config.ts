export const APP_CONFIG = {
  MAX_DEVICES_PER_USER: parseInt(process.env.MAX_DEVICES_PER_USER || "2", 10),
} as const;

// Device fingerprinting configuration constants
export const DEVICE_CONFIG = {
  // Device similarity threshold: 0.8 = 80% similarity required for device matching
  SIMILARITY_THRESHOLD: Number(process.env.DEVICE_SIMILARITY_THRESHOLD) || 0.8,
  COLOR_DEPTH_VARIANCE: Number(process.env.DEVICE_COLOR_DEPTH_VARIANCE) || 8,

  // Similarity weights for device fingerprint comparison (must sum to 1.0)
  // Higher weights = more important for device identification
  SIMILARITY_WEIGHTS: {
    platform: Number(process.env.DEVICE_WEIGHT_PLATFORM) || 0.25, // OS platform (highest priority)
    screen: Number(process.env.DEVICE_WEIGHT_SCREEN) || 0.2, // Screen resolution
    userAgent: Number(process.env.DEVICE_WEIGHT_USER_AGENT) || 0.15, // Browser and OS info
    timezone: Number(process.env.DEVICE_WEIGHT_TIMEZONE) || 0.1, // User timezone
    language: Number(process.env.DEVICE_WEIGHT_LANGUAGE) || 0.08, // Browser language
    hardwareConcurrency: Number(process.env.DEVICE_WEIGHT_HARDWARE) || 0.08, // CPU cores
    cookieEnabled: Number(process.env.DEVICE_WEIGHT_COOKIE) || 0.05, // Cookie support
    vendor: Number(process.env.DEVICE_WEIGHT_VENDOR) || 0.03, // Browser vendor
    maxTouchPoints: Number(process.env.DEVICE_WEIGHT_TOUCH) || 0.03, // Touch capability
    doNotTrack: Number(process.env.DEVICE_WEIGHT_DNT) || 0.02, // DNT setting
    languages: Number(process.env.DEVICE_WEIGHT_LANGUAGES) || 0.01, // Supported languages
  },
  BROWSER_OS_KEYWORDS: {
    browsers: {
      chrome: "chrome",
      firefox: "firefox",
      safari: "safari",
      edge: "edge",
    },
    operating_systems: {
      mac: "mac",
      windows: "windows",
      linux: "linux",
      android: "android",
      ios: "ios",
    },
  },
} as const;

// Debug logging for configuration
if (process.env.NODE_ENV === "development") {
  console.log("Device Config:", {
    MAX_DEVICES_PER_USER: APP_CONFIG.MAX_DEVICES_PER_USER,
    SIMILARITY_THRESHOLD: DEVICE_CONFIG.SIMILARITY_THRESHOLD,
    ENV_MAX_DEVICES: process.env.MAX_DEVICES_PER_USER,
  });
}
