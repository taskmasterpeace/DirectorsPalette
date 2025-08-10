/**
 * Performance monitoring and metrics collection
 */

import { getCacheClient, CacheKeys, CacheTTL } from './redis-client'

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
}

export interface MonitoringOptions {
  collectMemoryStats?: boolean
  collectCpuStats?: boolean
  sampleRate?: number // 0-1, percentage of requests to monitor
  slowThreshold?: number // milliseconds
  errorThreshold?: number // error rate percentage
  batchSize?: number
  flushInterval?: number // milliseconds
}

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private options: Required<MonitoringOptions>
  private flushTimer?: NodeJS.Timeout
  private cpuStartUsage?: NodeJS.CpuUsage

  constructor(options: MonitoringOptions = {}) {
    this.options = {
      collectMemoryStats: options.collectMemoryStats ?? false,
      collectCpuStats: options.collectCpuStats ?? false,
      sampleRate: options.sampleRate ?? 1.0,
      slowThreshold: options.slowThreshold ?? 1000,
      errorThreshold: options.errorThreshold ?? 5.0,
      batchSize: options.batchSize ?? 100,
      flushInterval: options.flushInterval ?? 30000, // 30 seconds
    }

    // Start periodic flush
    this.startPeriodicFlush()
  }

  /**
   * Start monitoring an operation
   */
  startOperation(operation: string): {
    end: (success?: boolean, error?: string, metadata?: Record<string, any>) => void
  } {
    // Check sample rate
    if (Math.random() > this.options.sampleRate) {
      return { end: () => {} } // No-op for unsampled requests
    }

    const startTime = performance.now()
    const startTimestamp = Date.now()
    
    // Capture initial CPU usage if enabled
    let cpuStart: NodeJS.CpuUsage | undefined
    if (this.options.collectCpuStats && process.cpuUsage) {
      cpuStart = process.cpuUsage()
    }

    return {
      end: (success: boolean = true, error?: string, metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime
        
        // Collect system stats if enabled
        let memoryUsage: NodeJS.MemoryUsage | undefined
        let cpuUsage: NodeJS.CpuUsage | undefined
        
        if (this.options.collectMemoryStats && process.memoryUsage) {
          memoryUsage = process.memoryUsage()
        }
        
        if (this.options.collectCpuStats && cpuStart && process.cpuUsage) {
          cpuUsage = process.cpuUsage(cpuStart)
        }

        const metric: PerformanceMetrics = {
          operation,
          duration,
          timestamp: startTimestamp,
          success,
          error,
          metadata,
          memoryUsage,
          cpuUsage
        }

        this.recordMetric(metric)
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)

    // Check for slow operations
    if (metric.duration > this.options.slowThreshold) {
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`)
    }

    // Auto-flush if batch size reached
    if (this.metrics.length >= this.options.batchSize) {
      this.flush().catch(error => 
        console.error('Failed to flush performance metrics:', error)
      )
    }
  }

  /**
   * Flush metrics to cache
   */
  async flush(): Promise<void> {
    if (this.metrics.length === 0) return

    const cache = getCacheClient()
    const timestamp = new Date().toISOString()
    const batchKey = `metrics:batch:${timestamp}`

    try {
      await cache.set(batchKey, this.metrics, CacheTTL.METRICS)
      
      // Update aggregated metrics
      await this.updateAggregatedMetrics(this.metrics)
      
      // Clear local metrics
      this.metrics = []
    } catch (error) {
      console.error('Failed to flush performance metrics:', error)
    }
  }

  /**
   * Update aggregated metrics
   */
  private async updateAggregatedMetrics(metrics: PerformanceMetrics[]) {
    const cache = getCacheClient()
    const now = new Date()
    const hourKey = `metrics:hour:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
    
    try {
      // Get existing hourly metrics
      let hourlyMetrics = await cache.get(hourKey) || {
        operations: {},
        totalRequests: 0,
        totalErrors: 0,
        averageLatency: 0,
        slowRequests: 0,
        timestamp: now.toISOString()
      }

      // Update with new metrics
      for (const metric of metrics) {
        if (!hourlyMetrics.operations[metric.operation]) {
          hourlyMetrics.operations[metric.operation] = {
            count: 0,
            errors: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            slowCount: 0
          }
        }

        const opStats = hourlyMetrics.operations[metric.operation]
        opStats.count++
        opStats.totalDuration += metric.duration
        opStats.minDuration = Math.min(opStats.minDuration, metric.duration)
        opStats.maxDuration = Math.max(opStats.maxDuration, metric.duration)

        if (!metric.success) {
          opStats.errors++
          hourlyMetrics.totalErrors++
        }

        if (metric.duration > this.options.slowThreshold) {
          opStats.slowCount++
          hourlyMetrics.slowRequests++
        }

        hourlyMetrics.totalRequests++
      }

      // Recalculate average latency
      const totalDuration = Object.values(hourlyMetrics.operations)
        .reduce((sum: number, op: any) => sum + op.totalDuration, 0)
      hourlyMetrics.averageLatency = hourlyMetrics.totalRequests > 0 
        ? totalDuration / hourlyMetrics.totalRequests 
        : 0

      // Save updated metrics
      await cache.set(hourKey, hourlyMetrics, 25 * 60 * 60) // 25 hours TTL
    } catch (error) {
      console.error('Failed to update aggregated metrics:', error)
    }
  }

  /**
   * Get performance statistics
   */
  async getStats(operation?: string, hours: number = 1): Promise<any> {
    const cache = getCacheClient()
    const now = new Date()
    const stats: any = {
      timestamp: now.toISOString(),
      operations: {}
    }

    // Collect hourly metrics
    for (let i = 0; i < hours; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourKey = `metrics:hour:${hour.getFullYear()}-${hour.getMonth()}-${hour.getDate()}-${hour.getHours()}`
      
      try {
        const hourlyMetrics = await cache.get(hourKey)
        if (hourlyMetrics) {
          // Merge operation stats
          for (const [op, opStats] of Object.entries(hourlyMetrics.operations)) {
            if (operation && op !== operation) continue
            
            if (!stats.operations[op]) {
              stats.operations[op] = {
                count: 0,
                errors: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                slowCount: 0
              }
            }

            const currentStats = stats.operations[op]
            const hourStats = opStats as any

            currentStats.count += hourStats.count
            currentStats.errors += hourStats.errors
            currentStats.totalDuration += hourStats.totalDuration
            currentStats.minDuration = Math.min(currentStats.minDuration, hourStats.minDuration)
            currentStats.maxDuration = Math.max(currentStats.maxDuration, hourStats.maxDuration)
            currentStats.slowCount += hourStats.slowCount
          }
        }
      } catch (error) {
        console.warn(`Failed to get metrics for hour ${hourKey}:`, error)
      }
    }

    // Calculate derived metrics
    for (const [op, opStats] of Object.entries(stats.operations)) {
      const s = opStats as any
      s.averageDuration = s.count > 0 ? s.totalDuration / s.count : 0
      s.errorRate = s.count > 0 ? (s.errors / s.count) * 100 : 0
      s.slowRate = s.count > 0 ? (s.slowCount / s.count) * 100 : 0
      
      // Clean up infinity values
      if (s.minDuration === Infinity) s.minDuration = 0
    }

    return stats
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => 
        console.error('Periodic metrics flush failed:', error)
      )
    }, this.options.flushInterval)
  }

  /**
   * Stop monitoring and cleanup
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    // Flush remaining metrics
    this.flush().catch(error => 
      console.error('Final metrics flush failed:', error)
    )
  }

  /**
   * Get current options
   */
  getOptions(): Required<MonitoringOptions> {
    return { ...this.options }
  }

  /**
   * Update monitoring options
   */
  updateOptions(options: Partial<MonitoringOptions>) {
    this.options = { ...this.options, ...options }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor({
  collectMemoryStats: process.env.NODE_ENV !== 'production',
  collectCpuStats: process.env.NODE_ENV !== 'production',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  slowThreshold: 2000,
  batchSize: 50
})

/**
 * Decorator for monitoring function performance
 */
export function withPerformanceMonitoring<TArgs extends any[], TReturn>(
  operationName: string,
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const operation = performanceMonitor.startOperation(operationName)
    
    try {
      const result = await fn(...args)
      operation.end(true, undefined, { argsCount: args.length })
      return result
    } catch (error) {
      operation.end(false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }
}

/**
 * Middleware for Next.js API routes
 */
export function performanceMiddleware(operationName?: string) {
  return (req: any, res: any, next: () => void) => {
    const operation = performanceMonitor.startOperation(
      operationName || `${req.method} ${req.url}`
    )

    // Wrap res.end to capture completion
    const originalEnd = res.end
    res.end = function(...args: any[]) {
      const success = res.statusCode < 400
      operation.end(success, success ? undefined : `HTTP ${res.statusCode}`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.headers['user-agent']
      })
      
      return originalEnd.apply(this, args)
    }

    next()
  }
}