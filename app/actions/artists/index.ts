"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { ArtistProfile } from "@/lib/artist-types"
import type { ArtistProfileV2 } from "@/lib/artist-types-v2"
import { createBlankArtistV2 } from "@/lib/artist-types-v2"

// Schema for AI generation - focused on music creation
const ArtistGenerationSchema = z.object({
  // Identity
  artist_name: z.string(),
  real_name: z.string().optional(),
  gender: z.string(),
  age_range: z.string(),
  origin_city: z.string(),
  origin_state: z.string(),
  mbti: z.string().optional(),
  
  // Vocal Phonetics
  regional_dialect: z.string(),
  vowel_color: z.string(),
  consonant_attack: z.string(),
  
  // Musical DNA
  genres_primary: z.array(z.string()),
  genres_sub: z.array(z.string()).optional(),
  genres_micro: z.array(z.string()).optional(),
  
  // Vocal Profile
  voice_type: z.string(),
  vocal_weight: z.string(),
  breathiness: z.number().min(0).max(10),
  rasp: z.number().min(0).max(10),
  
  // Performance
  timing_preference: z.string(),
  flow_types: z.array(z.string()),
  adlibs_bank: z.array(z.string()),
  energy_level: z.string(),
  
  // Songwriting
  syllables_per_bar_verse: z.number(),
  syllables_per_bar_chorus: z.number(),
  rhyme_density: z.number().min(0).max(10),
  primary_themes: z.array(z.string()),
  narrative_style: z.string(),
  
  // Production
  drum_character: z.string(),
  bass_type: z.string(),
  primary_instruments: z.array(z.string()),
  bpm_min: z.number(),
  bpm_max: z.number(),
  bpm_sweet_spot: z.number(),
})

export async function autofillArtistProfile(input: ArtistProfile | ArtistProfileV2): Promise<{ fill: Partial<ArtistProfileV2> }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  // Extract basic info from either format
  const artistName = 'artist_name' in input ? input.artist_name : (input as any).identity_persona?.artist_name
  const genres = 'genres' in input ? input.genres : (input as any).musical_dna?.genres?.primary

  const prompt = `
Based on the artist name "${artistName}" and genres ${JSON.stringify(genres)}, generate a comprehensive artist profile for AI music creation.

Existing details: ${JSON.stringify(input)}

Focus on:
1. Vocal characteristics crucial for AI voice synthesis
2. Songwriting patterns (syllable counts, rhyme density)
3. Production preferences for beat creation
4. Performance style for ad-libs and energy

Make it specific and detailed for ${artistName}'s style.
`

  try {
    const { object: generated } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistGenerationSchema,
      prompt,
      system: "You are creating a detailed artist profile for AI song generation. Focus on technical musical details that AI systems need to create authentic-sounding music in this artist's style.",
    })

    // Convert to V2 format
    const v2Profile: Partial<ArtistProfileV2> = {
      identity_persona: {
        artist_name: generated.artist_name,
        real_name: generated.real_name,
        gender: generated.gender,
        age_range: generated.age_range,
        origin_city: generated.origin_city,
        origin_state: generated.origin_state,
        mbti: generated.mbti as any,
        vocal_phonetics: {
          regional_dialect: generated.regional_dialect,
          vowel_color: generated.vowel_color,
          consonant_attack: generated.consonant_attack,
        },
      },
      vocal_performance: {
        vocal_timbre: {
          voice_type: generated.voice_type as any,
          weight: generated.vocal_weight as any,
          texture: {
            breathiness: generated.breathiness,
            rasp: generated.rasp,
            nasality: 3,
            warmth: 7,
          },
        },
        flow_phrasing: {
          timing_preference: generated.timing_preference as any,
          flow_types: generated.flow_types as any,
        },
        performance_persona: {
          adlibs_bank: generated.adlibs_bank,
          energy_level: generated.energy_level as any,
        },
      },
      songwriting_system: {
        prosody_rhyme: {
          syllables_per_bar: {
            verse_avg: generated.syllables_per_bar_verse,
            chorus_avg: generated.syllables_per_bar_chorus,
            variance: 2,
          },
          rhyme_density: generated.rhyme_density,
        },
        themes: {
          primary_themes: generated.primary_themes,
          narrative_style: generated.narrative_style as any,
        },
      },
      musical_dna: {
        genres: {
          primary: generated.genres_primary,
          sub: generated.genres_sub || [],
          micro: generated.genres_micro || [],
        },
        rhythm_groove: {
          bpm_range: {
            min: generated.bpm_min,
            max: generated.bpm_max,
            sweet_spot: generated.bpm_sweet_spot,
          },
        },
      },
      production_blueprint: {
        core_palette: {
          drum_character: generated.drum_character as any,
          bass_type: generated.bass_type as any,
          primary_instruments: generated.primary_instruments,
        },
      },
    }

    return { fill: v2Profile }
  } catch (error) {
    console.error("Error autofilling artist profile:", error)
    throw error
  }
}

export async function createArtistFromDescription(description: string): Promise<{ profile: ArtistProfileV2 }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Based on this artist description, create a comprehensive artist profile for AI music generation:
"${description}"

Analyze the description and generate:
1. Identity details (name, gender, origin, personality type)
2. Vocal characteristics (timbre, texture, phonetics) 
3. Musical DNA (genres, BPM preferences, rhythm patterns)
4. Songwriting patterns (syllable counts, rhyme density, themes)
5. Production preferences (instruments, drum/bass style)
6. Performance style (energy, ad-libs, flow types)

Be specific and technical - this will be used to generate AI music.
`

  try {
    const { object: generated } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistGenerationSchema,
      prompt,
      system: "You are creating a detailed technical artist profile for AI song generation. Extract musical characteristics that define this artist's unique sound and style. Be specific about vocal qualities, rhythm patterns, and production elements.",
    })

    // Create full V2 profile
    const profile = createBlankArtistV2()
    
    // Populate with generated data
    profile.identity_persona = {
      artist_name: generated.artist_name,
      real_name: generated.real_name,
      gender: generated.gender,
      age_range: generated.age_range,
      origin_city: generated.origin_city,
      origin_state: generated.origin_state,
      mbti: generated.mbti as any,
      vocal_phonetics: {
        regional_dialect: generated.regional_dialect,
        vowel_color: generated.vowel_color,
        consonant_attack: generated.consonant_attack,
        diction_clarity: 7,
      },
    }
    
    profile.vocal_performance = {
      vocal_timbre: {
        voice_type: generated.voice_type as any,
        weight: generated.vocal_weight as any,
        texture: {
          breathiness: generated.breathiness,
          rasp: generated.rasp,
          nasality: 3,
          warmth: 7,
        },
      },
      flow_phrasing: {
        timing_preference: generated.timing_preference as any,
        flow_types: generated.flow_types as any,
        phrasing_style: "mixed",
        swing_percentage: 15,
      },
      performance_persona: {
        adlibs_bank: generated.adlibs_bank,
        energy_level: generated.energy_level as any,
        adlib_frequency: "moderate",
      },
      vocal_production: {
        stacking_style: "doubles",
        autotune_amount: 3,
      },
    }
    
    profile.songwriting_system = {
      song_forms: {
        intro_style: "instrumental",
        outro_style: "fade",
      },
      prosody_rhyme: {
        syllables_per_bar: {
          verse_avg: generated.syllables_per_bar_verse,
          chorus_avg: generated.syllables_per_bar_chorus,
          variance: 2,
        },
        rhyme_density: generated.rhyme_density,
        multisyllabic_frequency: "moderate",
      },
      themes: {
        primary_themes: generated.primary_themes,
        narrative_style: generated.narrative_style as any,
      },
      lyrical_content: {
        pov: "first-person",
        sincerity_level: 7,
        vocabulary_level: "moderate",
        slang_density: "moderate",
      },
    }
    
    profile.musical_dna = {
      genres: {
        primary: generated.genres_primary,
        sub: generated.genres_sub || [],
        micro: generated.genres_micro || [],
      },
      rhythm_groove: {
        bpm_range: {
          min: generated.bpm_min,
          max: generated.bpm_max,
          sweet_spot: generated.bpm_sweet_spot,
        },
        groove_feel: "straight",
        syncopation_level: 5,
      },
    }
    
    profile.production_blueprint = {
      core_palette: {
        drum_character: generated.drum_character as any,
        bass_type: generated.bass_type as any,
        primary_instruments: generated.primary_instruments,
      },
      texture_space: {
        density: "moderate",
        stereo_width: "wide",
        reverb_character: "room",
        saturation_amount: 5,
      },
      mix_character: {
        frequency_balance: "balanced",
        compression_style: "modern",
        loudness_target: "competitive",
      },
    }

    return { profile }
  } catch (error) {
    console.error("Error creating artist from description:", error)
    throw error
  }
}

export async function createArtistFromLyrics(lyrics: string): Promise<{ profile: ArtistProfileV2 }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const prompt = `
Analyze these song lyrics and create a detailed artist profile for AI music generation:
"${lyrics}"

From the lyrics, determine:
1. Vocal delivery style (flow patterns, timing, energy)
2. Rhyme schemes and syllable patterns (count syllables per bar)
3. Vocabulary level and slang usage
4. Themes and narrative style
5. Likely genre and sub-genres
6. Emotional tone and energy level
7. Regional dialect or accent hints
8. Personality type that would write these lyrics

Create a fitting artist name and full profile based on the lyrical analysis.
Be technically specific for AI music generation.
`

  try {
    const { object: generated } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ArtistGenerationSchema,
      prompt,
      system: "You are a music analyst creating a technical artist profile from lyrics. Focus on extracting rhythmic patterns, rhyme density, vocabulary style, and flow characteristics. Count syllables, identify rhyme schemes, and infer production preferences from the lyrical content and structure.",
    })

    // Create full V2 profile from lyrics analysis
    const profile = createBlankArtistV2()
    
    profile.identity_persona = {
      artist_name: generated.artist_name,
      real_name: generated.real_name,
      gender: generated.gender,
      age_range: generated.age_range,
      origin_city: generated.origin_city,
      origin_state: generated.origin_state,
      mbti: generated.mbti as any,
      vocal_phonetics: {
        regional_dialect: generated.regional_dialect,
        vowel_color: generated.vowel_color,
        consonant_attack: generated.consonant_attack,
        diction_clarity: 7,
      },
    }
    
    profile.vocal_performance = {
      vocal_timbre: {
        voice_type: generated.voice_type as any,
        weight: generated.vocal_weight as any,
        texture: {
          breathiness: generated.breathiness,
          rasp: generated.rasp,
          nasality: 3,
          warmth: 7,
        },
      },
      flow_phrasing: {
        timing_preference: generated.timing_preference as any,
        flow_types: generated.flow_types as any,
        phrasing_style: "mixed",
        swing_percentage: 15,
      },
      performance_persona: {
        adlibs_bank: generated.adlibs_bank,
        energy_level: generated.energy_level as any,
        adlib_frequency: "moderate",
        adlib_placement: "end of bars",
      },
      vocal_production: {
        stacking_style: "doubles",
        harmony_intervals: ["3rd", "5th"],
        autotune_amount: 3,
      },
    }
    
    profile.songwriting_system = {
      song_forms: {
        intro_style: "vocal",
        outro_style: "fade",
      },
      hook_strategy: {
        hook_type: "melodic",
        hook_density: "moderate",
      },
      prosody_rhyme: {
        syllables_per_bar: {
          verse_avg: generated.syllables_per_bar_verse,
          chorus_avg: generated.syllables_per_bar_chorus,
          variance: 2,
        },
        rhyme_density: generated.rhyme_density,
        rhyme_schemes: ["AABB", "ABAB"],
        multisyllabic_frequency: "moderate",
        alliteration_usage: "moderate",
      },
      themes: {
        primary_themes: generated.primary_themes,
        narrative_style: generated.narrative_style as any,
        metaphor_systems: ["street", "hustle"],
        emotional_range: ["confident", "reflective"],
      },
      lyrical_content: {
        pov: "first-person",
        sincerity_level: 8,
        vocabulary_level: "moderate",
        slang_density: "moderate",
      },
    }
    
    profile.musical_dna = {
      genres: {
        primary: generated.genres_primary,
        sub: generated.genres_sub || [],
        micro: generated.genres_micro || [],
      },
      rhythm_groove: {
        bpm_range: {
          min: generated.bpm_min,
          max: generated.bpm_max,
          sweet_spot: generated.bpm_sweet_spot,
        },
        groove_feel: "straight",
        subdivision_focus: "sixteenths",
        syncopation_level: 6,
      },
      flow_archetypes: {
        primary_flows: [
          { name: "conversational", usage_percentage: 40 },
          { name: "melodic", usage_percentage: 30 },
          { name: "aggressive", usage_percentage: 30 },
        ],
        pocket_preference: "in-pocket",
        bar_end_habits: "always land",
      },
    }
    
    profile.production_blueprint = {
      core_palette: {
        drum_character: generated.drum_character as any,
        bass_type: generated.bass_type as any,
        primary_instruments: generated.primary_instruments,
        signature_sounds: ["vinyl crackle", "vocal chops"],
      },
      rhythm_section: {
        kick_pattern: "boom-bap",
        snare_placement: "2-4",
        hihat_style: "straight",
        bass_behavior: {
          movement: "melodic",
          octave_jumps: true,
          glides: false,
        },
      },
      texture_space: {
        density: "moderate",
        stereo_width: "wide",
        reverb_character: "room",
        delay_usage: "subtle",
        saturation_amount: 5,
      },
      arrangement: {
        intro_length: "short",
        energy_curve: "gradual-build",
        drop_style: "full",
        transition_style: "smooth",
      },
      mix_character: {
        frequency_balance: "balanced",
        compression_style: "modern",
        loudness_target: "competitive",
      },
    }
    
    profile.content_safety = {
      content_filters: {
        profanity_level: "moderate",
        violence_references: "metaphorical",
        sexual_content: "suggestive",
        substance_references: "casual",
        misogyny_filter: false,
      },
      chat_personality: {
        base_tone: "casual",
        humor_style: "dry",
        formality_level: "casual",
        response_length: "moderate",
      },
    }

    return { profile }
  } catch (error) {
    console.error("Error creating artist from lyrics:", error)
    throw error
  }
}