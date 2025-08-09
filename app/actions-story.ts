"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

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

function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

function buildFilmDirectorStyle(d?: {
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
}) {
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

export async function generateBreakdown(
  story: string,
  director: string,
  titleCardOptions: { enabled: boolean; format: "full" | "name-only" | "roman-numerals"; approaches: string[] },
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean; includeColorPalette: boolean },
  directorNotes = "",
) {
  assertAIEnv()

  const { object: storyStructure } = await generateObject({
    model: openai("gpt-4o"),
    schema: StoryStructureSchema,
    prompt: prompts.structureDetection,
    system: `You are a professional script supervisor and editor. STORY: """${story}"""`,
  })

  const chapterBreakdowns = await Promise.all(
    (storyStructure.chapters || []).map(async (chapter) => {
      const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

      let prompt = prompts.chapterBreakdown
        .replace("{directorStyle}", directorStyle)
        .replace("{directorNotes}", directorNotes || "None")

      if (!promptOptions.includeCameraStyle) {
        prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
      }
      if (!promptOptions.includeColorPalette) {
        prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
      }

      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: ChapterBreakdownSchema,
        prompt,
        system: `Create a visual breakdown. CHAPTER CONTENT: """${chapter.content}"""`,
      })

      if (titleCardOptions.enabled) {
        const { object: tc } = await generateObject({
          model: openai("gpt-4o"),
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
    }),
  )

  return {
    storyStructure,
    chapterBreakdowns,
    overallAnalysis: "Initial breakdown complete.",
  }
}

export async function generateAdditionalChapterShots(
  args: {
    story: string
    director: string
    storyStructure: any
    chapterId: string
    existingBreakdown: any
    existingAdditionalShots: string[]
    categories: string[]
    customRequest: string
  },
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean; includeColorPalette: boolean },
  directorNotes = "",
) {
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

  const chapter = storyStructure.chapters.find((c: any) => c.id === chapterId)
  if (!chapter) throw new Error("Chapter not found")

  const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
  const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

  let prompt = prompts.additionalShots
    .replace("{categories}", categories.join(", "))
    .replace("{directorStyle}", directorStyle)
    .replace("{directorNotes}", directorNotes || "None")
    .replace("{customRequest}", customRequest || "")

  if (!promptOptions.includeCameraStyle) prompt += `\nIMPORTANT: Minimize detailed camera moves.`
  if (!promptOptions.includeColorPalette) prompt += `\nIMPORTANT: Minimize detailed color/lighting.`

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: AdditionalShotsSchema,
    prompt,
    system: `Expand the shot list. CHAPTER CONTENT: """${chapter.content}""". EXISTING SHOTS: """${[
      ...(existingBreakdown?.shots || []),
      ...(existingAdditionalShots || []),
    ].join("\n")}"""`,
  })

  return object
}
