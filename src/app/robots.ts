import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/notes",
          "/ai",
          "/quiz",
          "/flashcards",
          "/premium",
          "/privacy",
          "/terms",
          "/refund",
          "/shipping",
        ],
        disallow: [
          "/admin/*",
          "/api/*",
          "/studio/*",
          "/blocked",
          "/sign-in",
          "/sign-up",
          "/profile/*",
          "/*?*",
        ],
      },
      // Specific rules for search engine bots
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/*",
          "/api/*",
          "/studio/*",
          "/blocked",
          "/sign-in",
          "/sign-up",
          "/profile/*",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/admin/*",
          "/api/*",
          "/studio/*",
          "/blocked",
          "/sign-in",
          "/sign-up",
          "/profile/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
