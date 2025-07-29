import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return [
      {
        source: "/script.js",
        destination: process.env.NEXT_PUBLIC_UMAMI_SRC || "",
      },
      {
        source: "/api/send",
        destination: "https://analytics.notesbuddy.in/api/send",
      },
    ];
  },
};

export default nextConfig;
