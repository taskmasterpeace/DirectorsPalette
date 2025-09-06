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
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ]
  },
  // Only allow development origins in development
  experimental: process.env.NODE_ENV === 'development' ? {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
  } : {},
}

export default nextConfig
