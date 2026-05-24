import type { NextConfig } from "next";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? 'business-template'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'x-app-id', value: APP_ID }],
      },
    ]
  },
};

export default nextConfig;
