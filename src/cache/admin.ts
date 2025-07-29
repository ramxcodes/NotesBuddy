import { CacheConfig } from "./cache";

export const adminCacheConfig = {
  getAdminStatistics: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-statistics"],
    cacheKey: "admin-statistics",
  } as CacheConfig,
  getAdminUsers: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-users"],
    cacheKey: "admin-users",
  } as CacheConfig,
  getAdminCoupons: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-coupons"],
    cacheKey: "admin-coupons",
  } as CacheConfig,
  getCouponDetails: {
    cacheTime: 10, // 10 minutes
    tags: ["coupon-details"],
    cacheKey: "coupon-details",
  } as CacheConfig,
  getAdminQuizzes: {
    cacheTime: 10, // 10 minutes
    tags: ["admin-quizzes"],
    cacheKey: "admin-quizzes",
  } as CacheConfig,
  getQuizDetails: {
    cacheTime: 10, // 10 minutes
    tags: ["quiz-details"],
    cacheKey: "quiz-details",
  } as CacheConfig,
  getQuizAttempts: {
    cacheTime: 10, // 10 minutes
    tags: ["quiz-attempts"],
    cacheKey: "quiz-attempts",
  } as CacheConfig,
  getAdminReports: {
    cacheTime: 5, // 5 minutes
    tags: ["admin-reports"],
    cacheKey: "admin-reports",
  } as CacheConfig,
  getReportDetails: {
    cacheTime: 5, // 5 minutes
    tags: ["report-details"],
    cacheKey: "report-details",
  } as CacheConfig,
};
