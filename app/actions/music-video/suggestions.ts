"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { ArtistProfile } from "@/lib/artist-types"

const SuggestionSchema = z.object({
  locations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      purpose: z.string(),
    })
  ),
  wardrobe: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      purpose: z.string(),
    })
  ),
  props: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      purpose: z.string(),
    })
  ),
})

export async function generateMusicVideoSuggestions({
  songTitle,
  artistName,
  lyrics,
  treatment,
  artistProfile,
}: {
  songTitle: string
  artistName: string
  lyrics: string
  treatment: any
  artistProfile?: ArtistProfile | null
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  try {
    const prompt = `
Based on this music video treatment, suggest specific locations, wardrobe, and props.

Song: "${songTitle}" by ${artistName}
Treatment Concept: ${treatment.concept}
Visual Theme: ${treatment.visualTheme}
${artistProfile ? `Artist Style: ${(artistProfile as any).visual_style || 'No style specified'}` : ''}

Lyrics for context:
${lyrics}

Generate practical, specific suggestions that would work for this music video.
Each suggestion should have:
- A unique ID (e.g., "loc-1", "ward-1", "prop-1")
- A clear name
- A brief description
- The purpose it serves in the video

Focus on items that would enhance the visual storytelling and match the treatment's theme.
`

    const { object: suggestions } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: SuggestionSchema,
      prompt,
      system: "You are a music video production designer creating practical suggestions for locations, wardrobe, and props.",
    })

    return {
      success: true,
      data: suggestions,
    }
  } catch (error) {
    console.error("Error generating music video suggestions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate suggestions",
    }
  }
}