/**
 * Comprehensive Type Definitions
 * This file contains all the proper TypeScript interfaces to replace 'any' types
 */

// ============= Director Types =============

export interface BaseDirector {
  id: string
  name: string
  description: string
  category?: string
  disciplines?: string[]
  tags?: string[]
}

export interface FilmDirector extends BaseDirector {
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
}

export interface MusicVideoDirector extends BaseDirector {
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
}

// ============= Story Types =============

export interface Chapter {
  id: string
  title: string
  content: string
  startPosition: number
  endPosition: number
  estimatedDuration: string
  keyCharacters: string[]
  primaryLocation: string
  narrativeBeat: 'setup' | 'rising-action' | 'climax' | 'resolution'
}

export interface StoryStructure {
  chapters: Chapter[]
  detectionMethod: 'existing' | 'ai-generated' | 'hybrid'
  totalChapters: number
  fullStory: string
}

export interface StoryReference {
  id: string
  reference: string
  name: string
  description: string
  appearances?: string[]
}

export interface StoryReferences {
  characters: StoryReference[]
  locations: StoryReference[]
  props: StoryReference[]
  themes: string[]
  suggestedTreatments?: Treatment[]
}

export interface ChapterBreakdown {
  chapterId: string
  characterReferences: string[]
  locationReferences: string[]
  propReferences: string[]
  shots: string[]
  coverageAnalysis: string
  additionalOpportunities: string[]
  titleCards?: TitleCard[]
}

export interface StoryBreakdown {
  storyStructure: StoryStructure
  chapterBreakdowns: ChapterBreakdown[]
  overallAnalysis: string
}

export interface TitleCard {
  id: string
  styleLabel: string
  description: string
}

// ============= Music Video Types =============

export interface MusicVideoSection {
  id: string
  title: string
  type: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'post-chorus' | 
        'bridge' | 'instrumental' | 'solo' | 'refrain' | 'outro' | 'hook' | 'interlude'
  startTime?: string
  endTime?: string
  lyrics: string
  isHook?: boolean
  repetitionNumber?: number
}

export interface MusicVideoStructure {
  songTitle: string
  artist: string
  genre: string
  totalSections: number
  sections: MusicVideoSection[]
  detectionMethod: 'timestamp-based' | 'ai-generated' | 'hybrid'
}

export interface Treatment {
  id: string
  name: string
  concept: string
  visualTheme: string
  performanceRatio: number
  hookStrategy: string
}

export interface MusicVideoSectionBreakdown {
  sectionId: string
  shots: string[]
  performanceNotes?: string[]
  syncPoints?: string[]
  performanceRatio?: number
  locationReference?: string
  wardrobeReference?: string
  propReferences?: string[]
}

export interface MusicVideoBreakdown {
  musicVideoStructure: MusicVideoStructure
  treatments: Treatment[]
  selectedTreatment?: Treatment
  sections: MusicVideoSection[]
  sectionBreakdowns: MusicVideoSectionBreakdown[]
  overallAnalysis?: string
  isConfigured?: boolean
}

export interface MusicVideoReference {
  id?: string
  reference?: string
  name: string
  description: string
  type?: string
  style?: string
  purpose?: string
}

export interface MusicVideoReferences {
  locations?: MusicVideoReference[]
  wardrobe?: MusicVideoReference[]
  props?: MusicVideoReference[]
  visualThemes?: string[]
}

// ============= Configuration Types =============

export interface LocationConfig {
  reference: string
  name: string
  description: string
  assignedSections?: string[]
}

export interface WardrobeConfig {
  reference: string
  name: string
  description: string
  assignedSections?: string[]
}

export interface PropConfig {
  reference: string
  name: string
  description: string
  assignedSections?: string[]
}

export interface TitleCardOptions {
  enabled: boolean
  format: 'full' | 'name-only' | 'roman-numerals'
  approaches: string[]
}

export interface PromptOptions {
  includeCameraStyle: boolean
  includeColorPalette: boolean
  includeLightingDetails?: boolean
}

// ============= Generation Types =============

export interface GenerationResult<T> {
  success: boolean
  data?: T
  error?: string
  generatedAt?: string
}

export interface AdditionalShotsRequest {
  shotCount?: number
  categories: string[]
  customRequest: string
  existingShots: string[]
}

export interface AdditionalShotsResult {
  newShots: string[]
  coverageAnalysis?: string
}

// ============= Workflow Types =============

export interface WorkflowState {
  stage: 'idle' | 'extracting' | 'configuring' | 'generating' | 'complete'
  progress: {
    current: number
    total: number
  }
  message: string
  error?: string
}

export interface SessionData {
  mode: 'story' | 'music-video'
  lastModified: string
  storyData?: Partial<StoryBreakdown>
  musicVideoData?: Partial<MusicVideoBreakdown>
  references?: StoryReferences | MusicVideoReferences
}

// ============= Component Props Types =============

export interface DirectorSelectorProps {
  mode: 'film' | 'music-video'
  selectedDirector: string
  onDirectorChange: (directorId: string) => void
  allDirectors: (FilmDirector | MusicVideoDirector)[]
  allowCustom?: boolean
}

export interface ShotGeneratorProps {
  mode: 'story' | 'music-video'
  existingShots: string[]
  onShotsGenerated: (shots: string[]) => void
  context: {
    director?: string
    section?: Chapter | MusicVideoSection
    references?: StoryReferences | MusicVideoReferences
  }
}

export interface ReferenceConfigProps {
  references: StoryReferences | MusicVideoReferences
  onConfigurationComplete: (configured: StoryReferences | MusicVideoReferences) => void
  onCancel: () => void
  isLoading?: boolean
}

// ============= Store Types =============

export interface AppState {
  isLoading: boolean
  error: string | null
  mode: 'story' | 'music-video'
  sessionId: string
}

export interface StoryState {
  story: string
  storyTitle: string
  selectedDirector: string
  directorNotes: string
  breakdown: StoryBreakdown | null
  references: StoryReferences | null
  additionalShots: Record<string, string[]>
  expandedChapters: string[]
  titleCardOptions: TitleCardOptions
  promptOptions: PromptOptions
}

export interface MusicVideoState {
  songTitle: string
  artist: string
  genre: string
  lyrics: string
  selectedDirector: string
  directorNotes: string
  breakdown: MusicVideoBreakdown | null
  references: MusicVideoReferences | null
  config: MusicVideoConfig | null
  additionalShots: Record<string, string[]>
  expandedSections: string[]
}

// ============= API Types =============

export interface AIGenerationRequest {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemMessage?: string
  structuredOutput?: boolean
}

export interface AIGenerationResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Re-export from existing files for compatibility
export type { MusicVideoConfig } from '@/lib/indexeddb'
export type { ArtistProfile } from '@/lib/artist-types'