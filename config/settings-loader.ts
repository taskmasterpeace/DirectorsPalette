/**
 * Settings loader for managing app configuration
 */
import path from 'path'
import fs from 'fs/promises'
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
  maxRetries: z.number().default(3),
  retryDelay: z.number().default(1000),
  enableAnalytics: z.boolean().default(false),
  enableErrorReporting: z.boolean().default(true),
})

const FeatureSettingsSchema = z.object({
  storyMode: z.object({
    enabled: z.boolean().default(true),
    maxChapters: z.number().default(20),
    defaultDirector: z.string().default('nolan'),
    enableTitleCards: z.boolean().default(true),
    maxAdditionalShots: z.number().default(10),
  }).default({}),
  musicVideoMode: z.object({
    enabled: z.boolean().default(true),
    maxSections: z.number().default(15),
    defaultDirector: z.string().default('hype-williams'),
    enableSuggestions: z.boolean().default(true),
    maxTreatments: z.number().default(5),
  }).default({}),
  artistProfiles: z.object({
    enabled: z.boolean().default(true),
    maxProfiles: z.number().default(100),
    enableAutofill: z.boolean().default(true),
    enableCreateFromLyrics: z.boolean().default(true),
  }).default({}),
  customDirectors: z.object({
    enabled: z.boolean().default(true),
    maxCustomDirectors: z.number().default(50),
    enableStyleGeneration: z.boolean().default(true),
  }).default({}),
}).default({})

const UISettingsSchema = z.object({
  defaultMode: z.enum(['story', 'music-video']).default('story'),
  enableProjectManager: z.boolean().default(true),
  enableAdvancedOptions: z.boolean().default(true),
  autoSaveInterval: z.number().default(30000),
  maxToastDuration: z.number().default(5000),
}).default({})

const StorageSettingsSchema = z.object({
  enablePersistence: z.boolean().default(true),
  sessionStoragePrefix: z.string().default('dsvb:'),
  indexedDBName: z.string().default('dsvb-db'),
  maxStorageSize: z.number().default(100000000),
}).default({})

const SettingsSchema = z.object({
  version: z.string().default('1.0'),
  ai: AISettingsSchema.default({}),
  app: AppSettingsSchema.default({}),
  features: FeatureSettingsSchema.default({}),
  ui: UISettingsSchema.default({}),
  storage: StorageSettingsSchema.default({}),
})

// ===== Types =====
export type AISettings = z.infer<typeof AISettingsSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
export type FeatureSettings = z.infer<typeof FeatureSettingsSchema>
export type UISettings = z.infer<typeof UISettingsSchema>
export type StorageSettings = z.infer<typeof StorageSettingsSchema>
export type Settings = z.infer<typeof SettingsSchema>

class SettingsLoader {
  private static instance: SettingsLoader
  private settings: Settings | null = null
  private loaded = false

  private constructor() {}

  static getInstance(): SettingsLoader {
    if (!SettingsLoader.instance) {
      SettingsLoader.instance = new SettingsLoader()
    }
    return SettingsLoader.instance
  }

  /**
   * Load settings from files and environment variables
   */
  async load(): Promise<Settings> {
    if (this.loaded && this.settings) {
      return this.settings
    }

    try {
      // Load base settings
      let settings: Partial<Settings> = {}

      // Try to load from app-settings.json
      try {
        const settingsPath = path.join(process.cwd(), 'config', 'settings', 'app-settings.json')
        const content = await fs.readFile(settingsPath, 'utf-8')
        settings = JSON.parse(content)
      } catch (error) {
        console.warn('Could not load app-settings.json, using defaults')
      }

      // Override with environment variables
      const envOverrides = this.loadEnvironmentOverrides()
      settings = { ...settings, ...envOverrides }

      // Validate and parse with defaults
      this.settings = SettingsSchema.parse(settings)
      this.loaded = true

      return this.settings
    } catch (error) {
      console.error('Failed to load settings:', error)
      
      // Return default settings on error
      this.settings = SettingsSchema.parse({})
      this.loaded = true
      
      return this.settings
    }
  }

  /**
   * Load environment variable overrides
   */
  private loadEnvironmentOverrides(): Partial<Settings> {
    const overrides: any = {}

    // AI settings from environment
    if (process.env.AI_MODEL) {
      overrides.ai = { ...overrides.ai, model: process.env.AI_MODEL }
    }
    if (process.env.AI_MAX_TOKENS) {
      overrides.ai = { ...overrides.ai, maxTokens: parseInt(process.env.AI_MAX_TOKENS) }
    }
    if (process.env.AI_TEMPERATURE) {
      overrides.ai = { ...overrides.ai, temperature: parseFloat(process.env.AI_TEMPERATURE) }
    }

    // App settings from environment
    if (process.env.NODE_ENV === 'development') {
      overrides.app = { ...overrides.app, debug: true }
    }
    if (process.env.DISABLE_LOGGING === 'true') {
      overrides.app = { ...overrides.app, enableLogging: false }
    }

    // Feature flags from environment
    if (process.env.DISABLE_STORY_MODE === 'true') {
      overrides.features = { ...overrides.features, storyMode: { enabled: false } }
    }
    if (process.env.DISABLE_MUSIC_VIDEO_MODE === 'true') {
      overrides.features = { ...overrides.features, musicVideoMode: { enabled: false } }
    }

    return overrides
  }

  /**
   * Get current settings
   */
  getSettings(): Settings | null {
    return this.settings
  }

  /**
   * Check if settings are loaded
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Get a setting by path
   */
  getSetting(path: string): any {
    if (!this.settings) return undefined

    const keys = path.split('.')
    let current: any = this.settings

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * Reload settings
   */
  async reload(): Promise<Settings> {
    this.loaded = false
    this.settings = null
    return this.load()
  }
}

// ===== Exports =====
export const settingsLoader = SettingsLoader.getInstance()
export default settingsLoader