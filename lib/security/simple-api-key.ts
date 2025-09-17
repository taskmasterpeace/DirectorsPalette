/**
 * Simple API Key Protection
 * Single key system for protecting generation endpoints
 */

import { type NextRequest, NextResponse } from 'next/server'

// Generate a single API key for your application
// In production, this should come from environment variables
const API_KEY = process.env.DIRECTORS_PALETTE_API_KEY || 'dp_dev_2025_secure_key_machinekinglabs'

/**
 * Validates API key from request headers
 */
export function validateApiKey(request: NextRequest): boolean {
  // Check multiple possible header locations
  const apiKey =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.headers.get('api-key')

  return apiKey === API_KEY
}

/**
 * API key validation middleware for generation endpoints
 */
export function withApiKeyValidation(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Always skip API key check in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Development mode: Skipping API key check for', request.url)
      return handler(request, context)
    }

    // In production, check for localhost/internal calls
    const url = new URL(request.url)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.includes('localhost')

    if (isLocalhost) {
      console.log('🔓 Localhost call: Skipping API key check')
      return handler(request, context)
    }

    // Check if this is an authenticated user request (has Bearer token)
    const authHeader = request.headers.get('authorization')
    const hasAuthToken = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 20

    if (hasAuthToken) {
      console.log('🔓 Authenticated user request: Using auth token')
      return handler(request, context)
    }

    // Check API key for external calls without auth token
    const apiKey = request.headers.get('x-api-key') || request.headers.get('api-key')
    if (apiKey !== API_KEY) {
      console.log('🔒 External call: API key required')
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key',
          message: 'Please provide a valid API key in the X-API-Key header or authenticate with Bearer token'
        },
        { status: 401 }
      )
    }

    console.log('🔓 External call: Valid API key provided')
    return handler(request, context)
  }
}

/**
 * Add API key to client requests (for your own app)
 */
export function addApiKeyToRequest(url: string, options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-API-Key': API_KEY
    }
  }
}

/**
 * Fetch wrapper that automatically includes API key
 */
export async function secureApiCall(url: string, options: RequestInit = {}) {
  return fetch(url, addApiKeyToRequest(url, options))
}

/**
 * For your external applications - use this key
 */
export function getApiKey(): string {
  return API_KEY
}