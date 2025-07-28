import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

const ALL_NOTES_SITEMAP_QUERY = defineQuery(`
  *[_type == "note" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`);

async function getAllNotesForSitemap() {
  try {
    const notes = await client.fetch(
      ALL_NOTES_SITEMAP_QUERY,
      {},
      {
        next: { revalidate: 18000 },
      },
    );
    return notes;
  } catch (error) {
    console.error("Error fetching notes for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://notesbuddy.in";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/flashcards`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // Get all notes for dynamic routes
    const notes = await getAllNotesForSitemap();
    const noteRoutes: MetadataRoute.Sitemap = notes
      .filter((note: { slug: string | null; _updatedAt: string }) => note.slug !== null)
      .map(
        (note: { slug: string | null; _updatedAt: string }) => ({
          url: `${baseUrl}/notes/${note.slug!}`,
          lastModified: note._updatedAt ? new Date(note._updatedAt) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }),
      );

    return [...staticRoutes, ...noteRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return only static routes if there's an error fetching notes
    return staticRoutes;
  }
}
