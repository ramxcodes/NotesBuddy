import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/script.js",
        destination: process.env.NEXT_PUBLIC_UMAMI_SRC || "",
      },
      {
        source: "/api/send",
        destination: process.env.NEXT_PUBLIC_UMAMI_SRC || "",
      },
    ];
  },
};

export default nextConfig;
