import { z } from "zod"

// ============================================
// 1. IDENTITY & PERSONA
// ============================================

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const

export const IdentityPersonaSchema = z.object({
  artist_name: z.string(),
  real_name: z.string().optional(),
  image_data_url: z.string().optional(),
  gender: z.string().optional(),
  age_range: z.string().optional(),
  origin_city: z.string().optional(),
  origin_state: z.string().optional(),
  mbti: z.enum(MBTI_TYPES).optional(),
  
  // Vocal Phonetics (renamed from accent)
  vocal_phonetics: z.object({
    regional_dialect: z.string().optional(), // "Southern drawl", "NYC rapid-fire"
    vowel_color: z.string().optional(), // "rounded", "bright", "nasal"
    consonant_attack: z.string().optional(), // "soft", "percussive", "clipped"
    diction_clarity: z.number().min(0).max(10).optional(), // 0=mumbled, 10=crystal clear
  }).optional(),
  
  // Brand Positioning
  brand_positioning: z.object({
    sonic_references: z.array(z.string()).optional(), // ["Drake", "J. Cole", "Kendrick"]
    market_position: z.string().optional(), // "conscious mainstream", "underground experimental"
    differentiators: z.array(z.string()).optional(), // what makes them unique
  }).optional(),
})

// ============================================
// 2. VOCAL & PERFORMANCE PROFILE
// ============================================

export const VocalPerformanceSchema = z.object({
  // Vocal Timbre Profile
  vocal_timbre: z.object({
    voice_type: z.enum(["soprano", "alto", "tenor", "baritone", "bass", "varied"]).optional(),
    range_low: z.string().optional(), // "C2"
    range_high: z.string().optional(), // "C5"
    tessitura: z.string().optional(), // comfortable range "G2-G4"
    weight: z.enum(["light", "lyric", "dramatic", "heavy"]).optional(),
    texture: z.object({
      breathiness: z.number().min(0).max(10).optional(),
      rasp: z.number().min(0).max(10).optional(),
      nasality: z.number().min(0).max(10).optional(),
      warmth: z.number().min(0).max(10).optional(),
    }).optional(),
  }).optional(),
  
  // Flow & Phrasing System
  flow_phrasing: z.object({
    timing_preference: z.enum(["behind", "on", "ahead", "varies"]).optional(),
    flow_types: z.array(z.enum([
      "straight", "triplet", "double-time", "half-time", 
      "syncopated", "trap-triplet", "boom-bap", "melodic"
    ])).optional(),
    phrasing_style: z.enum(["legato", "staccato", "mixed"]).optional(),
    swing_percentage: z.number().min(0).max(100).optional(),
  }).optional(),
  
  // Performance Persona
  performance_persona: z.object({
    energy_level: z.enum(["laid-back", "moderate", "high-energy", "dynamic"]).optional(),
    stage_presence: z.string().optional(),
    signature_moves: z.array(z.string()).optional(),
    adlibs_bank: z.array(z.string()).optional(), // ["yeah", "uh", "okay", "let's go"]
    adlib_frequency: z.enum(["sparse", "moderate", "heavy"]).optional(),
    adlib_placement: z.string().optional(), // "end of bars", "throughout", "hooks only"
  }).optional(),
  
  // Vocal Production Preferences
  vocal_production: z.object({
    stacking_style: z.enum(["minimal", "doubles", "heavy", "gospel"]).optional(),
    harmony_intervals: z.array(z.enum(["unison", "3rd", "5th", "6th", "octave"])).optional(),
    autotune_amount: z.number().min(0).max(10).optional(),
    effects_chain: z.array(z.string()).optional(), // ["compression", "reverb", "delay"]
  }).optional(),
})

// ============================================
// 3. SONGWRITING SYSTEM
// ============================================

export const SongwritingSystemSchema = z.object({
  // Song Structure
  song_forms: z.object({
    preferred_structures: z.array(z.object({
      structure: z.string(), // "verse-chorus-verse-chorus-bridge-chorus"
      probability: z.number().min(0).max(1),
    })).optional(),
    intro_style: z.enum(["instrumental", "vocal", "cold-open", "build-up"]).optional(),
    outro_style: z.enum(["fade", "hard-stop", "instrumental", "repeat-hook"]).optional(),
  }).optional(),
  
  // Hook Strategy
  hook_strategy: z.object({
    hook_type: z.enum(["melodic", "chant", "post-chorus", "pre-chorus"]).optional(),
    hook_placement: z.array(z.number()).optional(), // [8, 16, 24] bar numbers
    hook_density: z.enum(["minimal", "moderate", "heavy"]).optional(),
    catchphrase_style: z.string().optional(),
  }).optional(),
  
  // Prosody & Rhyme
  prosody_rhyme: z.object({
    syllables_per_bar: z.object({
      verse_avg: z.number().optional(),
      chorus_avg: z.number().optional(),
      variance: z.number().optional(), // how much it varies
    }).optional(),
    rhyme_density: z.number().min(0).max(10).optional(), // rhymes per bar
    rhyme_schemes: z.array(z.string()).optional(), // ["AABB", "ABAB", "internal"]
    multisyllabic_frequency: z.enum(["rare", "moderate", "heavy"]).optional(),
    alliteration_usage: z.enum(["minimal", "moderate", "heavy"]).optional(),
  }).optional(),
  
  // Lyrical Content
  lyrical_content: z.object({
    pov: z.enum(["first-person", "third-person", "mixed", "omniscient"]).optional(),
    sincerity_level: z.number().min(0).max(10).optional(), // 0=satire, 10=earnest
    vocabulary_level: z.enum(["simple", "moderate", "complex", "academic"]).optional(),
    slang_density: z.enum(["none", "light", "moderate", "heavy"]).optional(),
    regional_terms: z.array(z.string()).optional(),
  }).optional(),
  
  // Thematic Elements
  themes: z.object({
    primary_themes: z.array(z.string()).optional(), // ["struggle", "success", "love"]
    narrative_style: z.enum(["linear", "vignettes", "abstract", "storytelling"]).optional(),
    metaphor_systems: z.array(z.string()).optional(), // ["sports", "war", "nature"]
    emotional_range: z.array(z.string()).optional(), // ["vulnerable", "confident", "angry"]
  }).optional(),
})

// ============================================
// 4. MUSICAL DNA
// ============================================

export const MusicalDNASchema = z.object({
  // Genre Classification
  genres: z.object({
    primary: z.array(z.string()),
    sub: z.array(z.string()).optional(),
    micro: z.array(z.string()).optional(),
    fusion_elements: z.array(z.string()).optional(), // genres they blend
  }),
  
  // Melody Profile (for singers/melodic rappers)
  melody_profile: z.object({
    scale_modes: z.array(z.string()).optional(), // ["minor", "major", "dorian", "mixolydian"]
    common_intervals: z.array(z.string()).optional(), // ["3rd", "5th", "octave"]
    leap_vs_step_ratio: z.number().optional(), // 0=all steps, 1=all leaps
    melisma_usage: z.enum(["none", "minimal", "moderate", "heavy"]).optional(),
    vibrato: z.object({
      rate: z.number().optional(), // Hz
      depth: z.number().optional(), // cents
      usage: z.enum(["none", "endings", "sustained", "throughout"]).optional(),
    }).optional(),
  }).optional(),
  
  // Harmony Tendencies
  harmony: z.object({
    key_centers: z.array(z.string()).optional(), // ["Am", "C", "F#m"]
    chord_progressions: z.array(z.string()).optional(), // ["i-VI-III-VII", "I-V-vi-IV"]
    modal_flavors: z.array(z.string()).optional(),
    harmonic_rhythm: z.enum(["slow", "moderate", "fast"]).optional(),
  }).optional(),
  
  // Rhythm & Groove
  rhythm_groove: z.object({
    bpm_range: z.object({
      min: z.number(),
      max: z.number(),
      sweet_spot: z.number(),
    }).optional(),
    groove_feel: z.enum(["straight", "swung", "shuffled", "latin"]).optional(),
    subdivision_focus: z.enum(["quarters", "eighths", "sixteenths", "triplets"]).optional(),
    syncopation_level: z.number().min(0).max(10).optional(),
  }).optional(),
  
  // Flow Archetypes (for rappers)
  flow_archetypes: z.object({
    primary_flows: z.array(z.object({
      name: z.string(), // "machine-gun", "laid-back", "choppy"
      usage_percentage: z.number(),
    })).optional(),
    pocket_preference: z.enum(["in-pocket", "pushing", "dragging", "varied"]).optional(),
    bar_end_habits: z.string().optional(), // "always land", "carry over", "vary"
  }).optional(),
})

// ============================================
// 5. PRODUCTION BLUEPRINT
// ============================================

export const ProductionBlueprintSchema = z.object({
  // Core Production Palette
  core_palette: z.object({
    drum_character: z.enum(["acoustic", "electronic", "hybrid", "vintage"]).optional(),
    bass_type: z.enum(["808", "synth", "electric", "upright", "hybrid"]).optional(),
    primary_instruments: z.array(z.string()).optional(), // ["piano", "guitar", "strings"]
    signature_sounds: z.array(z.string()).optional(), // ["vinyl crackle", "tape saturation"]
  }).optional(),
  
  // Rhythm Section Details
  rhythm_section: z.object({
    kick_pattern: z.string().optional(), // "four-on-floor", "boom-bap", "trap"
    snare_placement: z.string().optional(), // "2-4", "3", "syncopated"
    hihat_style: z.string().optional(), // "straight", "trap-rolls", "open-closed"
    percussion_elements: z.array(z.string()).optional(),
    bass_behavior: z.object({
      movement: z.enum(["static", "walking", "melodic", "following-kick"]).optional(),
      octave_jumps: z.boolean().optional(),
      glides: z.boolean().optional(),
    }).optional(),
  }).optional(),
  
  // Texture & Space
  texture_space: z.object({
    density: z.enum(["minimal", "moderate", "lush", "wall-of-sound"]).optional(),
    stereo_width: z.enum(["mono", "narrow", "wide", "immersive"]).optional(),
    reverb_character: z.enum(["dry", "room", "hall", "cathedral", "spring"]).optional(),
    delay_usage: z.enum(["none", "subtle", "obvious", "creative"]).optional(),
    saturation_amount: z.number().min(0).max(10).optional(),
  }).optional(),
  
  // Arrangement Dynamics
  arrangement: z.object({
    intro_length: z.enum(["none", "short", "medium", "long"]).optional(),
    energy_curve: z.string().optional(), // "gradual-build", "immediate-drop", "wave"
    drop_style: z.enum(["full", "drums-only", "bass-drop", "beat-switch"]).optional(),
    transition_style: z.enum(["smooth", "abrupt", "filtered", "risers"]).optional(),
  }).optional(),
  
  // Mix Characteristics
  mix_character: z.object({
    frequency_balance: z.enum(["bass-heavy", "balanced", "bright", "mid-focused"]).optional(),
    compression_style: z.enum(["transparent", "pumping", "vintage", "modern"]).optional(),
    loudness_target: z.enum(["dynamic", "competitive", "crushed"]).optional(),
  }).optional(),
})

// ============================================
// 6. CONTENT & SAFETY
// ============================================

export const ContentSafetySchema = z.object({
  // Content Filters
  content_filters: z.object({
    profanity_level: z.enum(["none", "mild", "moderate", "explicit"]).optional(),
    violence_references: z.enum(["none", "metaphorical", "mild", "graphic"]).optional(),
    sexual_content: z.enum(["none", "suggestive", "explicit"]).optional(),
    substance_references: z.enum(["none", "casual", "heavy"]).optional(),
    misogyny_filter: z.boolean().optional(),
  }).optional(),
  
  // Cultural Sensitivities
  cultural_sensitivity: z.object({
    avoid_terms: z.array(z.string()).optional(),
    respect_guidelines: z.array(z.string()).optional(),
    representation_rules: z.array(z.string()).optional(),
  }).optional(),
  
  // Authenticity Guards
  authenticity: z.object({
    off_brand_indicators: z.array(z.string()).optional(), // things that would feel wrong
    must_include_elements: z.array(z.string()).optional(), // signature requirements
    credibility_markers: z.array(z.string()).optional(),
  }).optional(),
  
  // Chat Personality (for AI interaction)
  chat_personality: z.object({
    base_tone: z.enum(["friendly", "professional", "casual", "intense"]).optional(),
    humor_style: z.enum(["none", "dry", "playful", "sarcastic"]).optional(),
    formality_level: z.enum(["very-casual", "casual", "neutral", "formal"]).optional(),
    response_length: z.enum(["brief", "moderate", "detailed"]).optional(),
    interaction_style: z.string().optional(), // guided by MBTI
  }).optional(),
})

// ============================================
// MAIN ARTIST PROFILE V2
// ============================================

export const ArtistProfileV2Schema = z.object({
  // Metadata
  artist_id: z.string(),
  version: z.literal("2.0"),
  created_at: z.string(),
  updated_at: z.string(),
  
  // The 6 main categories
  identity_persona: IdentityPersonaSchema,
  vocal_performance: VocalPerformanceSchema.optional(),
  songwriting_system: SongwritingSystemSchema.optional(),
  musical_dna: MusicalDNASchema,
  production_blueprint: ProductionBlueprintSchema.optional(),
  content_safety: ContentSafetySchema.optional(),
})

export type ArtistProfileV2 = z.infer<typeof ArtistProfileV2Schema>

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createBlankArtistV2(): ArtistProfileV2 {
  return {
    artist_id: `art_${Math.random().toString(36).slice(2, 10)}`,
    version: "2.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    identity_persona: {
      artist_name: "",
      real_name: "",
      gender: "",
      age_range: "",
      origin_city: "",
      origin_state: "",
    },
    
    musical_dna: {
      genres: {
        primary: [],
        sub: [],
        micro: [],
      },
    },
  }
}

// Migration function from V1 to V2
export function migrateArtistToV2(v1: any): ArtistProfileV2 {
  const v2 = createBlankArtistV2()
  
  // Keep the same ID if it exists
  if (v1.artist_id) v2.artist_id = v1.artist_id
  
  // Migrate Identity & Persona
  v2.identity_persona = {
    artist_name: v1.artist_name || "",
    real_name: v1.real_name || "",
    image_data_url: v1.image_data_url,
    gender: v1.artist_identity?.gender,
    age_range: v1.artist_identity?.age_range,
    origin_city: v1.artist_identity?.city || v1.artist_identity?.hometown_city,
    origin_state: v1.artist_identity?.state || v1.artist_identity?.hometown_state,
    mbti: v1.personality?.mbti,
    vocal_phonetics: {
      regional_dialect: v1.artist_identity?.accent,
    },
  }
  
  // Migrate Vocal & Performance
  v2.vocal_performance = {
    vocal_timbre: {
      texture: {
        breathiness: 5, // default values
        rasp: 5,
        nasality: 3,
        warmth: 7,
      },
    },
    flow_phrasing: {
      timing_preference: "on",
      phrasing_style: v1.vocal_description?.delivery_style?.includes("laid") ? "legato" : "mixed",
    },
    performance_persona: {
      adlibs_bank: v1.adlib_profile?.bank || [],
      adlib_placement: v1.adlib_profile?.placement_rules,
    },
  }
  
  // Migrate Songwriting
  v2.songwriting_system = {
    lyrical_content: {
      pov: v1.writing_persona?.narrative_pov === "first-person" ? "first-person" : "mixed",
      vocabulary_level: "moderate",
      slang_density: v1.writing_persona?.linguistic_base?.includes("AAVE") ? "moderate" : "light",
    },
    themes: {
      primary_themes: v1.writing_persona?.themes || [],
    },
    prosody_rhyme: {
      rhyme_schemes: [v1.writing_persona?.rhyme_form || "AABB"],
    },
  }
  
  // Migrate Musical DNA
  v2.musical_dna = {
    genres: {
      primary: v1.genres || [],
      sub: v1.sub_genres || [],
      micro: v1.micro_genres || [],
    },
    rhythm_groove: {
      bpm_range: {
        min: 60,
        max: 180,
        sweet_spot: 120,
      },
    },
  }
  
  // Migrate Production
  if (v1.production_preferences || v1.signature_essence) {
    v2.production_blueprint = {
      core_palette: {
        signature_sounds: v1.signature_essence?.sonic_hallmark ? [v1.signature_essence.sonic_hallmark] : [],
      },
    }
  }
  
  // Migrate Content & Safety
  if (v1.chat_voice) {
    v2.content_safety = {
      chat_personality: {
        base_tone: "casual",
        formality_level: "casual",
      },
      cultural_sensitivity: {
        avoid_terms: v1.chat_voice?.never_say || [],
      },
    }
  }
  
  return v2
}

// Genre-specific templates
export const GENRE_TEMPLATES = {
  rapper: {
    vocal_performance: {
      flow_phrasing: {
        timing_preference: "on" as const,
        flow_types: ["straight", "triplet", "double-time"] as any,
      },
      performance_persona: {
        adlib_frequency: "moderate" as const,
        energy_level: "high-energy" as const,
      },
    },
    songwriting_system: {
      prosody_rhyme: {
        syllables_per_bar: { verse_avg: 12, chorus_avg: 8, variance: 2 },
        rhyme_density: 7,
        multisyllabic_frequency: "moderate" as const,
      },
    },
    musical_dna: {
      flow_archetypes: {
        pocket_preference: "in-pocket" as const,
      },
    },
  },
  
  singer: {
    vocal_performance: {
      vocal_timbre: {
        weight: "lyric" as const,
        texture: { breathiness: 3, rasp: 2, nasality: 1, warmth: 8 },
      },
      vocal_production: {
        stacking_style: "doubles" as const,
        harmony_intervals: ["3rd", "5th", "octave"] as any,
      },
    },
    musical_dna: {
      melody_profile: {
        melisma_usage: "moderate" as const,
        vibrato: {
          usage: "endings" as const,
        },
      },
    },
  },
  
  country: {
    identity_persona: {
      vocal_phonetics: {
        regional_dialect: "Southern drawl",
        vowel_color: "rounded",
      },
    },
    songwriting_system: {
      themes: {
        primary_themes: ["home", "heartbreak", "faith", "trucks"],
        narrative_style: "storytelling" as const,
      },
    },
    production_blueprint: {
      core_palette: {
        primary_instruments: ["acoustic guitar", "steel guitar", "fiddle"],
      },
    },
  },
}