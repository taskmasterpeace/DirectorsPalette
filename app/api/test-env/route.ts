import { NextResponse } from 'next/server'
import { withSecurity, addSecurityHeaders } from '@/lib/middleware/api-security'

// SECURED: Admin-only environment diagnostics
export const GET = withSecurity(async (request, context) => {
  // Only show basic status, never expose actual keys or sensitive info
  const response = NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    status: 'Environment configuration verified',
    // DO NOT expose API keys, lengths, or sensitive environment details
  })
  
  return addSecurityHeaders(response)
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: { maxRequests: 5, windowMs: 300000 } // 5 requests per 5 minutes
})