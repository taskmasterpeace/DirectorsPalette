/**
 * React-Friendly Content Security Policy
 * Balances security with Next.js/React functionality
 */

/**
 * Development CSP - More permissive for hot reloading and debugging
 */
export const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:* *.vercel.app", // Allow dev tools
  "style-src 'self' 'unsafe-inline' *.googleapis.com", // Allow Tailwind and Google Fonts
  "img-src 'self' data: https: blob: *.replicate.com *.supabase.co", // Allow generated images
  "font-src 'self' *.googleapis.com *.gstatic.com",
  "connect-src 'self' localhost:* 127.0.0.1:* *.supabase.co *.replicate.com *.openai.com ws: wss:", // Allow API calls and dev websockets
  "media-src 'self' blob: *.replicate.com *.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.google.com accounts.google.com", // Allow OAuth
  "frame-src 'self' *.google.com accounts.google.com", // Allow OAuth frames
  "worker-src 'self' blob:", // Allow service workers
  "manifest-src 'self'"
].join('; ')

/**
 * Production CSP - More restrictive but still functional
 */
export const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' *.vercel.app", // No unsafe-eval in production
  "style-src 'self' 'unsafe-inline' *.googleapis.com", // Tailwind needs unsafe-inline
  "img-src 'self' data: https: blob: *.replicate.com *.supabase.co",
  "font-src 'self' *.googleapis.com *.gstatic.com",
  "connect-src 'self' *.supabase.co *.replicate.com *.openai.com",
  "media-src 'self' blob: *.replicate.com *.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.google.com accounts.google.com",
  "frame-src 'self' *.google.com accounts.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'"
].join('; ')

/**
 * Minimal CSP for testing authentication issues
 */
export const MINIMAL_CSP = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' *", // Very permissive for testing
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
  "style-src 'self' 'unsafe-inline' *",
  "img-src 'self' data: https: blob: *",
  "connect-src 'self' *",
  "frame-src 'self' *",
  "form-action 'self' *"
].join('; ')

/**
 * Security headers that DON'T interfere with React
 */
export const REACT_SAFE_HEADERS = {
  // Safe headers that don't break React functionality
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN', // Changed from DENY to allow iframe embeds if needed
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Use appropriate CSP based on environment
  'Content-Security-Policy': process.env.NODE_ENV === 'development'
    ? DEV_CSP
    : PROD_CSP,

  // Permissions policy without blocking essential features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
    // Removed usb=() and fullscreen restrictions that might interfere
  ].join(', ')
} as const

/**
 * Ultra-minimal headers for auth debugging
 */
export const DEBUG_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  // Only the most essential security header
} as const