/**
 * API Middleware for Authentication, Rate Limiting, and Security
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractApiKey, hashApiKey, isValidApiKeyFormat, type ApiKey, type AuthResult, type RateLimitResult } from '@/lib/auth/api-auth'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Authenticate API request and get user info
 */
export async function authenticateApiRequest(request: NextRequest): Promise<AuthResult> {
  const apiKey = extractApiKey(request)

  if (!apiKey) {
    return {
      success: false,
      error: 'Missing API key. Include in Authorization header: Bearer dp_xxxxx or X-API-Key header'
    }
  }

  if (!isValidApiKeyFormat(apiKey)) {
    return {
      success: false,
      error: 'Invalid API key format. Must be: dp_[64-character-hex]'
    }
  }

  try {
    // In development, allow a test key
    if (process.env.NODE_ENV === 'development' && apiKey === 'dp_test_key') {
      return {
        success: true,
        apiKey: {
          id: 'test',
          key: apiKey,
          name: 'Development Test Key',
          userId: 'test-user',
          permissions: ['*'],
          rateLimit: 1000,
          isActive: true,
          createdAt: new Date()
        }
      }
    }

    // Check API key in database (Supabase)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const hashedKey = hashApiKey(apiKey)
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', hashedKey)
      .eq('is_active', true)
      .single()

    if (error || !apiKeyData) {
      return {
        success: false,
        error: 'Invalid or expired API key'
      }
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKeyData.id)

    return {
      success: true,
      apiKey: {
        id: apiKeyData.id,
        key: apiKey,
        name: apiKeyData.name,
        userId: apiKeyData.user_id,
        permissions: apiKeyData.permissions || [],
        rateLimit: apiKeyData.rate_limit || 60,
        isActive: apiKeyData.is_active,
        createdAt: new Date(apiKeyData.created_at),
        lastUsed: apiKeyData.last_used ? new Date(apiKeyData.last_used) : undefined,
        expiresAt: apiKeyData.expires_at ? new Date(apiKeyData.expires_at) : undefined
      }
    }

  } catch (error) {
    console.error('API authentication error:', error)
    return {
      success: false,
      error: 'Authentication service unavailable'
    }
  }
}

/**
 * Check rate limits for API key
 */
export function checkRateLimit(apiKey: ApiKey, identifier: string = apiKey.id): RateLimitResult {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const limit = apiKey.rateLimit

  const current = rateLimitStore.get(identifier)

  if (!current || now > current.resetTime) {
    // Reset window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })

    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: new Date(now + windowMs)
    }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(current.resetTime),
      error: `Rate limit exceeded. ${limit} requests per minute allowed.`
    }
  }

  // Increment counter
  current.count++
  rateLimitStore.set(identifier, current)

  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: new Date(current.resetTime)
  }
}

/**
 * Check if API key has permission for specific action
 */
export function hasPermission(apiKey: ApiKey, permission: string): boolean {
  // Admin/enterprise keys have all permissions
  if (apiKey.permissions.includes('*')) {
    return true
  }

  // Check specific permission
  return apiKey.permissions.includes(permission)
}

/**
 * Middleware wrapper for API routes
 */
export function withApiAuth(
  handler: (request: NextRequest, context: { apiKey: ApiKey }) => Promise<NextResponse>,
  requiredPermission?: string
) {
  return async (request: NextRequest) => {
    try {
      // Authenticate request
      const authResult = await authenticateApiRequest(request)
      if (!authResult.success || !authResult.apiKey) {
        return NextResponse.json(
          { error: authResult.error || 'Authentication failed' },
          { status: 401 }
        )
      }

      // Check permissions
      if (requiredPermission && !hasPermission(authResult.apiKey, requiredPermission)) {
        return NextResponse.json(
          { error: `Permission denied. Required: ${requiredPermission}` },
          { status: 403 }
        )
      }

      // Check rate limits
      const rateLimitResult = checkRateLimit(authResult.apiKey)
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': authResult.apiKey.rateLimit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString()
            }
          }
        )
      }

      // Add rate limit headers
      const response = await handler(request, { apiKey: authResult.apiKey })
      response.headers.set('X-RateLimit-Limit', authResult.apiKey.rateLimit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toISOString())

      return response

    } catch (error) {
      console.error('API middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * CORS headers for API responses
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', "default-src 'self'")
  return response
}