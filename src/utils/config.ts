export const APP_CONFIG = {
  MAX_DEVICES_PER_USER: parseInt(process.env.MAX_DEVICES_PER_USER || "1"),
} as const;
