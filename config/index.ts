/**
 * Configuration system for ImgPromptGen
 * Centralizes prompts, settings, and AI model configurations
 */
import { z } from 'zod'

// ===== Configuration Schemas =====
const AIConfigSchema = z.object({
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
})

const AppSettingsSchema = z.object({
  debug: z.boolean().default(false),
  enableLogging: z.boolean().default(true),
  maxRetries: z.number().default(3),
  retryDelay: z.number().default(1000),
})

const ConfigSchema = z.object({
  version: z.string().default('1.0'),
  ai: AIConfigSchema,
  app: AppSettingsSchema,
  prompts: z.record(z.string(), z.any()).default({}),
})

// ===== Types =====
export type AIConfig = z.infer<typeof AIConfigSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
export type Config = z.infer<typeof ConfigSchema>

// ===== Default Configuration =====
const defaultConfig: Config = {
  version: '1.0',
  ai: {
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
  },
  app: {
    debug: false,
    enableLogging: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  prompts: {},
}

// ===== Configuration Manager =====
class ConfigManager {
  private static instance: ConfigManager
  private config: Config = defaultConfig
  private loaded = false

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * Load configuration from files
   */
  async load(): Promise<void> {
    if (this.loaded) return

    try {
      // In the future, this could load from files, environment variables, etc.
      // For now, use defaults
      this.config = defaultConfig
      this.loaded = true
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error)
      this.config = defaultConfig
      this.loaded = true
    }
  }

  /**
   * Get the full configuration
   */
  getConfig(): Config {
    return this.config
  }

  /**
   * Get AI configuration
   */
  getAIConfig(): AIConfig {
    return this.config.ai
  }

  /**
   * Get app settings
   */
  getAppSettings(): AppSettings {
    return this.config.app
  }

  /**
   * Get a prompt by key
   */
  getPrompt(key: string): string | undefined {
    return this.config.prompts[key]
  }

  /**
   * Set a configuration value
   */
  set(path: string, value: any): void {
    const keys = path.split('.')
    let current: any = this.config
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  /**
   * Update configuration from partial config
   */
  update(partialConfig: Partial<Config>): void {
    this.config = { ...this.config, ...partialConfig }
  }
}

// ===== Exports =====
export const config = ConfigManager.getInstance()
export default config

// Re-export constants and prompts
export * from './constants'
export * from './prompts'