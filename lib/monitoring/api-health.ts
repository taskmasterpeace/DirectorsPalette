'use client'

// API Health Monitoring System
export interface APIHealthStatus {
  provider: 'openrouter' | 'replicate'
  endpoint: string
  modelId?: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastChecked: Date
  errorMessage?: string
  uptime: number // percentage
}

export interface APIHealthSummary {
  openrouter: {
    overall: 'healthy' | 'degraded' | 'down'
    models: { [modelId: string]: APIHealthStatus }
    avgResponseTime: number
    uptime: number
  }
  replicate: {
    overall: 'healthy' | 'degraded' | 'down'
    services: { [service: string]: APIHealthStatus }
    avgResponseTime: number
    uptime: number
  }
}

class APIHealthMonitor {
  private healthData: Map<string, APIHealthStatus> = new Map()
  private monitoring = false

  async checkOpenRouterHealth(): Promise<APIHealthStatus[]> {
    const results: APIHealthStatus[] = []
    
    // Test core OpenRouter models
    const testModels = [
      'openai/gpt-4o',
      'openai/gpt-4o-mini', 
      'moonshotai/kimi-k2:free',
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-chat-v3.1'
    ]

    for (const modelId of testModels) {
      const startTime = performance.now()
      let status: APIHealthStatus
      
      try {
        const response = await fetch('/api/health/openrouter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelId, test: true })
        })
        
        const responseTime = performance.now() - startTime
        
        status = {
          provider: 'openrouter',
          endpoint: `/api/health/openrouter`,
          modelId,
          status: response.ok ? 'healthy' : 'degraded',
          responseTime,
          lastChecked: new Date(),
          uptime: 99.5 // TODO: Calculate from historical data
        }
        
        if (!response.ok) {
          status.errorMessage = `HTTP ${response.status}`
        }
      } catch (error) {
        status = {
          provider: 'openrouter',
          endpoint: `/api/health/openrouter`,
          modelId,
          status: 'down',
          responseTime: performance.now() - startTime,
          lastChecked: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          uptime: 99.5
        }
      }
      
      this.healthData.set(`openrouter-${modelId}`, status)
      results.push(status)
    }
    
    return results
  }

  async checkReplicateHealth(): Promise<APIHealthStatus[]> {
    const results: APIHealthStatus[] = []
    
    // Test core Replicate services
    const testServices = [
      { name: 'gen4-image', endpoint: '/api/health/replicate/gen4' },
      { name: 'seedance-light', endpoint: '/api/health/replicate/seedance-light' },
      { name: 'seedance-pro', endpoint: '/api/health/replicate/seedance-pro' },
      { name: 'qwen-edit', endpoint: '/api/health/replicate/qwen-edit' }
    ]

    for (const service of testServices) {
      const startTime = performance.now()
      let status: APIHealthStatus
      
      try {
        const response = await fetch(service.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        })
        
        const responseTime = performance.now() - startTime
        
        status = {
          provider: 'replicate',
          endpoint: service.endpoint,
          modelId: service.name,
          status: response.ok ? 'healthy' : 'degraded',
          responseTime,
          lastChecked: new Date(),
          uptime: 99.8 // TODO: Calculate from historical data
        }
        
        if (!response.ok) {
          status.errorMessage = `HTTP ${response.status}`
        }
      } catch (error) {
        status = {
          provider: 'replicate',
          endpoint: service.endpoint,
          modelId: service.name,
          status: 'down',
          responseTime: performance.now() - startTime,
          lastChecked: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          uptime: 99.8
        }
      }
      
      this.healthData.set(`replicate-${service.name}`, status)
      results.push(status)
    }
    
    return results
  }

  async getHealthSummary(): Promise<APIHealthSummary> {
    const [openrouterHealth, replicateHealth] = await Promise.all([
      this.checkOpenRouterHealth(),
      this.checkReplicateHealth()
    ])

    // Calculate OpenRouter summary
    const openrouterHealthy = openrouterHealth.filter(h => h.status === 'healthy').length
    const openrouterTotal = openrouterHealth.length
    const openrouterOverall = openrouterHealthy === openrouterTotal ? 'healthy' : 
                             openrouterHealthy > openrouterTotal * 0.7 ? 'degraded' : 'down'

    // Calculate Replicate summary  
    const replicateHealthy = replicateHealth.filter(h => h.status === 'healthy').length
    const replicateTotal = replicateHealth.length
    const replicateOverall = replicateHealthy === replicateTotal ? 'healthy' :
                            replicateHealthy > replicateTotal * 0.7 ? 'degraded' : 'down'

    return {
      openrouter: {
        overall: openrouterOverall,
        models: Object.fromEntries(
          openrouterHealth.map(h => [h.modelId!, h])
        ),
        avgResponseTime: openrouterHealth.reduce((sum, h) => sum + h.responseTime, 0) / openrouterHealth.length,
        uptime: openrouterHealth.reduce((sum, h) => sum + h.uptime, 0) / openrouterHealth.length
      },
      replicate: {
        overall: replicateOverall,
        services: Object.fromEntries(
          replicateHealth.map(h => [h.modelId!, h])
        ),
        avgResponseTime: replicateHealth.reduce((sum, h) => sum + h.responseTime, 0) / replicateHealth.length,
        uptime: replicateHealth.reduce((sum, h) => sum + h.uptime, 0) / replicateHealth.length
      }
    }
  }

  startMonitoring(intervalMinutes: number = 5) {
    if (this.monitoring) return
    
    this.monitoring = true
    const interval = setInterval(async () => {
      try {
        await this.getHealthSummary()
        console.log('🔍 API health check completed')
      } catch (error) {
        console.error('❌ API health check failed:', error)
      }
    }, intervalMinutes * 60 * 1000)

    // Initial check
    this.getHealthSummary()
    
    return () => {
      clearInterval(interval)
      this.monitoring = false
    }
  }
}

// Singleton instance
export const apiHealthMonitor = new APIHealthMonitor()

// React hook for health monitoring
export function useAPIHealth() {
  const [healthSummary, setHealthSummary] = useState<APIHealthSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshHealth = async () => {
    setIsLoading(true)
    try {
      const summary = await apiHealthMonitor.getHealthSummary()
      setHealthSummary(summary)
    } catch (error) {
      console.error('Failed to get health summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Start monitoring on mount
    const cleanup = apiHealthMonitor.startMonitoring(5) // Check every 5 minutes
    refreshHealth() // Initial load
    
    return cleanup
  }, [])

  return { healthSummary, isLoading, refreshHealth }
}

import { useState, useEffect } from 'react'