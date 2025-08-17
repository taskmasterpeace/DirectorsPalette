/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow development from other devices on local network
  experimental: {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://192.168.1.230:3000',
      'http://192.168.1.*:3000',
      'http://192.168.0.*:3000',
      'http://10.0.0.*:3000',
    ],
  },
}

export default nextConfig
