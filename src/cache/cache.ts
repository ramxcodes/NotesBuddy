export interface CacheConfig {
  cacheTime: number; // in minutes
  tags?: string[];
  cacheKey?: string;
}

export const minutesToSeconds = (minutes: number): number => minutes * 60;

export * from "./notes";
export * from "./user";
export * from "./premium";
export * from "./admin";

export const getCacheOptions = (config: CacheConfig) => ({
  revalidate: minutesToSeconds(config.cacheTime),
  tags: config.tags || [],
});

export const getNextOptions = (config: CacheConfig) => ({
  next: {
    revalidate: minutesToSeconds(config.cacheTime),
    tags: config.tags,
  },
});
