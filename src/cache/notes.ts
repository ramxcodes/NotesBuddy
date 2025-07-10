import { CacheConfig } from "./cache";

export const notesCacheConfig = {
  getFilteredNotes: {
    cacheTime: 1, // 1 hour
    tags: ["notes"],
    cacheKey: "filtered-notes",
  } as CacheConfig,

  getNotesCount: {
    cacheTime: 60, // 1 hour
    tags: ["notes"],
    cacheKey: "notes-count",
  } as CacheConfig,
};
