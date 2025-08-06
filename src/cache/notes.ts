import { CacheConfig } from "./cache";

export const notesCacheConfig = {
  getFilteredNotes: {
    cacheTime: 5, // 5 minutes - frequently changing search results
    tags: ["notes", "search"],
    cacheKey: "filtered-notes",
  } as CacheConfig,

  getFilteredNotesByType: {
    cacheTime: 5, // 5 minutes - type filters change frequently with user interaction
    tags: ["notes", "type", "filter"],
    cacheKey: "filtered-notes-by-type",
  } as CacheConfig,

  getFilteredNotesByPremium: {
    cacheTime: 10, // 10 minutes - premium status changes less frequently
    tags: ["notes", "premium", "filter"],
    cacheKey: "filtered-notes-by-premium",
  } as CacheConfig,

  getNotesCount: {
    cacheTime: 15, // 15 minutes - longer for counts as they change less frequently
    tags: ["notes"],
    cacheKey: "notes-count",
  } as CacheConfig,

  getSubjects: {
    cacheTime: 60, // 1 hour - subjects change rarely
    tags: ["subjects", "notes"],
    cacheKey: "subjects",
  } as CacheConfig,

  getPopularSearches: {
    cacheTime: 30, // 30 minutes - analytics data updates periodically
    tags: ["search", "analytics"],
    cacheKey: "popular-searches",
  } as CacheConfig,

  getNoteBySlug: {
    cacheTime: 60, // 1 hour - individual notes change rarely
    tags: ["notes", "note"],
    cacheKey: "note-by-slug",
  } as CacheConfig,

  getNextUnitsAndContent: {
    cacheTime: 30, // 30 minutes - next content changes moderately
    tags: ["notes", "next-content", "navigation"],
    cacheKey: "next-units-content",
  } as CacheConfig,

  getNotesUnits: {
    cacheTime: 45, // 45 minutes - NOTES type content changes less frequently
    tags: ["notes", "units", "notes-type"],
    cacheKey: "notes-units",
  } as CacheConfig,

  getExamContent: {
    cacheTime: 30, // 30 minutes - exam content (MST, PYQ, ONE-SHOT) changes moderately
    tags: ["notes", "exam", "mst", "pyq", "one-shot"],
    cacheKey: "exam-content",
  } as CacheConfig,
};
