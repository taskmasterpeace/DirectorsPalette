/**
 * Security utilities exports
 */

// Rate limiting
export {
  RateLimiter,
  generalRateLimiter,
  aiRateLimiter,
  storyRateLimiter,
  musicVideoRateLimiter,
  directorRateLimiter,
  artistRateLimiter,
  uploadRateLimiter,
  getClientId,
  withRateLimit,
  createRateLimiter
} from './rate-limiter'

// Security utils
export {
  sanitizeHtml,
  sanitizeSql,
  sanitizeJs,
  sanitizeInput,
  scanForMaliciousContent,
  validateContentSecurity,
  generateSecureToken,
  hashData,
  generateContentHash,
  validateOrigin,
  validateUserAgent,
  sanitizeErrorMessage,
  logSecurityEvent,
  validateEnvironmentSecurity
} from './security-utils'

// Security middleware
export {
  withSecurity,
  securityPresets,
  Secure,
  createSecurityContext,
  type SecurityContext,
  type SecurityOptions
} from './middleware'