/**
 * Music video service for generating breakdowns and additional shots
 */

import { generateObject } from "ai"
import { z } from "zod"
import { assertAIEnv, AI_MODEL, ServiceError } from "./base"
import type { ArtistProfile } from "@/lib/artist-types"
import { mvPrompts, buildArtistProfileString, buildDirectorStyleString } from "@/lib/prompts-mv"

// ===== Schemas =====
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

const AdditionalMusicVideoShotsSchema = z.object({
  newShots: z.array(z.string()),
  performanceNotes: z.array(z.string()),
  syncAnalysis: z.string(),
})

// ===== Types =====
export type MusicVideoStructure = z.infer<typeof MusicVideoStructureSchema>
export type MusicVideoSection = z.infer<typeof MusicVideoSectionSchema>
export type Treatment = z.infer<typeof TreatmentSchema>
export type MusicVideoSectionBreakdown = z.infer<typeof MusicVideoSectionBreakdownSchema>
export type AdditionalMusicVideoShots = z.infer<typeof AdditionalMusicVideoShotsSchema>

export interface MusicVideoConfig {
  isConfigured?: boolean
  selectedTreatmentId?: string
  locations?: Array<{ reference: string; name: string; description: string }>
  wardrobe?: Array<{ reference: string; name: string; description: string }>
  props?: Array<{ reference: string; name: string; description: string }>
  [key: string]: any
}

export interface MusicVideoGuidance {
  directorNotes?: string
  videoConcept?: string
}

// ===== Utilities =====
function stringifyConfigList(items?: Array<{ reference: string; name: string; description: string }>): string {
  return (items || []).map((i) => `${i.reference}: ${i.name} - ${i.description}`).join("\n")
}

// ===== Service =====
export class MusicVideoService {
  /**
   * Generate complete music video breakdown
   */
  static async generateFullBreakdown(
    lyrics: string,
    songTitle = "Untitled Song",
    artist = "Unknown Artist",
    genre = "Pop",
    config?: MusicVideoConfig,
    selectedMusicVideoDirectorInfo?: any,
    guidance?: MusicVideoGuidance,
    artistProfile?: ArtistProfile,
    options?: { debugPrompts?: boolean }
  ) {
    try {
      assertAIEnv()

      const directorStyle = buildDirectorStyleString(selectedMusicVideoDirectorInfo)
      const artistProfileStr = buildArtistProfileString(artistProfile)
      const directorNotes = guidance?.directorNotes || "None"
      const videoConcept = guidance?.videoConcept || "None"

      // Generate structure and treatments in parallel
      const [structureResult, treatmentsResult] = await Promise.all([
        generateObject({
          model: AI_MODEL,
          schema: MusicVideoStructureSchema,
          prompt: mvPrompts.musicVideoStructure({ songTitle, artist, genre }),
          system: `Analyze song structure. LYRICS: """${lyrics}"""`,
        }),
        generateObject({
          model: AI_MODEL,
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

      // If not configured, return early for configuration step
      if (!config || !config.isConfigured) {
        return {
          musicVideoStructure,
          treatments,
          selectedTreatment: treatments[0],
          isConfigured: false,
          ...(options?.debugPrompts ? { debug: { prompts: { treatments: "hidden" } } } : null),
        }
      }

      // Generate configured breakdown
      const selectedTreatment = treatments.find((t) => t.id === config.selectedTreatmentId) || treatments[0]
      
      if (!selectedTreatment) {
        throw new ServiceError("Selected treatment not found", 'TREATMENT_NOT_FOUND', { treatmentId: config.selectedTreatmentId })
      }

      // Generate suggestions and section breakdowns
      const [suggestionsResult, ...sectionBreakdowns] = await Promise.all([
        generateObject({
          model: AI_MODEL,
          schema: SuggestionsSchema,
          prompt: mvPrompts.musicVideoSuggestions({
            lyrics,
            songTitle,
            artist,
            genre,
            selectedTreatment: selectedTreatment.concept,
            directorStyle,
            directorNotes,
            videoConcept,
            artistProfileStr,
          }),
          system: "Generate comprehensive production suggestions.",
        }),
        ...musicVideoStructure.sections.map((section) =>
          generateObject({
            model: AI_MODEL,
            schema: MusicVideoSectionBreakdownSchema,
            prompt: mvPrompts.musicVideoSectionBreakdown({
              section,
              selectedTreatment: selectedTreatment.concept,
              locations: stringifyConfigList(config.locations),
              wardrobe: stringifyConfigList(config.wardrobe),
              props: stringifyConfigList(config.props),
              directorStyle,
              directorNotes,
              videoConcept,
              artistProfileStr,
            }),
            system: `Generate section breakdown. SECTION: ${section.title} - "${section.lyrics}"`,
          })
        ),
      ])

      return {
        musicVideoStructure,
        treatments,
        selectedTreatment,
        suggestions: suggestionsResult.object,
        sectionBreakdowns: sectionBreakdowns.map((result) => result.object),
        isConfigured: true,
        ...(options?.debugPrompts ? { debug: { prompts: "hidden" } } : null),
      }
    } catch (error) {
      throw new ServiceError(
        `Failed to generate music video breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MUSIC_VIDEO_BREAKDOWN_FAILED',
        { songTitle, artist, genre }
      )
    }
  }

  /**
   * Generate additional shots for a music video section
   */
  static async generateAdditionalShots(args: {
    lyrics: string
    musicVideoStructure: MusicVideoStructure
    sectionId: string
    existingBreakdown: MusicVideoSectionBreakdown
    existingAdditionalShots: string[]
    customRequest: string
    config?: MusicVideoConfig
    selectedMusicVideoDirectorInfo?: any
    guidance?: MusicVideoGuidance
    artistProfile?: ArtistProfile
  }): Promise<AdditionalMusicVideoShots> {
    try {
      assertAIEnv()

      const {
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
      } = args

      const section = musicVideoStructure.sections.find((s) => s.id === sectionId)
      if (!section) {
        throw new ServiceError("Section not found", 'SECTION_NOT_FOUND', { sectionId })
      }

      const directorStyle = buildDirectorStyleString(selectedMusicVideoDirectorInfo)
      const artistProfileStr = buildArtistProfileString(artistProfile)
      const directorNotes = guidance?.directorNotes || "None"
      const videoConcept = guidance?.videoConcept || "None"

      const systemPrompt = `Generate additional shots for section "${section.title}". Avoid duplicating:
EXISTING: ${[...existingBreakdown.shots, ...existingAdditionalShots].join(", ")}
SECTION: ${section.lyrics}`

      const { object } = await generateObject({
        model: AI_MODEL,
        schema: AdditionalMusicVideoShotsSchema,
        prompt: mvPrompts.additionalMusicVideoShots({
          section,
          customRequest,
          locations: stringifyConfigList(config?.locations),
          wardrobe: stringifyConfigList(config?.wardrobe),
          props: stringifyConfigList(config?.props),
          directorStyle,
          directorNotes,
          videoConcept,
          artistProfileStr,
        }),
        system: systemPrompt,
      })

      return object
    } catch (error) {
      throw new ServiceError(
        `Failed to generate additional music video shots: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADDITIONAL_MV_SHOTS_FAILED',
        { sectionId: args.sectionId }
      )
    }
  }

  /**
   * Generate suggestions for music video production
   */
  static async generateSuggestions({
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
    guidance?: MusicVideoGuidance
    artistProfile?: ArtistProfile
  }) {
    try {
      assertAIEnv()

      const directorStyle = buildDirectorStyleString(directorInfo)
      const artistProfileStr = buildArtistProfileString(artistProfile)
      const directorNotes = guidance?.directorNotes || "None"
      const videoConcept = guidance?.videoConcept || "None"

      const sectionList = sections.map((s) => `${s.id} (${s.title})`).join(", ")

      const { object } = await generateObject({
        model: AI_MODEL,
        schema: SuggestionsSchema,
        prompt: mvPrompts.musicVideoSuggestions({
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
        }),
        system: `You are a creative director brainstorming for a music video. The lyrics are: """${lyrics}""". The genre is ${genre}.`,
      })

      return object
    } catch (error) {
      throw new ServiceError(
        `Failed to generate music video suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MV_SUGGESTIONS_FAILED',
        { songTitle, artist, treatmentId: treatment.id }
      )
    }
  }
}