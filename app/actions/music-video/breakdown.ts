"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { MusicVideoConfig } from "@/lib/indexeddb"
import type { ArtistProfile } from "@/lib/artist-types"
import { mvPrompts, buildArtistProfileString, buildDirectorStyleString } from "@/lib/prompts-mv"
import { withRetry } from "@/lib/error-handling"

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
  performanceNotes: z.array(z.string()).optional(),
  syncPoints: z.array(z.string()).optional(),
  performanceRatio: z.number().optional(),
}).passthrough() // Allow additional fields

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
    const structurePrompt = mvPrompts.musicVideoStructure({
      songTitle,
      artist: artistName,
      genre: "unknown" // We'll determine this from the analysis
    })

    const musicVideoStructure = await withRetry(
      async () => {
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: MusicVideoStructureSchema,
          prompt: structurePrompt,
          system: `You are analyzing a music video's lyrics to create a structured breakdown. Return valid JSON matching the exact schema. Each section must have an id, title, type, and lyrics.`,
        })
        return object
      },
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} for music video structure:`, error.message)
        }
      }
    )

    // Step 2: Generate Treatments
    const artistContext = artistProfile ? buildArtistProfileString(artistProfile) : ""
    // For now, use director as a simple string since it's just the director name/ID
    const directorContext = director ? `Director Style: ${director}\n${directorNotes ? `Director Notes: ${directorNotes}` : ''}` : ""

    const treatmentPrompt = mvPrompts.musicVideoTreatments({
      songTitle,
      artist: artistName,
      genre: musicVideoStructure.genre,
      directorStyle: directorContext,
      directorNotes: directorNotes || "",
      videoConcept: directorNotes || "",  // Using directorNotes as concept for now
      artistProfileStr: artistContext
    })

    const treatmentData = await withRetry(
      async () => {
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: z.object({ treatments: z.array(TreatmentSchema) }),
          prompt: treatmentPrompt,
          system: `You are a creative music video director proposing treatment concepts. Return valid JSON with exactly 3 treatments, each with unique visual approaches.`,
        })
        return object
      },
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} for treatments:`, error.message)
        }
      }
    )

    // Step 3: Generate Section Breakdowns
    const selectedTreatment = treatmentData.treatments[0]
    const sectionBreakdowns = []

    for (const section of musicVideoStructure.sections) {
      const sectionPrompt = `
Generate a shot list for this section of the music video.

Section: ${section.type}
Lyrics: ${section.lyrics || "Instrumental"}

Treatment: ${selectedTreatment.name}
Concept: ${selectedTreatment.concept}
Visual Theme: ${selectedTreatment.visualTheme}

${directorContext}
${artistContext}

Create 3-5 detailed shots that:
${includeVisualMetaphors ? "- Include visual metaphors\n" : ""}${
  includePerformanceShots ? "- Include performance shots\n" : ""
}${includeLocationScout ? "- Consider diverse locations\n" : ""}
- Match the treatment's visual theme
- Progress the narrative

IMPORTANT FORMATTING RULES:
1. Use @artist as a placeholder for the artist's name in ALL shots
2. @artist is a variable that represents the performing artist
3. Never use any actual artist names, always use @artist

IMPORTANT: Return a JSON object with this EXACT structure:
{
  "sectionId": "${section.id}",
  "shots": ["shot 1 description", "shot 2 description", ...],
  "locationReference": "location name or empty string",
  "wardrobeReference": "wardrobe description or empty string",
  "propReferences": ["prop1", "prop2"],
  "performanceNotes": ["note1", "note2"],
  "syncPoints": ["sync1", "sync2"],
  "performanceRatio": 0.5
}

CRITICAL: The shots array MUST contain STRINGS, not objects.
Example shot strings:
- "Wide shot of @artist in warehouse, dramatic lighting, slow dolly forward"
- "Close-up of @artist's face, emotional expression, handheld camera"
- "Tracking shot following @artist through urban streets, golden hour lighting"
`

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
        if (musicVideoConfig.visualThemes?.length) {
          configContext += `\nIncorporate these visual themes: ${musicVideoConfig.visualThemes.join(", ")}`
        }
      }

      const breakdown = await withRetry(
        async () => {
          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: SectionBreakdownSchema,
            prompt: sectionPrompt + configContext,
            system: `You are a music video director creating a detailed shot list. Always return valid JSON matching the exact schema provided. The shots array must contain string descriptions, not objects. CRITICAL: Always use @artist as a placeholder for the artist's name in shot descriptions, never use the actual artist name.`,
          })
          
          // DO NOT replace @artist - keep it as a variable placeholder
          // This makes the prompts reusable and shows the variable nature
          
          return object
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} for section ${section.id}:`, error.message)
          }
        }
      )

      sectionBreakdowns.push({
        ...breakdown,
        sectionId: section.id,
      })
    }

    // If no config provided, return early for config screen
    console.log('Checking config:', {
      hasConfig: !!musicVideoConfig,
      isConfigured: musicVideoConfig?.isConfigured,
      shouldReturnEarly: !musicVideoConfig || musicVideoConfig.isConfigured === false
    })
    
    if (!musicVideoConfig || musicVideoConfig.isConfigured === false) {
      console.log('Returning early - no config or not configured')
      return {
        success: true,
        data: {
          breakdown: {
            musicVideoStructure,
            treatments: treatmentData.treatments,
            selectedTreatment,
            sections: musicVideoStructure.sections,
            sectionBreakdowns: [], // Empty until configured
            isConfigured: false, // Not configured yet
          },
          config: null,
          isConfigured: false,
        },
      }
    }
    
    console.log(`Generated ${sectionBreakdowns.length} section breakdowns`)
    console.log('Sample section breakdown:', sectionBreakdowns[0])

    // Return a structure that the UI can actually use
    const finalBreakdown = {
      musicVideoStructure,
      treatments: treatmentData.treatments,
      selectedTreatment,
      sections: musicVideoStructure.sections, // Add sections for easy access
      sectionBreakdowns,
      isConfigured: true, // Add this to the breakdown itself
    }

    console.log('Returning breakdown with keys:', Object.keys(finalBreakdown))

    return {
      success: true,
      data: {
        breakdown: finalBreakdown,
        config: musicVideoConfig,
        isConfigured: true,
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