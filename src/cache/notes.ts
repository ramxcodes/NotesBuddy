import { CacheConfig } from "./cache";

export const notesCacheConfig = {
  getFilteredNotes: {
    cacheTime: 21600,
    tags: ["notes", "search"],
    cacheKey: "filtered-notes",
  } as CacheConfig,

  getFilteredNotesByType: {
    cacheTime: 21600,
    tags: ["notes", "type", "filter"],
    cacheKey: "filtered-notes-by-type",
  } as CacheConfig,

  getFilteredNotesByPremium: {
    cacheTime: 21600,
    tags: ["notes", "premium", "filter"],
    cacheKey: "filtered-notes-by-premium",
  } as CacheConfig,

  getNotesCount: {
    cacheTime: 21600,
    tags: ["notes"],
    cacheKey: "notes-count",
  } as CacheConfig,

  getSubjects: {
    cacheTime: 21600,
    tags: ["subjects", "notes"],
    cacheKey: "subjects",
  } as CacheConfig,

  getPopularSearches: {
    cacheTime: 21600,
    tags: ["search", "analytics"],
    cacheKey: "popular-searches",
  } as CacheConfig,

  getNoteBySlug: {
    cacheTime: 21600,
    tags: ["notes", "note"],
    cacheKey: "note-by-slug",
  } as CacheConfig,

  getNextUnitsAndContent: {
    cacheTime: 21600,
    tags: ["notes", "next-content", "navigation"],
    cacheKey: "next-units-content",
  } as CacheConfig,

  getNotesUnits: {
    cacheTime: 21600,
    tags: ["notes", "units", "notes-type"],
    cacheKey: "notes-units",
  } as CacheConfig,

  getExamContent: {
    cacheTime: 21600,
    tags: ["notes", "exam", "mst", "pyq", "one-shot"],
    cacheKey: "exam-content",
  } as CacheConfig,
};
