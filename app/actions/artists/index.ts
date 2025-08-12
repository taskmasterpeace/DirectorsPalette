"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { ArtistProfile } from "@/lib/artist-types"

const ArtistProfileSchema = z.object({
  artist_name: z.string(),
  genres: z.array(z.string()),
  visual_style: z.string(),
  themes: z.array(z.string()),
  color_preferences: z.string(),
  performance_style: z.string(),
  typical_locations: z.array(z.string()),
  typical_props: z.array(z.string()),
  wardrobe_style: z.string(),
  influences: z.array(z.string()),
  target_audience: z.string(),
  brand_identity: z.string(),
})

export async function autofillArtistProfile(input: ArtistProfile): Promise<{ fill: Partial<ArtistProfile> }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Based on the artist name "${input.artist_name}" and any provided details, generate a comprehensive artist profile.
Existing details: ${JSON.stringify(input)}

Fill in missing fields with appropriate values that match the artist's style and genre.
Focus on visual and performance aspects relevant to music video production.
`

  try {
    const { object: profile } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistProfileSchema,
      prompt,
      system: "You are creating an artist profile for music video production planning.",
    })

    return { fill: profile }
  } catch (error) {
    console.error("Error autofilling artist profile:", error)
    throw error
  }
}

export async function createArtistFromDescription(description: string): Promise<{ profile: ArtistProfile }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Based on this artist description, create a comprehensive artist profile:
"${description}"

Generate all profile fields including:
- Artist name
- Genres (array of relevant music genres)
- Visual style description
- Themes (array of common themes in their work)
- Color preferences
- Performance style
- Typical locations for videos
- Typical props used
- Wardrobe style
- Influences
- Target audience
- Brand identity
`

  try {
    const { object: profile } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistProfileSchema,
      prompt,
      system: "You are creating an artist profile for music video production planning.",
    })

    return { profile: profile as ArtistProfile }
  } catch (error) {
    console.error("Error creating artist from description:", error)
    throw error
  }
}

export async function createArtistFromLyrics(lyrics: string): Promise<{ profile: ArtistProfile }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Based on these song lyrics, infer and create an artist profile:
"${lyrics}"

Analyze the lyrics to determine:
- Likely artist name (create a fitting one)
- Genres that match the lyrical style
- Visual style that would complement these lyrics
- Themes present in the lyrics
- Appropriate color palette
- Performance style that fits the mood
- Locations that match the narrative
- Props that would enhance the story
- Wardrobe that fits the genre and mood
- Musical influences apparent in the style
- Target audience based on content
- Brand identity that emerges from the lyrics
`

  try {
    const { object: profile } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistProfileSchema,
      prompt,
      system: "You are inferring an artist profile from their lyrics for music video production planning.",
    })

    return { profile: profile as ArtistProfile }
  } catch (error) {
    console.error("Error creating artist from lyrics:", error)
    throw error
  }
}