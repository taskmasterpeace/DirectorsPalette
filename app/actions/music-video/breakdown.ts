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

const SectionBreakdownSchema = z.object({
  sectionId: z.string(),
  shots: z.array(z.string()),
  locationReference: z.string().optional(),
  wardrobeReference: z.string().optional(),
  propReferences: z.array(z.string()).optional(),
})

const FullBreakdownResultSchema = z.object({
  musicVideoStructure: MusicVideoStructureSchema,
  treatments: z.array(TreatmentSchema),
  sectionBreakdowns: z.array(SectionBreakdownSchema),
})

export async function generateFullMusicVideoBreakdown(params: {
  songTitle: string
  artistName: string
  lyrics: string
  director?: string
  directorNotes?: string
  artistProfile?: ArtistProfile | null
  includeVisualMetaphors: boolean
  includePerformanceShots: boolean
  includeLocationScout: boolean
  musicVideoConfig?: MusicVideoConfig | null
}) {
  const {
    songTitle,
    artistName,
    lyrics,
    director = "",
    directorNotes = "",
    artistProfile,
    includeVisualMetaphors = true,
    includePerformanceShots = true,
    includeLocationScout = true,
    musicVideoConfig = null,
  } = params

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    // Step 1: Generate Music Video Structure
    const structurePrompt = mvPrompts.structure
      .replace("{songTitle}", songTitle)
      .replace("{artistName}", artistName)
      .replace("{lyrics}", lyrics)

    const { object: musicVideoStructure } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MusicVideoStructureSchema,
      prompt: structurePrompt,
    })

    // Step 2: Generate Treatments
    const artistContext = artistProfile ? buildArtistProfileString(artistProfile) : ""
    const directorContext = director ? buildDirectorStyleString(director, directorNotes) : ""

    const treatmentPrompt = mvPrompts.treatments
      .replace("{songTitle}", songTitle)
      .replace("{artistName}", artistName)
      .replace("{lyrics}", lyrics)
      .replace("{genre}", musicVideoStructure.genre)
      .replace("{artistContext}", artistContext)
      .replace("{directorContext}", directorContext)

    const { object: treatmentData } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({ treatments: z.array(TreatmentSchema) }),
      prompt: treatmentPrompt,
    })

    // Step 3: Generate Section Breakdowns
    const selectedTreatment = treatmentData.treatments[0]
    const sectionBreakdowns = []

    for (const section of musicVideoStructure.sections) {
      const sectionPrompt = mvPrompts.sectionBreakdown
        .replace("{sectionType}", section.type)
        .replace("{sectionLyrics}", section.lyrics || "Instrumental")
        .replace("{treatment}", JSON.stringify(selectedTreatment))
        .replace("{directorContext}", directorContext)
        .replace("{artistContext}", artistContext)
        .replace(
          "{visualOptions}",
          `${includeVisualMetaphors ? "Include visual metaphors. " : ""}${
            includePerformanceShots ? "Include performance shots. " : ""
          }${includeLocationScout ? "Consider diverse locations. " : ""}`
        )

      // Add config references if available
      let configContext = ""
      if (musicVideoConfig) {
        if (musicVideoConfig.locations?.length) {
          configContext += `\nUse these locations: ${musicVideoConfig.locations
            .map((l) => `${l.reference} (${l.name})`)
            .join(", ")}`
        }
        if (musicVideoConfig.wardrobe?.length) {
          configContext += `\nUse this wardrobe: ${musicVideoConfig.wardrobe
            .map((w) => `${w.reference} (${w.name})`)
            .join(", ")}`
        }
        if (musicVideoConfig.props?.length) {
          configContext += `\nUse these props: ${musicVideoConfig.props
            .map((p) => `${p.reference} (${p.name})`)
            .join(", ")}`
        }
      }

      const { object: breakdown } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: SectionBreakdownSchema,
        prompt: sectionPrompt + configContext,
      })

      sectionBreakdowns.push({
        ...breakdown,
        sectionId: section.id,
      })
    }

    return {
      success: true,
      data: {
        breakdown: {
          musicVideoStructure,
          treatments: treatmentData.treatments,
          selectedTreatment,
          sections: musicVideoStructure.sections, // Add sections for easy access
          sectionBreakdowns,
        },
        generatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error generating music video breakdown:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate breakdown",
    }
  }
}