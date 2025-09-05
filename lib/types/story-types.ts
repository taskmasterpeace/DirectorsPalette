/**
 * Story Mode TypeScript Interfaces
 * Replaces all 'any' types with proper type safety
 */

export interface Chapter {
  id: string
  title: string
  keyCharacters: string[]
  primaryLocation: string
  narrativeBeat: string
  moodDescription?: string
  timeOfDay?: string
}

export interface ChapterBreakdown {
  shots: string[]
  chapterId: string
  characterReferences?: string[]
  locationReferences?: string[]
  propReferences?: string[]
  characterDescriptions?: Array<{ name: string; description: string }>
  locationDescriptions?: Array<{ name: string; description: string }>
  propDescriptions?: Array<{ name: string; description: string }>
  coverageAnalysis: string
}

export interface StoryStructure {
  title: string
  chapters: Chapter[]
  totalChapters: number
  estimatedRuntime?: string
}

export interface StoryBreakdown {
  storyStructure: StoryStructure
  chapterBreakdowns: ChapterBreakdown[]
  overallTone: string
  visualThemes: string[]
  directorNotes?: string
}

export interface TitleCardOptions {
  enabled: boolean
  format: "full" | "name-only" | "roman-numerals"
  approaches: string[]
}

export interface PromptOptions {
  includeCameraStyle: boolean
  includeColorPalette: boolean
}

export interface StoryEntities {
  characters: StoryCharacter[]
  locations: StoryLocation[]
  props: StoryProp[]
  storyId: string
}

export interface StoryCharacter {
  id: string
  name: string
  description: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  ageVariation?: string
  chapters: string[]
}

export interface StoryLocation {
  id: string
  name: string
  description: string
  type: 'interior' | 'exterior' | 'mixed'
  chapters: string[]
}

export interface StoryProp {
  id: string
  name: string
  description: string
  significance: 'critical' | 'important' | 'background'
  chapters: string[]
}

export interface ExtractedEntities {
  characters: Array<{
    id: string
    reference: string
    name: string
    description: string
    appearances?: string[]
  }>
  locations: Array<{
    id: string
    reference: string
    name: string
    description: string
    appearances?: string[]
  }>
  props: Array<{
    id: string
    reference: string
    name: string
    description: string
    appearances?: string[]
  }>
  themes: string[]
  suggestedTreatments: Array<{
    id: string
    name: string
    description: string
  }>
}