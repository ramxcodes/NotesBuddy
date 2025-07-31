"use server";
import { revalidateTag } from "next/cache";
import { notesCacheConfig } from "./notes";

export async function revalidateAllNotesCaching() {
  "use server";
  const allTags = [
    notesCacheConfig.getFilteredNotes.tags,
    notesCacheConfig.getNotesCount.tags,
    notesCacheConfig.getSubjects.tags,
    notesCacheConfig.getPopularSearches.tags,
    notesCacheConfig.getNoteBySlug.tags,
  ]
    .filter(Boolean)
    .flat();
  const uniqueTags = Array.from(new Set(allTags));
  await Promise.all(
    uniqueTags
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => revalidateTag(tag)),
  );
}
