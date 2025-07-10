import { CacheConfig } from "./cache";

// Only functions that actually use unstable_cache
export const premiumCacheConfig = {
  getUserPremiumStatus: {
    cacheTime: 30, // 30 minutes (was 1800 seconds)
    tags: ["user-premium-status"],
    cacheKey: "user-premium-status",
  } as CacheConfig,

  getUserPurchaseHistory: {
    cacheTime: 30, // 30 minutes (was 1800 seconds)
    tags: ["user-purchase-history"],
    cacheKey: "user-purchase-history",
  } as CacheConfig,
};
