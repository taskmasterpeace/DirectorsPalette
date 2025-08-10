/**
 * Validation utilities and middleware
 */
import { z } from 'zod'
import { ServiceError } from '@/services/base'

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[],
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorPrefix: string = 'Validation failed'
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ')
      
      throw new ValidationError(
        `${errorPrefix}: ${formattedErrors}`,
        error.issues,
        'VALIDATION_ERROR'
      )
    }
    throw error
  }
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    const validData = validateInput(schema, data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error }
    }
    return {
      success: false,
      error: new ValidationError(
        'Validation failed with unknown error',
        [],
        'UNKNOWN_VALIDATION_ERROR'
      )
    }
  }
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs for safety
    .slice(0, 50000) // Enforce max length
}

/**
 * Validate and sanitize text input
 */
export function validateText(
  input: string,
  minLength: number = 1,
  maxLength: number = 50000,
  fieldName: string = 'text'
): string {
  if (typeof input !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      [],
      'INVALID_TYPE'
    )
  }

  const sanitized = sanitizeString(input)
  
  if (sanitized.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      [],
      'TOO_SHORT'
    )
  }
  
  if (sanitized.length > maxLength) {
    throw new ValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      [],
      'TOO_LONG'
    )
  }
  
  return sanitized
}

/**
 * Validate array input with length limits
 */
export function validateArray<T>(
  input: T[],
  maxLength: number = 100,
  fieldName: string = 'array'
): T[] {
  if (!Array.isArray(input)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      [],
      'INVALID_TYPE'
    )
  }
  
  if (input.length > maxLength) {
    throw new ValidationError(
      `${fieldName} cannot have more than ${maxLength} items`,
      [],
      'ARRAY_TOO_LONG'
    )
  }
  
  return input
}

/**
 * Validate ID format (alphanumeric, hyphens, underscores only)
 */
export function validateId(input: string, fieldName: string = 'id'): string {
  const sanitized = input.trim()
  
  if (!/^[a-zA-Z0-9\-_]+$/.test(sanitized)) {
    throw new ValidationError(
      `${fieldName} can only contain letters, numbers, hyphens, and underscores`,
      [],
      'INVALID_ID_FORMAT'
    )
  }
  
  if (sanitized.length < 1 || sanitized.length > 50) {
    throw new ValidationError(
      `${fieldName} must be between 1 and 50 characters`,
      [],
      'INVALID_ID_LENGTH'
    )
  }
  
  return sanitized
}

/**
 * Validate file size for uploads
 */
export function validateFileSize(
  size: number,
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): void {
  if (size > maxSize) {
    throw new ValidationError(
      `File size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB`,
      [],
      'FILE_TOO_LARGE'
    )
  }
}

/**
 * Validate MIME type for file uploads
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): void {
  if (!allowedTypes.includes(mimeType)) {
    throw new ValidationError(
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      [],
      'INVALID_MIME_TYPE'
    )
  }
}

/**
 * Rate limiting validation
 */
export interface RateLimitCheck {
  key: string
  limit: number
  windowMs: number
  current?: number
}

export function validateRateLimit(check: RateLimitCheck): void {
  if (check.current && check.current >= check.limit) {
    throw new ServiceError(
      `Rate limit exceeded. Try again in ${Math.round(check.windowMs / 1000)} seconds`,
      'RATE_LIMIT_EXCEEDED',
      { limit: check.limit, windowMs: check.windowMs }
    )
  }
}

/**
 * Content moderation helpers
 */
const FORBIDDEN_PATTERNS = [
  /\b(hack|exploit|inject|payload)\b/i,
  /\b(admin|root|sudo)\s+(password|pass|pwd)/i,
  /\b(credit\s+card|ssn|social\s+security)\b/i,
  /<iframe|<embed|<object/i,
]

export function moderateContent(content: string): { safe: boolean; reason?: string } {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      return {
        safe: false,
        reason: 'Content contains potentially harmful or sensitive information'
      }
    }
  }
  
  return { safe: true }
}

/**
 * Comprehensive input validation for server actions
 */
export function validateServerInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options: {
    sanitize?: boolean
    moderate?: boolean
    rateLimit?: RateLimitCheck
  } = {}
): T {
  // Rate limiting check
  if (options.rateLimit) {
    validateRateLimit(options.rateLimit)
  }
  
  // Basic validation
  const validatedData = validateInput(schema, data, 'Server input validation failed')
  
  // Content moderation
  if (options.moderate) {
    const dataStr = JSON.stringify(validatedData)
    const moderation = moderateContent(dataStr)
    if (!moderation.safe) {
      throw new ValidationError(
        moderation.reason || 'Content failed moderation',
        [],
        'CONTENT_MODERATED'
      )
    }
  }
  
  return validatedData
}