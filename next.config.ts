import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/me',
  assetPrefix: '/me',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["id.floofbite.com"]
    }
  },
  // This helps Next.js understand it's behind a proxy
  trustHost: true,
};

export default nextConfig;
