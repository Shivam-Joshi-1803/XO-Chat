import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy all /api/* requests to the backend server.
    // This makes session cookies first-party (same domain as the frontend),
    // which is required for mobile browsers that block third-party cookies.
    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
