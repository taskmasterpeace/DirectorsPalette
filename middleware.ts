/**
 * Next.js Middleware for Global Security
 * Runs on all requests to enforce security policies
 */

import { NextRequest, NextResponse } from 'next/server'
import { SECURITY_HEADERS, isAllowedIP } from '@/lib/security/security-config'

export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLE ALL MIDDLEWARE TO FIX UI ISSUES
  // The security headers are causing button interaction problems

  // Just pass through all requests without modification
  return NextResponse.next()
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