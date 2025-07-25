export interface CacheConfig {
  cacheTime: number; // in minutes
  tags?: string[];
  cacheKey?: string;
}

// Utility function to convert minutes to seconds
export const minutesToSeconds = (minutes: number): number => minutes * 60;

// Re-export all cache configurations
export * from "./notes";
export * from "./user";
export * from "./premium";
export * from "./admin";

// Utility function to get cache options for unstable_cache
export const getCacheOptions = (config: CacheConfig) => ({
  revalidate: minutesToSeconds(config.cacheTime),
  tags: config.tags || [],
});

// Utility function to get Next.js fetch options
export const getNextOptions = (config: CacheConfig) => ({
  next: {
    revalidate: minutesToSeconds(config.cacheTime),
    tags: config.tags,
  },
});
