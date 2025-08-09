"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { MusicVideoConfig } from "@/lib/indexeddb"
import type { ArtistProfile } from "@/lib/artist-types"
import { mvPrompts, buildArtistProfileString, buildDirectorStyleString } from "@/lib/prompts-mv"

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

function assertAIEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Please add the OpenAI integration or set the key in project settings.")
  }
}

function stringifyConfigList(items?: Array<{ reference: string; name: string; description: string }>): string {
  return (items || []).map((i) => `${i.reference}: ${i.name} - ${i.description}`).join("\n")
}

export async function generateFullMusicVideoBreakdown(
  lyrics: string,
  songTitle = "Untitled Song",
  artist = "Unknown Artist",
  genre = "Pop",
  config?: MusicVideoConfig,
  selectedMusicVideoDirectorInfo?: any,
  guidance?: { directorNotes?: string; videoConcept?: string },
  artistProfile?: ArtistProfile,
  options?: { debugPrompts?: boolean },
) {
  assertAIEnv()
  const directorStyle = buildDirectorStyleString(selectedMusicVideoDirectorInfo)
  const artistProfileStr = buildArtistProfileString(artistProfile)
  const directorNotes = guidance?.directorNotes || "None"
  const videoConcept = guidance?.videoConcept || "None"

  const [structureResult, treatmentsResult] = await Promise.all([
    generateObject({
      model: openai("gpt-4o"),
      schema: MusicVideoStructureSchema,
      prompt: mvPrompts.musicVideoStructure({ songTitle, artist, genre }),
      system: `Analyze song structure. LYRICS: """${lyrics}"""`,
    }),
    generateObject({
      model: openai("gpt-4o"),
      schema: z.object({ treatments: z.array(TreatmentSchema) }),
      prompt: mvPrompts.musicVideoTreatments({
        songTitle,
        artist,
        genre,
        directorStyle,
        directorNotes,
        videoConcept,
        artistProfileStr,
      }),
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
      ...(options?.debugPrompts ? { debug: { prompts: { treatments: "hidden" } } } : null),
    }
  }

  let selectedTreatment = config.customTreatment || treatments.find((t) => t.id === config.selectedTreatmentId)
  if (!selectedTreatment) selectedTreatment = treatments[0]

  const locationsStr = stringifyConfigList(config.locations as any)
  const wardrobeStr = stringifyConfigList(config.wardrobe as any)
  const propsStr = stringifyConfigList(config.props as any)

  const sectionBreakdowns = await Promise.all(
    musicVideoStructure.sections.map(async (section: any) => {
      const prompt = mvPrompts.musicVideoBreakdown({
        songTitle,
        artist,
        genre,
        directorStyle,
        directorNotes,
        videoConcept,
        artistProfileStr,
        sectionTitle: section.title,
        treatmentName: selectedTreatment.name,
        treatmentConcept: selectedTreatment.concept,
        treatmentVisuals: selectedTreatment.visualTheme,
        locations: locationsStr,
        wardrobe: wardrobeStr,
        props: propsStr,
      })
      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o"),
        schema: MusicVideoSectionBreakdownSchema,
        prompt,
        system: `Create a detailed section shot list. SECTION LYRICS: """${section.lyrics}"""`,
      })
      return breakdown
    }),
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
  guidance,
  artistProfile,
}: any) {
  assertAIEnv()
  const section = musicVideoStructure.sections.find((s: any) => s.id === sectionId)
  if (!section) throw new Error("Section not found")

  const directorStyle = buildDirectorStyleString(selectedMusicVideoDirectorInfo)
  const artistProfileStr = buildArtistProfileString(artistProfile)
  const directorNotes = guidance?.directorNotes || "None"
  const videoConcept = guidance?.videoConcept || "None"

  const selectedTreatment = config?.customTreatment || null
  const locationsStr = stringifyConfigList(config?.locations || [])
  const wardrobeStr = stringifyConfigList(config?.wardrobe || [])
  const propsStr = stringifyConfigList(config?.props || [])

  const allExistingShots = [...(existingBreakdown?.shots || []), ...(existingAdditionalShots || [])].join("\n")

  const prompt = mvPrompts.additionalMusicVideoShots({
    songTitle: musicVideoStructure.songTitle || "Song",
    artist: musicVideoStructure.artist || "Artist",
    genre: musicVideoStructure.genre || "Genre",
    directorStyle,
    directorNotes,
    videoConcept,
    artistProfileStr,
    sectionTitle: section.title,
    customRequest: customRequest || "",
    existingShots: allExistingShots || "None",
    treatmentConcept: selectedTreatment?.concept || "Default",
    locations: locationsStr,
    wardrobe: wardrobeStr,
    props: propsStr,
  })

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({ newShots: z.array(z.string()) }),
    prompt,
    system: `Generate creative additions. SECTION LYRICS: """${section.lyrics}"""`,
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
  guidance,
  artistProfile,
}: {
  lyrics: string
  songTitle: string
  artist: string
  genre: string
  treatment: { id: string; name: string; concept: string }
  sections: Array<{ id: string; title: string }>
  directorInfo?: any
  guidance?: { directorNotes?: string; videoConcept?: string }
  artistProfile?: ArtistProfile
}) {
  assertAIEnv()
  const directorStyle = buildDirectorStyleString(directorInfo)
  const artistProfileStr = buildArtistProfileString(artistProfile)
  const directorNotes = guidance?.directorNotes || "None"
  const videoConcept = guidance?.videoConcept || "None"

  const sectionList = sections.map((s) => `${s.id} (${s.title})`).join(", ")

  const prompt = mvPrompts.musicVideoSuggestions({
    songTitle,
    artist,
    genre,
    directorStyle,
    directorNotes,
    videoConcept,
    artistProfileStr,
    treatmentName: treatment.name,
    treatmentConcept: treatment.concept,
    sectionList,
  })

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: SuggestionsSchema,
    prompt,
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
