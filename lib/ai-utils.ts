// Centralized AI utilities for better error handling

import { z } from 'zod'

/**
 * Make all fields in a Zod schema optional recursively
 */
export function makeSchemaFlexible<T extends z.ZodObject<any>>(schema: T): T {
  const shape = schema.shape
  const newShape: any = {}
  
  for (const key in shape) {
    const field = shape[key]
    if (field instanceof z.ZodObject) {
      newShape[key] = makeSchemaFlexible(field).optional()
    } else {
      newShape[key] = field.optional()
    }
  }
  
  return z.object(newShape) as T
}

/**
 * Safely parse AI response with fallback
 */
export function safeParseAIResponse<T>(
  response: any,
  schema: z.ZodSchema<T>,
  defaults?: Partial<T>
): T | null {
  try {
    // Try strict parsing
    return schema.parse(response)
  } catch (error) {
    console.warn('Strict schema parsing failed, trying flexible parsing:', error)
    
    try {
      // Try with optional fields
      const flexibleSchema = makeSchemaFlexible(schema as any)
      const parsed = flexibleSchema.parse(response)
      
      // Merge with defaults
      return { ...defaults, ...parsed } as T
    } catch (flexError) {
      console.error('Flexible parsing also failed:', flexError)
      return defaults as T || null
    }
  }
}

/**
 * Retry AI generation with exponential backoff
 */
export async function retryAIGeneration<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`AI generation attempt ${i + 1} failed:`, error)
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Extract structured data from text with fallback
 */
export function extractFromText(text: string, patterns: Record<string, RegExp>): Record<string, string[]> {
  const results: Record<string, string[]> = {}
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(new RegExp(pattern, 'g')) || []
    results[key] = matches.map(m => m.trim())
  }
  
  return results
}

/**
 * Sanitize and validate references
 */
export function sanitizeReference(ref: string): string {
  // Remove duplicate @ signs
  ref = ref.replace(/^@+/, '@')
  
  // Ensure it starts with @
  if (!ref.startsWith('@')) {
    ref = '@' + ref
  }
  
  // Clean up the reference
  return ref.toLowerCase()
    .replace(/[^a-z0-9_@]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '')
}