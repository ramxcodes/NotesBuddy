import { CacheConfig } from "./cache";

export const referralCacheConfig = {
  getUserReferralStatus: {
    cacheTime: 5, // 5 minutes
    tags: ["user-referral-status"],
    cacheKey: "user-referral-status",
  } as CacheConfig,

  validateReferralCode: {
    cacheTime: 1, // 1 minute
    tags: ["referral-code-validation"],
    cacheKey: "referral-code-validation",
  } as CacheConfig,
};
