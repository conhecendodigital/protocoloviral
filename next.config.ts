import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vskmryemztaalmrftlpo.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
              "img-src 'self' data: blob: https://vskmryemztaalmrftlpo.supabase.co https://*.googleusercontent.com",
              "connect-src 'self' https://vskmryemztaalmrftlpo.supabase.co https://generativelanguage.googleapis.com https://*.googleapis.com",
              "frame-src 'self' https://drive.google.com https://www.youtube.com",
              "media-src 'self' https://vskmryemztaalmrftlpo.supabase.co https://drive.google.com",
            ].join('; '),
          },
        ],
      },
    ]
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
