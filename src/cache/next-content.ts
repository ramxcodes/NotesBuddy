import { CacheConfig } from "./cache";

export const nextContentCacheConfig = {
  getNextUnits: {
    cacheTime: 21600,
    tags: ["notes", "next-units"],
    cacheKey: "next-units",
  } as CacheConfig,

  getSubjectQuizzes: {
    cacheTime: 15,
    tags: ["quizzes", "subject-content"],
    cacheKey: "subject-quizzes",
  } as CacheConfig,

  getSubjectFlashcards: {
    cacheTime: 15,
    tags: ["flashcards", "subject-content"],
    cacheKey: "subject-flashcards",
  } as CacheConfig,

  getSubjectContent: {
    cacheTime: 20,
    tags: ["notes", "quizzes", "flashcards", "subject-content"],
    cacheKey: "subject-content",
  } as CacheConfig,
};
