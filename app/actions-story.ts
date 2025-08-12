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

const ReferenceDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
})

const ChapterBreakdownSchema = z.object({
  chapterId: z.string(),
  characterReferences: z.array(z.string()),
  locationReferences: z.array(z.string()),
  propReferences: z.array(z.string()),
  characterDescriptions: z.array(ReferenceDescriptionSchema).optional(),
  locationDescriptions: z.array(ReferenceDescriptionSchema).optional(),
  propDescriptions: z.array(ReferenceDescriptionSchema).optional(),
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
  structureDetection: `Analyze the following text and split it into 3-5 logical chapters maximum. Focus on major story beats and natural narrative breaks, not minor scene changes. Each chapter should be substantial (multiple paragraphs or story sections).

REQUIRED JSON FORMAT - You MUST include ALL these fields:
{
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter Title",
      "content": "Full chapter text content",
      "startPosition": 0,
      "endPosition": 500,
      "estimatedDuration": "2-3 minutes",
      "keyCharacters": ["character1", "character2"],
      "primaryLocation": "location name",
      "narrativeBeat": "setup" // REQUIRED: Must be one of: "setup", "rising-action", "climax", or "resolution"
    }
  ],
  "detectionMethod": "ai-generated",  
  "totalChapters": [number],
  "fullStory": "[the complete original story text]"
}

CRITICAL: Every chapter MUST have a "narrativeBeat" field with one of these exact values: "setup", "rising-action", "climax", or "resolution"

Return ONLY JSON matching this exact schema.`,
  chapterBreakdown: `You are a world-class cinematographer creating a visual breakdown for a story chapter.

BALANCE REQUIREMENTS:
- Director Notes: PRIMARY creative guidance (highest priority) 
- Director Style: Core aesthetic framework (enhanced by director notes)

DIRECTOR NOTES (HIGHEST PRIORITY - GUIDES DIRECTOR STYLE):
{directorNotes}

DIRECTOR STYLE PROFILE:
{directorStyle}

CRITICAL SHOT REQUIREMENTS:
- For DIALOGUE scenes: MUST include over-the-shoulder (OTS) shots using this exact format:
  "Over-the-shoulder view from behind [Character A] ([appearance description]), looking at [Character B] ([appearance description]) at [location], [Character A]'s shoulder prominently in frame, [Character B's action/expression], [atmosphere/lighting]"
  
- For CONVERSATIONS: Provide full coverage:
  1. Establishing two-shot
  2. OTS from Character A to B
  3. Reverse OTS from B to A  
  4. Close-ups for emotional beats
  5. Return to two-shot for resolution

- For ACTION: Mix wide shots (geography) with close-ups (impact)
- For EMOTIONAL moments: Hold on close-ups, include reaction shots

Generate a shot list that authentically reflects this director's style. Each shot should be a complete, detailed image prompt.

REFERENCE FORMATTING & DESCRIPTIONS:
- Use clean @reference handles: @protagonist, @sarah_young, @apartment, @gun
- Format: "[Shot description] featuring @character_name at @location_name with @prop_name"
- Keep references consistent and descriptive
- For each reference, provide a brief director-style description:
  - Characters: Physical appearance and personality in director's visual language
  - Locations: Atmospheric qualities and visual tone in director's style
  - Props: Visual significance and symbolic meaning in the narrative

CRITICAL JSON FORMAT REQUIREMENTS:
- chapterId: string (required)
- characterReferences: array of strings (required, e.g., ["protagonist", "sarah_young"])
- locationReferences: array of strings (required, e.g., ["apartment", "street"]) 
- propReferences: array of strings (required, e.g., ["gun", "phone"])
- characterDescriptions: array of {name, description} objects with director-style descriptions
- locationDescriptions: array of {name, description} objects with atmospheric qualities
- propDescriptions: array of {name, description} objects with visual significance
- shots: array of STRINGS (not objects, just plain text descriptions)
- coverageAnalysis: string (required)
- additionalOpportunities: array of strings (required)

Return ONLY JSON matching this exact schema.`,
  additionalShots: `Expand a shot list with distinct new shots for categories: {categories}.

BALANCE REQUIREMENTS:
- Director Notes: PRIMARY creative guidance (highest priority) 
- Director Style: Core aesthetic framework (enhanced by director notes)

DIRECTOR NOTES (HIGHEST PRIORITY - GUIDES DIRECTOR STYLE):
{directorNotes}

DIRECTOR STYLE PROFILE:
{directorStyle}

CUSTOM REQUEST: {customRequest}

REFERENCE FORMATTING & DESCRIPTIONS:
- Use clean @reference handles: @protagonist, @sarah_young, @apartment, @gun
- Format: "[Shot description] featuring @character_name at @location_name with @prop_name"
- Keep references consistent and descriptive
- For each reference, provide a brief director-style description:
  - Characters: Physical appearance and personality in director's visual language
  - Locations: Atmospheric qualities and visual tone in director's style
  - Props: Visual significance and symbolic meaning in the narrative

Return ONLY JSON with 'newShots' and 'coverageAnalysis'.`,
  titleCard: `Design {count} unique title card concepts for the chapter "{chapterTitle}". For each, provide 'styleLabel' and a detailed 'description'. Approaches: {approaches}. Return ONLY JSON.`,
}

export async function generateBreakdown(
  story: string,
  director: string,
  directorNotes: string = "",
  titleCardOptions?: { enabled: boolean; format: "full" | "name-only" | "roman-numerals"; approaches: string[] },
  promptOptions?: { includeCameraStyle?: boolean; includeColorPalette?: boolean } | null,
  chapterMethod: string = "ai-suggested",
  userChapterCount: number = 4
) {
  console.log('DEBUG: generateBreakdown called')
  
  try {
    assertAIEnv()
    
    console.log('🎬 STORY LENGTH:', story.length, 'characters')
  console.log('🎭 DIRECTOR SELECTED:', director)
  console.log('📝 DIRECTOR NOTES:', directorNotes || 'None')
  console.log('🚀 Starting structure detection (aiming for 3-5 chapters)...')
  console.log('DEBUG: titleCardOptions:', titleCardOptions)
  console.log('DEBUG: promptOptions:', promptOptions)
  console.log('DEBUG: chapterMethod:', chapterMethod)
  console.log('DEBUG: userChapterCount:', userChapterCount)

  console.log('DEBUG: About to call generateObject for structure...')
  let storyStructure
  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: StoryStructureSchema,
      prompt: prompts.structureDetection,
      system: `You are a professional script supervisor and editor. STORY: """${story}"""`,
    })
    storyStructure = result.object
    console.log('DEBUG: Structure generated successfully:', storyStructure)
  } catch (error) {
    console.error('ERROR generating structure:', error)
    throw error
  }

  console.log('✅ Structure detection completed, chapters:', storyStructure.chapters?.length || 0)
  console.log('DEBUG: Chapters:', JSON.stringify(storyStructure.chapters?.map(c => ({id: c.id, title: c.title, narrativeBeat: c.narrativeBeat}))))
  console.log('🎬 Starting chapter breakdowns for', storyStructure.chapters?.length || 0, 'chapters...')

  // Get custom directors from a store or pass empty array
  const customDirectors: any[] = []
  
  const chapterBreakdowns = await Promise.all(
    (storyStructure.chapters || []).map(async (chapter, index) => {
      // Cannot call client callbacks from server actions
      // Progress tracking must be handled client-side
      
      const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

      let prompt = prompts.chapterBreakdown
        .replace("{directorStyle}", directorStyle)
        .replace("{directorNotes}", directorNotes || "None")

      // Handle promptOptions safely for server-side execution
      const includeCameraStyle = promptOptions ? Boolean(promptOptions.includeCameraStyle) : true
      const includeColorPalette = promptOptions ? Boolean(promptOptions.includeColorPalette) : true
      
      if (!includeCameraStyle) {
        prompt += `\nIMPORTANT: Minimize detailed camera movement descriptions.`
      }
      if (!includeColorPalette) {
        prompt += `\nIMPORTANT: Minimize detailed color palette and lighting descriptions.`
      }

      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: ChapterBreakdownSchema,
        prompt,
        system: `Create a visual breakdown. CHAPTER CONTENT: """${chapter.content}"""`,
      })

      if (titleCardOptions?.enabled) {
        const { object: tc } = await generateObject({
          model: openai("gpt-4o-mini"),
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

  console.log('🎉 Generation completed successfully!')
  console.log('📊 Final result:', {
    chapters: storyStructure.chapters?.length || 0,
    breakdowns: chapterBreakdowns.length
  })

  // Progress callback removed - can't call client functions from server

  return {
    success: true,
    data: {
      storyStructure,
      chapterBreakdowns,
      chapters: storyStructure.chapters,
      overallAnalysis: "Initial breakdown complete.",
    }
  }
  } catch (error) {
    console.error('ERROR in generateBreakdown:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate breakdown'
    }
  }
}

export async function generateAdditionalChapterShots(
  chapter: any,
  storyTitle: string,
  director: string,
  categories: string[],
  customRequest: string,
  directorNotes: string = ""
) {
  assertAIEnv()
  
  if (!chapter) throw new Error("Chapter not found")
  
  // Get custom directors from a store or pass empty array
  const customDirectors: any[] = []
  const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
  const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

  let prompt = prompts.additionalShots
    .replace("{categories}", categories.join(", "))
    .replace("{directorStyle}", directorStyle)
    .replace("{directorNotes}", directorNotes || "None")
    .replace("{customRequest}", customRequest || "")

  // Default to including camera and color details
  const includeCameraStyle = true
  const includeColorPalette = true

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: AdditionalShotsSchema,
    prompt,
    system: `Expand the shot list. CHAPTER CONTENT: """${chapter.content || chapter.title || ''}""". EXISTING SHOTS: """${[
      ...(chapter.shots || []),
    ].join("\n")}"""`,
  })

  return {
    success: true,
    data: object.newShots || []
  }
}
