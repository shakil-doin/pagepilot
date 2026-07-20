import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  // Prisma engines must stay external to the server bundle
  serverExternalPackages: ["@prisma/client", "sharp", "bcryptjs"],
};

export default nextConfig;
