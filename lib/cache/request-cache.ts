/**
 * Request-level caching and memoization utilities
 */

import { getCacheClient, CacheKeys, CacheTTL, cached } from './redis-client'
import { generateContentHash } from '@/lib/security/security-utils'

/**
 * Request cache options
 */
export interface RequestCacheOptions {
  ttl?: number
  keyPrefix?: string
  includeHeaders?: string[]
  ignoreQueryParams?: string[]
  skipCache?: boolean
}

/**
 * Generate cache key for request
 */
export function generateRequestCacheKey(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>,
  options: RequestCacheOptions = {}
): string {
  const { keyPrefix = 'req', includeHeaders = [], ignoreQueryParams = [] } = options
  
  // Parse URL and filter query params
  const urlObj = new URL(url, 'http://localhost')
  const filteredParams = new URLSearchParams()
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    if (!ignoreQueryParams.includes(key)) {
      filteredParams.append(key, value)
    }
  }
  
  // Build cache input
  const cacheInput = {
    method: method.toUpperCase(),
    pathname: urlObj.pathname,
    params: Object.fromEntries(filteredParams.entries()),
    body: body || null,
    headers: includeHeaders.reduce((acc, header) => {
      if (headers?.[header]) {
        acc[header] = headers[header]
      }
      return acc
    }, {} as Record<string, string>)
  }
  
  const contentHash = generateContentHash(JSON.stringify(cacheInput))
  return `${keyPrefix}:${contentHash}`
}

/**
 * Request memoization decorator
 */
export function memoizeRequest<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RequestCacheOptions & {
    keyGenerator?: (...args: TArgs) => string
    shouldCache?: (...args: TArgs) => boolean
  } = {}
) {
  const {
    ttl = CacheTTL.AI_GENERATION_SHORT,
    keyPrefix = 'memo',
    keyGenerator,
    shouldCache = () => true,
    skipCache = false
  } = options

  return async (...args: TArgs): Promise<TReturn> => {
    // Skip caching if disabled
    if (skipCache || !shouldCache(...args)) {
      return fn(...args)
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? `${keyPrefix}:${keyGenerator(...args)}`
      : `${keyPrefix}:${generateContentHash(JSON.stringify(args))}`

    // Use cached wrapper
    return cached(cacheKey, () => fn(...args), ttl)
  }
}

/**
 * AI generation cache wrapper
 */
export function cacheAIGeneration<T>(
  generationType: string,
  inputData: any,
  generationFn: () => Promise<T>,
  ttl: number = CacheTTL.AI_GENERATION
): Promise<T> {
  const inputHash = generateContentHash(JSON.stringify(inputData))
  const cacheKey = `ai:${generationType}:${inputHash}`
  
  return cached(cacheKey, generationFn, ttl)
}

/**
 * Configuration cache wrapper
 */
export function cacheConfig<T>(
  configKey: string,
  configFn: () => Promise<T>,
  ttl: number = CacheTTL.CONFIG
): Promise<T> {
  const cacheKey = CacheKeys.config(configKey)
  return cached(cacheKey, configFn, ttl)
}

/**
 * Prompt cache wrapper
 */
export function cachePrompt(
  category: string,
  key: string,
  promptFn: () => Promise<string>,
  ttl: number = CacheTTL.PROMPTS
): Promise<string> {
  const cacheKey = CacheKeys.prompt(category, key)
  return cached(cacheKey, promptFn, ttl)
}

/**
 * Request deduplication - prevent duplicate requests
 */
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending as Promise<T>
    }

    // Execute request and store promise
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear() {
    this.pendingRequests.clear()
  }

  getPendingCount(): number {
    return this.pendingRequests.size
  }
}

// Global request deduplicator
const globalDeduplicator = new RequestDeduplicator()

/**
 * Deduplicate identical requests
 */
export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  return globalDeduplicator.deduplicate(key, requestFn)
}

/**
 * Combined cache and deduplication wrapper
 */
export async function cachedRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<T>,
  options: {
    ttl?: number
    deduplicate?: boolean
    skipCache?: boolean
  } = {}
): Promise<T> {
  const { ttl = CacheTTL.AI_GENERATION_SHORT, deduplicate = true, skipCache = false } = options

  const actualRequestFn = deduplicate 
    ? () => deduplicateRequest(cacheKey, requestFn)
    : requestFn

  if (skipCache) {
    return actualRequestFn()
  }

  return cached(cacheKey, actualRequestFn, ttl)
}

/**
 * Batch cache operations
 */
export class CacheBatch {
  private operations: Array<{ key: string; value: any; ttl: number }> = []

  add(key: string, value: any, ttl: number = CacheTTL.CONFIG) {
    this.operations.push({ key, value, ttl })
    return this
  }

  async execute(): Promise<void> {
    const cache = getCacheClient()
    const promises = this.operations.map(({ key, value, ttl }) =>
      cache.set(key, value, ttl).catch(error =>
        console.warn(`Batch cache set failed for key ${key}:`, error)
      )
    )
    
    await Promise.all(promises)
    this.operations = []
  }

  clear() {
    this.operations = []
  }

  size(): number {
    return this.operations.length
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  private warmerTasks: Array<{
    key: string
    fn: () => Promise<any>
    ttl: number
    interval?: number
  }> = []

  addTask(
    key: string,
    fn: () => Promise<any>,
    ttl: number = CacheTTL.CONFIG,
    interval?: number
  ) {
    this.warmerTasks.push({ key, fn, ttl, interval })
    return this
  }

  async warmOnce(key?: string): Promise<void> {
    const tasks = key 
      ? this.warmerTasks.filter(task => task.key === key)
      : this.warmerTasks

    const promises = tasks.map(async ({ key, fn, ttl }) => {
      try {
        const result = await fn()
        const cache = getCacheClient()
        await cache.set(key, result, ttl)
      } catch (error) {
        console.warn(`Cache warming failed for key ${key}:`, error)
      }
    })

    await Promise.all(promises)
  }

  startPeriodicWarming(): NodeJS.Timeout[] {
    const intervals: NodeJS.Timeout[] = []

    for (const task of this.warmerTasks) {
      if (task.interval) {
        const intervalId = setInterval(async () => {
          try {
            await this.warmOnce(task.key)
          } catch (error) {
            console.warn(`Periodic cache warming failed for ${task.key}:`, error)
          }
        }, task.interval)
        
        intervals.push(intervalId)
      }
    }

    return intervals
  }

  clear() {
    this.warmerTasks = []
  }
}

/**
 * Cache statistics and monitoring
 */
export class CacheStats {
  private hits = 0
  private misses = 0
  private errors = 0
  private startTime = Date.now()

  recordHit() {
    this.hits++
  }

  recordMiss() {
    this.misses++
  }

  recordError() {
    this.errors++
  }

  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0
    const uptime = Date.now() - this.startTime

    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      total,
      hitRate: Math.round(hitRate * 100) / 100,
      uptime,
      timestamp: new Date().toISOString()
    }
  }

  reset() {
    this.hits = 0
    this.misses = 0
    this.errors = 0
    this.startTime = Date.now()
  }
}

// Global cache stats instance
export const cacheStats = new CacheStats()

/**
 * Enhanced cached wrapper with stats
 */
export async function cachedWithStats<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = CacheTTL.CONFIG
): Promise<T> {
  const cache = getCacheClient()
  
  // Try to get from cache first
  try {
    const cached = await cache.get(key)
    if (cached !== null) {
      cacheStats.recordHit()
      return cached
    }
  } catch (error) {
    cacheStats.recordError()
    console.warn(`Cache get failed for key ${key}:`, error)
  }
  
  // Cache miss
  cacheStats.recordMiss()
  
  // Execute function and cache result
  const result = await fn()
  
  try {
    await cache.set(key, result, ttlSeconds)
  } catch (error) {
    cacheStats.recordError()
    console.warn(`Cache set failed for key ${key}:`, error)
  }
  
  return result
}