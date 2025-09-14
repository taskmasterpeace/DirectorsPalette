/**
 * Input Validation and Sanitization for API Security
 */

import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize user input for AI prompts
 */
export function sanitizePrompt(prompt: string): string {
  // Remove potentially harmful content
  const cleaned = prompt
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URIs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()

  // Limit length to prevent abuse
  return cleaned.slice(0, 5000)
}

/**
 * Validate file upload security
 */
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif)$/i, 'Invalid filename or file type'),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, 'Invalid file type')
})

/**
 * Validate API key format
 */
export const apiKeySchema = z.string()
  .regex(/^dp_[a-f0-9]{64}$/, 'Invalid API key format')

/**
 * Validate story generation request
 */
export const storyGenerationSchema = z.object({
  story: z.string()
    .min(10, 'Story must be at least 10 characters')
    .max(10000, 'Story too long (max 10,000 characters)')
    .transform(sanitizePrompt),
  director: z.string()
    .min(1, 'Director required')
    .max(100, 'Director name too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Invalid director name'),
  genre: z.string()
    .max(50, 'Genre too long')
    .optional(),
  chapters: z.number()
    .min(1, 'Must have at least 1 chapter')
    .max(20, 'Too many chapters (max 20)')
    .optional()
})

/**
 * Validate image generation request
 */
export const imageGenerationSchema = z.object({
  prompt: z.string()
    .min(5, 'Prompt must be at least 5 characters')
    .max(2000, 'Prompt too long (max 2,000 characters)')
    .transform(sanitizePrompt),
  model: z.enum(['nano-banana', 'seedream-4', 'gen4-image', 'gen4-image-turbo']),
  num_images: z.number()
    .min(1, 'Must generate at least 1 image')
    .max(15, 'Too many images (max 15)'),
  aspect_ratio: z.enum(['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'])
    .optional()
    .default('16:9'),
  resolution: z.enum(['720p', '1080p', '2k', '4k'])
    .optional()
    .default('1080p'),
  reference_images: z.array(z.string().url())
    .max(10, 'Too many reference images (max 10)')
    .optional()
})

/**
 * Validate music video generation request
 */
export const musicVideoGenerationSchema = z.object({
  artist_name: z.string()
    .min(1, 'Artist name required')
    .max(100, 'Artist name too long')
    .regex(/^[a-zA-Z0-9\s-_&.]+$/, 'Invalid artist name'),
  lyrics: z.string()
    .min(20, 'Lyrics must be at least 20 characters')
    .max(50000, 'Lyrics too long (max 50,000 characters)')
    .transform(sanitizePrompt),
  director: z.string()
    .min(1, 'Director required')
    .max(100, 'Director name too long'),
  concept: z.string()
    .max(1000, 'Concept too long (max 1,000 characters)')
    .optional()
})

/**
 * Rate limiting validation
 */
export function validateRequestRate(
  identifier: string,
  limit: number,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: Date } {
  const now = Date.now()
  const key = `rate_limit:${identifier}`

  // Simple in-memory rate limiting (use Redis in production)
  const stored = rateLimitCache.get(key)

  if (!stored || now > stored.resetTime) {
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: new Date(now + windowMs)
    }
  }

  if (stored.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(stored.resetTime)
    }
  }

  stored.count++
  return {
    allowed: true,
    remaining: limit - stored.count,
    resetTime: new Date(stored.resetTime)
  }
}

// Simple rate limit cache (use Redis in production)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'"
}

/**
 * Allowed file types for upload security
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/aac'
] as const

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 25 * 1024 * 1024, // 25MB
  video: 100 * 1024 * 1024 // 100MB
} as const