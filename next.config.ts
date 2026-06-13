import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.imgbox.com" },
      { protocol: "https", hostname: "**.staticflickr.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      {
        protocol: "https",
        hostname: "thespacedevs-prod.nyc3.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
