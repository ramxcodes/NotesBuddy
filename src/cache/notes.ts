import { CacheConfig } from "./cache";

export const notesCacheConfig = {
  getFilteredNotes: {
    cacheTime: 5, // 5 minutes - shorter for dynamic search results
    tags: ["notes", "search"],
    cacheKey: "filtered-notes",
  } as CacheConfig,

  getNotesCount: {
    cacheTime: 15, // 15 minutes - longer for counts
    tags: ["notes"],
    cacheKey: "notes-count",
  } as CacheConfig,

  getSubjects: {
    cacheTime: 60, // 1 hour - subjects change rarely
    tags: ["subjects", "notes"],
    cacheKey: "subjects",
  } as CacheConfig,

  getPopularSearches: {
    cacheTime: 30, // 30 minutes
    tags: ["search", "analytics"],
    cacheKey: "popular-searches",
  } as CacheConfig,
};
