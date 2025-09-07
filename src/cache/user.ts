import { CacheConfig } from "./cache";

export const userCacheConfig = {
  getUserOnboardingStatus: {
    cacheTime: 5,
    tags: ["user-onboarding"],
    cacheKey: "user-onboarding-status",
  } as CacheConfig,

  getUserFullProfile: {
    cacheTime: 5,
    tags: ["user-full-profile"],
    cacheKey: "user-full-profile",
  } as CacheConfig,

  getUserDevices: {
    cacheTime: 5,
    tags: ["user-devices"],
    cacheKey: "user-devices",
  } as CacheConfig,

  getUserDeviceCount: {
    cacheTime: 5,
    tags: ["user-devices"],
    cacheKey: "user-device-count",
  } as CacheConfig,
};
