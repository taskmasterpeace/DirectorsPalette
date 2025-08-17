import { z } from "zod"

// ============================================
// SONG DNA CORE TYPES
// ============================================

export const SongStructureSchema = z.object({
  pattern: z.array(z.string()), // ["verse", "chorus", "verse", "chorus", "bridge", "chorus"]
  verse_lines: z.number(),
  chorus_lines: z.number(),
  bridge_lines: z.number().optional(),
  pre_chorus_lines: z.number().optional(),
  outro_lines: z.number().optional(),
  total_bars: z.number(),
  sections: z.array(z.object({
    type: z.string(),
    start_line: z.number(),
    end_line: z.number(),
    rhyme_scheme: z.string().optional(),
  })),
})

export const LyricalPatternsSchema = z.object({
  rhyme_schemes: z.record(z.string()), // {"verse": "ABAB", "chorus": "AABB"}
  syllables_per_line: z.object({
    average: z.number(),
    variance: z.number(),
    distribution: z.array(z.number()), // Syllable count for each line
  }),
  vocabulary_level: z.enum(["simple", "moderate", "complex", "academic"]),
  signature_words: z.array(z.string()),
  themes: z.array(z.string()),
  metaphor_density: z.number().min(0).max(10),
  alliteration_frequency: z.number().min(0).max(10),
  internal_rhyme_density: z.number().min(0).max(10),
  repetition_patterns: z.array(z.object({
    phrase: z.string(),
    occurrences: z.number(),
    positions: z.array(z.number()),
  })),
})

export const MusicalDNASchema = z.object({
  tempo_bpm: z.number().optional(),
  suggested_key: z.string().optional(),
  time_signature: z.string().optional(),
  energy_curve: z.array(z.number()), // Energy levels through song sections (0-10)
  hook_placement: z.array(z.number()), // Line numbers where hooks appear
  dynamics: z.object({
    quiet_sections: z.array(z.string()),
    loud_sections: z.array(z.string()),
    build_sections: z.array(z.string()),
  }).optional(),
})

export const EmotionalMappingSchema = z.object({
  primary_emotion: z.string(),
  secondary_emotions: z.array(z.string()),
  emotional_arc: z.array(z.object({
    section: z.string(),
    emotion: z.string(),
    intensity: z.number().min(1).max(10),
  })),
  overall_intensity: z.number().min(1).max(10),
  sincerity_vs_irony: z.number().min(-5).max(5), // -5 (ironic) to +5 (sincere)
  vulnerability_level: z.number().min(0).max(10),
})

export const SongDNASchema = z.object({
  id: z.string(),
  
  // Reference song info
  reference_song: z.object({
    title: z.string(),
    artist: z.string(),
    lyrics: z.string(),
    year: z.number().optional(),
    genre: z.string().optional(),
  }),
  
  // Analysis results
  structure: SongStructureSchema,
  lyrical: LyricalPatternsSchema,
  musical: MusicalDNASchema,
  emotional: EmotionalMappingSchema,
  
  // Artist integration
  artist_profile_id: z.string().optional(),
  genre_tags: z.array(z.string()),
  production_notes: z.string().optional(),
  
  // Metadata
  created_at: z.string(),
  updated_at: z.string(),
  analysis_version: z.string(),
})

export type SongDNA = z.infer<typeof SongDNASchema>
export type SongStructure = z.infer<typeof SongStructureSchema>
export type LyricalPatterns = z.infer<typeof LyricalPatternsSchema>
export type MusicalDNA = z.infer<typeof MusicalDNASchema>
export type EmotionalMapping = z.infer<typeof EmotionalMappingSchema>

// ============================================
// GENERATION TYPES
// ============================================

export const GenerationOptionsSchema = z.object({
  theme: z.string(), // What the new song should be about
  
  // Variation controls
  creativity: z.number().min(0).max(10).default(5), // How much to deviate from original
  complexity_adjustment: z.enum(["simpler", "match", "more_complex"]).default("match"),
  modernize: z.boolean().default(false), // Update dated references
  explicit_allowed: z.boolean().default(true),
  
  // Structure overrides
  custom_structure: z.array(z.string()).optional(), // Override detected structure
  target_length: z.enum(["short", "medium", "long"]).or(z.number()).optional(),
  force_rhyme_scheme: z.string().optional(), // Force specific rhyme scheme
  
  // Generation settings
  count: z.number().min(1).max(5).default(2), // How many songs to generate
  variation_mode: z.enum(["similar", "diverse"]).default("diverse"),
  
  // Mood overrides
  emotional_override: z.string().optional(),
  energy_level: z.number().min(1).max(10).optional(),
})

export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>

export const GeneratedSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  lyrics: z.string(),
  
  // Structure info
  structure: z.array(z.object({
    section: z.string(),
    lines: z.array(z.string()),
  })),
  
  // Metadata
  theme: z.string(),
  estimated_bpm: z.number().optional(),
  suggested_key: z.string().optional(),
  emotional_tone: z.string(),
  
  // Generation info
  song_dna_id: z.string(),
  artist_profile_id: z.string().optional(),
  generation_params: GenerationOptionsSchema,
  created_at: z.string(),
})

export type GeneratedSong = z.infer<typeof GeneratedSongSchema>

// ============================================
// ANALYSIS TYPES
// ============================================

export interface AnalysisRequest {
  lyrics: string
  title?: string
  artist?: string
  artist_profile_id?: string
  year?: number
  genre?: string
}

export interface AnalysisResult {
  song_dna: SongDNA
  confidence_scores: {
    structure: number
    rhyme: number
    emotion: number
    overall: number
  }
  warnings?: string[]
  suggestions?: string[]
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createBlankSongDNA(): SongDNA {
  return {
    id: `dna_${Math.random().toString(36).slice(2, 10)}`,
    reference_song: {
      title: "",
      artist: "",
      lyrics: "",
    },
    structure: {
      pattern: [],
      verse_lines: 0,
      chorus_lines: 0,
      total_bars: 0,
      sections: [],
    },
    lyrical: {
      rhyme_schemes: {},
      syllables_per_line: {
        average: 0,
        variance: 0,
        distribution: [],
      },
      vocabulary_level: "moderate",
      signature_words: [],
      themes: [],
      metaphor_density: 5,
      alliteration_frequency: 3,
      internal_rhyme_density: 3,
      repetition_patterns: [],
    },
    musical: {
      energy_curve: [],
      hook_placement: [],
    },
    emotional: {
      primary_emotion: "",
      secondary_emotions: [],
      emotional_arc: [],
      overall_intensity: 5,
      sincerity_vs_irony: 0,
      vulnerability_level: 5,
    },
    genre_tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    analysis_version: "1.0",
  }
}

export function detectSongSections(lyrics: string): string[] {
  const lines = lyrics.split('\n').filter(line => line.trim())
  const sections: string[] = []
  
  // Common section markers
  const markers = {
    verse: /^\[?verse\s*\d*\]?:?$/i,
    chorus: /^\[?chorus\]?:?$/i,
    bridge: /^\[?bridge\]?:?$/i,
    preChorus: /^\[?pre[- ]?chorus\]?:?$/i,
    outro: /^\[?outro\]?:?$/i,
    intro: /^\[?intro\]?:?$/i,
    hook: /^\[?hook\]?:?$/i,
  }
  
  let currentSection = "verse"
  
  for (const line of lines) {
    for (const [section, regex] of Object.entries(markers)) {
      if (regex.test(line.trim())) {
        currentSection = section
        if (!sections.includes(currentSection)) {
          sections.push(currentSection)
        }
        break
      }
    }
  }
  
  // If no sections detected, assume verse-chorus pattern
  if (sections.length === 0) {
    sections.push("verse", "chorus")
  }
  
  return sections
}

export function countSyllables(word: string): number {
  // Simple syllable counting algorithm
  word = word.toLowerCase()
  let count = 0
  let previousWasVowel = false
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = /[aeiouy]/.test(word[i])
    if (isVowel && !previousWasVowel) {
      count++
    }
    previousWasVowel = isVowel
  }
  
  // Adjust for silent e
  if (word.endsWith('e') && count > 1) {
    count--
  }
  
  // Words always have at least one syllable
  return Math.max(1, count)
}

export function detectRhymeScheme(lines: string[]): string {
  // Simplified rhyme detection
  const rhymes: string[] = []
  const schemes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let schemeIndex = 0
  const usedRhymes: { [key: string]: string } = {}
  
  for (const line of lines) {
    const lastWord = line.trim().split(/\s+/).pop()?.toLowerCase() || ""
    const ending = lastWord.slice(-2) // Simple: just check last 2 letters
    
    if (usedRhymes[ending]) {
      rhymes.push(usedRhymes[ending])
    } else {
      const scheme = schemes[schemeIndex++]
      usedRhymes[ending] = scheme
      rhymes.push(scheme)
    }
  }
  
  return rhymes.join('')
}