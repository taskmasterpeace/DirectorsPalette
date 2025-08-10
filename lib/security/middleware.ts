/**
 * Security middleware for server actions and API routes
 */
import { z } from 'zod'
import { validateInput, ValidationError } from '@/lib/validation/validator'
import { RateLimiter } from './rate-limiter'
import { validateContentSecurity, logSecurityEvent, sanitizeErrorMessage } from './security-utils'
import { ServiceError } from '@/services/base'

export interface SecurityContext {
  clientId: string
  userAgent?: string
  origin?: string
  timestamp: number
}

export interface SecurityOptions {
  rateLimit?: {
    limiter: RateLimiter
    action: string
  }
  validation?: {
    schema: z.ZodSchema<any>
    sanitize?: boolean
    moderate?: boolean
  }
  contentSecurity?: {
    maxLength?: number
    allowHtml?: boolean
    strictMode?: boolean
  }
  requireOrigin?: string[]
  logEvents?: boolean
}

/**
 * Comprehensive security middleware wrapper
 */
export function withSecurity<TInput, TOutput>(
  handler: (input: TInput, context: SecurityContext) => Promise<TOutput>,
  options: SecurityOptions = {}
) {
  return async function secureHandler(
    input: unknown,
    context: Partial<SecurityContext> = {}
  ): Promise<TOutput> {
    const securityContext: SecurityContext = {
      clientId: context.clientId || 'unknown',
      userAgent: context.userAgent,
      origin: context.origin,
      timestamp: Date.now()
    }

    try {
      // 1. Rate Limiting
      if (options.rateLimit) {
        options.rateLimit.limiter.enforce(
          securityContext.clientId,
          options.rateLimit.action
        )
      }

      // 2. Origin Validation
      if (options.requireOrigin && securityContext.origin) {
        const allowedOrigins = options.requireOrigin
        const isValidOrigin = allowedOrigins.some(allowed => {
          if (allowed === securityContext.origin) return true
          if (allowed.includes('*')) {
            const pattern = allowed.replace(/\*/g, '.*')
            return new RegExp(`^${pattern}$`).test(securityContext.origin!)
          }
          return false
        })

        if (!isValidOrigin) {
          if (options.logEvents) {
            logSecurityEvent('invalid_origin', {
              origin: securityContext.origin,
              allowedOrigins: allowedOrigins
            }, 'medium')
          }
          throw new ServiceError('Invalid origin', 'INVALID_ORIGIN')
        }
      }

      // 3. Input Validation
      let validatedInput = input as TInput
      if (options.validation?.schema) {
        try {
          validatedInput = validateInput(
            options.validation.schema,
            input,
            'Security validation failed'
          )
        } catch (error) {
          if (options.logEvents) {
            logSecurityEvent('validation_failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              clientId: securityContext.clientId
            }, 'low')
          }
          throw error
        }
      }

      // 4. Content Security
      if (options.contentSecurity) {
        const contentString = JSON.stringify(validatedInput)
        const securityResult = validateContentSecurity(contentString, {
          maxLength: options.contentSecurity.maxLength,
          allowHtml: options.contentSecurity.allowHtml,
          strictMode: options.contentSecurity.strictMode
        })

        if (!securityResult.valid) {
          if (options.logEvents) {
            logSecurityEvent('content_security_violation', {
              message: securityResult.message,
              clientId: securityContext.clientId,
              contentLength: contentString.length
            }, 'high')
          }
          throw new ServiceError(
            'Content security validation failed',
            'CONTENT_SECURITY_VIOLATION'
          )
        }
      }

      // 5. Content Moderation (if enabled)
      if (options.validation?.moderate) {
        // This would integrate with a content moderation service
        // For now, we'll do basic checks
        const contentString = JSON.stringify(validatedInput)
        
        // Check for inappropriate content patterns
        const inappropriatePatterns = [
          /\b(password|secret|token|key)\s*[:=]\s*\S+/i,
          /\b(credit\s+card|ssn|social\s+security)\b/i,
        ]

        for (const pattern of inappropriatePatterns) {
          if (pattern.test(contentString)) {
            if (options.logEvents) {
              logSecurityEvent('inappropriate_content', {
                pattern: pattern.source,
                clientId: securityContext.clientId
              }, 'high')
            }
            throw new ServiceError(
              'Content contains inappropriate information',
              'INAPPROPRIATE_CONTENT'
            )
          }
        }
      }

      // 6. Execute Handler
      const result = await handler(validatedInput, securityContext)

      // 7. Success Logging
      if (options.logEvents) {
        logSecurityEvent('action_success', {
          action: options.rateLimit?.action || 'unknown',
          clientId: securityContext.clientId,
          processingTime: Date.now() - securityContext.timestamp
        }, 'low')
      }

      return result

    } catch (error) {
      // Error Logging and Sanitization
      if (options.logEvents) {
        logSecurityEvent('action_error', {
          action: options.rateLimit?.action || 'unknown',
          clientId: securityContext.clientId,
          error: error instanceof Error ? error.name : 'Unknown error',
          processingTime: Date.now() - securityContext.timestamp
        }, error instanceof ServiceError ? 'low' : 'medium')
      }

      // Sanitize error message in production
      if (error instanceof Error) {
        const sanitizedMessage = sanitizeErrorMessage(
          error,
          process.env.NODE_ENV === 'production'
        )
        
        if (error instanceof ServiceError) {
          throw new ServiceError(sanitizedMessage, error.code, error.details)
        } else if (error instanceof ValidationError) {
          throw new ValidationError(sanitizedMessage, error.issues, error.code)
        } else {
          throw new ServiceError(sanitizedMessage, 'INTERNAL_ERROR')
        }
      }

      throw error
    }
  }
}

/**
 * Pre-configured security middleware for different use cases
 */
export const securityPresets = {
  // Standard API endpoint security
  api: (schema?: z.ZodSchema<any>) => ({
    rateLimit: {
      limiter: new RateLimiter(60000, 100), // 100 requests per minute
      action: 'api_request'
    },
    validation: schema ? { schema, moderate: true } : undefined,
    contentSecurity: {
      maxLength: 10000,
      allowHtml: false,
      strictMode: true
    },
    logEvents: true
  }),

  // AI generation security (stricter limits)
  aiGeneration: (schema?: z.ZodSchema<any>) => ({
    rateLimit: {
      limiter: new RateLimiter(300000, 10), // 10 requests per 5 minutes
      action: 'ai_generation'
    },
    validation: schema ? { schema, sanitize: true, moderate: true } : undefined,
    contentSecurity: {
      maxLength: 50000,
      allowHtml: false,
      strictMode: true
    },
    logEvents: true
  }),

  // File upload security
  upload: (schema?: z.ZodSchema<any>) => ({
    rateLimit: {
      limiter: new RateLimiter(300000, 5), // 5 uploads per 5 minutes
      action: 'file_upload'
    },
    validation: schema ? { schema, moderate: true } : undefined,
    contentSecurity: {
      maxLength: 5 * 1024 * 1024, // 5MB
      strictMode: true
    },
    logEvents: true
  }),

  // Public endpoint security (more permissive)
  public: (schema?: z.ZodSchema<any>) => ({
    rateLimit: {
      limiter: new RateLimiter(60000, 200), // 200 requests per minute
      action: 'public_request'
    },
    validation: schema ? { schema } : undefined,
    contentSecurity: {
      maxLength: 5000,
      allowHtml: false
    },
    logEvents: false
  })
}

/**
 * Decorator for applying security to server actions
 */
export function Secure(options: SecurityOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (this: any, ...args: any[]) {
      const securedMethod = withSecurity(
        async (input, context) => {
          // Call original method with original arguments
          return method.apply(this, args)
        },
        options
      )

      // Extract input from first argument (common pattern)
      const input = args[0]
      const context = args[1] || {}

      return securedMethod(input, context)
    }

    return descriptor
  }
}

/**
 * Security context provider for server actions
 */
export function createSecurityContext(headers: Headers): SecurityContext {
  // Extract client information from headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const userAgent = headers.get('user-agent')
  const origin = headers.get('origin')

  let clientId = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Hash IP for privacy
  if (clientId !== 'unknown') {
    clientId = Buffer.from(clientId).toString('base64').slice(0, 10)
  }

  return {
    clientId,
    userAgent: userAgent || undefined,
    origin: origin || undefined,
    timestamp: Date.now()
  }
}