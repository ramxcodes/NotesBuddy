// Search optimization utilities for better performance at scale

import { NOTES_QUERYResult } from "@/sanity/types";

// Extend the note type to include searchScore from our query
type NoteWithSearchScore = NOTES_QUERYResult[0] & {
  searchScore?: number;
};

interface SearchFilters {
  query?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
}

interface SearchCursor {
  lastTitle?: string;
  lastId?: string;
}

type CachedResult = {
  results: NOTES_QUERYResult;
  timestamp: number;
};

class SearchOptimizer {
  private static instance: SearchOptimizer;
  private searchCache = new Map<string, CachedResult>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SearchOptimizer {
    if (!SearchOptimizer.instance) {
      SearchOptimizer.instance = new SearchOptimizer();
    }
    return SearchOptimizer.instance;
  }

  // Client-side search result caching
  getCachedResults(cacheKey: string): NOTES_QUERYResult | null {
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results;
    }
    return null;
  }

  setCachedResults(cacheKey: string, results: NOTES_QUERYResult): void {
    this.searchCache.set(cacheKey, {
      results,
      timestamp: Date.now(),
    });

    // Cleanup old cache entries
    if (this.searchCache.size > 100) {
      const oldestKey = this.searchCache.keys().next().value;
      if (oldestKey) {
        this.searchCache.delete(oldestKey);
      }
    }
  }

  // Generate optimized cache key
  generateCacheKey(filters: SearchFilters, cursor?: SearchCursor): string {
    const filterStr = Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== "all",
      )
      .map(([key, value]) => `${key}:${value}`)
      .sort()
      .join("|");

    const cursorStr = cursor
      ? `cursor:${cursor.lastTitle}:${cursor.lastId}`
      : "";
    return `search:${filterStr}${cursorStr ? `|${cursorStr}` : ""}`;
  }

  // Search query sanitization
  sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .substring(0, 100); // Limit length
  }

  // Check if search should be throttled
  shouldThrottleSearch(query: string): boolean {
    // Skip very short or very common queries
    if (query.length < 2) return true;

    const commonQueries = [
      "the",
      "and",
      "or",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
    ];
    return commonQueries.includes(query.toLowerCase());
  }
}

export const searchOptimizer = SearchOptimizer.getInstance();

// Performance monitoring
export function measureSearchPerformance<T>(
  searchFunction: () => Promise<T>,
  query: string,
): Promise<T> {
  const startTime = performance.now();

  return searchFunction().then((result) => {
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Log slow searches (> 1 second)
    if (executionTime > 1000) {
      console.warn(
        `Slow search detected: "${query}" took ${executionTime.toFixed(2)}ms`,
      );
    }

    return result;
  });
}

// Search result sorting optimization
export function sortSearchResults(
  results: NOTES_QUERYResult,
  searchTerm?: string,
): NOTES_QUERYResult {
  if (!searchTerm) return results;

  return results.sort((a, b) => {
    // Use the searchScore we added to the query (with type assertion since it's dynamically added)
    const scoreA = (a as NoteWithSearchScore).searchScore || 0;
    const scoreB = (b as NoteWithSearchScore).searchScore || 0;

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }

    // Secondary sort by title alphabetically
    return (a.title || "").localeCompare(b.title || "");
  });
}
