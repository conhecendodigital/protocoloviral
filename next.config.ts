import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true, // Gzip/Brotli compression
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats — menor tamanho
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vskmryemztaalmrftlpo.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 86400, // Cache imagens por 24h
  },
  async redirects() {
    return [
      {
        source: '/prompts',
        destination: '/roteirista',
        permanent: true,
      },
      {
        source: '/prompts/:path*',
        destination: '/roteirista',
        permanent: true,
      },
    ]
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
              "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com https://*.mlstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.mlstatic.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data: https://*.mlstatic.com",
              "img-src 'self' data: blob: https://vskmryemztaalmrftlpo.supabase.co https://*.googleusercontent.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com",
              "connect-src 'self' https://vskmryemztaalmrftlpo.supabase.co https://generativelanguage.googleapis.com https://*.googleapis.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com https://*.mlstatic.com",
              "frame-src 'self' https://drive.google.com https://www.youtube.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com",
              "media-src 'self' https://vskmryemztaalmrftlpo.supabase.co https://drive.google.com",
            ].join('; '),
          },
        ],
      },
      // Cache agressivo para assets estáticos (JS/CSS imutáveis gerados pelo Next.js)
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

};

export default nextConfig;
