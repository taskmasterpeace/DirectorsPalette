/**
 * Unified Generation Service
 * Single source of truth for all AI generation operations
 */

import { z } from 'zod'

// ============ SHARED TYPES ============
export interface GenerationResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Reference {
  id: string
  reference: string  // @reference format
  name: string
  description: string
  type?: string
  appearances?: string[]
}

export interface ReferenceSet {
  characters: Reference[]
  locations: Reference[]
  props: Reference[]
  themes?: string[]
  additionalContext?: Record<string, any>
}

export interface Shot {
  id: string
  description: string
  cameraMovement?: string
  colorAndLighting?: string
  references?: {
    characters: string[]
    locations: string[]
    props: string[]
  }
}

export interface Breakdown {
  id: string
  title: string
  sections: Section[]
  references: ReferenceSet
  metadata: {
    generatedAt: string
    director?: string
    directorNotes?: string
    [key: string]: any
  }
}

export interface Section {
  id: string
  title: string
  content?: string
  shots: Shot[]
  analysis?: string
  additionalInfo?: Record<string, any>
}

// ============ SERVICE INTERFACE ============
export interface GenerationService {
  // Reference extraction
  extractReferences(config: ExtractReferencesConfig): Promise<GenerationResult<ReferenceSet>>
  
  // Breakdown generation
  generateBreakdown(config: GenerateBreakdownConfig): Promise<GenerationResult<Breakdown>>
  
  // Additional shots
  generateAdditionalShots(config: AdditionalShotsConfig): Promise<GenerationResult<Shot[]>>
  
  // Utility
  validateReferences(refs: ReferenceSet): ReferenceSet
  sanitizeReference(ref: string): string
}

// ============ CONFIGURATION TYPES ============
export interface ExtractReferencesConfig {
  mode: 'story' | 'music-video'
  content: string
  metadata?: {
    title?: string
    artist?: string
    director?: string
    directorNotes?: string
    concept?: string
    [key: string]: any
  }
}

export interface GenerateBreakdownConfig {
  mode: 'story' | 'music-video'
  content: string
  references?: ReferenceSet
  director?: string
  directorNotes?: string
  options?: {
    chapterMethod?: string
    chapterCount?: number
    includeAnalysis?: boolean
    [key: string]: any
  }
}

export interface AdditionalShotsConfig {
  mode: 'story' | 'music-video'
  sectionId: string
  existingShots: Shot[]
  references: ReferenceSet
  categories?: string[]
  customRequest?: string
  director?: string
}

// ============ SCHEMA DEFINITIONS ============
// Flexible schemas that won't break on unexpected data
export const ReferenceSchema = z.object({
  id: z.string().optional(),
  reference: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  appearances: z.array(z.string()).optional()
}).transform(data => ({
  id: data.id || `ref-${Date.now()}-${Math.random()}`,
  reference: data.reference || `@${data.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: data.name,
  description: data.description || '',
  type: data.type,
  appearances: data.appearances
}))

export const ReferenceSetSchema = z.object({
  characters: z.array(ReferenceSchema).optional().default([]),
  locations: z.array(ReferenceSchema).optional().default([]),
  props: z.array(ReferenceSchema).optional().default([]),
  themes: z.array(z.string()).optional().default([]),
  additionalContext: z.record(z.any()).optional()
})

export const ShotSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  cameraMovement: z.string().optional(),
  colorAndLighting: z.string().optional(),
  references: z.object({
    characters: z.array(z.string()).optional().default([]),
    locations: z.array(z.string()).optional().default([]),
    props: z.array(z.string()).optional().default([])
  }).optional()
}).transform(data => ({
  id: data.id || `shot-${Date.now()}-${Math.random()}`,
  description: data.description,
  cameraMovement: data.cameraMovement,
  colorAndLighting: data.colorAndLighting,
  references: data.references || { characters: [], locations: [], props: [] }
}))

// ============ IMPLEMENTATION ============
class UnifiedGenerationService implements GenerationService {
  async extractReferences(config: ExtractReferencesConfig): Promise<GenerationResult<ReferenceSet>> {
    try {
      // Route to appropriate extraction based on mode
      if (config.mode === 'story') {
        const { extractStoryReferences } = await import('@/app/actions/story')
        const result = await extractStoryReferences(
          config.content,
          config.metadata?.director,
          config.metadata?.directorNotes
        )
        return this.normalizeResult(result)
      } else {
        const { extractMusicVideoReferences } = await import('@/app/actions/music-video')
        const result = await extractMusicVideoReferences(
          config.metadata?.title || '',
          config.metadata?.artist || '',
          config.content,
          config.metadata?.director,
          config.metadata?.directorNotes,
          config.metadata?.concept
        )
        return this.normalizeResult(result)
      }
    } catch (error) {
      console.error('Extract references error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract references'
      }
    }
  }

  async generateBreakdown(config: GenerateBreakdownConfig): Promise<GenerationResult<Breakdown>> {
    try {
      if (config.mode === 'story') {
        const { generateStoryBreakdownWithReferences } = await import('@/app/actions/story')
        const result = await generateStoryBreakdownWithReferences(
          config.content,
          config.director || '',
          config.directorNotes || '',
          config.references || { characters: [], locations: [], props: [] },
          {}, // titleCardOptions
          {}, // promptOptions
          config.options?.chapterMethod || 'ai-suggested',
          config.options?.chapterCount || 4
        )
        return this.normalizeBreakdown(result, 'story')
      } else {
        const { generateMusicVideoBreakdownWithReferences } = await import('@/app/actions/music-video')
        // Implement music video breakdown normalization
        // For now, return placeholder
        return {
          success: false,
          error: 'Music video breakdown normalization not yet implemented'
        }
      }
    } catch (error) {
      console.error('Generate breakdown error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate breakdown'
      }
    }
  }

  async generateAdditionalShots(config: AdditionalShotsConfig): Promise<GenerationResult<Shot[]>> {
    try {
      if (config.mode === 'story') {
        const { generateAdditionalChapterShots } = await import('@/app/actions/story')
        // Call with proper parameters
        const result = await generateAdditionalChapterShots(
          { id: config.sectionId, content: '', shots: config.existingShots.map(s => s.description) },
          'Story',
          config.director || '',
          config.categories || [],
          config.customRequest || ''
        )
        
        if (result.success && result.data) {
          const shots = result.data.map((desc: string) => ({
            id: `shot-${Date.now()}-${Math.random()}`,
            description: desc,
            references: this.extractReferencesFromText(desc)
          }))
          return { success: true, data: shots }
        }
        return { success: false, error: result.error }
      } else {
        const { generateAdditionalMusicVideoShots } = await import('@/app/actions/music-video')
        // Implement music video additional shots
        return {
          success: false,
          error: 'Music video additional shots not yet implemented'
        }
      }
    } catch (error) {
      console.error('Generate additional shots error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate additional shots'
      }
    }
  }

  validateReferences(refs: ReferenceSet): ReferenceSet {
    // Ensure all references have proper format
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
      })),
      themes: refs.themes
    }
  }

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

  // ============ PRIVATE HELPERS ============
  private normalizeResult(result: any): GenerationResult<ReferenceSet> {
    if (!result.success) {
      return { success: false, error: result.error }
    }

    try {
      const normalized = ReferenceSetSchema.parse(result.data)
      return { success: true, data: this.validateReferences(normalized) }
    } catch (error) {
      console.warn('Failed to normalize result, using raw data:', error)
      return { success: true, data: result.data }
    }
  }

  private normalizeBreakdown(result: any, mode: 'story' | 'music-video'): GenerationResult<Breakdown> {
    if (!result.success) {
      return { success: false, error: result.error }
    }

    try {
      // Convert story format to unified format
      if (mode === 'story' && result.data) {
        const breakdown: Breakdown = {
          id: `breakdown-${Date.now()}`,
          title: result.data.storyTitle || 'Story',
          sections: (result.data.chapterBreakdowns || []).map((cb: any, idx: number) => ({
            id: cb.chapterId || `chapter-${idx}`,
            title: result.data.chapters?.[idx]?.title || `Chapter ${idx + 1}`,
            content: result.data.chapters?.[idx]?.content,
            shots: (cb.shots || []).map((shot: any) => ({
              id: `shot-${Date.now()}-${Math.random()}`,
              description: typeof shot === 'string' ? shot : shot.description,
              references: this.extractReferencesFromText(typeof shot === 'string' ? shot : shot.description)
            })),
            analysis: cb.coverageAnalysis,
            additionalInfo: {
              characterDescriptions: cb.characterDescriptions,
              locationDescriptions: cb.locationDescriptions,
              propDescriptions: cb.propDescriptions
            }
          })),
          references: {
            characters: [],
            locations: [],
            props: [],
            themes: []
          },
          metadata: {
            generatedAt: result.data.generatedAt || new Date().toISOString(),
            director: result.data.director,
            directorNotes: result.data.directorNotes
          }
        }
        return { success: true, data: breakdown }
      }

      return { success: true, data: result.data }
    } catch (error) {
      console.warn('Failed to normalize breakdown, using raw data:', error)
      return { success: true, data: result.data }
    }
  }

  private extractReferencesFromText(text: string): { characters: string[], locations: string[], props: string[] } {
    const references = {
      characters: [] as string[],
      locations: [] as string[],
      props: [] as string[]
    }

    // Extract @references from text
    const matches = text.match(/@\w+/g) || []
    matches.forEach(match => {
      // Simple heuristic - could be improved with context
      references.characters.push(match)
    })

    return references
  }
}

// ============ SINGLETON EXPORT ============
export const generationService = new UnifiedGenerationService()