export const APP_CONFIG = {
  MAX_DEVICES_PER_USER: parseInt(process.env.MAX_DEVICES_PER_USER || "1"),
} as const;

// Configuration constants
export const DEVICE_CONFIG = {
  SIMILARITY_THRESHOLD: Number(process.env.DEVICE_SIMILARITY_THRESHOLD) || 0.8,
  COLOR_DEPTH_VARIANCE: Number(process.env.DEVICE_COLOR_DEPTH_VARIANCE) || 8,
  SIMILARITY_WEIGHTS: {
    platform: Number(process.env.DEVICE_WEIGHT_PLATFORM) || 0.25,
    screen: Number(process.env.DEVICE_WEIGHT_SCREEN) || 0.2,
    userAgent: Number(process.env.DEVICE_WEIGHT_USER_AGENT) || 0.15,
    timezone: Number(process.env.DEVICE_WEIGHT_TIMEZONE) || 0.1,
    language: Number(process.env.DEVICE_WEIGHT_LANGUAGE) || 0.08,
    hardwareConcurrency: Number(process.env.DEVICE_WEIGHT_HARDWARE) || 0.08,
    cookieEnabled: Number(process.env.DEVICE_WEIGHT_COOKIE) || 0.05,
    vendor: Number(process.env.DEVICE_WEIGHT_VENDOR) || 0.03,
    maxTouchPoints: Number(process.env.DEVICE_WEIGHT_TOUCH) || 0.03,
    doNotTrack: Number(process.env.DEVICE_WEIGHT_DNT) || 0.02,
    languages: Number(process.env.DEVICE_WEIGHT_LANGUAGES) || 0.01,
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
