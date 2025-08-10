/**
 * Server actions for story generation
 */
'use server'

import { StoryService } from '@/services'
import { StoryEntityService } from '@/services/story-entity-service'
import type { StoryEntities } from '@/components/story/story-entities-config'

export interface StoryGenerationRequest {
  story: string
  selectedDirector: string
  titleCardOptions: {
    enabled: boolean
    format: "full" | "name-only" | "roman-numerals"
    approaches: string[]
  }
  allDirectors: any[]
  promptOptions: {
    includeCameraStyle: boolean
    includeColorPalette: boolean
  }
  storyDirectorNotes: string
}

export async function generateStoryBreakdown(request: StoryGenerationRequest) {
  try {
    const result = await StoryService.generateBreakdown(
      request.story,
      request.selectedDirector,
      request.titleCardOptions,
      request.allDirectors,
      request.promptOptions,
      request.storyDirectorNotes
    )

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Story generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generateAdditionalShots(args: {
  story: string
  director: string
  storyStructure: any
  chapterId: string
  existingBreakdown: any
  existingAdditionalShots: string[]
  categories: string[]
  customRequest: string
}, customDirectors: any[], promptOptions: any, directorNotes: string) {
  try {
    const result = await StoryService.generateAdditionalShots(
      args,
      customDirectors,
      promptOptions,
      directorNotes
    )

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Additional shots generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function extractStoryEntities(story: string) {
  try {
    const result = await StoryEntityService.extractEntities({ story })

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Entity extraction failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generateStoryBreakdownWithEntities(
  request: StoryGenerationRequest,
  entities: StoryEntities
) {
  try {
    const result = await StoryEntityService.generateBreakdownWithEntities(
      request.story,
      entities,
      request.selectedDirector,
      request.allDirectors,
      request.titleCardOptions,
      request.promptOptions,
      request.storyDirectorNotes
    )

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Entity-based story generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}