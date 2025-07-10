import { CacheConfig } from "./cache";

// Only functions that actually use unstable_cache
export const userCacheConfig = {
  getUserOnboardingStatus: {
    cacheTime: 30, // 30 minutes
    tags: ["user-onboarding"],
    cacheKey: "user-onboarding-status",
  } as CacheConfig,

  getUserFullProfile: {
    cacheTime: 30, // 30 minutes
    tags: ["user-full-profile"],
    cacheKey: "user-full-profile",
  } as CacheConfig,

  getUserDevices: {
    cacheTime: 30, // 30 minutes (was 1800 seconds)
    tags: ["user-devices"],
    cacheKey: "user-devices",
  } as CacheConfig,

  getUserDeviceCount: {
    cacheTime: 5, // 5 minutes (was 300 seconds)
    tags: ["user-devices"],
    cacheKey: "user-device-count",
  } as CacheConfig,
};
