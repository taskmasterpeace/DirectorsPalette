/**
 * Enhanced Artist Service - Handles versatile artist creation and slang system
 */

import { generateText } from "ai"
import { assertAIEnv, AI_MODEL, ServiceError } from "./base"
import type { ArtistProfile } from "@/lib/artist-types"
import { GENRE_STRUCTURE, suggestGenresFromDescription } from "@/lib/enhanced-genres"
import { cacheAIGeneration, withPerformanceMonitoring } from "@/lib/cache"

export interface ArtistSlang {
  term: string
  replacement: string
  context?: string
}

export interface EnhancedArtistProfile extends ArtistProfile {
  signature_slang?: {
    slang_terms: ArtistSlang[]
    linguistic_region: string
    authenticity_level: number
  }
}

function extractJsonFromResponse(text: string): any {
  const cleanText = text.replace(/```json\s*|\s*```/g, "").trim()
  return JSON.parse(cleanText)
}

/**
 * Generate realistic slang based on artist profile
 */
function generateSlangSuggestions(profile: Partial<ArtistProfile>): ArtistSlang[] {
  const region = profile.artist_identity?.city || profile.artist_identity?.state || 'General'
  const genres = profile.genres || []
  
  // Base slang patterns by genre/region
  const slangPatterns: Record<string, ArtistSlang[]> = {
    'Hip-Hop/Rap': [
      { term: 'money', replacement: 'bread', context: 'cash/payment' },
      { term: 'car', replacement: 'whip', context: 'vehicle' },
      { term: 'house', replacement: 'spot', context: 'home/place' },
      { term: 'fake', replacement: 'cap', context: 'lying/false' },
      { term: 'really', replacement: 'deadass', context: 'emphasis' },
      { term: 'good', replacement: 'valid', context: 'quality/approval' },
      { term: 'party', replacement: 'function', context: 'event/gathering' }
    ],
    'Trap': [
      { term: 'money', replacement: 'racks', context: 'cash/bands' },
      { term: 'drugs', replacement: 'work', context: 'product' },
      { term: 'gun', replacement: 'pole', context: 'weapon' },
      { term: 'police', replacement: '12', context: 'law enforcement' },
      { term: 'authentic', replacement: 'real', context: 'genuine' }
    ],
    'R&B/Soul': [
      { term: 'love', replacement: 'feelings', context: 'emotion' },
      { term: 'attractive', replacement: 'fine', context: 'appearance' },
      { term: 'relationship', replacement: 'situation', context: 'romantic connection' },
      { term: 'baby', replacement: 'bae', context: 'term of endearment' }
    ],
    'Atlanta': [
      { term: 'money', replacement: 'bankroll', context: 'cash' },
      { term: 'car', replacement: 'foreign', context: 'expensive car' },
      { term: 'party', replacement: 'lit function', context: 'event' }
    ],
    'New York': [
      { term: 'crazy', replacement: 'buggin', context: 'wild/insane' },
      { term: 'money', replacement: 'paper', context: 'cash' },
      { term: 'good', replacement: 'brick', context: 'quality' },
      { term: 'really', replacement: 'deadass', context: 'serious' }
    ],
    'Chicago': [
      { term: 'money', replacement: 'bands', context: 'cash' },
      { term: 'gun', replacement: 'blick', context: 'weapon' },
      { term: 'neighborhood', replacement: 'block', context: 'area' }
    ],
    'California': [
      { term: 'cool', replacement: 'coo', context: 'acceptable/good' },
      { term: 'money', replacement: 'cheddar', context: 'cash' },
      { term: 'car', replacement: 'ride', context: 'vehicle' }
    ]
  }
  
  const suggestions: ArtistSlang[] = []
  
  // Add genre-specific slang
  genres.forEach(genre => {
    if (slangPatterns[genre]) {
      suggestions.push(...slangPatterns[genre])
    }
  })
  
  // Add regional slang
  if (slangPatterns[region]) {
    suggestions.push(...slangPatterns[region])
  }
  
  // Remove duplicates and limit to 5-7 terms
  const uniqueSlang = suggestions.filter((item, index, arr) => 
    arr.findIndex(t => t.term === item.term) === index
  ).slice(0, 7)
  
  return uniqueSlang
}

export class EnhancedArtistService {
  /**
   * Create artist from ANY description - 1 word to full description
   */
  static async createFromDescription(description: string): Promise<{ profile: EnhancedArtistProfile }> {
    try {
      assertAIEnv()

      const artistId = `art_${Math.random().toString(36).slice(2, 10)}`
      const genreSuggestions = suggestGenresFromDescription(description)

      const prompt = `
Create a complete Artist Profile from this description: "${description}"

INSTRUCTIONS:
- Handle ANY input: single word ("Drake"), style mix ("Michael Jackson + Beanie Siegel"), detailed description, or region ("Atlanta rapper")
- For style mixing: blend characteristics authentically (voice + themes + visual style)
- For single words: extrapolate full persona from known artists or create original
- For regions: incorporate local sounds, slang, and cultural elements

GENRE RECOMMENDATIONS (use as guidance):
Suggested Genres: ${genreSuggestions.genres.join(', ') || 'determine from description'}
Suggested Subgenres: ${genreSuggestions.subgenres.join(', ') || 'determine from description'}
Suggested Microgenres: ${genreSuggestions.microgenres.join(', ') || 'determine from description'}

SLANG SYSTEM:
Include 5-7 authentic slang terms specific to:
- The artist's genre (hip-hop uses different slang than R&B)
- Their geographic region (Atlanta vs New York vs Chicago)
- Their generation/era
Format: [{ "term": "money", "replacement": "bread", "context": "cash/payment" }]

STYLE RULES:
- Accent: "hood Black male from Miami, FL" (region-specific)
- Sonic hallmark: "808-heavy low end; vinyl crackle; tape saturation"
- Tempo: "mid-tempo 85-100 BPM; syncopated hi-hats; polyrhythmic patterns"
- Camera rules: "lift lighting on chorus; handheld during verses; static for bridges"
- Themes: authentic to artist's background and genre

Return ONLY valid JSON with this exact structure:

{
  "artist_id": "${artistId}",
  "artist_name": "string",
  "real_name": "string", 
  "artist_identity": {
    "gender": "string",
    "race_ethnicity": "string",
    "age_range": "string", 
    "accent": "string (region-specific)",
    "neighborhood": "string",
    "city": "string",
    "state": "string", 
    "zip": "string"
  },
  "genres": ["array of 2-4 main genres"],
  "sub_genres": ["array of 2-4 subgenres"], 
  "micro_genres": ["array of 1-3 microgenres"],
  "vocal_description": {
    "tone_texture": "string (detailed)",
    "delivery_style": "string (specific to genre)",
    "quirks": ["array of 2-4 unique vocal characteristics"]
  },
  "signature_essence": {
    "sonic_hallmark": "string (production signature)"
  },
  "production_preferences": {
    "tempo_energy": "string (BPM range and feel)",
    "drums_bass_chords": "string (sound palette)",
    "emotional_arc_rules": "string (song structure preference)",
    "camera_movement_rules": "string (visual style for videos)",
    "lighting_lift_rules": "string (lighting preferences)"
  },
  "writing_persona": {
    "narrative_pov": "string (first person, storyteller, etc)",
    "linguistic_base": "string (vocabulary style)",
    "rhyme_form": "string (rhyme scheme preferences)", 
    "themes": ["array of 3-5 lyrical themes"],
    "signature_devices": ["array of 2-4 writing techniques"]
  },
  "personality": {
    "mbti": "string (16-type MBTI)"
  },
  "visual_look": {
    "skin_tone": "string",
    "hair_style": "string", 
    "fashion_style": "string (genre-appropriate)",
    "jewelry": "string (style-specific)"
  },
  "material_prefs": {
    "cars": ["array of 2-3 vehicle preferences"],
    "diamonds": ["array of jewelry preferences"],
    "weapons": ["array only if genre-appropriate"],
    "exclude": ["array of things they avoid/oppose"]
  },
  "signature_slang": {
    "slang_terms": [
      {"term": "original word", "replacement": "slang version", "context": "usage context"}
    ],
    "linguistic_region": "string (regional dialect)",
    "authenticity_level": 85
  },
  "chat_voice": {
    "tone": "string (conversational style)",
    "communication_style": "string (how they text/talk)",
    "signature_phrases": ["array of 2-3 catchphrases"]
  }
}`

      const { text } = await generateText({
        model: AI_MODEL,
        prompt,
        maxTokens: 3000,
        temperature: 0.9,
      })

      const profile = extractJsonFromResponse(text)
      
      // Auto-generate additional slang if not enough provided
      if (!profile.signature_slang?.slang_terms || profile.signature_slang.slang_terms.length < 3) {
        const generatedSlang = generateSlangSuggestions(profile)
        profile.signature_slang = {
          slang_terms: generatedSlang,
          linguistic_region: profile.artist_identity?.city || 'General',
          authenticity_level: 80
        }
      }

      return { profile: profile as EnhancedArtistProfile }

    } catch (error) {
      throw new ServiceError(
        `Failed to create artist from description: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ARTIST_CREATE_FAILED',
        { description }
      )
    }
  }

  /**
   * Auto-fill remaining fields with enhanced intelligence
   */
  static async autoFillRemaining(
    profile: Partial<ArtistProfile>,
    userInputs: { city?: string; genres?: string[]; [key: string]: any }
  ): Promise<{ fill: Partial<EnhancedArtistProfile> }> {
    return withPerformanceMonitoring('enhanced-artist-autofill', async () => {
      return cacheAIGeneration(
        'enhanced-autofill',
        { profile, userInputs },
        async () => {
          try {
            assertAIEnv()

            const prompt = `
Auto-fill remaining fields for this artist profile based on the provided information.

CURRENT PROFILE:
${JSON.stringify(profile, null, 2)}

USER INPUTS:
${JSON.stringify(userInputs, null, 2)}

FILL STRATEGY:
- Keep ALL existing values unchanged
- Use user inputs to inform missing fields
- Generate genre-appropriate content
- Create authentic regional details if city is provided
- Add realistic slang based on genre/region
- Maintain consistency across all fields

Fill ONLY empty/missing fields. Return complete JSON structure with filled values.`

            const { text } = await generateText({
              model: AI_MODEL,
              prompt,
              maxTokens: 2500,
              temperature: 0.7,
            })

            const fillData = extractJsonFromResponse(text)
            
            // Ensure slang is included
            if (!fillData.signature_slang && (userInputs.city || profile.genres)) {
              fillData.signature_slang = {
                slang_terms: generateSlangSuggestions({ ...profile, ...userInputs }),
                linguistic_region: userInputs.city || profile.artist_identity?.city || 'General',
                authenticity_level: 85
              }
            }

            return { fill: fillData }

          } catch (error) {
            throw new ServiceError(
              `Failed to auto-fill artist profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'ARTIST_AUTOFILL_FAILED',
              { artistName: profile.artist_name }
            )
          }
        }
      )
    })()
  }

  /**
   * Apply slang to text using artist's signature slang
   */
  static applySlangToText(text: string, slangTerms: ArtistSlang[]): string {
    let modifiedText = text

    slangTerms.forEach(({ term, replacement }) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      modifiedText = modifiedText.replace(regex, replacement)
    })

    return modifiedText
  }

  /**
   * Generate artist text message using their voice and slang
   */
  static generateArtistMessage(
    artist: EnhancedArtistProfile,
    context: string,
    options: any[]
  ): Promise<{ message: string; rating: number; emoji: string }[]> {
    // Implementation for artist text message generation
    // Would use the artist's chat_voice and signature_slang
    return Promise.resolve([])
  }
}