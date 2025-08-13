/**
 * AI Generation Service
 * Centralized AI operations with proper error handling
 * BUT respects the differences between story and music video modes
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { retryAIGeneration } from '@/lib/ai-utils'
import * as actions from '@/app/actions'

// ============ BASE TYPES ============
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

// ============ STORY TYPES ============
export interface StoryReferences {
  characters: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
  locations: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
  props: Array<{
    id: string
    reference: string
    name: string
    description: string
  }>
}

export interface StoryBreakdown {
  storyTitle?: string
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  chapterBreakdowns: Array<{
    chapterId: string
    shots: string[]
    characterReferences: string[]
    locationReferences: string[]
    propReferences: string[]
    coverageAnalysis: string
    characterDescriptions?: Array<{ name: string; description: string }>
    locationDescriptions?: Array<{ name: string; description: string }>
    propDescriptions?: Array<{ name: string; description: string }>
  }>
  generatedAt: string
}

// ============ MUSIC VIDEO TYPES ============
export interface MusicVideoReferences {
  locations: Array<{
    name: string
    description: string
    type: 'interior' | 'exterior' | 'studio' | 'abstract' | 'mixed'
  }>
  wardrobe: Array<{
    name: string
    description: string
    style: string
  }>
  props: Array<{
    name: string
    description: string
    purpose: string
  }>
  visualThemes: string[]
}

export interface MusicVideoBreakdown {
  songTitle: string
  artist: string
  sections: Array<{
    id: string
    type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'
    lyrics: string
    shots: Array<{
      shot: string
      cameraMovement?: string
      lighting?: string
      vfx?: string
    }>
    performanceNotes?: string
    narrativeNotes?: string
  }>
  overallTreatment: string
  visualThemes: string[]
  colorPalette: string[]
  generatedAt: string
}

// ============ SERVICE CLASS ============
class AIGenerationService {
  // ========== STORY METHODS ==========
  async extractStoryReferences(
    story: string,
    director?: string,
    directorNotes?: string
  ): Promise<ServiceResult<StoryReferences>> {
    return this.withErrorHandling(async () => {
      return await actions.extractStoryReferences(story, director, directorNotes)
    })
  }

  async generateStoryBreakdown(
    story: string,
    references: StoryReferences,
    director: string,
    directorNotes: string,
    options: {
      chapterMethod: string
      chapterCount: number
      titleCardOptions?: any
      promptOptions?: any
    }
  ): Promise<ServiceResult<StoryBreakdown>> {
    return this.withErrorHandling(async () => {
      return await actions.generateStoryBreakdownWithReferences(
        story,
        director,
        directorNotes,
        references,
        options.titleCardOptions || {},
        options.promptOptions || {},
        options.chapterMethod,
        options.chapterCount
      )
    })
  }

  async generateStoryAdditionalShots(
    chapter: any,
    storyTitle: string,
    director: string,
    categories: string[],
    customRequest: string
  ): Promise<ServiceResult<string[]>> {
    return this.withErrorHandling(async () => {
      return await actions.generateAdditionalChapterShots(
        chapter,
        storyTitle,
        director,
        categories,
        customRequest
      )
    })
  }

  // ========== MUSIC VIDEO METHODS ==========
  async extractMusicVideoReferences(
    songTitle: string,
    artist: string,
    lyrics: string,
    director?: string,
    directorNotes?: string,
    concept?: string
  ): Promise<ServiceResult<MusicVideoReferences>> {
    return this.withErrorHandling(async () => {
      return await actions.extractMusicVideoReferences(
        songTitle,
        artist,
        lyrics,
        director,
        directorNotes,
        concept
      )
    })
  }

  async generateMusicVideoBreakdown(
    songTitle: string,
    artist: string,
    genre: string,
    lyrics: string,
    references: MusicVideoReferences,
    director: string,
    directorNotes: string,
    concept: string,
    artistProfile?: any
  ): Promise<ServiceResult<MusicVideoBreakdown>> {
    return this.withErrorHandling(async () => {
      return await actions.generateMusicVideoBreakdownWithReferences(
        songTitle,
        artist,
        genre,
        lyrics,
        director,
        directorNotes,
        concept,
        references,
        artistProfile,
        null // musicVideoConfig
      )
    })
  }

  async generateMusicVideoAdditionalShots(
    section: any,
    songTitle: string,
    director: string,
    customRequest: string
  ): Promise<ServiceResult<any>> {
    return this.withErrorHandling(async () => {
      return await actions.generateAdditionalMusicVideoShots(
        section,
        songTitle,
        director,
        customRequest
      )
    })
  }

  // ========== SHARED UTILITIES ==========
  private async withErrorHandling<T>(
    fn: () => Promise<ServiceResult<T>>
  ): Promise<ServiceResult<T>> {
    try {
      const result = await fn()
      
      // Handle undefined result
      if (!result) {
        console.error('Service returned undefined result')
        return {
          success: false,
          error: 'Service returned no result - check if the action is properly exported'
        }
      }
      
      // If the action itself returned an error, pass it through
      if (!result.success) {
        console.error('Service error:', result.error)
        return result
      }
      
      return result
    } catch (error) {
      console.error('Unexpected error in AI service:', error)
      
      // Try to extract useful error message
      let errorMessage = 'An unexpected error occurred'
      
      if (error instanceof Error) {
        if (error.message.includes('schema')) {
          errorMessage = 'The AI response format was unexpected. Retrying with flexible parsing...'
          // Could implement retry with flexible schema here
        } else if (error.message.includes('API')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // ========== REFERENCE UTILITIES ==========
  sanitizeReference(ref: string): string {
    // Remove duplicate @ signs
    ref = ref.replace(/^@+/, '@')
    
    // Ensure it starts with @
    if (!ref.startsWith('@')) {
      ref = '@' + ref
    }
    
    // Clean up the reference
    return ref.toLowerCase()
      .replace(/[^a-z0-9_@]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '')
  }

  validateStoryReferences(refs: StoryReferences): StoryReferences {
    return {
      characters: refs.characters.map(ref => ({
        ...ref,
        reference: this.sanitizeReference(ref.reference || ref.name)
      })),
      locations: refs.locations.map(ref => ({
        ...ref,
        reference: this.sanitizeReference(ref.reference || ref.name)
      })),
      props: refs.props.map(ref => ({
        ...ref,
        reference: this.sanitizeReference(ref.reference || ref.name)
      }))
    }
  }
}

// ============ SINGLETON EXPORT ============
export const aiService = new AIGenerationService()