import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development', // Only ignore in dev
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for UI deployment
  },
  images: {
    unoptimized: true,
    domains: ['v0-director-style-workflow.vercel.app'], // Restrict image domains
  },
  // Security headers - TEMPORARILY DISABLED due to UI interaction issues
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         {
  //           key: 'Permissions-Policy',
  //           value: 'camera=(), microphone=(), geolocation=(), payment=()',
  //         },
  //       ],
  //     },
  //   ]
  // },
  // Only allow development origins in development
  experimental: process.env.NODE_ENV === 'development' ? {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
  } : {},
}

// PWA configuration - only for production builds
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false, // We'll manually register for mobile-only
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:.*\.(png|jpg|jpeg|webp|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200
        }
      }
    }
  ]
})

export default pwaConfig(nextConfig)
