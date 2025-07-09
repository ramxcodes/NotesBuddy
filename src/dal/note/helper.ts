import { client } from "@/sanity/lib/client";
import {
  NOTE_BY_SLUG_QUERY,
  NOTES_QUERY,
  NOTES_COUNT_QUERY,
  SUBJECTS_QUERY,
} from "@/sanity/lib/queries";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const getNoteBySlug = cache(async (slug: string) => {
  return await client.fetch(
    NOTE_BY_SLUG_QUERY,
    { slug },
    {
      next: { revalidate: 3600 },
    },
  );
});

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
      },
      {
        next: { revalidate: 3600 },
      },
    );
  },
  ["notes-count"],
  {
    revalidate: 3600,
    tags: ["notes"],
  },
);

// Get filtered notes with pagination
export const getFilteredNotes = unstable_cache(
  async (
    filters: {
      search?: string;
      university?: string;
      degree?: string;
      year?: string;
      semester?: string;
      subject?: string;
    },
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 6 },
  ) => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit - 1;

    return await client.fetch(
      NOTES_QUERY,
      {
        search: filters.search || null,
        university: filters.university || null,
        degree: filters.degree || null,
        year: filters.year || null,
        semester: filters.semester || null,
        subject: filters.subject || null,
        start,
        end,
      },
      {
        next: { revalidate: 3600 },
      },
    );
  },
  ["filtered-notes"],
  {
    revalidate: 3600,
    tags: ["notes"],
  },
);
