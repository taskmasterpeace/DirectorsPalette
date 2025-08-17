/**
 * Enhanced Post Production Types
 * Combines Director's Palette shot types with ImageMax functionality
 */

import type { PostProductionShot } from './types'

// ImageMax types
export interface ImageData {
  id: string
  file?: File
  type?: string
  size?: number
  fileUrl?: string
  preview: string
  prompt: string
  selected: boolean
  status: 'idle' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  videos?: string[]
  error?: string
  mode: 'seedance' | 'kontext'
  shotId?: string // Link to Director's Palette shot
}

export interface Template {
  id: string
  name: string
  prompt: string
  category: string
  favorite: boolean
  usageCount: number
}

export interface Gen4ReferenceImage {
  id: string
  file: File
  preview: string
  tags: string[]
  detectedAspectRatio?: string
  width?: number
  height?: number
  persistentTag?: string // Saved tag that persists across sessions
}

export interface Gen4Generation {
  id: string
  prompt: string
  referenceImages: Gen4ReferenceImage[]
  settings: Gen4Settings
  status: 'idle' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  error?: string
  timestamp: number
  category?: 'people' | 'places' | 'props' | 'unorganized'
}

export interface Gen4Settings {
  aspectRatio: string
  resolution: string
  seed?: number
  model?: 'gen4-image' | 'gen4-image-turbo'
}

export interface LibraryImageReference {
  id: string
  imageData: string // base64 encoded
  preview?: string
  tags: string[]
  category: 'people' | 'places' | 'props' | 'unorganized'
  prompt?: string
  createdAt: Date
  source: 'generated' | 'uploaded'
  settings?: Gen4Settings
  referenceTag?: string // The @ tag used for Gen4 reference
}

export interface SettingsType {
  seedance: {
    model: string
    resolution: string
    duration: number
    cameraFixed: boolean
  }
  kontext: {
    model: 'dev' | 'max'
  }
  general: {
    autoSave: boolean
    showCostEstimates: boolean
    maxConcurrentJobs: number
  }
}

// Layout Planner types
export interface BoundingBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  text: string
}

// Enhanced shot type that combines Director's Palette and ImageMax
export interface EnhancedShot extends PostProductionShot {
  referenceImages?: Gen4ReferenceImage[]
  template?: Template
  layoutPlan?: BoundingBox[]
  mode?: 'seedance' | 'kontext'
}