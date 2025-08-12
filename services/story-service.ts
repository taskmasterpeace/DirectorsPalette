/**
 * Story service for generating story breakdowns and additional shots
 */

import { generateObject } from "ai"
import { z } from "zod"
import { assertAIEnv, getAIConfig, getPrompt, ServiceError } from "./base"
import { validateServerInput } from "@/lib/validation/validator"
import { StoryInputSchema, AdditionalShotsRequestSchema } from "@/lib/validation/schemas"
import { storyRateLimiter } from "@/lib/security/rate-limiter"
import { cacheAIGeneration, withPerformanceMonitoring, CacheKeys } from "@/lib/cache"
import { generateContentHash } from "@/lib/security/security-utils"

// ===== Schemas =====
const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  startPosition: z.number(),
  endPosition: z.number(),
  estimatedDuration: z.string(),
  keyCharacters: z.array(z.string()),
  primaryLocation: z.string(),
  narrativeBeat: z.enum(["setup", "rising-action", "climax", "resolution"]),
})

const StoryStructureSchema = z.object({
  chapters: z.array(ChapterSchema),
  detectionMethod: z.enum(["existing", "ai-generated", "hybrid"]),
  totalChapters: z.number(),
  fullStory: z.string(),
})

const TitleCardSchema = z.object({
  id: z.string(),
  styleLabel: z.string(),
  description: z.string(),
})

const ChapterBreakdownSchema = z.object({
  chapterId: z.string(),
  characterReferences: z.array(z.string()),
  locationReferences: z.array(z.string()),
  propReferences: z.array(z.string()),
  shots: z.array(z.string()),
  coverageAnalysis: z.string(),
  additionalOpportunities: z.array(z.string()),
  titleCards: z.array(TitleCardSchema).optional(),
})

const AdditionalShotsSchema = z.object({
  newShots: z.array(z.string()),
  coverageAnalysis: z.string(),
})

// ===== Types =====
export type StoryStructure = z.infer<typeof StoryStructureSchema>
export type Chapter = z.infer<typeof ChapterSchema>
export type ChapterBreakdown = z.infer<typeof ChapterBreakdownSchema>
export type TitleCard = z.infer<typeof TitleCardSchema>
export type AdditionalShots = z.infer<typeof AdditionalShotsSchema>

export interface TitleCardOptions {
  enabled: boolean
  format: "full" | "name-only" | "roman-numerals"
  approaches: string[]
}

export interface PromptOptions {
  includeCameraStyle: boolean
  includeColorPalette: boolean
}

export interface DirectorInfo {
  name?: string
  description?: string
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  disciplines?: string[]
  tags?: string[]
  category?: string
}

// ===== Utilities =====
function buildFilmDirectorStyle(d?: DirectorInfo): string {
  if (!d) return "Standard, balanced coverage focusing on clarity and storytelling."
  
  const visual = d.visualLanguage || [d.visualStyle, d.cameraStyle].filter(Boolean).join("; ")
  
  return [
    `DIRECTOR: ${d.name || "Unknown"}`,
    d.description && `DESCRIPTION: ${d.description}`,
    visual && `VISUAL LANGUAGE: ${visual}`,
    d.colorPalette && `COLOR PALETTE: ${d.colorPalette}`,
    d.narrativeFocus && `NARRATIVE FOCUS: ${d.narrativeFocus}`,
    d.category && `CATEGORY: ${d.category}`,
    d.disciplines?.length ? `DISCIPLINES: ${d.disciplines.join(", ")}` : null,
    d.tags?.length ? `STYLE TAGS: ${d.tags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

// Prompts are now loaded from configuration files

// ===== Service =====
export class StoryService {
  /**
   * Generate complete story breakdown with chapters and shots
   */
  static async generateBreakdown(
    story: string,
    director: string,
    titleCardOptions: TitleCardOptions,
    customDirectors: DirectorInfo[],
    promptOptions: PromptOptions,
    directorNotes = ""
  ) {
    return withPerformanceMonitoring('story-breakdown-generation', async () => {
      try {
        assertAIEnv()
        
        // Validate and sanitize input
        const validatedInput = validateServerInput(
          StoryInputSchema,
          { story, selectedDirector: director, directorNotes },
          { sanitize: true, moderate: true, rateLimit: { key: 'story-generation', limit: 10, windowMs: 300000 } }
        )
        
        // Use validated input
        const sanitizedStory = validatedInput.story
        const sanitizedDirectorNotes = validatedInput.directorNotes || ""
        
        // Create cache key from input data
        const inputData = {
          story: sanitizedStory,
          director,
          titleCardOptions,
          customDirectors,
          promptOptions,
          directorNotes: sanitizedDirectorNotes
        }
        
        return cacheAIGeneration(
          'story-breakdown',
          inputData,
          async () => {
            return this._generateBreakdownInternal(
              sanitizedStory,
              director,
              titleCardOptions,
              customDirectors,
              promptOptions,
              sanitizedDirectorNotes
            )
          }
        )
      } catch (error) {
        throw new ServiceError(
          `Failed to generate story breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'STORY_BREAKDOWN_FAILED',
          { director, storyLength: story.length }
        )
      }
    })()
  }
  
  /**
   * Internal method for generating breakdown (cached)
   */
  private static async _generateBreakdownInternal(
    sanitizedStory: string,
    director: string,
    titleCardOptions: TitleCardOptions,
    customDirectors: DirectorInfo[],
    promptOptions: PromptOptions,
    sanitizedDirectorNotes: string
  ) {
      
      const aiConfig = await getAIConfig()

      // Generate story structure
      const structurePrompt = await getPrompt('story-prompts', 'storyStructureDetection')
      const structureSystemPrompt = await getPrompt('story-prompts', 'systemPrompts.structureAnalysis', { story: sanitizedStory })

      const { object: storyStructure } = await generateObject({
        model: aiConfig.model,
        schema: StoryStructureSchema,
        prompt: structurePrompt,
        system: structureSystemPrompt,
      })

      // Generate chapter breakdowns
      const chapterBreakdowns = await Promise.all(
        (storyStructure.chapters || []).map(async (chapter) => {
          const selectedDirectorInfo = customDirectors.find((d) => d.name === director || (d as any).id === director)
          const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

          let prompt = await getPrompt('story-prompts', 'chapterBreakdown', {
            directorStyle,
            directorNotes: sanitizedDirectorNotes || "None"
          })

          // Apply prompt options
          const includeCameraStyle = promptOptions?.includeCameraStyle ?? true
          const includeColorPalette = promptOptions?.includeColorPalette ?? true
          
          if (!includeCameraStyle) {
            prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
          }
          if (!includeColorPalette) {
            prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
          }

          const systemPrompt = await getPrompt('story-prompts', 'systemPrompts.chapterBreakdown', {
            chapterContent: chapter.content
          })

          const { object: breakdown } = await generateObject({
            model: aiConfig.model,
            schema: ChapterBreakdownSchema,
            prompt,
            system: systemPrompt,
          })

          // Generate title cards if enabled
          if (titleCardOptions.enabled) {
            const titleCardPrompt = await getPrompt('story-prompts', 'titleCard', {
              count: "3",
              chapterTitle: chapter.title,
              approaches: (titleCardOptions.approaches || []).join(", ")
            })
            
            const titleSystemPrompt = await getPrompt('story-prompts', 'systemPrompts.titleDesigner')

            const { object: tc } = await generateObject({
              model: aiConfig.model,
              schema: z.object({ titleCards: z.array(TitleCardSchema) }),
              prompt: titleCardPrompt,
              system: titleSystemPrompt,
            })
            ;(breakdown as any).titleCards = tc.titleCards
          }

          return {
            ...breakdown,
            chapterId: breakdown.chapterId || chapter.id,
          }
        })
      )

      return {
        storyStructure,
        chapterBreakdowns,
        overallAnalysis: "Initial breakdown complete.",
      }
  }

  /**
   * Generate additional shots for a specific chapter
   */
  static async generateAdditionalShots(
    args: {
      story: string
      director: string
      storyStructure: StoryStructure
      chapterId: string
      existingBreakdown: ChapterBreakdown
      existingAdditionalShots: string[]
      categories: string[]
      customRequest: string
    },
    customDirectors: DirectorInfo[],
    promptOptions: PromptOptions,
    directorNotes = ""
  ): Promise<AdditionalShots> {
    return withPerformanceMonitoring('story-additional-shots-generation', async () => {
      try {
        assertAIEnv()
        
        const {
          story,
          director,
          storyStructure,
          chapterId,
          existingBreakdown,
          existingAdditionalShots,
          categories,
          customRequest,
        } = args
        
        // Validate and sanitize input
        const validatedInput = validateServerInput(
          AdditionalShotsRequestSchema,
          { customRequest },
          { sanitize: true, moderate: true, rateLimit: { key: 'additional-shots-generation', limit: 15, windowMs: 300000 } }
        )
        
        // Create cache key from input data
        const inputData = {
          ...args,
          customDirectors,
          promptOptions,
          directorNotes
        }
        
        return cacheAIGeneration(
          'additional-shots',
          inputData,
          async () => {
            return this._generateAdditionalShotsInternal(args, customDirectors, promptOptions, directorNotes)
          }
        )
      } catch (error) {
        throw new ServiceError(
          `Failed to generate additional shots: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'ADDITIONAL_SHOTS_FAILED',
          { chapterId: args.chapterId, categories: args.categories }
        )
      }
    })()
  }
  
  /**
   * Internal method for generating additional shots (cached)
   */
  private static async _generateAdditionalShotsInternal(
    args: {
      story: string
      director: string
      storyStructure: StoryStructure
      chapterId: string
      existingBreakdown: ChapterBreakdown
      existingAdditionalShots: string[]
      categories: string[]
      customRequest: string
    },
    customDirectors: DirectorInfo[],
    promptOptions: PromptOptions,
    directorNotes = ""
  ): Promise<AdditionalShots> {
    try {
      assertAIEnv()
      
      const {
        story,
        director,
        storyStructure,
        chapterId,
        existingBreakdown,
        existingAdditionalShots,
        categories,
        customRequest,
      } = args

      const aiConfig = await getAIConfig()
      
      const selectedDirectorInfo = customDirectors.find((d) => d.name === director || (d as any).id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)
      const chapter = storyStructure.chapters?.find((c) => c.id === chapterId)

      if (!chapter) {
        throw new ServiceError("Chapter not found", 'CHAPTER_NOT_FOUND', { chapterId })
      }

      let prompt = await getPrompt('story-prompts', 'additionalShots', {
        categories: categories.join(", "),
        directorStyle,
        directorNotes: directorNotes || "None",
        customRequest: customRequest || "General shot variety"
      })

      // Apply prompt options
      if (!promptOptions.includeCameraStyle) {
        prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
      }
      if (!promptOptions.includeColorPalette) {
        prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
      }

      const systemPrompt = await getPrompt('story-prompts', 'systemPrompts.additionalShots', {
        existingShots: [...existingBreakdown.shots, ...existingAdditionalShots].join(", "),
        chapterTitle: chapter.title,
        chapterContent: chapter.content.substring(0, 200) + "..."
      })

      const { object } = await generateObject({
        model: aiConfig.model,
        schema: AdditionalShotsSchema,
        prompt,
        system: systemPrompt,
      })

      return object
    } catch (error) {
      throw new ServiceError(
        `Failed to generate additional shots: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADDITIONAL_SHOTS_FAILED',
        { chapterId: args.chapterId, categories: args.categories }
      )
    }
  }
}