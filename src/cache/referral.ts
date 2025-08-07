import { CacheConfig } from "./cache";

export const referralCacheConfig = {
  getUserReferralStatus: {
    cacheTime: 5,
    tags: ["user-referral-status"],
    cacheKey: "user-referral-status",
  } as CacheConfig,

  validateReferralCode: {
    cacheTime: 1,
    tags: ["referral-code-validation"],
    cacheKey: "referral-code-validation",
  } as CacheConfig,
};
