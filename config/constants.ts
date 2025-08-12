// Application-wide constants
export const APP_NAME = "Director's Palette"
export const APP_VERSION = "1.0.0"

// Session management
export const SESSION_KEY = 'dsvb:session:v3'
export const SESSION_VERSION = 3

// Generation limits
export const GENERATION_LIMITS = {
  MAX_STORY_LENGTH: 50000,
  MAX_LYRICS_LENGTH: 10000,
  MAX_CHAPTERS: 20,
  MIN_CHAPTERS: 1,
  MAX_SHOTS_PER_CHAPTER: 50,
  MAX_ADDITIONAL_SHOTS: 20,
  MAX_CUSTOM_REQUEST_LENGTH: 500
}

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  GENERATION_TIMEOUT: 120000, // 2 minutes
  API_TIMEOUT: 60000, // 1 minute
  PROGRESS_UPDATE_INTERVAL: 100,
  AUTO_SAVE_INTERVAL: 5000 // 5 seconds
}

// Default values
export const DEFAULT_VALUES = {
  CHAPTER_COUNT: 4,
  CHAPTER_METHOD: 'ai-suggested',
  SHOTS_PER_CHAPTER: 8,
  ASPECT_RATIO: '16:9',
  STYLE_SUFFIX: 'cinematic, professional, high quality',
  DEFAULT_GENRE: 'General',
  DEFAULT_DIRECTOR: null
}

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MAX_VISIBLE_CHAPTERS: 10,
  MAX_VISIBLE_SECTIONS: 10
}

// Feature flags
export const FEATURES = {
  ENABLE_DIRECTOR_QUESTIONS: true,
  ENABLE_ENTITY_EXTRACTION: true,
  ENABLE_CUSTOM_DIRECTORS: true,
  ENABLE_ARTIST_PROFILES: true,
  ENABLE_PROJECT_MANAGEMENT: true,
  ENABLE_ADVANCED_OPTIONS: true,
  ENABLE_EXPORT: false, // Coming soon
  ENABLE_TEMPLATES: false // Coming soon
}

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  OPENAI_MODEL: 'gpt-4-turbo-preview',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4096
}

// Storage keys
export const STORAGE_KEYS = {
  SESSION: 'dsvb:session:v3',
  GENERATION_HISTORY: 'story-generation-times',
  USER_PREFERENCES: 'user-preferences',
  RECENT_PROJECTS: 'recent-projects',
  CUSTOM_DIRECTORS: 'custom-directors'
}