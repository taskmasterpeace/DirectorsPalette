/**
 * Cache utilities exports
 */

// Redis client
export {
  getCacheClient,
  setCacheClient,
  CacheKeys,
  CacheTTL,
  cached,
  invalidateCache,
  clearCache,
  type CacheClient
} from './redis-client'

// Request caching
export {
  generateRequestCacheKey,
  memoizeRequest,
  cacheAIGeneration,
  cacheConfig,
  cachePrompt,
  deduplicateRequest,
  cachedRequest,
  CacheBatch,
  CacheWarmer,
  CacheStats,
  cacheStats,
  cachedWithStats,
  type RequestCacheOptions
} from './request-cache'

// Performance monitoring
export {
  PerformanceMonitor,
  withPerformanceMonitoring,
  performanceMonitor,
  type PerformanceMetrics,
  type MonitoringOptions
} from './performance-monitor'