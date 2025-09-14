/**
 * API Authentication and Authorization System
 * Handles API key validation, rate limiting, and user permissions
 */

import { createHash, randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

export interface ApiKey {
  id: string
  key: string
  name: string
  userId: string
  permissions: string[]
  rateLimit: number // requests per minute
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
  expiresAt?: Date
}

export interface ApiUsage {
  apiKeyId: string
  endpoint: string
  requestCount: number
  lastRequest: Date
  costUsd: number
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const prefix = 'dp_' // Directors Palette prefix
  const randomPart = randomBytes(32).toString('hex')
  return `${prefix}${randomPart}`
}

/**
 * Hash API key for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^dp_[a-f0-9]{64}$/.test(key)
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header: Bearer dp_xxxxx
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  // Check query parameter (less secure, for development only)
  const url = new URL(request.url)
  const queryKey = url.searchParams.get('api_key')
  if (queryKey && process.env.NODE_ENV === 'development') {
    return queryKey
  }

  return null
}

/**
 * API Authentication Response Types
 */
export interface AuthResult {
  success: boolean
  apiKey?: ApiKey
  error?: string
  rateLimitRemaining?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  error?: string
}

/**
 * Default API permissions for different user types
 */
export const API_PERMISSIONS = {
  FREE: [
    'story:generate',
    'image:generate:basic',
    'export:text'
  ],
  PRO: [
    'story:generate',
    'music-video:generate',
    'commercial:generate',
    'image:generate:all',
    'image:edit',
    'export:all',
    'template:manage'
  ],
  ENTERPRISE: [
    '*' // All permissions
  ]
} as const

/**
 * API Cost tracking for billing
 */
export const API_COSTS = {
  'story:generate': 0.05, // $0.05 per story generation
  'music-video:generate': 0.10, // $0.10 per music video
  'image:generate:basic': 0.01, // $0.01 per basic image
  'image:generate:premium': 0.05, // $0.05 per premium image
  'image:edit': 0.03, // $0.03 per image edit
  'export:json': 0.01, // $0.01 per export
} as const

/**
 * Rate limit tiers based on plan
 */
export const RATE_LIMITS = {
  FREE: 10, // 10 requests per minute
  PRO: 60, // 60 requests per minute
  ENTERPRISE: 600 // 600 requests per minute
} as const