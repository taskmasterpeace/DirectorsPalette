'use server'

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { generateFullMusicVideoBreakdown } from './breakdown'
import { retryAIGeneration } from '@/lib/ai-utils'
import type { ArtistProfile } from '@/lib/artist-types'
import type { MusicVideoConfig } from '@/lib/indexeddb'

const MusicVideoReferencesSchema = z.object({
  locations: z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(['interior', 'exterior', 'studio', 'abstract', 'mixed'])
  })).optional(),
  wardrobe: z.array(z.object({
    name: z.string(),
    description: z.string(),
    style: z.enum(['casual', 'formal', 'costume', 'performance', 'avant-garde', 'period'])
  })).optional(),
  props: z.array(z.object({
    name: z.string(),
    description: z.string(),
    purpose: z.enum(['narrative', 'symbolic', 'performance', 'decorative', 'interactive', 'abstract']).optional()
  })).optional(),
  visualThemes: z.array(z.string()).optional()
})

export async function extractMusicVideoReferences(
  songTitle: string,
  artist: string,
  lyrics: string,
  director?: string,
  directorNotes?: string,
  mvConcept?: string
) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured'
    }
  }

  try {
    // Use retry wrapper for better reliability
    const result = await retryAIGeneration(async () => {
      const prompt = `
Extract visual references for a music video based on the following:

Song: "${songTitle}" by ${artist}
Lyrics:
${lyrics}

${mvConcept ? `\nConcept: ${mvConcept}` : ''}
${director ? `\nDirector Style: ${director}` : ''}
${directorNotes ? `\nDirector's Notes: ${directorNotes}` : ''}

Analyze the song and extract:
1. Location suggestions that fit the mood and narrative
2. Wardrobe ideas that match the artist and song theme
3. Props that could enhance the visual storytelling
4. Visual themes that emerge from the lyrics

Be specific and creative while staying true to the song's essence.
`

      try {
        // Try with strict schema first
        const { object } = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: MusicVideoReferencesSchema,
          prompt
        })
        return object
      } catch (schemaError) {
        console.warn('Strict schema failed, trying flexible approach:', schemaError)
        
        // Fallback to text generation and manual parsing
        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: prompt + '\n\nReturn as JSON format.'
        })
        
        // Try to parse the text as JSON
        const parsed = JSON.parse(text)
        
        // Clean up the data to match schema
        return {
          locations: parsed.locations || [],
          wardrobe: parsed.wardrobe || [],
          props: (parsed.props || []).map((p: any) => ({
            ...p,
            purpose: ['narrative', 'symbolic', 'performance', 'decorative', 'interactive', 'abstract']
              .includes(p.purpose) ? p.purpose : 'decorative'
          })),
          visualThemes: parsed.visualThemes || []
        }
      }
    }, 2) // Only retry twice for references
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Error extracting music video references:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract references'
    }
  }
}

export async function generateMusicVideoBreakdownWithReferences(
  songTitle: string,
  artist: string,
  genre: string,
  lyrics: string,
  director: string,
  directorNotes: string,
  mvConcept: string,
  configuredReferences: any,
  artistProfile: ArtistProfile | null,
  musicVideoConfig: MusicVideoConfig | null
) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured'
    }
  }

  try {
    console.log('generateMusicVideoBreakdownWithReferences called with:', {
      songTitle,
      artist,
      hasConfiguredRefs: !!configuredReferences,
      hasMusicVideoConfig: !!musicVideoConfig
    })
    
    // Merge configured references with music video config
    const mergedConfig: MusicVideoConfig = {
      isConfigured: true, // CRITICAL: Mark as configured so breakdown generates shots
      locations: [
        ...(musicVideoConfig?.locations || []),
        ...(configuredReferences?.locations || []).map((loc: any, i: number) => ({
          reference: `L${i + 1}`,
          name: loc.name,
          description: loc.description
        }))
      ],
      wardrobe: [
        ...(musicVideoConfig?.wardrobe || []),
        ...(configuredReferences?.wardrobe || []).map((item: any, i: number) => ({
          reference: `W${i + 1}`,
          name: item.name,
          description: item.description
        }))
      ],
      props: [
        ...(musicVideoConfig?.props || []),
        ...(configuredReferences?.props || []).map((prop: any, i: number) => ({
          reference: `P${i + 1}`,
          name: prop.name,
          description: prop.description
        }))
      ],
      // Include visual themes if provided
      visualThemes: configuredReferences?.visualThemes || musicVideoConfig?.visualThemes || []
    }

    console.log('Merged config:', {
      isConfigured: mergedConfig.isConfigured,
      locationsCount: mergedConfig.locations.length,
      wardrobeCount: mergedConfig.wardrobe.length,
      propsCount: mergedConfig.props.length,
      themesCount: mergedConfig.visualThemes?.length || 0
    })
    
    // Generate breakdown with references
    const result = await generateFullMusicVideoBreakdown({
      songTitle,
      artistName: artist,
      lyrics,
      director,
      directorNotes,
      artistProfile,
      includeVisualMetaphors: true,
      includePerformanceShots: true,
      includeLocationScout: true,
      musicVideoConfig: mergedConfig
    })

    console.log('generateFullMusicVideoBreakdown result:', {
      success: result.success,
      hasData: !!result.data,
      hasBreakdown: !!result.data?.breakdown,
      sectionBreakdownsCount: result.data?.breakdown?.sectionBreakdowns?.length || 0
    })

    if (result.success && result.data) {
      console.log('generateMusicVideoBreakdownWithReferences returning:', {
        hasBreakdown: !!result.data.breakdown,
        hasSections: !!result.data.breakdown?.sections,
        hasSectionBreakdowns: !!result.data.breakdown?.sectionBreakdowns,
        sectionBreakdownsLength: result.data.breakdown?.sectionBreakdowns?.length
      })
      
      // Return the breakdown with all its data
      return {
        success: true,
        data: {
          ...result.data.breakdown,
          isConfigured: true,
          configuredReferences,
          musicVideoConfig: mergedConfig
        }
      }
    } else {
      throw new Error(result.error || 'Failed to generate breakdown')
    }
  } catch (error) {
    console.error('Error generating music video with references:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate breakdown'
    }
  }
}