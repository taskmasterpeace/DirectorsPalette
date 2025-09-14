/**
 * Next.js Middleware for Global Security
 * Runs on all requests to enforce security policies
 */

import { NextRequest, NextResponse } from 'next/server'
import { SECURITY_HEADERS, isAllowedIP } from '@/lib/security/security-config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

  // Check IP whitelist
  if (!isAllowedIP(ip)) {
    console.warn(`🚨 Blocked request from unauthorized IP: ${ip}`)
    return new NextResponse('Access denied', { status: 403 })
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
    response.headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  // Continue with the request
  const response = NextResponse.next()

  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  }

  // Log API requests for monitoring
  if (pathname.startsWith('/api/') && process.env.LOG_API_REQUESTS === 'true') {
    console.log(`📊 API Request: ${request.method} ${pathname} from ${ip}`)
  }

  return response
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}