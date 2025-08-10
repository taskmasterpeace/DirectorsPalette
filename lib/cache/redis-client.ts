/**
 * Redis client configuration and utilities
 */

// In-memory cache fallback for development/environments without Redis
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>()
  private maxSize = 1000
  private gcInterval: NodeJS.Timeout

  constructor() {
    // Garbage collect expired entries every 5 minutes
    this.gcInterval = setInterval(() => {
      this.gc()
    }, 5 * 60 * 1000)
  }

  private gc() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires <= now) {
        this.cache.delete(key)
      }
    }
  }

  private evictLRU() {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    return entry.value
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    this.evictLRU()
    
    const expires = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  async flushdb(): Promise<void> {
    this.cache.clear()
  }

  destroy() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval)
    }
    this.cache.clear()
  }
}

// Cache client interface
export interface CacheClient {
  get(key: string): Promise<any>
  set(key: string, value: any, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  keys(pattern: string): Promise<string[]>
  flushdb(): Promise<void>
}

// Global cache instance
let cacheInstance: CacheClient | null = null

/**
 * Get cache client instance
 */
export function getCacheClient(): CacheClient {
  if (!cacheInstance) {
    // In development or when Redis is not available, use memory cache
    cacheInstance = new MemoryCache()
  }
  
  return cacheInstance
}

/**
 * Set custom cache client (useful for testing or Redis integration)
 */
export function setCacheClient(client: CacheClient) {
  cacheInstance = client
}

/**
 * Cache key utilities
 */
export const CacheKeys = {
  // AI Generation caches
  storyBreakdown: (contentHash: string) => `story:breakdown:${contentHash}`,
  additionalShots: (contentHash: string) => `story:shots:${contentHash}`,
  musicVideoBreakdown: (contentHash: string) => `mv:breakdown:${contentHash}`,
  artistProfile: (inputHash: string) => `artist:profile:${inputHash}`,
  directorStyle: (inputHash: string) => `director:style:${inputHash}`,
  
  // Configuration caches
  prompt: (category: string, key: string) => `prompt:${category}:${key}`,
  config: (key: string) => `config:${key}`,
  
  // Rate limiting
  rateLimit: (identifier: string, window: string) => `rate:${identifier}:${window}`,
  
  // Performance metrics
  metrics: (endpoint: string, period: string) => `metrics:${endpoint}:${period}`,
  
  // User sessions
  session: (sessionId: string) => `session:${sessionId}`,
} as const

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  // AI-generated content - cache longer since it's expensive
  AI_GENERATION: 24 * 60 * 60, // 24 hours
  AI_GENERATION_SHORT: 6 * 60 * 60, // 6 hours
  
  // Configuration data
  CONFIG: 60 * 60, // 1 hour
  PROMPTS: 30 * 60, // 30 minutes
  
  // Rate limiting windows
  RATE_LIMIT_SHORT: 5 * 60, // 5 minutes
  RATE_LIMIT_MEDIUM: 15 * 60, // 15 minutes
  RATE_LIMIT_LONG: 60 * 60, // 1 hour
  
  // Performance metrics
  METRICS: 5 * 60, // 5 minutes
  
  // User sessions
  SESSION: 30 * 60, // 30 minutes
  SESSION_EXTENDED: 7 * 24 * 60 * 60, // 7 days
} as const

/**
 * Cached function wrapper
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = CacheTTL.CONFIG
): Promise<T> {
  const cache = getCacheClient()
  
  // Try to get from cache first
  try {
    const cached = await cache.get(key)
    if (cached !== null) {
      return cached
    }
  } catch (error) {
    console.warn(`Cache get failed for key ${key}:`, error)
  }
  
  // Execute function and cache result
  const result = await fn()
  
  try {
    await cache.set(key, result, ttlSeconds)
  } catch (error) {
    console.warn(`Cache set failed for key ${key}:`, error)
  }
  
  return result
}

/**
 * Invalidate cache entries by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const cache = getCacheClient()
  
  try {
    const keys = await cache.keys(pattern)
    for (const key of keys) {
      await cache.del(key)
    }
  } catch (error) {
    console.warn(`Cache invalidation failed for pattern ${pattern}:`, error)
  }
}

/**
 * Clear all cache entries
 */
export async function clearCache(): Promise<void> {
  const cache = getCacheClient()
  
  try {
    await cache.flushdb()
  } catch (error) {
    console.warn('Cache clear failed:', error)
  }
}