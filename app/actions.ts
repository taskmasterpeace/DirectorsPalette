"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { MusicVideoConfig } from "@/lib/indexeddb"

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

const MusicVideoSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum([
    "intro",
    "verse",
    "pre-chorus",
    "chorus",
    "post-chorus",
    "bridge",
    "instrumental",
    "solo",
    "refrain",
    "outro",
    "hook",
    "interlude",
  ]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  lyrics: z.string(),
  isHook: z.boolean().optional(),
  repetitionNumber: z.number().optional(),
})

const MusicVideoStructureSchema = z.object({
  songTitle: z.string(),
  artist: z.string(),
  genre: z.string(),
  totalSections: z.number(),
  sections: z.array(MusicVideoSectionSchema),
  detectionMethod: z.enum(["timestamp-based", "ai-generated", "hybrid"]),
})

const TreatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  concept: z.string(),
  visualTheme: z.string(),
  performanceRatio: z.number(),
  hookStrategy: z.string(),
})

const MusicVideoSectionBreakdownSchema = z.object({
  sectionId: z.string(),
  shots: z.array(z.string()),
  performanceNotes: z.array(z.string()),
  syncPoints: z.array(z.string()),
  performanceRatio: z.number(),
})

const LocationConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
})
const WardrobeConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
})
const PropConfigSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
  assignedSections: z.array(z.string()),
})
const SuggestionsSchema = z.object({
  locations: z.array(LocationConfigSchema),
  wardrobe: z.array(WardrobeConfigSchema),
  props: z.array(PropConfigSchema),
})

const StoryCharacterSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  age: z.string().optional(),
  role: z.enum(["main", "supporting", "background"]),
  description: z.string(),
  wardrobe: z.string().optional(),
  assignedChapters: z.array(z.string()),
})
const StoryLocationSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  assignedChapters: z.array(z.string()),
})
const StoryPropSchema = z.object({
  id: z.string(),
  reference: z.string(),
  name: z.string(),
  description: z.string(),
  assignedChapters: z.array(z.string()),
})
const StoryEntitiesSchema = z.object({
  characters: z.array(StoryCharacterSchema),
  locations: z.array(StoryLocationSchema),
  props: z.array(StoryPropSchema),
})

const DirectorProfileSchema = z.object({
  visualHallmarks: z.string(),
  narrativeStyle: z.string(),
  pacingAndEnergy: z.string(),
  genres: z.string(),
})

// Suggestion schemas for AI Assist (used by completeFilmDirector / completeMusicDirector)
const FilmDirectorSuggestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  visualLanguage: z.string().optional(),
  colorPalette: z.string().optional(),
  narrativeFocus: z.string().optional(),
  category: z.enum(["Contemporary", "Auteur", "Classic", "Custom"]).optional(),
  disciplines: z
    .array(
      z.enum([
        "composition",
        "camera-movement",
        "color-lighting",
        "editing-rhythm",
        "world-building",
        "performance-direction",
        "tone-mood",
      ])
    )
    .optional(),
  tags: z.array(z.string()).optional(),
})

const MusicDirectorSuggestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  visualHallmarks: z.string().optional(),
  narrativeStyle: z.string().optional(),
  pacingAndEnergy: z.string().optional(),
  genres: z.array(z.string()).optional(),
  category: z
    .enum([
      "Standard",
      "Hip-Hop & R&B Visionaries",
      "Cinematic Storytellers",
      "Avant-Garde & Indie Innovators",
      "Pop & Spectacle Auteurs",
      "Custom",
    ])
    .optional(),
  disciplines: z
    .array(
      z.enum(["performance", "narrative", "choreography", "fashion-styling", "visual-effects", "editing", "live-action"])
    )
    .optional(),
  tags: z.array(z.string()).optional(),
})

// ===== Helpers =====
function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings."
    )
  }
}

// Build director style strings (used in prompts)
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

function buildMusicDirectorStyle(d?: {
  name?: string
  description?: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  disciplines?: string[]
  tags?: string[]
  category?: string
}) {
  if (!d) return "Standard, balanced, and modern music video style."
  return [
    `DIRECTOR: ${d.name || "Unknown"}`,
    d.description && `DESCRIPTION: ${d.description}`,
    d.visualHallmarks && `VISUAL HALLMARKS: ${d.visualHallmarks}`,
    d.narrativeStyle && `NARRATIVE STYLE: ${d.narrativeStyle}`,
    d.pacingAndEnergy && `PACING & ENERGY: ${d.pacingAndEnergy}`,
    d.genres?.length ? `GENRES: ${d.genres.join(", ")}` : null,
    d.category && `CATEGORY: ${d.category}`,
    d.disciplines?.length ? `DISCIPLINES: ${d.disciplines.join(", ")}` : null,
    d.tags?.length ? `STYLE TAGS: ${d.tags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

// ===== Deterministic Fallback: Chapter Detection =====
type FallbackChapter = {
  title: string
  content: string
  start: number
  end: number
}

function isTitleCaseWord(w: string) {
  // Allow "The", "Of", etc. in either case
  if (!w) return false
  const clean = w.replace(/[^A-Za-z']/g, "")
  if (!clean) return false
  // All caps or Title Case
  return /^[A-Z][a-z']+$/.test(clean) || /^[A-Z]{2,}$/.test(clean)
}

function looksLikeHeading(line: string) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (/[.!?]$/.test(trimmed)) return false // headings typically don't end with punctuation
  if (trimmed.length > 90) return false
  const words = trimmed.split(/\s+/)
  const titleWords = words.filter(isTitleCaseWord).length
  // At least 2 title-like words and at least 60% of words are title-like (allowing some stopwords)
  return titleWords >= 2 && titleWords / Math.max(words.length, 1) >= 0.6
}

function splitByLineHeadings(raw: string): FallbackChapter[] {
  const lines = raw.split(/\r?\n/)
  const chapters: FallbackChapter[] = []
  let currentTitle: string | null = null
  let currentContent = ""
  let cursor = 0

  for (const line of lines) {
    if (looksLikeHeading(line)) {
      // push previous
      if (currentTitle || currentContent.trim()) {
        const start = cursor - currentContent.length
        chapters.push({
          title: currentTitle || "Part",
          content: currentContent.trim(),
          start: Math.max(0, start),
          end: cursor,
        })
        currentContent = ""
      }
      currentTitle = line.trim()
    } else {
      currentContent += (currentContent ? "\n" : "") + line
    }
    cursor += line.length + 1
  }

  if (currentTitle || currentContent.trim()) {
    const start = cursor - currentContent.length
    chapters.push({
      title: currentTitle || "Part",
      content: currentContent.trim(),
      start: Math.max(0, start),
      end: cursor,
    })
  }

  // filter empties
  return chapters.filter((c) => c.content.length > 0)
}

function splitByInlineHeadings(raw: string): FallbackChapter[] {
  // Look for inline heading phrases like "The Something ..." that are short and Title-Case-ish
  const pattern = /\b(The|What|Before|After|Pulling|Standing|Final|This|The|Confrontation|Lesson|Code|Aftermath)\s+[A-Z][A-Za-z']+(?:\s+[A-Z][A-Za-z']+){0,7}\b/g
  const matches: Array<{ index: number; text: string }> = []
  let m: RegExpExecArray | null
  while ((m = pattern.exec(raw)) !== null) {
    const idx = m.index
    // Ensure this isn't mid-sentence with trailing punctuation immediately before
    const prev = raw.slice(Math.max(0, idx - 2), idx)
    if (!/[.!?]$/.test(prev)) {
      matches.push({ index: idx, text: m[0] })
    }
  }
  if (matches.length < 2) return []

  const chapters: FallbackChapter[] = []
  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index
    const endIdx = i < matches.length - 1 ? matches[i + 1].index : raw.length
    const title = matches[i].text.trim()
    const content = raw.slice(startIdx + title.length, endIdx).trim()
    if (content.length > 0) {
      chapters.push({
        title,
        content,
        start: startIdx,
        end: endIdx,
      })
    }
  }
  return chapters
}

function splitByParagraphChunking(raw: string): FallbackChapter[] {
  // Split by double newlines, then group into ~1200-1800 char chunks
  const paragraphs = raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (paragraphs.length <= 1) {
    // final fallback: split by sentences into ~1500-char chunks
    const sentences = raw.split(/(?<=[.!?])\s+/)
    const chunks: FallbackChapter[] = []
    let buf = ""
    let start = 0
    for (const s of sentences) {
      const next = buf ? buf + " " + s : s
      if (next.length > 1500 && buf) {
        const end = start + buf.length
        chunks.push({
          title: `Part ${chunks.length + 1}`,
          content: buf.trim(),
          start,
          end,
        })
        start = end + 1
        buf = s
      } else {
        buf = next
      }
    }
    if (buf.trim()) {
      chunks.push({
        title: `Part ${chunks.length + 1}`,
        content: buf.trim(),
        start,
        end: start + buf.length,
      })
    }
    return chunks
  }

  const chapters: FallbackChapter[] = []
  let buf = ""
  let start = 0
  for (const p of paragraphs) {
    const next = buf ? buf + "\n\n" + p : p
    if (next.length > 1600 && buf) {
      const end = start + buf.length
      chapters.push({
        title: `Part ${chapters.length + 1}`,
        content: buf.trim(),
        start,
        end,
      })
      start = end + 2
      buf = p
    } else {
      buf = next
    }
  }
  if (buf.trim()) {
    chapters.push({
      title: `Part ${chapters.length + 1}`,
      content: buf.trim(),
      start,
      end: start + buf.length,
    })
  }
  return chapters
}

function deterministicFallbackChapters(story: string): FallbackChapter[] {
  const trimmed = story.replace(/\r/g, "")
  // 1) Line-based headings
  const byLines = splitByLineHeadings(trimmed)
  if (byLines.length >= 2) return byLines

  // 2) Inline heading detection
  const byInline = splitByInlineHeadings(trimmed)
  if (byInline.length >= 2) return byInline

  // 3) Paragraph/sentence chunking
  const byChunks = splitByParagraphChunking(trimmed)
  if (byChunks.length >= 1) return byChunks

  // 4) Last resort: whole story as one
  return [
    {
      title: "Complete Story",
      content: trimmed,
      start: 0,
      end: trimmed.length,
    },
  ]
}

function heuristicsAssignBeat(i: number, n: number): "setup" | "rising-action" | "climax" | "resolution" {
  if (n <= 1) return "setup"
  if (n === 2) return (i === 0 ? "setup" : "resolution")
  const climaxIndex = Math.max(1, Math.min(n - 2, Math.floor(n * 0.65)))
  if (i === 0) return "setup"
  if (i === climaxIndex) return "climax"
  if (i === n - 1) return "resolution"
  return "rising-action"
}

function estimateDurationStr(len: number): string {
  // Very rough: ~250 words per minute; words ~ len/5 chars
  const words = Math.max(1, Math.round(len / 5))
  const minutes = Math.max(1, Math.round(words / 250))
  return `${minutes} min`
}

// ===== Prompts =====
const defaultPrompts = {
  structureDetection: `Analyze the following text and split it into logical chapters. Identify the narrative beat for each chapter (setup, rising-action, climax, resolution). Provide a unique ID, a concise title, the full content, start/end character positions, estimated screen time, key characters, and primary location for each chapter. Ensure the entire text is covered. Return ONLY the valid JSON object.`,
  wholeStoryBreakdown: `You are a world-class cinematographer creating a visual breakdown for an entire story that doesn't break into distinct chapters. Generate a comprehensive shot list that reflects the director's unique style and approach.

DIRECTOR STYLE PROFILE:
{directorStyle}

Based on this director's specific visual language, color palette, narrative focus, and disciplines, create shots that authentically reflect their style. Consider their typical camera movements, framing preferences, lighting approaches, and storytelling methods.

Also identify key character, location, and prop references. Analyze the shot coverage and suggest additional opportunities. Return ONLY the valid JSON object.`,
  chapterBreakdown: `You are a world-class cinematographer creating a visual breakdown for a story chapter. Generate a detailed shot list that reflects the director's unique style and approach.

DIRECTOR STYLE PROFILE:
{directorStyle}

Based on this director's specific visual language, color palette, narrative focus, and disciplines, create shots that authentically reflect their style. Consider their typical camera movements, framing preferences, lighting approaches, and storytelling methods.

Also identify key character, location, and prop references. Analyze the shot coverage and suggest additional opportunities. Return ONLY the valid JSON object.`,
  additionalShots: `You are expanding a shot list for a story chapter in the style of a specific director. Generate {shotCount} new, distinct shots that focus on these categories: {categories}.

DIRECTOR STYLE PROFILE:
{directorStyle}

CUSTOM REQUEST: {customRequest}

The new shots should authentically reflect this director's visual language, camera techniques, and narrative approach. Ensure they complement the existing coverage while adding the director's signature style elements.

Update the coverage analysis based on the new shots. Return ONLY the valid JSON object with 'newShots' and 'coverageAnalysis' keys.`,
  titleCard: `Design {count} unique title card concepts for the chapter titled "{chapterTitle}". For each concept, provide a 'styleLabel' and a detailed 'description' of the visual execution based on these approaches: {approaches}. Return ONLY the valid JSON object.`,
  musicVideoStructure: `Analyze the provided song lyrics for "{songTitle}" by "{artist}" ({genre}). Break the song down into its structural components. Use only the following section types: "intro", "verse", "pre-chorus", "chorus", "post-chorus", "bridge", "instrumental", "solo", "refrain", "outro", "hook", "interlude". If timestamps [MM:SS] are present, use them for timing. If not, generate a logical structure. Identify recurring hooks. Return ONLY the valid JSON object.`,
  musicVideoTreatments: `You are creating music video treatments for "{songTitle}" by "{artist}" in the style of a specific director. Generate three distinct and creative treatments that authentically reflect this director's approach.

DIRECTOR STYLE PROFILE:
{directorStyle}

Each treatment should incorporate the director's visual hallmarks, narrative style, pacing preferences, and genre expertise.

Return ONLY the valid JSON object.`,
  musicVideoBreakdown: `You are creating a detailed shot list for the "{sectionTitle}" section of a music video in a specific director's style.

DIRECTOR STYLE PROFILE:
{directorStyle}

TREATMENT: "{treatmentName}" - {treatmentConcept}
VISUAL STYLE: {treatmentVisuals}

PRODUCTION CONFIGURATION:
LOCATIONS: {locations}
WARDROBE: {wardrobe}
PROPS: {props}

Generate shots that authentically reflect this director's visual hallmarks, narrative approach, and pacing style. Ensure shots reference the configured items using their reference IDs (e.g., @location1, @outfit2, @prop3). Return ONLY the valid JSON object.`,
  musicVideoSuggestions: `Based on the song "{songTitle}" by {artist} and the selected treatment "{treatmentName}" ({treatmentConcept}), generate 2-3 creative suggestions each for locations, wardrobe, and props.

DIRECTOR STYLE PROFILE:
{directorStyle}

Provide: id, reference (@id), name, description, purpose, and assign to relevant sections from: {sectionIds}. Return ONLY the valid JSON object.`,
  additionalMusicVideoShots: `Generate additional shots for "{sectionTitle}" in a specific director's style.

DIRECTOR STYLE PROFILE:
{directorStyle}

CUSTOM REQUEST: "{customRequest}"
EXISTING SHOTS: {existingShots}
TREATMENT: {treatmentConcept}

PRODUCTION CONFIGURATION:
LOCATIONS: {locations}
WARDROBE: {wardrobe}
PROPS: {props}

Return ONLY JSON with 'newShots'.`,
  directorStyleGeneration: `Create a custom music video director profile from "{name}" and idea "{description}". Define visual hallmarks, narrative style, pacing & energy, and genres. Return ONLY JSON.`,
  storyEntities: `Extract characters, locations, and props from the story. For characters, include name, short description, age if present or inferred (e.g., "7", "20s", "elderly"), and classify as "main" | "supporting" | "background".
Generate wardrobe notes for each character informed by the DIRECTOR STYLE.
Create stable references:
- Characters: "@<lower_snake_case_name>" (e.g., @little_red)
- Locations: "@loc<number>" or "@location_<short_label>"
- Props: "@prop<number>" or "@prop_<short_label>"
Assign each item to relevant chapter IDs from: {chapterIds}.
Return ONLY the valid JSON object.`,
}

export function getDefaultPrompts() {
  return defaultPrompts
}

// ===== Main Actions =====
export async function generateBreakdown(
  story: string,
  director: string,
  titleCardOptions: { enabled: boolean; format: "full" | "name-only" | "roman-numerals"; approaches: string[] },
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean; includeColorPalette: boolean }
) {
  assertAIEnv()

  // 1) Try to detect structure first via model
  let storyStructure: any
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: StoryStructureSchema,
      prompt: defaultPrompts.structureDetection,
      system: `You are a professional script supervisor and editor. Analyze the story and split it into chapters. STORY: """${story}"""`,
    })
    storyStructure = object
  } catch (error) {
    storyStructure = null
  }

  // 2) Deterministic fallback when model returns no/empty chapters
  if (!storyStructure || !Array.isArray(storyStructure.chapters) || storyStructure.chapters.length === 0) {
    const detected = deterministicFallbackChapters(story)
    const chapters = detected.map((c, i, arr) => {
      const beat = heuristicsAssignBeat(i, arr.length)
      return {
        id: `ch_${i + 1}`,
        title: c.title || `Part ${i + 1}`,
        content: c.content,
        startPosition: c.start,
        endPosition: c.end,
        estimatedDuration: estimateDurationStr(c.content.length),
        keyCharacters: [] as string[],
        primaryLocation: "Unknown",
        narrativeBeat: beat,
      }
    })
    storyStructure = {
      chapters,
      detectionMethod: "ai-generated",
      totalChapters: chapters.length,
      fullStory: story,
    }
  }

  // Normalize structure for safety
  const normalizedStructure = {
    ...storyStructure,
    chapters: Array.isArray(storyStructure?.chapters) ? storyStructure.chapters : [],
    totalChapters: Array.isArray(storyStructure?.chapters) ? storyStructure.chapters.length : 0,
    detectionMethod: storyStructure?.detectionMethod ?? "ai-generated",
    fullStory: typeof storyStructure?.fullStory === "string" && storyStructure.fullStory.length > 0 ? storyStructure.fullStory : story,
  }

  // 3) Entities (influenced by director style)
  const entities = await generateStoryEntities(
    story,
    normalizedStructure,
    [...customDirectors].find((d) => d.id === director)
  )

  // 4) Chapter/Story breakdowns
  const chapterBreakdowns = await Promise.all(
    normalizedStructure.chapters.map(async (chapter: any) => {
      const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
      const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

      const charactersString = entities.characters
        .map((c: any) => {
          const bits = [
            `${c.reference}: ${c.name}`,
            c.role ? `role: ${c.role}` : null,
            c.age ? `age: ${c.age}` : null,
            c.description ? `desc: ${c.description}` : null,
            c.wardrobe ? `wardrobe: ${c.wardrobe}` : null,
          ]
            .filter(Boolean)
            .join(" | ")
          return bits
        })
        .join("\n")

      const locString = entities.locations.map((l: any) => `${l.reference}: ${l.name} - ${l.description}`).join("\n")
      const propString = entities.props.map((p: any) => `${p.reference}: ${p.name} - ${p.description}`).join("\n")

      const isWholeStory = normalizedStructure.totalChapters === 1
      let prompt = (isWholeStory ? defaultPrompts.wholeStoryBreakdown : defaultPrompts.chapterBreakdown).replace(
        "{directorStyle}",
        directorStyle
      )

      prompt += `

PRODUCTION CONFIG:
CHARACTERS:
${charactersString || "None"}

LOCATIONS:
${locString || "None"}

PROPS:
${propString || "None"}

IMPORTANT: Use reference IDs (e.g., @character_name, @loc1, @prop1) when referring to people/places/props in shots.`

      if (!promptOptions.includeCameraStyle) {
        prompt += `

IMPORTANT: Minimize detailed camera movement descriptions.`
      }
      if (!promptOptions.includeColorPalette) {
        prompt += `

IMPORTANT: Minimize detailed color palette and lighting descriptions.`
      }

      prompt += `

IMPORTANT: Include a field "chapterId" with the exact value: "${chapter.id}". Ensure all required keys are present.`

      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: ChapterBreakdownSchema,
        prompt,
        system: `You are a world-class cinematographer. Create a visual breakdown. ${
          isWholeStory ? "COMPLETE STORY" : "CHAPTER CONTENT"
        }: """${chapter.content}"""`,
      })

      const normalized = {
        ...breakdown,
        chapterId: breakdown.chapterId || chapter.id,
        characterReferences: Array.isArray((breakdown as any).characterReferences) ? breakdown.characterReferences : [],
        locationReferences: Array.isArray((breakdown as any).locationReferences) ? breakdown.locationReferences : [],
        propReferences: Array.isArray((breakdown as any).propReferences) ? breakdown.propReferences : [],
        shots: Array.isArray((breakdown as any).shots) ? breakdown.shots : [],
        additionalOpportunities: Array.isArray((breakdown as any).additionalOpportunities)
          ? breakdown.additionalOpportunities
          : [],
        coverageAnalysis: breakdown.coverageAnalysis || "",
      }

      if (titleCardOptions.enabled && !isWholeStory) {
        const { object: titleCards } = await generateObject({
          model: openai("gpt-4o"),
          schema: z.object({ titleCards: z.array(TitleCardSchema) }),
          prompt: defaultPrompts.titleCard
            .replace("{count}", "3")
            .replace("{chapterTitle}", chapter.title)
            .replace("{approaches}", titleCardOptions.approaches.join(", ")),
          system: "You are a creative title sequence designer.",
        })
        normalized.titleCards = titleCards.titleCards
      }

      return normalized
    })
  )

  return {
    storyStructure: normalizedStructure,
    chapterBreakdowns,
    overallAnalysis: "Breakdown complete.",
    entities,
  }
}

export async function generateAdditionalChapterShots(
  args: any,
  customDirectors: any[],
  promptOptions: { includeCameraStyle: boolean; includeColorPalette: boolean }
) {
  assertAIEnv()
  const { story, director, storyStructure, chapterId, existingBreakdown, existingAdditionalShots, categories, customRequest } = args

  const chapter = storyStructure.chapters.find((c: any) => c.id === chapterId)
  if (!chapter) throw new Error("Chapter not found")

  const selectedDirectorInfo = [...customDirectors].find((d) => d.id === director)
  const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)

  let prompt = defaultPrompts.additionalShots
    .replace("{shotCount}", "5")
    .replace("{categories}", categories.join(", "))
    .replace("{customRequest}", customRequest)
    .replace("{directorStyle}", directorStyle)

  if (!promptOptions.includeCameraStyle) {
    prompt += `

IMPORTANT: Minimize detailed camera movement descriptions.`
  }
  if (!promptOptions.includeColorPalette) {
    prompt += `

IMPORTANT: Minimize detailed color palette and lighting descriptions.`
  }

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      newShots: z.array(z.string()),
      coverageAnalysis: z.string(),
    }),
    prompt,
    system: `Expand the shot list. CHAPTER CONTENT: """${chapter.content}""". EXISTING SHOTS: """${[
      ...existingBreakdown.shots,
      ...existingAdditionalShots,
    ].join("\n")}"""`,
  })

  return object
}

export async function generateFullMusicVideoBreakdown(
  lyrics: string,
  songTitle: string = "Untitled Song",
  artist: string = "Unknown Artist",
  genre: string = "Pop",
  config?: MusicVideoConfig,
  selectedMusicVideoDirectorInfo?: any
) {
  assertAIEnv()
  const directorStyle = buildMusicDirectorStyle(selectedMusicVideoDirectorInfo)

  const [structureResult, treatmentsResult] = await Promise.all([
    generateObject({
      model: openai("gpt-4o"),
      schema: MusicVideoStructureSchema,
      prompt: defaultPrompts.musicVideoStructure
        .replace("{songTitle}", songTitle)
        .replace("{artist}", artist)
        .replace("{genre}", genre),
      system: `Analyze song lyrics and determine the song's structure. LYRICS: """${lyrics}"""`,
    }),
    generateObject({
      model: openai("gpt-4o"),
      schema: z.object({ treatments: z.array(TreatmentSchema) }),
      prompt: defaultPrompts.musicVideoTreatments
        .replace("{songTitle}", songTitle)
        .replace("{artist}", artist)
        .replace("{directorStyle}", directorStyle),
      system: `You are a visionary music video director. LYRICS: """${lyrics}"""`,
    }),
  ])

  const musicVideoStructure = structureResult.object
  const treatments = treatmentsResult.object.treatments

  if (!config || !config.isConfigured) {
    return {
      musicVideoStructure,
      treatments,
      selectedTreatment: treatments[0],
      isConfigured: false,
    }
  }

  let selectedTreatment = config.customTreatment || treatments.find((t) => t.id === config.selectedTreatmentId)
  if (!selectedTreatment) selectedTreatment = treatments[0]

  const locationString = config.locations.map((l) => `${l.reference}: ${l.name} - ${l.description}`).join("\n")
  const wardrobeString = config.wardrobe.map((w) => `${w.reference}: ${w.name} - ${w.description}`).join("\n")
  const propString = config.props.map((p) => `${p.reference}: ${p.name} - ${p.description}`).join("\n")

  const sectionBreakdowns = await Promise.all(
    musicVideoStructure.sections.map(async (section) => {
      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: MusicVideoSectionBreakdownSchema,
        prompt: defaultPrompts.musicVideoBreakdown
          .replace("{sectionTitle}", section.title)
          .replace("{songTitle}", songTitle)
          .replace("{treatmentName}", selectedTreatment.name)
          .replace("{treatmentConcept}", selectedTreatment.concept)
          .replace("{treatmentVisuals}", selectedTreatment.visualTheme)
          .replace("{directorStyle}", directorStyle)
          .replace("{locations}", locationString || "None")
          .replace("{wardrobe}", wardrobeString || "None")
          .replace("{props}", propString || "None"),
        system: `Create a detailed section shot list. SECTION LYRICS: """${section.lyrics}"""`,
      })
      return breakdown
    })
  )

  return {
    musicVideoStructure,
    treatments,
    selectedTreatment,
    sectionBreakdowns,
    overallAnalysis: "Full music video breakdown complete.",
    isConfigured: true,
  }
}

export async function generateAdditionalMusicVideoShots({
  lyrics,
  musicVideoStructure,
  sectionId,
  existingBreakdown,
  existingAdditionalShots,
  customRequest,
  config,
  selectedMusicVideoDirectorInfo,
}: any) {
  assertAIEnv()
  const section = musicVideoStructure.sections.find((s: any) => s.id === sectionId)
  if (!section) throw new Error("Section not found")

  const directorStyle = buildMusicDirectorStyle(selectedMusicVideoDirectorInfo)

  const { object: treatmentsData } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({ treatments: z.array(TreatmentSchema) }),
    prompt: defaultPrompts.musicVideoTreatments
      .replace("{songTitle}", musicVideoStructure.songTitle)
      .replace("{artist}", musicVideoStructure.artist)
      .replace("{directorStyle}", directorStyle),
    system: `You are a visionary music video director. LYRICS: """${lyrics}"""`,
  })

  const selectedTreatment =
    config.customTreatment || treatmentsData.treatments.find((t) => t.id === config.selectedTreatmentId)
  if (!selectedTreatment) throw new Error("Selected treatment not found.")

  const locationString = config.locations.map((l: any) => `${l.reference}: ${l.name} - ${l.description}`).join("\n")
  const wardrobeString = config.wardrobe.map((w: any) => `${w.reference}: ${w.name} - ${w.description}`).join("\n")
  const propString = config.props.map((p: any) => `${p.reference}: ${p.name} - ${p.description}`).join("\n")

  const allExistingShots = [...existingBreakdown.shots, ...existingAdditionalShots]

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({ newShots: z.array(z.string()) }),
    prompt: defaultPrompts.additionalMusicVideoShots
      .replace("{sectionTitle}", section.title)
      .replace("{songTitle}", musicVideoStructure.songTitle)
      .replace("{customRequest}", customRequest)
      .replace("{existingShots}", allExistingShots.join("\n"))
      .replace("{treatmentConcept}", selectedTreatment.concept)
      .replace("{directorStyle}", directorStyle)
      .replace("{locations}", locationString || "None")
      .replace("{wardrobe}", wardrobeString || "None")
      .replace("{props}", propString || "None"),
    system: `Generate additional shots for the given section. SECTION LYRICS: """${section.lyrics}"""`,
  })

  return object
}

export async function generateMusicVideoSuggestions({
  lyrics,
  songTitle,
  artist,
  genre,
  treatment,
  sections,
  directorInfo,
}: {
  lyrics: string
  songTitle: string
  artist: string
  genre: string
  treatment: { id: string; name: string; concept: string }
  sections: Array<{ id: string; title: string }>
  directorInfo?: {
    name?: string
    description?: string
    visualHallmarks?: string
    narrativeStyle?: string
    pacingAndEnergy?: string
    genres?: string[]
    disciplines?: string[]
    tags?: string[]
    category?: string
  }
}) {
  assertAIEnv()
  const sectionInfo = sections.map((s) => `${s.id} (${s.title})`).join(", ")
  const directorStyle = buildMusicDirectorStyle(directorInfo)

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: SuggestionsSchema,
    prompt: defaultPrompts.musicVideoSuggestions
      .replace("{songTitle}", songTitle || "the song")
      .replace("{artist}", artist || "the artist")
      .replace("{treatmentName}", treatment.name)
      .replace("{treatmentConcept}", treatment.concept)
      .replace("{sectionIds}", sectionInfo)
      .replace("{directorStyle}", directorStyle),
    system: `You are a creative director brainstorming for a music video. The lyrics are: """${lyrics}""". The genre is ${genre}.`,
  })

  const validSectionIds = sections.map((s) => s.id)
  object.locations.forEach((item) => {
    item.assignedSections = item.assignedSections.filter((id) => validSectionIds.includes(id))
  })
  object.wardrobe.forEach((item) => {
    item.assignedSections = item.assignedSections.filter((id) => validSectionIds.includes(id))
  })
  object.props.forEach((item) => {
    item.assignedSections = item.assignedSections.filter((id) => validSectionIds.includes(id))
  })

  return object
}

export async function generateDirectorStyleDetails(name: string, description: string) {
  assertAIEnv()
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: DirectorProfileSchema,
    prompt: defaultPrompts.directorStyleGeneration.replace("{name}", name).replace("{description}", description),
    system: "You are a knowledgeable film and music video historian with a knack for distilling a director's style.",
  })
  return object
}

export async function generateStoryEntities(story: string, storyStructure: any, selectedDirectorInfo?: any) {
  assertAIEnv()
  const directorStyle = buildFilmDirectorStyle(selectedDirectorInfo)
  const chapterIds = (storyStructure?.chapters || [])
    .map((c: any) => `${c.id} (${c.title})`)
    .join(", ")

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: StoryEntitiesSchema,
    prompt: defaultPrompts.storyEntities.replace("{chapterIds}", chapterIds),
    system: `You are a script supervisor extracting people, places, and props.
DIRECTOR STYLE:
${directorStyle}

STORY:
"""${story}"""`,
  })

  // Ensure references start with "@"
  object.characters.forEach((c: any) => {
    if (!c.reference.startsWith("@")) c.reference = `@${c.reference}`
  })
  object.locations.forEach((l: any) => {
    if (!l.reference.startsWith("@")) l.reference = `@${l.reference}`
  })
  object.props.forEach((p: any) => {
    if (!p.reference.startsWith("@")) p.reference = `@${p.reference}`
  })

  return object
}

// ===== AI Assist: Director completion exports =====
export async function completeFilmDirector(input: {
  name?: string
  description?: string
  visualLanguage?: string
  colorPalette?: string
  narrativeFocus?: string
  category?: "Contemporary" | "Auteur" | "Classic" | "Custom"
  disciplines?: string[]
  tags?: string[]
}) {
  assertAIEnv()
  const prompt = `You are assisting a user in defining a FILM director style profile. Expand succinctly and fill gaps.
Return ONLY the JSON keys: {name, description, visualLanguage, colorPalette, narrativeFocus, category, disciplines, tags}.

CURRENT INPUT:
${JSON.stringify(input, null, 2)}
`
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: FilmDirectorSuggestSchema,
    prompt,
    system: "You are a seasoned cinematographer and development producer. Write compact, production-friendly text.",
  })
  return object
}

export async function completeMusicDirector(input: {
  name?: string
  description?: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  category?: string
  disciplines?: string[]
  tags?: string[]
}) {
  assertAIEnv()
  const prompt = `You are assisting a user in defining a MUSIC VIDEO director style profile. Expand succinctly and fill gaps.
Return ONLY JSON keys: {name, description, visualHallmarks, narrativeStyle, pacingAndEnergy, genres, category, disciplines, tags}.

CURRENT INPUT:
${JSON.stringify(input, null, 2)}
`
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: MusicDirectorSuggestSchema,
    prompt,
    system: "You are a veteran music video director and creative producer. Be precise and useful.",
  })
  return object
}
