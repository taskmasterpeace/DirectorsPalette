/**
 * API Key Management Utilities
 * Handles API keys from localStorage with fallback to environment variables
 */

// Client-side API key retrieval
export function getClientApiKey(type: 'openai' | 'replicate'): string | null {
  if (typeof window === 'undefined') return null
  
  const storageKey = `directors-palette-${type}-key`
  return localStorage.getItem(storageKey)
}

// Server-side API key retrieval with localStorage fallback
export function getServerApiKey(type: 'openai' | 'replicate', clientKey?: string): string | null {
  // Use client-provided key first
  if (clientKey) return clientKey
  
  // Fallback to environment variables
  if (type === 'openai') {
    return process.env.OPENAI_API_KEY || null
  } else {
    return process.env.REPLICATE_API_TOKEN || null
  }
}

// Check if API key is configured (client or server)
export function isApiKeyConfigured(type: 'openai' | 'replicate'): boolean {
  const clientKey = getClientApiKey(type)
  const envKey = type === 'openai' ? process.env.OPENAI_API_KEY : process.env.REPLICATE_API_TOKEN
  
  return !!(clientKey || envKey)
}

// Validate API key format
export function validateApiKey(type: 'openai' | 'replicate', key: string): { valid: boolean; error?: string } {
  if (!key.trim()) {
    return { valid: false, error: 'API key cannot be empty' }
  }
  
  if (type === 'openai') {
    if (!key.startsWith('sk-')) {
      return { valid: false, error: 'OpenAI API key should start with "sk-"' }
    }
    if (key.length < 20) {
      return { valid: false, error: 'OpenAI API key seems too short' }
    }
  } else if (type === 'replicate') {
    if (!key.startsWith('r8_')) {
      return { valid: false, error: 'Replicate API token should start with "r8_"' }
    }
    if (key.length < 20) {
      return { valid: false, error: 'Replicate API token seems too short' }
    }
  }
  
  return { valid: true }
}

// Get all configured API keys for server actions
export function getAllApiKeys(): { openai?: string; replicate?: string } {
  return {
    openai: getServerApiKey('openai'),
    replicate: getServerApiKey('replicate')
  }
}