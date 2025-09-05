/**
 * Music Video Mode TypeScript Interfaces
 * Replaces all 'any' types with proper type safety
 */

export interface Section {
  id: string
  title: string
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'pre-chorus' | 'hook'
  startTime?: number
  endTime?: number
  energy: 'low' | 'medium' | 'high'
  lyrics?: string
}

export interface SectionBreakdown {
  sectionId: string
  shots: string[]
  sectionType: string
  energy: 'low' | 'medium' | 'high'
  visualThemes: string[]
  performanceRatio?: number // 0-100, percentage of performance vs narrative shots
}

export interface Treatment {
  id: string
  name: string
  description: string
  visualStyle: string
  moodBoard?: string[]
  estimatedBudget?: 'low' | 'medium' | 'high'
}

export interface MusicVideoStructure {
  sections: Section[]
  totalDuration?: number
  overallEnergy: 'low' | 'medium' | 'high'
  performanceBalance: number // 0-100, overall performance vs narrative ratio
}

export interface MusicVideoBreakdown {
  sectionBreakdowns: SectionBreakdown[]
  musicVideoStructure: MusicVideoStructure
  treatments: Treatment[]
  selectedTreatment: string
  overallConcept: string
  visualThemes: string[]
  directorNotes?: string
  isConfigured?: boolean
  sections?: Section[] // Fallback for older data structure
}

export interface MusicVideoConfig {
  selectedTreatmentId: string
  locations: string[]
  wardrobe: string[]
  props: string[]
  performanceRatio: number
  narrativeElements: string[]
  isConfigured: boolean
}

export interface MusicVideoReference {
  type: 'location' | 'wardrobe' | 'prop' | 'mood' | 'style'
  name: string
  description: string
  reference: string // @reference format
  visualImportance: 'high' | 'medium' | 'low'
}

export interface ArtistIntegration {
  selectedArtistId: string | null
  selectedArtistProfile: any | undefined // Will be typed with proper ArtistProfile interface
  artistVisualDescription: string
  showDescriptions: boolean // Toggle between @artist variable and description
}