import { CacheConfig } from "./cache";

export const premiumCacheConfig = {
  getUserPremiumStatus: {
    cacheTime: 30,
    tags: ["user-premium-status"],
    cacheKey: "user-premium-status",
  } as CacheConfig,

  getUserPurchaseHistory: {
    cacheTime: 30,
    tags: ["user-purchase-history"],
    cacheKey: "user-purchase-history",
  } as CacheConfig,
};
