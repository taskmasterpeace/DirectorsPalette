/**
 * Commercial Generation Types
 * TypeScript interfaces and Zod schemas for commercial content generation
 */

import { z } from 'zod'

// ============= Base Types =============

export type Platform = 'tiktok' | 'instagram' | 'youtube'
export type Duration = '10s' | '30s'
export type ContentType = 'product' | 'service' | 'hybrid'
export type LocationRequirement = 'flexible' | 'specific' | 'brand-location'

// ============= Commercial Configuration =============

export interface CommercialConfig {
  brand: string
  product: string
  audience: string
  duration: Duration
  platform: Platform
  director: string
  concept?: string
  contentType?: ContentType
  locationRequirement?: LocationRequirement
}

export const CommercialConfigSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  product: z.string().min(1, "Product/Service is required"),
  audience: z.string().min(1, "Target audience is required"),
  duration: z.enum(['10s', '30s']),
  platform: z.enum(['tiktok', 'instagram', 'youtube']),
  director: z.string().min(1, "Director selection is required"),
  concept: z.string().optional(),
  contentType: z.enum(['product', 'service', 'hybrid']).optional(),
  locationRequirement: z.enum(['flexible', 'specific', 'brand-location']).optional()
})

// ============= Shot Structure =============

export interface CommercialShot {
  id: string
  shotNumber: number
  timing: string // e.g., "0-2s" or "5-10s"
  shotType: 'hook' | 'problem' | 'solution' | 'benefit' | 'cta' | 'setup' | 'conflict' | 'discovery' | 'transformation' | 'resolution' | 'brand-close'
  description: string
  cameraWork: string
  lighting: string
  location: string
  props?: string[]
  brandIntegration: string
  directorNotes?: string
}

export const CommercialShotSchema = z.object({
  id: z.string(),
  shotNumber: z.number().min(1),
  timing: z.string().describe("Time range for the shot, e.g., '0-2s' or '15-22s'"),
  shotType: z.enum(['hook', 'problem', 'solution', 'benefit', 'cta', 'setup', 'conflict', 'discovery', 'transformation', 'resolution', 'brand-close']),
  description: z.string().min(10, "Shot description must be detailed"),
  cameraWork: z.string().describe("Camera angle, movement, and framing details"),
  lighting: z.string().describe("Lighting style and mood"),
  location: z.string().describe("Location setting for the shot"),
  props: z.array(z.string()).optional(),
  brandIntegration: z.string().describe("How brand/product is integrated into this shot"),
  directorNotes: z.string().optional()
})

// ============= Commercial Structure =============

export interface CommercialStructure {
  commercialId: string
  config: CommercialConfig
  shots: CommercialShot[]
  totalDuration: Duration
  platformOptimization: PlatformOptimization
  directorStyle: DirectorStyleApplication
  overallAnalysis: string
  productionNotes?: string[]
  estimatedBudget?: 'low' | 'medium' | 'high'
}

export const CommercialStructureSchema = z.object({
  commercialId: z.string(),
  config: CommercialConfigSchema,
  shots: z.array(CommercialShotSchema).min(3, "Commercial must have at least 3 shots"),
  totalDuration: z.enum(['10s', '30s']),
  platformOptimization: z.object({
    platform: z.enum(['tiktok', 'instagram', 'youtube']),
    aspectRatio: z.string(),
    hookTiming: z.string(),
    ctaPlacement: z.string(),
    engagementFactors: z.array(z.string())
  }),
  directorStyle: z.object({
    directorName: z.string(),
    styleApplication: z.string(),
    visualElements: z.array(z.string()),
    pacingNotes: z.string()
  }),
  overallAnalysis: z.string().min(50, "Analysis must be comprehensive"),
  productionNotes: z.array(z.string()).optional(),
  estimatedBudget: z.enum(['low', 'medium', 'high']).optional()
})

// ============= Platform Optimization =============

export interface PlatformOptimization {
  platform: Platform
  aspectRatio: string
  hookTiming: string
  ctaPlacement: string
  engagementFactors: string[]
}

// ============= Director Style Application =============

export interface DirectorStyleApplication {
  directorName: string
  styleApplication: string
  visualElements: string[]
  pacingNotes: string
}

// ============= Commercial Director Profiles =============

export interface CommercialDirector {
  id: string
  name: string
  description: string
  specialties: string[]
  visualHallmarks: string
  pacing: 'slow' | 'medium' | 'fast' | 'variable'
  energy: 'calm' | 'moderate' | 'high' | 'explosive'
  brandFit: string[]
  platformStrength: Platform[]
  audience: string[]
  stats: {
    creativity: number // 1-10
    authenticity: number // 1-10
    premiumFeel: number // 1-10
    engagement: number // 1-10
  }
  notableApproaches: string[]
  when_to_use: string
  sample_brands: string[]
}

export const CommercialDirectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().min(20),
  specialties: z.array(z.string()).min(1),
  visualHallmarks: z.string().min(20),
  pacing: z.enum(['slow', 'medium', 'fast', 'variable']),
  energy: z.enum(['calm', 'moderate', 'high', 'explosive']),
  brandFit: z.array(z.string()).min(1),
  platformStrength: z.array(z.enum(['tiktok', 'instagram', 'youtube'])).min(1),
  audience: z.array(z.string()).min(1),
  stats: z.object({
    creativity: z.number().min(1).max(10),
    authenticity: z.number().min(1).max(10),
    premiumFeel: z.number().min(1).max(10),
    engagement: z.number().min(1).max(10)
  }),
  notableApproaches: z.array(z.string()).min(2),
  when_to_use: z.string().min(30),
  sample_brands: z.array(z.string()).min(2)
})

// ============= Generation Result Types =============

export interface CommercialGenerationRequest {
  config: CommercialConfig
  customDirectorInput?: string
  regenerateShots?: number[] // Shot numbers to regenerate
}

export interface CommercialGenerationResult {
  success: boolean
  commercial?: CommercialStructure
  error?: string
  generatedAt: string
  tokens_used?: {
    prompt: number
    completion: number
    total: number
  }
}

export const CommercialGenerationResultSchema = z.object({
  success: z.boolean(),
  commercial: CommercialStructureSchema.optional(),
  error: z.string().optional(),
  generatedAt: z.string(),
  tokens_used: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number()
  }).optional()
})

// ============= Export Types =============

export interface CommercialExportData {
  commercial: CommercialStructure
  exportFormat: 'shot-list' | 'storyboard' | 'production-notes' | 'platform-package'
  includeMetadata: boolean
  platformOptimizations: boolean
}

// ============= Variable Replacement Types =============

export interface CommercialVariables {
  brand: string
  product: string
  audience?: string
  platform?: string
  concept?: string
  features?: string
  benefits?: string
  location?: string
}

// Helper function to create default commercial config
export function createDefaultCommercialConfig(): CommercialConfig {
  return {
    brand: '',
    product: '',
    audience: '',
    duration: '10s',
    platform: 'tiktok',
    director: '',
    concept: '',
    contentType: 'product',
    locationRequirement: 'flexible'
  }
}

// Helper function to validate shot timing for duration
export function validateShotTiming(shots: CommercialShot[], duration: Duration): boolean {
  const maxSeconds = duration === '10s' ? 10 : 30
  
  for (const shot of shots) {
    const [start, end] = shot.timing.split('-').map(t => parseInt(t.replace('s', '')))
    if (end > maxSeconds) {
      return false
    }
  }
  
  return true
}

// Helper function to extract timing from shot description
export function extractTimingFromShot(shotDescription: string): string | null {
  const timingMatch = shotDescription.match(/\((\d+-\d+s)\)/)
  return timingMatch ? timingMatch[1] : null
}