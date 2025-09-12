// Wild Card System Types and Interfaces

export interface WildCard {
  id: string
  user_id: string
  name: string
  category: string
  content: string // newline-separated entries
  description?: string
  is_shared: boolean
  created_at: string
  updated_at: string
}

export interface WildCardCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sort_order: number
  is_system: boolean
}

export interface WildCardEntry {
  id: string
  content: string
  line_number: number
}

export interface WildCardShare {
  id: string
  wildcard_id: string
  shared_by: string
  share_code: string
  title: string
  description?: string
  download_count: number
  is_active: boolean
  created_at: string
}

export interface WildCardParseResult {
  isValid: boolean
  hasWildCards: boolean
  originalPrompt: string
  wildCardNames: string[]
  expandedPrompts: string[]
  totalCombinations: number
  warnings: string[]
  crossCombination: boolean
}

export interface WildCardImportData {
  name: string
  category: string
  content: string
  description?: string
}

export const DEFAULT_CATEGORIES: Omit<WildCardCategory, 'id'>[] = [
  { name: 'characters', description: 'Character descriptions and personas', icon: '👤', sort_order: 1, is_system: true },
  { name: 'locations', description: 'Places, settings, and environments', icon: '📍', sort_order: 2, is_system: true },
  { name: 'moods', description: 'Emotional tones and atmospheres', icon: '🎭', sort_order: 3, is_system: true },
  { name: 'lighting', description: 'Lighting conditions and styles', icon: '💡', sort_order: 4, is_system: true },
  { name: 'styles', description: 'Art styles and visual approaches', icon: '🎨', sort_order: 5, is_system: true },
  { name: 'objects', description: 'Props, items, and objects', icon: '📦', sort_order: 6, is_system: true },
  { name: 'actions', description: 'Activities and movements', icon: '🏃', sort_order: 7, is_system: true },
  { name: 'general', description: 'Uncategorized wild cards', icon: '📝', sort_order: 8, is_system: true }
]

export const WILDCARD_SYNTAX = {
  PATTERN: /_([a-zA-Z0-9_]+)_/g,
  EXAMPLE_PROMPTS: [
    'A _character_ walking through _location_',
    'Portrait of _character_ with _mood_ lighting',
    'Scene showing _action_ in _style_'
  ],
  MAX_COMBINATIONS_WARNING: 50,
  MAX_COMBINATIONS_DANGER: 100
}