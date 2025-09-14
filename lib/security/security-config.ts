/**
 * Security Configuration and Initialization
 * Central security settings for Directors Palette
 */

import { logSecurityStatus, checkEnvironmentSecurity } from './env-check'

/**
 * Security configuration based on environment
 */
export const SECURITY_CONFIG = {
  // API Security
  apiRateLimitEnabled: process.env.API_RATE_LIMIT_ENABLED === 'true',
  apiAuthRequired: process.env.API_AUTH_REQUIRED !== 'false', // Default true

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || (
    process.env.NODE_ENV === 'production'
      ? 'https://directorspal.com'
      : '*'
  ),

  // Rate Limiting
  defaultRateLimit: parseInt(process.env.DEFAULT_RATE_LIMIT || '60'),

  // File Upload Security
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'), // 10MB
  scanUploads: process.env.SCAN_UPLOADS === 'true',

  // API Key Security
  apiKeyPrefix: 'dp_',
  apiKeyLength: 64,

  // Error Reporting
  exposeErrorDetails: process.env.NODE_ENV === 'development',

  // Session Security
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400'), // 24 hours

  // Logging
  logApiUsage: process.env.LOG_API_USAGE !== 'false', // Default true
  logFailedAuth: process.env.LOG_FAILED_AUTH !== 'false' // Default true
} as const

/**
 * Initialize security system
 */
export function initializeSecurity() {
  console.log('🔐 Initializing Directors Palette Security System...')

  // Check environment security
  logSecurityStatus()

  const envCheck = checkEnvironmentSecurity()
  if (!envCheck.isSecure) {
    console.error('🚨 CRITICAL: Environment security check failed!')
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production deployment blocked due to security issues')
    }
  }

  // Log security configuration
  console.log('🔐 Security Configuration:')
  console.log(`  • API Auth Required: ${SECURITY_CONFIG.apiAuthRequired}`)
  console.log(`  • Rate Limiting: ${SECURITY_CONFIG.apiRateLimitEnabled}`)
  console.log(`  • CORS Origin: ${SECURITY_CONFIG.corsOrigin}`)
  console.log(`  • Max Upload Size: ${Math.round(SECURITY_CONFIG.maxUploadSize / (1024 * 1024))}MB`)
  console.log(`  • Upload Scanning: ${SECURITY_CONFIG.scanUploads}`)

  console.log('✅ Security system initialized')
}

/**
 * Security headers for all API responses
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent embedding in frames
  'X-Frame-Options': 'DENY',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // NextJS requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://api.replicate.com https://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'fullscreen=(self)'
  ].join(', ')
} as const

/**
 * API Error responses (no sensitive info exposed)
 */
export const SECURITY_ERRORS = {
  MISSING_API_KEY: {
    error: 'Authentication required',
    message: 'API key must be provided in Authorization header or X-API-Key header',
    code: 'AUTH_001'
  },
  INVALID_API_KEY: {
    error: 'Invalid API key',
    message: 'The provided API key is invalid or has been revoked',
    code: 'AUTH_002'
  },
  RATE_LIMIT_EXCEEDED: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please try again later.',
    code: 'RATE_001'
  },
  PERMISSION_DENIED: {
    error: 'Permission denied',
    message: 'Your API key does not have permission for this operation',
    code: 'AUTH_003'
  },
  INVALID_INPUT: {
    error: 'Invalid input',
    message: 'The request contains invalid or malicious content',
    code: 'INPUT_001'
  },
  FILE_TOO_LARGE: {
    error: 'File too large',
    message: 'Uploaded file exceeds maximum size limit',
    code: 'FILE_001'
  },
  UNSUPPORTED_FILE_TYPE: {
    error: 'Unsupported file type',
    message: 'The uploaded file type is not supported',
    code: 'FILE_002'
  }
} as const

/**
 * IP whitelist for additional security (optional)
 */
export function isAllowedIP(ip: string): boolean {
  // In development, allow all IPs
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // In production, check whitelist if configured
  const whitelist = process.env.IP_WHITELIST?.split(',').map(ip => ip.trim())
  if (whitelist && whitelist.length > 0) {
    return whitelist.includes(ip)
  }

  // If no whitelist configured, allow all (but log for monitoring)
  return true
}