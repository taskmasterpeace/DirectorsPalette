"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ArtistProfile } from "@/lib/artist-types"

function extractJsonFromResponse(text: string): any {
  // Remove markdown code blocks if present
  const cleanText = text.replace(/```json\s*|\s*```/g, "").trim()
  return JSON.parse(cleanText)
}

export async function autofillArtistProfile(input: ArtistProfile): Promise<{ fill: Partial<ArtistProfile> }> {
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

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system:
        "You return raw JSON only. No markdown code blocks. No explanations. Fill all missing fields with realistic data.",
      prompt,
    })

    const parsed = extractJsonFromResponse(text)
    return { fill: parsed }
  } catch (err) {
    console.error("Autofill error:", err)
    return { fill: {} }
  }
}

export async function createArtistFromDescription(description: string): Promise<{ profile: ArtistProfile }> {
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

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system:
        "You return raw JSON only. No markdown code blocks. No explanations. Create a complete, realistic artist profile.",
      prompt,
    })

    const parsed = extractJsonFromResponse(text)
    return { profile: parsed }
  } catch (err) {
    console.error("Create artist error:", err)
    throw new Error("Failed to create artist from description")
  }
}

export async function createArtistFromLyrics(lyrics: string): Promise<{ profile: ArtistProfile }> {
  const artistId = `art_${Math.random().toString(36).slice(2, 10)}`
  const timestamp = new Date().toISOString()

  const prompt = `
Analyze these song lyrics and create a complete Artist Profile based on the style, themes, and characteristics you detect:

LYRICS:
"${lyrics}"

Based on the lyrics, infer:
- Vocal style and delivery from the flow and rhythm
- Themes and subject matter from content
- Linguistic patterns and dialect
- Personality traits and MBTI type
- Visual style and material preferences from references
- Geographic/cultural background from language use

Create a realistic, detailed artist profile with ALL fields filled based on your analysis.

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

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system:
        "You return raw JSON only. No markdown code blocks. No explanations. Analyze lyrics and create a complete artist profile.",
      prompt,
    })

    const parsed = extractJsonFromResponse(text)
    return { profile: parsed }
  } catch (err) {
    console.error("Create artist from lyrics error:", err)
    throw new Error("Failed to create artist from lyrics")
  }
}
