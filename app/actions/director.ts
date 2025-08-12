'use server'

import { DirectorService } from '@/services'
import type { FilmDirector, MusicVideoDirector } from '@/lib/director-types'

export async function generateDirectorStyle(
  name: string,
  description: string,
  type: 'film' | 'music-video'
) {
  try {
    const result = await DirectorService.generateStyleDetails(name, description, type)
    return result
  } catch (error) {
    console.error('Error generating director style:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate director style'
    }
  }
}

export async function generateDirectorQuestions(
  director: FilmDirector | MusicVideoDirector,
  story?: string
) {
  try {
    // TODO: Implement director question generation
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error('Error generating director questions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate director questions'
    }
  }
}