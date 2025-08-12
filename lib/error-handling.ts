/**
 * Error handling utilities for robust AI generation
 */

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on certain errors
      if (lastError.message.includes('OPENAI_API_KEY')) {
        throw lastError
      }
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay)
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Progress saving for recovery
 */
export class ProgressSaver {
  private key: string
  private data: any = {}

  constructor(key: string) {
    this.key = `progress:${key}`
    this.load()
  }

  save(step: string, data: any) {
    this.data[step] = {
      data,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Failed to save progress:', e)
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(this.key)
      if (saved) {
        this.data = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load progress:', e)
      this.data = {}
    }
  }

  get(step: string, maxAge: number = 3600000) { // 1 hour default
    const saved = this.data[step]
    if (!saved) return null
    
    // Check if data is too old
    if (Date.now() - saved.timestamp > maxAge) {
      delete this.data[step]
      return null
    }
    
    return saved.data
  }

  clear() {
    this.data = {}
    try {
      localStorage.removeItem(this.key)
    } catch (e) {
      console.warn('Failed to clear progress:', e)
    }
  }

  hasProgress() {
    return Object.keys(this.data).length > 0
  }

  getSteps() {
    return Object.keys(this.data).map(step => ({
      step,
      timestamp: this.data[step].timestamp
    }))
  }
}

/**
 * Error messages for user-friendly display
 */
export function getUserFriendlyError(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('api key')) {
    return 'API key is missing or invalid. Please check your configuration.'
  }
  
  if (message.includes('rate limit')) {
    return 'Rate limit exceeded. Please wait a moment and try again.'
  }
  
  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection.'
  }
  
  if (message.includes('invalid')) {
    return 'Invalid input provided. Please check your data.'
  }
  
  // Default fallback
  return 'An error occurred. Please try again.'
}

/**
 * Chunk large operations into smaller batches
 */
export async function processInBatches<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 3
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await processor(batch)
    results.push(...batchResults)
  }
  
  return results
}