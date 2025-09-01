import { CacheConfig } from "./cache";

export const adminCacheConfig = {
  getAdminStatistics: {
    cacheTime: 0.083,
    tags: ["admin-statistics"],
    cacheKey: "admin-statistics",
  } as CacheConfig,
  getAdminUsers: {
    cacheTime: 0.083,
    tags: ["admin-users"],
    cacheKey: "admin-users",
  } as CacheConfig,
  getAdminCoupons: {
    cacheTime: 0.083,
    tags: ["admin-coupons"],
    cacheKey: "admin-coupons",
  } as CacheConfig,
  getCouponDetails: {
    cacheTime: 0.083,
    tags: ["coupon-details"],
    cacheKey: "coupon-details",
  } as CacheConfig,
  getAdminQuizzes: {
    cacheTime: 0.083,
    tags: ["admin-quizzes"],
    cacheKey: "admin-quizzes",
  } as CacheConfig,
  getQuizDetails: {
    cacheTime: 0.083,
    tags: ["quiz-details"],
    cacheKey: "quiz-details",
  } as CacheConfig,
  getQuizAttempts: {
    cacheTime: 0.083,
    tags: ["quiz-attempts"],
    cacheKey: "quiz-attempts",
  } as CacheConfig,
  getAdminReports: {
    cacheTime: 0.083,
    tags: ["admin-reports"],
    cacheKey: "admin-reports",
  } as CacheConfig,
  getReportDetails: {
    cacheTime: 0.083,
    tags: ["report-details"],
    cacheKey: "report-details",
  } as CacheConfig,
  getFlashcardSetStats: {
    cacheTime: 0.083,
    tags: ["flashcard-stats"],
    cacheKey: "flashcard-stats",
  } as CacheConfig,
  getAdminFlashcardSets: {
    cacheTime: 0.083,
    tags: ["admin-flashcard-sets"],
    cacheKey: "admin-flashcard-sets",
  } as CacheConfig,
};
