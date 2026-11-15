import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client"],
  images: {
    localPatterns: [
      {
        pathname: "/catalog/**",
        search: "",
      },
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
