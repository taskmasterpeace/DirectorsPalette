/**
 * Rate limiting implementation for API endpoints
 */
import { ServiceError } from '@/services/base'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

export class RateLimiter {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout

  constructor(
    private windowMs: number = 60000, // 1 minute default
    private maxRequests: number = 100, // 100 requests per minute default
    private cleanupIntervalMs: number = 300000 // 5 minutes cleanup interval
  ) {
    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  /**
   * Check if request is within rate limit
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = this.getKey(identifier)
    
    // Get or create entry
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs
      }
    }

    const entry = this.store[key]
    const allowed = entry.count < this.maxRequests

    if (allowed) {
      entry.count++
    }

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }

  /**
   * Enforce rate limit and throw error if exceeded
   */
  enforce(identifier: string, action: string = 'API request'): void {
    const result = this.check(identifier)
    
    if (!result.allowed) {
      const resetInMs = result.resetTime - Date.now()
      const resetInSeconds = Math.ceil(resetInMs / 1000)
      
      throw new ServiceError(
        `Rate limit exceeded for ${action}. Try again in ${resetInSeconds} seconds`,
        'RATE_LIMIT_EXCEEDED',
        {
          resetTime: result.resetTime,
          resetInSeconds,
          maxRequests: this.maxRequests,
          windowMs: this.windowMs
        }
      )
    }
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const result = this.check(identifier)
    return result.remaining
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.getKey(identifier)
    delete this.store[key]
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key]
      }
    })
  }

  /**
   * Generate storage key for identifier
   */
  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`
  }

  /**
   * Destroy rate limiter and clean up
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store = {}
  }
}

// ===== Predefined Rate Limiters =====

// General API rate limiter (100 requests per minute)
export const generalRateLimiter = new RateLimiter(60000, 100)

// AI generation rate limiter (20 requests per minute)
export const aiRateLimiter = new RateLimiter(60000, 20)

// Story generation rate limiter (10 requests per 5 minutes)
export const storyRateLimiter = new RateLimiter(300000, 10)

// Music video generation rate limiter (10 requests per 5 minutes)
export const musicVideoRateLimiter = new RateLimiter(300000, 10)

// Director creation rate limiter (5 requests per 10 minutes)
export const directorRateLimiter = new RateLimiter(600000, 5)

// Artist profile rate limiter (20 requests per 5 minutes)
export const artistRateLimiter = new RateLimiter(300000, 20)

// File upload rate limiter (10 uploads per 5 minutes)
export const uploadRateLimiter = new RateLimiter(300000, 10)

/**
 * Get client identifier for rate limiting
 */
export function getClientId(headers: Headers): string {
  // Try to get real IP from common headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const userAgent = headers.get('user-agent') || 'unknown'
  
  let ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Fallback to a hash of user agent if no IP
  if (ip === 'unknown') {
    ip = `ua_${Buffer.from(userAgent).toString('base64').slice(0, 10)}`
  }
  
  return ip
}

/**
 * Rate limiting middleware for server actions
 */
export function withRateLimit<T extends any[], R>(
  rateLimiter: RateLimiter,
  action: string = 'action'
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function(this: any, ...args: T): Promise<R> {
      // Get client identifier (this would need to be passed from the client)
      const clientId = 'default' // In a real app, this would come from request context
      
      // Enforce rate limit
      rateLimiter.enforce(clientId, action)
      
      // Execute original method
      return method.apply(this, args)
    }
    
    return descriptor
  }
}

/**
 * Create a rate limiter with custom settings
 */
export function createRateLimiter(
  windowMs: number,
  maxRequests: number,
  cleanupIntervalMs: number = 300000
): RateLimiter {
  return new RateLimiter(windowMs, maxRequests, cleanupIntervalMs)
}