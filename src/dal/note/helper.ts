import { client } from "@/sanity/lib/client";
import { NOTE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { cache } from "react";

export const getNoteBySlug = cache(async (slug: string) => {
  return await client.fetch(
    NOTE_BY_SLUG_QUERY,
    { slug },
    {
      next: { revalidate: 3600 },
    }
  );
});
