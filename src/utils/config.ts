export const APP_CONFIG = {
  MAX_DEVICES_PER_USER: parseInt(process.env.MAX_DEVICES_PER_USER || "2", 10),
} as const;

export const DEVICE_CONFIG = {
  SIMILARITY_THRESHOLD: Number(process.env.DEVICE_SIMILARITY_THRESHOLD) || 0.65,
  COLOR_DEPTH_VARIANCE: Number(process.env.DEVICE_COLOR_DEPTH_VARIANCE) || 8,

  SIMILARITY_WEIGHTS: {
    platform: Number(process.env.DEVICE_WEIGHT_PLATFORM) || 0.3,
    screen: Number(process.env.DEVICE_WEIGHT_SCREEN) || 0.25,
    hardwareConcurrency: Number(process.env.DEVICE_WEIGHT_HARDWARE) || 0.12,
    userAgent: Number(process.env.DEVICE_WEIGHT_USER_AGENT) || 0.1,
    timezone: Number(process.env.DEVICE_WEIGHT_TIMEZONE) || 0.08,
    language: Number(process.env.DEVICE_WEIGHT_LANGUAGE) || 0.06,
    maxTouchPoints: Number(process.env.DEVICE_WEIGHT_TOUCH) || 0.04,
    cookieEnabled: Number(process.env.DEVICE_WEIGHT_COOKIE) || 0.02,
    vendor: Number(process.env.DEVICE_WEIGHT_VENDOR) || 0.02,
    doNotTrack: Number(process.env.DEVICE_WEIGHT_DNT) || 0.01,
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
