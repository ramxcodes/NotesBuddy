import { CacheConfig } from "./cache";

export const adminCacheConfig = {
  getAdminStatistics: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-statistics"],
    cacheKey: "admin-statistics",
  } as CacheConfig,
  getAdminUsers: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-users"],
    cacheKey: "admin-users",
  } as CacheConfig,
  getAdminCoupons: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-coupons"],
    cacheKey: "admin-coupons",
  } as CacheConfig,
  getCouponDetails: {
    cacheTime: 10, // 10 minutes
    tags: ["coupon-details"],
    cacheKey: "coupon-details",
  } as CacheConfig,
};
