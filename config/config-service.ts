/**
 * Configuration service that provides unified access to settings and prompts
 */
import { config, type Config, type AIConfig, type AppSettings } from './index'
import { promptLoader, type PromptConfig } from './prompt-loader'
import { settingsLoader, type Settings } from './settings-loader'

export class ConfigService {
  private static instance: ConfigService
  private initialized = false
  private settings: Settings | null = null

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  /**
   * Initialize the configuration service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    await Promise.all([
      config.load(),
      promptLoader.load(),
      settingsLoader.load().then(settings => this.settings = settings)
    ])

    this.initialized = true
  }

  /**
   * Get the full configuration
   */
  getConfig(): Config {
    return config.getConfig()
  }

  /**
   * Get AI configuration (from new settings system)
   */
  getAIConfig(): any {
    return this.settings?.ai || config.getAIConfig()
  }

  /**
   * Get app settings (from new settings system)
   */
  getAppSettings(): any {
    return this.settings?.app || config.getAppSettings()
  }

  /**
   * Get feature settings
   */
  getFeatureSettings(): any {
    return this.settings?.features || {}
  }

  /**
   * Get UI settings
   */
  getUISettings(): any {
    return this.settings?.ui || {}
  }

  /**
   * Get storage settings
   */
  getStorageSettings(): any {
    return this.settings?.storage || {}
  }

  /**
   * Get full settings object
   */
  getSettings(): Settings | null {
    return this.settings
  }

  /**
   * Get a prompt template
   */
  getPrompt(category: string, key: string): string | undefined {
    return promptLoader.getPrompt(category, key)
  }

  /**
   * Get a filled prompt template
   */
  getFilledPrompt(category: string, key: string, variables: Record<string, string>): string {
    const template = this.getPrompt(category, key)
    if (!template) {
      throw new Error(`Prompt not found: ${category}.${key}`)
    }
    
    return promptLoader.fillTemplate(template, variables)
  }

  /**
   * Get all prompts for a category
   */
  getPromptCategory(category: string): PromptConfig | undefined {
    return promptLoader.getCategory(category)
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get environment-based configuration
   */
  getEnvironment(): 'development' | 'production' | 'test' {
    return process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.getAppSettings().debug || this.getEnvironment() === 'development'
  }

  /**
   * Update a configuration value
   */
  updateConfig(path: string, value: any): void {
    config.set(path, value)
  }

  /**
   * Get a configuration value by path
   */
  getConfigValue(path: string): any {
    const keys = path.split('.')
    let current: any = config.getConfig()
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return current
  }
}

// ===== Helper Functions =====

/**
 * Ensure the config service is initialized
 */
export async function ensureInitialized(): Promise<ConfigService> {
  const service = ConfigService.getInstance()
  await service.initialize()
  return service
}

// ===== Exports =====
export const configService = ConfigService.getInstance()
export default configService