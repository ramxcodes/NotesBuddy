import { CacheConfig } from "./cache";

export const notesCacheConfig = {
  getFilteredNotes: {
    cacheTime: 60, // 5 minutes
    tags: ["notes", "search"],
    cacheKey: "filtered-notes",
  } as CacheConfig,

  getNotesCount: {
    cacheTime: 60, // 15 minutes - longer for counts
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
  getNoteBySlug: {
    cacheTime: 60, // 1 hour - individual notes change rarely
    tags: ["notes", "note"],
    cacheKey: "note-by-slug",
  } as CacheConfig,
};
