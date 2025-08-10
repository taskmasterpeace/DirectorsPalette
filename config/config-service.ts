/**
 * Configuration service that provides unified access to settings and prompts
 */
import { promptLoader } from './prompt-loader'
import { settingsLoader } from './settings-loader'

export class ConfigService {
  private static instance: ConfigService
  private initialized = false

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

    try {
      await Promise.all([
        promptLoader.loadPrompts(),
        settingsLoader.loadSettings()
      ])
      this.initialized = true
    } catch (error) {
      console.warn('Failed to initialize configuration service:', error)
      this.initialized = true // Set to true to prevent repeated attempts
    }
  }

  /**
   * Get AI configuration
   */
  getAIConfig() {
    return settingsLoader.getAIConfig()
  }

  /**
   * Get app settings
   */
  getAppConfig() {
    return settingsLoader.getAppConfig()
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return settingsLoader.getSecurityConfig()
  }

  /**
   * Get a prompt by category and key
   */
  getPrompt(category: string, key: string): string {
    return promptLoader.getPrompt(category, key) || ''
  }

  /**
   * Get filled prompt template
   */
  getFilledPrompt(category: string, key: string, variables: Record<string, string>): string {
    return promptLoader.getFilledPrompt(category, key, variables)
  }

  /**
   * Check if configuration is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Validate environment setup
   */
  validateEnvironment() {
    return settingsLoader.validateEnvironment()
  }
}

// Global service instance
export const configService = ConfigService.getInstance()

/**
 * Ensure configuration is initialized
 */
export async function ensureInitialized(): Promise<void> {
  if (!configService.isInitialized()) {
    await configService.initialize()
  }
}