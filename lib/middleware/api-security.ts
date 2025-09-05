import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase'
import { headers } from 'next/headers'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Get client identifier for rate limiting
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || real || 'unknown'
  
  // For authenticated users, use user ID + IP
  // For anonymous, use IP only
  return ip
}

// Rate limiting middleware
export function checkRateLimit(
  clientId: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const record = rateLimitStore.get(clientId)
  
  if (!record || record.resetTime < now) {
    // New window
    const resetTime = now + windowMs
    rateLimitStore.set(clientId, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

// Authentication middleware
export async function requireAuth(request: NextRequest): Promise<{ authenticated: boolean; user?: any; error?: string }> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { authenticated: false, error: 'Authentication required' }
    }
    
    return { authenticated: true, user }
    
  } catch (error) {
    console.error('❌ Authentication check failed:', error)
    return { authenticated: false, error: 'Authentication verification failed' }
  }
}

// Input validation middleware
export function validateInput(input: any, schema: any): { valid: boolean; sanitized?: any; errors?: string[] } {
  const errors: string[] = []
  
  try {
    // Basic sanitization
    if (typeof input === 'string') {
      // Remove potential script injections
      const sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
      
      // Length validation
      if (sanitized.length > 10000) {
        errors.push('Input too long (max 10,000 characters)')
      }
      
      return { valid: errors.length === 0, sanitized, errors }
    }
    
    return { valid: true, sanitized: input }
    
  } catch (error) {
    return { valid: false, errors: ['Input validation failed'] }
  }
}

// File upload security
export function validateFileUpload(file: File): { valid: boolean; errors?: string[] } {
  const errors: string[] = []
  
  // File type validation
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`)
  }
  
  // File size validation (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 10MB limit`)
  }
  
  // File name validation
  const filename = file.name
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    errors.push('Invalid filename. Only alphanumeric, dots, hyphens, and underscores allowed')
  }
  
  return { valid: errors.length === 0, errors }
}

// Secure API route wrapper
export function withSecurity(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    validateInput?: boolean
  } = {}
) {
  return async (request: NextRequest, context: any) => {
    try {
      const clientId = getClientId(request)
      
      // Rate limiting
      if (options.rateLimit) {
        const rateCheck = checkRateLimit(
          clientId, 
          options.rateLimit.maxRequests, 
          options.rateLimit.windowMs
        )
        
        if (!rateCheck.allowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateCheck.resetTime).toISOString()
              }
            }
          )
        }
        
        // Add rate limit headers
        const response = await handler(request, context)
        response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(rateCheck.resetTime).toISOString())
      }
      
      // Authentication check
      if (options.requireAuth || options.requireAdmin) {
        const authCheck = await requireAuth(request)
        
        if (!authCheck.authenticated) {
          return NextResponse.json(
            { error: authCheck.error || 'Authentication required' },
            { status: 401 }
          )
        }
        
        // Admin check
        if (options.requireAdmin) {
          const isAdmin = authCheck.user?.email === process.env.ADMIN_EMAIL ||
                         authCheck.user?.app_metadata?.role === 'admin'
          
          if (!isAdmin) {
            // Log unauthorized admin attempt
            console.warn(`🚨 Unauthorized admin API access by ${authCheck.user?.email} from ${clientId}`)
            return NextResponse.json(
              { error: 'Admin access required' },
              { status: 403 }
            )
          }
        }
        
        // Add user context
        context.user = authCheck.user
      }
      
      return await handler(request, context)
      
    } catch (error) {
      console.error('❌ API security middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openrouter.ai https://api.replicate.com https://*.supabase.co;"
  )
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}