import { CacheConfig } from "./cache";

export const nextContentCacheConfig = {
  getNextUnits: {
    cacheTime: 30, // 30 minutes - changes when new content is added
    tags: ["notes", "next-units"],
    cacheKey: "next-units",
  } as CacheConfig,

  getSubjectQuizzes: {
    cacheTime: 15, // 15 minutes - quiz availability changes
    tags: ["quizzes", "subject-content"],
    cacheKey: "subject-quizzes",
  } as CacheConfig,

  getSubjectFlashcards: {
    cacheTime: 15, // 15 minutes - flashcard availability changes
    tags: ["flashcards", "subject-content"],
    cacheKey: "subject-flashcards",
  } as CacheConfig,

  getSubjectContent: {
    cacheTime: 20, // 20 minutes - combined content changes
    tags: ["notes", "quizzes", "flashcards", "subject-content"],
    cacheKey: "subject-content",
  } as CacheConfig,
};
