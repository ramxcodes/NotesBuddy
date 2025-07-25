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
};
