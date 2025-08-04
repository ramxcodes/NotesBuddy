import { client } from "@/sanity/lib/client";
import {
  NOTE_BY_SLUG_QUERY,
  NOTES_QUERY,
  NOTES_COUNT_QUERY,
  SUBJECTS_QUERY,
} from "@/sanity/lib/queries";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getCacheOptions, getNextOptions } from "@/cache/cache";
import { notesCacheConfig } from "@/cache/notes";

export const getNoteBySlug = unstable_cache(
  async (slug: string) => {
    return await client.fetch(
      NOTE_BY_SLUG_QUERY,
      { slug },
      getNextOptions(notesCacheConfig.getNoteBySlug),
    );
  },
  [notesCacheConfig.getNoteBySlug.cacheKey!],
  getCacheOptions(notesCacheConfig.getNoteBySlug),
);

// Get all available subjects based on filters
export const getAvailableSubjects = cache(
  async (filters: {
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
  }) => {
    return await client.fetch(
      SUBJECTS_QUERY,
      {
        university: filters.university || null,
        degree: filters.degree || null,
        year: filters.year || null,
        semester: filters.semester || null,
      },
      {
        next: { revalidate: 1800 },
      },
    );
  },
);

// Get total count of notes matching filters
export const getNotesCount = unstable_cache(
  async (filters: {
    search?: string;
    university?: string;
    degree?: string;
    year?: string;
    semester?: string;
    subject?: string;
    premium?: string;
  }) => {
    return await client.fetch(
      NOTES_COUNT_QUERY,
      {
        search: filters.search || null,
        university: filters.university || null,
        degree: filters.degree || null,
        year: filters.year || null,
        semester: filters.semester || null,
        subject: filters.subject || null,
        premium: filters.premium || null,
      },
      getNextOptions(notesCacheConfig.getNotesCount),
    );
  },
  [notesCacheConfig.getNotesCount.cacheKey!],
  getCacheOptions(notesCacheConfig.getNotesCount),
);

export const getFilteredNotes = unstable_cache(
  async (
    filters: {
      search?: string;
      university?: string;
      degree?: string;
      year?: string;
      semester?: string;
      subject?: string;
      premium?: string;
    },
    cursor?: {
      lastTitle?: string;
      lastId?: string;
    },
  ) => {
    return await client.fetch(
      NOTES_QUERY,
      {
        search: filters.search || null,
        university: filters.university || null,
        degree: filters.degree || null,
        year: filters.year || null,
        semester: filters.semester || null,
        subject: filters.subject || null,
        premium: filters.premium || null,
        lastTitle: cursor?.lastTitle || null,
        lastId: cursor?.lastId || null,
      },
      getNextOptions(notesCacheConfig.getFilteredNotes),
    );
  },
  [notesCacheConfig.getFilteredNotes.cacheKey!],
  getCacheOptions(notesCacheConfig.getFilteredNotes),
);
