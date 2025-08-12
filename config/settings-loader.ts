/**
 * Settings loader for managing app configuration
 */
import path from 'path'
import { z } from 'zod'

// ===== Configuration Schemas =====
const AISettingsSchema = z.object({
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  fallbackModel: z.string().optional(),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),
})

const AppSettingsSchema = z.object({
  debug: z.boolean().default(false),
  enableLogging: z.boolean().default(true),
  enableCaching: z.boolean().default(true),
  cachePrefix: z.string().default('imgprompt'),
  cacheTTL: z.number().default(3600),
})

const SecuritySettingsSchema = z.object({
  enableRateLimit: z.boolean().default(true),
  enableContentModeration: z.boolean().default(true),
  enableInputSanitization: z.boolean().default(true),
  maxTextLength: z.number().default(50000),
  maxRequestsPerMinute: z.number().default(60),
})

const ConfigSchema = z.object({
  ai: AISettingsSchema.optional(),
  app: AppSettingsSchema.optional(), 
  security: SecuritySettingsSchema.optional(),
})

export type AISettings = z.infer<typeof AISettingsSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>
export type Config = z.infer<typeof ConfigSchema>

// Server-side file reading function
async function readConfigFile(): Promise<Config | null> {
  if (typeof window !== 'undefined') {
    // Client-side: return null, will use environment variables and defaults
    return null
  }
  
  try {
    // Use require to conditionally load fs only on server
    // This prevents Next.js from trying to bundle fs for the client
    const { promises: fs } = require('fs')
    const configPath = path.join(process.cwd(), 'config', 'settings.json')
    const content = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(content)
    return ConfigSchema.parse(parsed)
  } catch (error) {
    // Don't warn on client-side, it's expected
    if (typeof window === 'undefined') {
      console.warn('Config file not found or invalid, using defaults:', error)
    }
    return null
  }
}

class SettingsLoader {
  private static instance: SettingsLoader
  private config: Config = {}
  private loaded = false

  static getInstance(): SettingsLoader {
    if (!SettingsLoader.instance) {
      SettingsLoader.instance = new SettingsLoader()
    }
    return SettingsLoader.instance
  }

  /**
   * Load configuration from file and environment variables
   */
  async loadSettings(): Promise<void> {
    if (this.loaded) return

    try {
      // Try to load config file first
      const fileConfig = await readConfigFile()
      if (fileConfig) {
        this.config = fileConfig
      }

      // Override with environment variables
      this.applyEnvironmentOverrides()
      
      this.loaded = true
    } catch (error) {
      console.warn('Failed to load settings:', error)
      this.loaded = true
    }
  }

  /**
   * Apply environment variable overrides
   */
  private applyEnvironmentOverrides(): void {
    // AI Settings
    if (process.env.OPENAI_MODEL) {
      this.config.ai = { ...this.config.ai, model: process.env.OPENAI_MODEL }
    }
    if (process.env.AI_MAX_TOKENS) {
      this.config.ai = { ...this.config.ai, maxTokens: parseInt(process.env.AI_MAX_TOKENS) }
    }
    if (process.env.AI_TEMPERATURE) {
      this.config.ai = { ...this.config.ai, temperature: parseFloat(process.env.AI_TEMPERATURE) }
    }

    // App Settings
    if (process.env.DEBUG) {
      this.config.app = { ...this.config.app, debug: process.env.DEBUG === 'true' }
    }
    if (process.env.ENABLE_CACHING) {
      this.config.app = { ...this.config.app, enableCaching: process.env.ENABLE_CACHING === 'true' }
    }

    // Security Settings
    if (process.env.ENABLE_RATE_LIMIT) {
      this.config.security = { 
        ...this.config.security, 
        enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true' 
      }
    }
    if (process.env.MAX_TEXT_LENGTH) {
      this.config.security = { 
        ...this.config.security, 
        maxTextLength: parseInt(process.env.MAX_TEXT_LENGTH) 
      }
    }
  }

  /**
   * Get AI configuration with defaults
   */
  getAIConfig(): AISettings {
    const defaults = AISettingsSchema.parse({})
    return { ...defaults, ...this.config.ai }
  }

  /**
   * Get app configuration with defaults
   */
  getAppConfig(): AppSettings {
    const defaults = AppSettingsSchema.parse({})
    return { ...defaults, ...this.config.app }
  }

  /**
   * Get security configuration with defaults
   */
  getSecurityConfig(): SecuritySettings {
    const defaults = SecuritySettingsSchema.parse({})
    return { ...defaults, ...this.config.security }
  }

  /**
   * Get full configuration
   */
  getConfig(): {
    ai: AISettings
    app: AppSettings
    security: SecuritySettings
  } {
    return {
      ai: this.getAIConfig(),
      app: this.getAppConfig(),
      security: this.getSecurityConfig(),
    }
  }

  /**
   * Check if settings are loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Reset loader state (useful for testing)
   */
  reset(): void {
    this.config = {}
    this.loaded = false
  }

  /**
   * Validate environment setup
   */
  validateEnvironment(): {
    valid: boolean
    missing: string[]
    warnings: string[]
  } {
    const missing: string[] = []
    const warnings: string[] = []

    // Check required environment variables
    if (!process.env.OPENAI_API_KEY) {
      missing.push('OPENAI_API_KEY')
    }

    // Check for common misconfigurations
    if (process.env.NODE_ENV === 'production') {
      if (process.env.DEBUG === 'true') {
        warnings.push('DEBUG is enabled in production')
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings
    }
  }
}

// Export singleton instance
export const settingsLoader = SettingsLoader.getInstance()