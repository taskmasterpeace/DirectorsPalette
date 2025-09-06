"use server"

import { openai } from "@ai-sdk/openai"
import { generateText, generateObject } from "ai"
import { z } from "zod"
import type { ArtistProfile } from "@/lib/artist-types"

// Enhanced profile schema with additional fields
const EnhancedProfileSchema = z.object({
  artist_name: z.string().optional(),
  real_name: z.string().optional(),
  artist_identity: z.object({
    gender: z.string().optional(),
    race_ethnicity: z.string().optional(),
    age_range: z.string().optional(),
    accent: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  genres: z.array(z.string()).optional(),
  sub_genres: z.array(z.string()).optional(),
  micro_genres: z.array(z.string()).optional(),
  vocal_description: z.object({
    tone_texture: z.string().optional(),
    delivery_style: z.string().optional(),
    quirks: z.array(z.string()).optional(),
  }).optional(),
  signature_essence: z.object({
    sonic_hallmark: z.string().optional(),
  }).optional(),
  production_preferences: z.object({
    tempo_energy: z.string().optional(),
    drums_bass_chords: z.string().optional(),
    emotional_arc_rules: z.string().optional(),
  }).optional(),
  writing_persona: z.object({
    narrative_pov: z.string().optional(),
    linguistic_base: z.string().optional(),
    rhyme_form: z.string().optional(),
    themes: z.array(z.string()).optional(),
    signature_devices: z.array(z.string()).optional(),
  }).optional(),
  personality: z.object({
    mbti: z.string().optional(),
  }).optional(),
  visual_look: z.object({
    skin_tone: z.string().optional(),
    hair_style: z.string().optional(),
    fashion_style: z.string().optional(),
    jewelry: z.string().optional(),
    visual_description: z.string().optional(),
  }).optional(),
  material_prefs: z.object({
    cars: z.array(z.string()).optional(),
    diamonds: z.array(z.string()).optional(),
    weapons: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
  adlib_profile: z.object({
    bank: z.array(z.string()).optional(),
    placement_rules: z.string().optional(),
  }).optional(),
  career_direction: z.object({
    target_markets: z.array(z.string()).optional(),
    north_star: z.string().optional(),
  }).optional(),
  chat_voice: z.object({
    tone: z.string().optional(),
    never_say: z.array(z.string()).optional(),
  }).optional(),
})

export async function autoFillRemaining(
  profile: Partial<ArtistProfile>,
  userInputs: { 
    city?: string
    primaryGenre?: string
    vibe?: string
    genres?: string[]
    subgenres?: string[]
    microgenres?: string[]
  }
): Promise<{ fill: Partial<ArtistProfile> }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Auto-fill remaining fields for this artist profile based on the provided information.

CURRENT PROFILE:
${JSON.stringify(profile, null, 2)}

USER INPUTS:
- City/Region: ${userInputs.city || 'Not specified'}
- Primary Genre: ${userInputs.primaryGenre || 'Not specified'}
- Vibe/Style: ${userInputs.vibe || 'Not specified'}
- Genres: ${userInputs.genres?.join(', ') || 'Not specified'}
- Subgenres: ${userInputs.subgenres?.join(', ') || 'Not specified'}
- Microgenres: ${userInputs.microgenres?.join(', ') || 'Not specified'}

FILL STRATEGY:
- Keep ALL existing values unchanged
- Use user inputs to inform missing fields
- Generate genre-appropriate content
- Create authentic regional details if city is provided
- Maintain consistency across all fields
- Focus on music video production relevant details

For any city provided, incorporate:
- Regional accent and slang patterns
- Local music scene influences
- Area-specific fashion and style
- Regional cultural references

Fill ONLY empty/missing fields with realistic, production-ready values.
`

  try {
    const { object: fillData } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: EnhancedProfileSchema,
      prompt,
      system: `You are completing an artist profile for music video production. 
Fill ONLY missing fields with authentic, detailed information that matches the artist's genre and region.
Keep all existing values exactly as they are.
Focus on visual and performance aspects relevant to music video creation.`,
      temperature: 0.7,
    })

    // Merge the filled data with the existing profile, preserving existing values
    const mergedProfile: Partial<ArtistProfile> = { ...profile }
    
    // Deep merge the filled data, only adding missing fields
    Object.entries(fillData).forEach(([key, value]) => {
      if (value && (!profile[key as keyof ArtistProfile] || 
          (typeof value === 'object' && !Array.isArray(value)))) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Deep merge objects
          mergedProfile[key as keyof ArtistProfile] = {
            ...(profile[key as keyof ArtistProfile] as any || {}),
            ...value
          }
        } else if (!profile[key as keyof ArtistProfile]) {
          // Only add if field doesn't exist
          mergedProfile[key as keyof ArtistProfile] = value as any
        }
      }
    })

    return { fill: mergedProfile }
  } catch (error) {
    console.error("Error auto-filling artist profile:", error)
    throw new Error(`Failed to auto-fill artist profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}