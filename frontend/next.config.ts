import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable optimizations for real-time dashboard
  poweredByHeader: false,
  // Configure for trading dashboard
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
