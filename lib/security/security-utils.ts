/**
 * Security utilities and hardening functions
 */
import crypto from 'crypto'
import { ServiceError } from '@/services/base'

// ===== Input Sanitization =====

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize SQL-like input to prevent injection
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/('|(\\))|((\-\-)|(\/\*)|(;\s))/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
}

/**
 * Sanitize JavaScript to prevent code injection
 */
export function sanitizeJs(input: string): string {
  return input
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/Function\s*\(/gi, '')
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(input: string): string {
  let sanitized = input.trim()
  sanitized = sanitizeHtml(sanitized)
  sanitized = sanitizeSql(sanitized)
  sanitized = sanitizeJs(sanitized)
  return sanitized
}

// ===== Content Security =====

/**
 * Check for potentially malicious content patterns
 */
export function scanForMaliciousContent(content: string): {
  safe: boolean
  threats: string[]
  score: number // 0-100, higher is more suspicious
} {
  const threats: string[] = []
  let score = 0

  // Check for script injection attempts
  if (/<script|javascript:|vbscript:/i.test(content)) {
    threats.push('Script injection attempt')
    score += 40
  }

  // Check for SQL injection patterns
  if (/(union|select|insert|update|delete|drop|create|alter|exec|script)\s+(.*\s+)*(from|into|set|table|database)/i.test(content)) {
    threats.push('SQL injection attempt')
    score += 35
  }

  // Check for file path traversal
  if (/\.\.[\/\\]/.test(content)) {
    threats.push('Path traversal attempt')
    score += 30
  }

  // Check for suspicious protocols
  if (/(file|ftp|data):/i.test(content)) {
    threats.push('Suspicious protocol usage')
    score += 20
  }

  // Check for excessive special characters (potential obfuscation)
  const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length
  if (specialCharRatio > 0.3) {
    threats.push('High special character ratio')
    score += 15
  }

  // Check for very long inputs (potential DOS)
  if (content.length > 100000) {
    threats.push('Excessive input length')
    score += 25
  }

  // Check for base64 encoded content (potential payload)
  if (/[A-Za-z0-9+\/]{100,}={0,2}/.test(content)) {
    threats.push('Potential base64 encoded payload')
    score += 20
  }

  return {
    safe: score < 30,
    threats,
    score: Math.min(score, 100)
  }
}

/**
 * Validate content against security policies
 */
export function validateContentSecurity(
  content: string,
  options: {
    maxLength?: number
    allowHtml?: boolean
    allowSpecialChars?: boolean
    strictMode?: boolean
  } = {}
): { valid: boolean; message?: string } {
  const {
    maxLength = 50000,
    allowHtml = false,
    allowSpecialChars = true,
    strictMode = false
  } = options

  // Length check
  if (content.length > maxLength) {
    return { valid: false, message: `Content exceeds maximum length of ${maxLength}` }
  }

  // HTML check
  if (!allowHtml && /<[^>]*>/g.test(content)) {
    return { valid: false, message: 'HTML content not allowed' }
  }

  // Special characters check
  if (!allowSpecialChars && /[<>&"'\/\\]/.test(content)) {
    return { valid: false, message: 'Special characters not allowed' }
  }

  // Malicious content scan
  const scanResult = scanForMaliciousContent(content)
  if (!scanResult.safe) {
    return {
      valid: false,
      message: `Content failed security scan: ${scanResult.threats.join(', ')}`
    }
  }

  // Strict mode additional checks
  if (strictMode) {
    if (content.includes('\0')) {
      return { valid: false, message: 'Null bytes not allowed' }
    }
    
    // Check for control characters
    if (/[\x00-\x1F\x7F]/.test(content)) {
      return { valid: false, message: 'Control characters not allowed' }
    }
  }

  return { valid: true }
}

// ===== Encryption and Hashing =====

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data using SHA-256
 */
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.createHash('sha256')
  hash.update(data + actualSalt)
  return hash.digest('hex')
}

/**
 * Generate content hash for integrity checking
 */
export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

// ===== Request Security =====

/**
 * Validate request origin and referrer
 */
export function validateOrigin(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true
  
  // Check wildcard matches
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(`^${pattern}$`).test(origin)
    }
    return false
  })
}

/**
 * Check for suspicious user agent patterns
 */
export function validateUserAgent(userAgent: string | null): {
  suspicious: boolean
  reason?: string
} {
  if (!userAgent) {
    return { suspicious: true, reason: 'Missing user agent' }
  }

  // Check for common bot/scraper patterns
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|php/i,
    /postman|insomnia/i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, reason: 'Suspicious user agent pattern' }
    }
  }

  // Check for very short or very long user agents
  if (userAgent.length < 10 || userAgent.length > 500) {
    return { suspicious: true, reason: 'Unusual user agent length' }
  }

  return { suspicious: false }
}

// ===== Error Handling Security =====

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: Error, isProduction: boolean = true): string {
  if (!isProduction) {
    return error.message
  }

  // In production, return generic messages for security
  if (error.name === 'ValidationError') {
    return 'Invalid input provided'
  }

  if (error.name === 'ServiceError') {
    // Allow service errors through as they're designed to be user-facing
    return error.message
  }

  // Generic message for all other errors
  return 'An error occurred while processing your request'
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details: {
      ...details,
      // Remove sensitive data
      userAgent: details.userAgent?.substring(0, 100),
      ip: details.ip ? hashData(details.ip) : undefined
    }
  }

  // In a real application, this would go to a proper logging service
  console.warn('[SECURITY]', JSON.stringify(logEntry))
}

// ===== Configuration Security =====

/**
 * Validate environment variables for security
 */
export function validateEnvironmentSecurity(): {
  secure: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is not set')
  }

  // Check for insecure configurations
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DEBUG === 'true') {
      warnings.push('Debug mode enabled in production')
    }
    
    if (!process.env.NODE_ENV) {
      warnings.push('NODE_ENV not explicitly set')
    }
  }

  // Check for sensitive data in environment
  Object.keys(process.env).forEach(key => {
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
      if (process.env[key]?.length && process.env[key]!.length < 16) {
        warnings.push(`${key} appears to be too short for secure use`)
      }
    }
  })

  return {
    secure: errors.length === 0,
    warnings,
    errors
  }
}