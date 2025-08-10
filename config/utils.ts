/**
 * Configuration utilities and helper functions
 */
import { configService, ensureInitialized } from './config-service'

// ===== Feature Flag Helpers =====

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(featurePath: string): Promise<boolean> {
  await ensureInitialized()
  const features = configService.getFeatureSettings()
  
  const keys = featurePath.split('.')
  let current = features
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return false
    }
  }
  
  return current === true
}

/**
 * Get a feature setting value
 */
export async function getFeatureSetting(featurePath: string, defaultValue?: any): Promise<any> {
  await ensureInitialized()
  const features = configService.getFeatureSettings()
  
  const keys = featurePath.split('.')
  let current = features
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return defaultValue
    }
  }
  
  return current !== undefined ? current : defaultValue
}

// ===== AI Configuration Helpers =====

/**
 * Get AI model configuration with environment overrides
 */
export async function getAIModelConfig() {
  await ensureInitialized()
  const aiConfig = configService.getAIConfig()
  
  return {
    model: process.env.AI_MODEL || aiConfig.model || 'gpt-4o',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '') || aiConfig.maxTokens || 4000,
    temperature: parseFloat(process.env.AI_TEMPERATURE || '') || aiConfig.temperature || 0.7,
    retryAttempts: aiConfig.retryAttempts || 3,
    retryDelay: aiConfig.retryDelay || 1000,
  }
}

/**
 * Check if debug mode is enabled
 */
export async function isDebugMode(): Promise<boolean> {
  return process.env.NODE_ENV === 'development' || await isFeatureEnabled('app.debug')
}

/**
 * Check if logging is enabled
 */
export async function isLoggingEnabled(): Promise<boolean> {
  await ensureInitialized()
  const appSettings = configService.getAppSettings()
  return appSettings.enableLogging !== false
}

// ===== UI Configuration Helpers =====

/**
 * Get default mode from configuration
 */
export async function getDefaultMode(): Promise<'story' | 'music-video'> {
  await ensureInitialized()
  const uiSettings = configService.getUISettings()
  return uiSettings.defaultMode || 'story'
}

/**
 * Get auto-save interval
 */
export async function getAutoSaveInterval(): Promise<number> {
  await ensureInitialized()
  const uiSettings = configService.getUISettings()
  return uiSettings.autoSaveInterval || 30000
}

// ===== Storage Configuration Helpers =====

/**
 * Get storage prefix for session/local storage
 */
export async function getStoragePrefix(): Promise<string> {
  await ensureInitialized()
  const storageSettings = configService.getStorageSettings()
  return storageSettings.sessionStoragePrefix || 'dsvb:'
}

/**
 * Check if persistence is enabled
 */
export async function isPersistenceEnabled(): Promise<boolean> {
  await ensureInitialized()
  const storageSettings = configService.getStorageSettings()
  return storageSettings.enablePersistence !== false
}

// ===== Validation Helpers =====

/**
 * Validate configuration on startup
 */
export async function validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  try {
    await ensureInitialized()
    
    // Check AI configuration
    const aiConfig = configService.getAIConfig()
    if (!aiConfig.model) {
      errors.push('AI model not configured')
    }
    if (aiConfig.temperature < 0 || aiConfig.temperature > 2) {
      errors.push('AI temperature must be between 0 and 2')
    }
    if (aiConfig.maxTokens <= 0) {
      errors.push('AI maxTokens must be positive')
    }
    
    // Check required environment variables
    if (!process.env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY environment variable is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  } catch (error) {
    errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      valid: false,
      errors
    }
  }
}

// ===== Configuration Export for Development =====

/**
 * Export current configuration (for debugging)
 */
export async function exportConfiguration(): Promise<any> {
  await ensureInitialized()
  return {
    settings: configService.getSettings(),
    prompts: configService.getPromptCategory('story-prompts'),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
}