/**
 * Story service for generating story breakdowns and additional shots
 */
"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { assertAIEnv, AI_MODEL, ServiceError } from "./base"

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

// ===== Prompts =====
const prompts = {
  structureDetection: `Analyze the following text and split it into logical chapters. Identify the narrative beat for each chapter (setup, rising-action, climax, resolution). Provide a unique ID, a concise title, the full content, start/end character positions, estimated screen time, key characters, and primary location for each chapter. Ensure the entire text is covered. Return ONLY JSON.`,
  
  chapterBreakdown: `You are a world-class cinematographer creating a visual breakdown for a story chapter.

DIRECTOR STYLE PROFILE:
{directorStyle}

CREATIVE DIRECTION NOTES:
{directorNotes}

Generate a shot list that authentically reflects this director's style (framing, movement, lighting, pacing). Identify character/location/prop references and provide coverage analysis and additional opportunities. Ensure references begin with "@" handles if applicable. Return ONLY JSON.`,

  additionalShots: `Expand a shot list with distinct new shots for categories: {categories}.

DIRECTOR STYLE PROFILE:
{directorStyle}

CREATIVE DIRECTION NOTES:
{directorNotes}

CUSTOM REQUEST: {customRequest}

Return ONLY JSON with 'newShots' and 'coverageAnalysis'.`,

  titleCard: `Design {count} unique title card concepts for the chapter "{chapterTitle}". For each, provide 'styleLabel' and a detailed 'description'. Approaches: {approaches}. Return ONLY JSON.`,
}

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
    try {
      assertAIEnv()

      // Generate story structure
      const { object: storyStructure } = await generateObject({
        model: AI_MODEL,
        schema: StoryStructureSchema,
        prompt: prompts.structureDetection,
        system: `You are a professional script supervisor and editor. STORY: """${story}"""`,
      })

      // Generate chapter breakdowns
      const chapterBreakdowns = await Promise.all(
        (storyStructure.chapters || []).map(async (chapter) => {
          const selectedDirectorInfo = customDirectors.find((d) => d.name === director || (d as any).id === director)
          const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

          let prompt = prompts.chapterBreakdown
            .replace("{directorStyle}", directorStyle)
            .replace("{directorNotes}", directorNotes || "None")

          // Apply prompt options
          if (!promptOptions.includeCameraStyle) {
            prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
          }
          if (!promptOptions.includeColorPalette) {
            prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
          }

          const { object: breakdown } = await generateObject({
            model: AI_MODEL,
            schema: ChapterBreakdownSchema,
            prompt,
            system: `Create a visual breakdown. CHAPTER CONTENT: """${chapter.content}"""`,
          })

          // Generate title cards if enabled
          if (titleCardOptions.enabled) {
            const { object: tc } = await generateObject({
              model: AI_MODEL,
              schema: z.object({ titleCards: z.array(TitleCardSchema) }),
              prompt: prompts.titleCard
                .replace("{count}", "3")
                .replace("{chapterTitle}", chapter.title)
                .replace("{approaches}", (titleCardOptions.approaches || []).join(", ")),
              system: "You are a creative title designer.",
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
    } catch (error) {
      throw new ServiceError(
        `Failed to generate story breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORY_BREAKDOWN_FAILED',
        { story: story.substring(0, 100) + '...', director }
      )
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

      const selectedDirectorInfo = customDirectors.find((d) => d.name === director || (d as any).id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)
      const chapter = storyStructure.chapters?.find((c) => c.id === chapterId)

      if (!chapter) {
        throw new ServiceError("Chapter not found", 'CHAPTER_NOT_FOUND', { chapterId })
      }

      let prompt = prompts.additionalShots
        .replace("{categories}", categories.join(", "))
        .replace("{directorStyle}", directorStyle)
        .replace("{directorNotes}", directorNotes || "None")
        .replace("{customRequest}", customRequest || "General shot variety")

      // Apply prompt options
      if (!promptOptions.includeCameraStyle) {
        prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
      }
      if (!promptOptions.includeColorPalette) {
        prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
      }

      const systemPrompt = `You are generating additional shots for a chapter. Avoid duplicating these existing shots:
EXISTING: ${[...existingBreakdown.shots, ...existingAdditionalShots].join(", ")}
CHAPTER: "${chapter.title}" - ${chapter.content.substring(0, 200)}...`

      const { object } = await generateObject({
        model: AI_MODEL,
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