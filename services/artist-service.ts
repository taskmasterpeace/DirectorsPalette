/**
 * Artist service for managing artist profiles and autofill
 */

import { generateText } from "ai"
import { assertAIEnv, AI_MODEL, ServiceError } from "./base"
import type { ArtistProfile } from "@/lib/artist-types"

// ===== Utilities =====
function extractJsonFromResponse(text: string): any {
  // Remove markdown code blocks if present
  const cleanText = text.replace(/```json\s*|\s*```/g, "").trim()
  return JSON.parse(cleanText)
}

// ===== Service =====
export class ArtistService {
  /**
   * Autofill missing fields in an artist profile
   */
  static async autofillProfile(input: ArtistProfile): Promise<{ fill: Partial<ArtistProfile> }> {
    try {
      assertAIEnv()

      const prompt = `
You are completing a structured Artist Profile for a music video director. 
Fill ONLY the missing or empty fields. Keep existing user-provided values EXACTLY as-is.
Use short, production-ready phrasing.

Current profile data:
${JSON.stringify(input, null, 2)}

Required style rules:
- Accent/Dialect example style: "hood Black male from Miami, FL" (short, locale-aware)
- Sonic hallmark examples: "808-heavy low end; eerie pads; tape-saturated leads"
- Tempo/Groove examples: "mid-tempo 80–95 BPM; swung hi-hats"
- Camera/Lighting rules: "lift lighting on chorus; handheld on bridge; lock-off on outros"
- MBTI must be one of the 16 standard types (e.g., INTJ, ENFP)
- Arrays prefer 2–5 concrete items
- Keep all existing values unchanged

Fill ALL missing fields with realistic, detailed information. Return ONLY valid JSON matching this exact structure:

{
  "artist_name": "string (if empty)",
  "real_name": "string (if empty)",
  "artist_identity": {
    "gender": "string (if empty)",
    "race_ethnicity": "string (if empty)", 
    "age_range": "string (if empty)",
    "accent": "string (if empty)",
    "neighborhood": "string (if empty)",
    "city": "string (if empty)",
    "state": "string (if empty)",
    "zip": "string (if empty)"
  },
  "genres": ["array of strings (if empty)"],
  "sub_genres": ["array of strings (if empty)"],
  "micro_genres": ["array of strings (if empty)"],
  "vocal_description": {
    "tone_texture": "string (if empty)",
    "delivery_style": "string (if empty)",
    "quirks": ["array of strings (if empty)"]
  },
  "signature_essence": {
    "sonic_hallmark": "string (if empty)"
  },
  "production_preferences": {
    "tempo_energy": "string (if empty)",
    "drums_bass_chords": "string (if empty)",
    "emotional_arc_rules": "string (if empty)"
  },
  "writing_persona": {
    "narrative_pov": "string (if empty)",
    "linguistic_base": "string (if empty)",
    "rhyme_form": "string (if empty)",
    "themes": ["array of strings (if empty)"],
    "signature_devices": ["array of strings (if empty)"]
  },
  "personality": {
    "mbti": "string (if empty)"
  },
  "visual_look": {
    "skin_tone": "string (if empty)",
    "hair_style": "string (if empty)",
    "fashion_style": "string (if empty)",
    "jewelry": "string (if empty)"
  },
  "material_prefs": {
    "cars": ["array of strings (if empty)"],
    "diamonds": ["array of strings (if empty)"],
    "weapons": ["array of strings (if empty)"],
    "exclude": ["array of strings (if empty)"]
  },
  "adlib_profile": {
    "bank": ["array of strings (if empty)"],
    "placement_rules": "string (if empty)"
  },
  "career_direction": {
    "target_markets": ["array of strings (if empty)"],
    "north_star": "string (if empty)"
  },
  "chat_voice": {
    "tone": "string (if empty)",
    "never_say": ["array of strings (if empty)"]
  }
}

IMPORTANT: Return raw JSON only. No markdown formatting. No explanations.
`

      const result = await generateText({
        model: AI_MODEL,
        prompt,
        maxTokens: 2000,
        temperature: 0.8,
      })

      const fillData = extractJsonFromResponse(result.text)
      return { fill: fillData }
    } catch (error) {
      throw new ServiceError(
        `Failed to autofill artist profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ARTIST_AUTOFILL_FAILED',
        { artistName: input.artist_name }
      )
    }
  }

  /**
   * Create a complete artist profile from a description
   */
  static async createFromDescription(description: string): Promise<{ profile: ArtistProfile }> {
    try {
      assertAIEnv()

      const artistId = `art_${Math.random().toString(36).slice(2, 10)}`
      const timestamp = new Date().toISOString()

      const prompt = `
Create a complete Artist Profile based on this description: "${description}"

Generate a realistic, detailed artist profile with ALL fields filled. Use the description to inform the style, but create a complete, cohesive artist persona.

Style rules:
- Accent/Dialect: "hood Black male from Miami, FL" (short, locale-aware)
- Sonic hallmark: "808-heavy low end; eerie pads; tape-saturated leads"
- Tempo/Groove: "mid-tempo 80–95 BPM; swung hi-hats"
- Camera/Lighting: "lift lighting on chorus; handheld on bridge; lock-off on outros"
- MBTI: one of 16 standard types
- Arrays: 2–5 concrete items

Return raw JSON only. No markdown formatting. Use this exact structure:

{
  "artist_id": "${artistId}",
  "artist_name": "string",
  "real_name": "string",
  "artist_identity": {
    "gender": "string",
    "race_ethnicity": "string",
    "age_range": "string",
    "accent": "string",
    "neighborhood": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "genres": ["array of 2-4 strings"],
  "sub_genres": ["array of 2-4 strings"],
  "micro_genres": ["array of 2-3 strings"],
  "vocal_description": {
    "tone_texture": "string",
    "delivery_style": "string",
    "quirks": ["array of 2-4 strings"]
  },
  "signature_essence": {
    "sonic_hallmark": "string"
  },
  "production_preferences": {
    "tempo_energy": "string",
    "drums_bass_chords": "string",
    "emotional_arc_rules": "string"
  },
  "writing_persona": {
    "narrative_pov": "string",
    "linguistic_base": "string",
    "rhyme_form": "string",
    "themes": ["array of 3-5 strings"],
    "signature_devices": ["array of 2-4 strings"]
  },
  "personality": {
    "mbti": "string"
  },
  "visual_look": {
    "skin_tone": "string",
    "hair_style": "string",
    "fashion_style": "string",
    "jewelry": "string"
  },
  "material_prefs": {
    "cars": ["array of 2-4 strings"],
    "diamonds": ["array of 2-3 strings"],
    "weapons": ["array of 1-3 strings"],
    "exclude": ["array of 1-3 strings"]
  },
  "adlib_profile": {
    "bank": ["array of 3-6 strings"],
    "placement_rules": "string"
  },
  "career_direction": {
    "target_markets": ["array of 2-4 strings"],
    "north_star": "string"
  },
  "chat_voice": {
    "tone": "string",
    "never_say": ["array of 2-4 strings"]
  },
  "meta": {
    "version": "1.0",
    "created_at": "${timestamp}",
    "updated_at": "${timestamp}"
  }
}

IMPORTANT: Return raw JSON only. No markdown code blocks. No explanations.
`

      const { text } = await generateText({
        model: AI_MODEL,
        system: "You return raw JSON only. No markdown code blocks. No explanations. Create a complete, realistic artist profile.",
        prompt,
      })

      const parsed = extractJsonFromResponse(text)
      return { profile: parsed }
    } catch (error) {
      throw new ServiceError(
        `Failed to create artist from description: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ARTIST_CREATE_FROM_DESCRIPTION_FAILED',
        { description: description.substring(0, 100) + '...' }
      )
    }
  }

  /**
   * Create a complete artist profile from song lyrics
   */
  static async createFromLyrics(lyrics: string): Promise<{ profile: ArtistProfile }> {
    try {
      assertAIEnv()

      const artistId = `art_${Math.random().toString(36).slice(2, 10)}`
      const timestamp = new Date().toISOString()

      const prompt = `
Analyze these song lyrics and create a complete Artist Profile based on the style, themes, and characteristics you detect:

LYRICS:
"${lyrics}"

Infer the artist's identity, style, and characteristics from the lyrics. Create a realistic, complete profile. Use similar structure and style rules as previous examples.

Return raw JSON only. No markdown formatting. Use this exact structure with all fields filled:

{
  "artist_id": "${artistId}",
  "artist_name": "string",
  "real_name": "string",
  "artist_identity": {
    "gender": "string",
    "race_ethnicity": "string",
    "age_range": "string",
    "accent": "string",
    "neighborhood": "string",
    "city": "string",
    "state": "string",
    "zip": "string"
  },
  "genres": ["array of 2-4 strings"],
  "sub_genres": ["array of 2-4 strings"],
  "micro_genres": ["array of 2-3 strings"],
  "vocal_description": {
    "tone_texture": "string",
    "delivery_style": "string",
    "quirks": ["array of 2-4 strings"]
  },
  "signature_essence": {
    "sonic_hallmark": "string"
  },
  "production_preferences": {
    "tempo_energy": "string",
    "drums_bass_chords": "string",
    "emotional_arc_rules": "string"
  },
  "writing_persona": {
    "narrative_pov": "string",
    "linguistic_base": "string",
    "rhyme_form": "string",
    "themes": ["array of 3-5 strings"],
    "signature_devices": ["array of 2-4 strings"]
  },
  "personality": {
    "mbti": "string"
  },
  "visual_look": {
    "skin_tone": "string",
    "hair_style": "string",
    "fashion_style": "string",
    "jewelry": "string"
  },
  "material_prefs": {
    "cars": ["array of 2-4 strings"],
    "diamonds": ["array of 2-3 strings"],
    "weapons": ["array of 1-3 strings"],
    "exclude": ["array of 1-3 strings"]
  },
  "adlib_profile": {
    "bank": ["array of 3-6 strings"],
    "placement_rules": "string"
  },
  "career_direction": {
    "target_markets": ["array of 2-4 strings"],
    "north_star": "string"
  },
  "chat_voice": {
    "tone": "string",
    "never_say": ["array of 2-4 strings"]
  },
  "meta": {
    "version": "1.0",
    "created_at": "${timestamp}",
    "updated_at": "${timestamp}"
  }
}

IMPORTANT: Return raw JSON only. No markdown code blocks. No explanations.
`

      const { text } = await generateText({
        model: AI_MODEL,
        system: "You return raw JSON only. No markdown code blocks. No explanations. Analyze lyrics and create a complete, realistic artist profile.",
        prompt,
        maxTokens: 2500,
      })

      const parsed = extractJsonFromResponse(text)
      return { profile: parsed }
    } catch (error) {
      throw new ServiceError(
        `Failed to create artist from lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ARTIST_CREATE_FROM_LYRICS_FAILED',
        { lyrics: lyrics.substring(0, 100) + '...' }
      )
    }
  }
}