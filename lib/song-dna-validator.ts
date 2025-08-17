/**
 * Validation utilities for Song DNA
 * Ensures data integrity throughout the analysis and generation process
 */

import type { SongDNA, GenerationOptions } from "./song-dna-types"

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates a Song DNA object before generation
 */
export function validateSongDNA(dna: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!dna) {
    errors.push("DNA object is null or undefined")
    return { valid: false, errors, warnings }
  }

  // Check ID - should always be present
  if (!dna.id) {
    warnings.push("DNA is missing an ID - will use 'unknown'")
  }

  // Check reference song
  if (!dna.reference_song) {
    errors.push("DNA is missing reference_song data")
  } else {
    if (!dna.reference_song.title) warnings.push("Reference song missing title")
    if (!dna.reference_song.artist) warnings.push("Reference song missing artist")
    if (!dna.reference_song.lyrics) errors.push("Reference song missing lyrics")
  }

  // Check structure
  if (!dna.structure) {
    errors.push("DNA is missing structure data")
  } else {
    if (!dna.structure.pattern || dna.structure.pattern.length === 0) {
      warnings.push("Structure pattern is empty")
    }
    if (typeof dna.structure.total_bars !== 'number') {
      warnings.push("Total bars is not a number")
    }
  }

  // Check lyrical data - CRITICAL for generation
  if (!dna.lyrical) {
    errors.push("DNA is missing lyrical data")
  } else {
    if (!dna.lyrical.syllables_per_line) {
      errors.push("Missing syllables_per_line data - required for generation")
    } else {
      const syllableData = dna.lyrical.syllables_per_line
      if (typeof syllableData.average !== 'number' || syllableData.average <= 0) {
        errors.push("Invalid average syllables per line")
      }
      if (!Array.isArray(syllableData.distribution)) {
        warnings.push("Syllable distribution is not an array")
      }
    }
    
    if (!dna.lyrical.rhyme_schemes || typeof dna.lyrical.rhyme_schemes !== 'object') {
      warnings.push("Rhyme schemes data is missing or invalid")
    }
  }

  // Check emotional data
  if (!dna.emotional) {
    warnings.push("DNA is missing emotional data")
  } else {
    if (!dna.emotional.primary_emotion) {
      warnings.push("Primary emotion is missing")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates generation options
 */
export function validateGenerationOptions(options: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!options) {
    errors.push("Generation options are null or undefined")
    return { valid: false, errors, warnings }
  }

  // Check creativity/temperature
  if (typeof options.creativity === 'number') {
    if (options.creativity < 0) {
      errors.push("Creativity cannot be negative")
    }
    if (options.creativity > 10) {
      warnings.push("Creativity is above 10 - will be capped at 10")
    }
  }

  // Check theme
  if (!options.theme || typeof options.theme !== 'string') {
    warnings.push("No theme specified - will use default")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Ensures a Song DNA object has all required fields with defaults
 */
export function ensureValidDNA(dna: Partial<SongDNA>): SongDNA {
  const now = new Date().toISOString()
  
  return {
    id: dna.id || `dna_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    
    reference_song: dna.reference_song || {
      title: "Unknown",
      artist: "Unknown",
      lyrics: ""
    },
    
    structure: {
      pattern: dna.structure?.pattern || [],
      verse_lines: dna.structure?.verse_lines || 4,
      chorus_lines: dna.structure?.chorus_lines || 4,
      bridge_lines: dna.structure?.bridge_lines,
      total_bars: dna.structure?.total_bars || 0,
      sections: dna.structure?.sections || []
    },
    
    lyrical: {
      rhyme_schemes: dna.lyrical?.rhyme_schemes || {},
      syllables_per_line: dna.lyrical?.syllables_per_line || {
        average: 7,
        variance: 1,
        distribution: []
      },
      vocabulary_level: dna.lyrical?.vocabulary_level || "moderate",
      signature_words: dna.lyrical?.signature_words || [],
      themes: dna.lyrical?.themes || [],
      metaphor_density: dna.lyrical?.metaphor_density || 5,
      alliteration_frequency: dna.lyrical?.alliteration_frequency || 3,
      internal_rhyme_density: dna.lyrical?.internal_rhyme_density || 3,
      repetition_patterns: dna.lyrical?.repetition_patterns || []
    },
    
    musical: dna.musical || {},
    
    emotional: {
      primary_emotion: dna.emotional?.primary_emotion || "neutral",
      secondary_emotions: dna.emotional?.secondary_emotions || [],
      emotional_arc: dna.emotional?.emotional_arc || [],
      overall_intensity: dna.emotional?.overall_intensity || 5,
      sincerity_vs_irony: dna.emotional?.sincerity_vs_irony || 0,
      vulnerability_level: dna.emotional?.vulnerability_level || 5
    },
    
    artist_profile_id: dna.artist_profile_id,
    genre_tags: dna.genre_tags || [],
    production_notes: dna.production_notes,
    
    created_at: dna.created_at || now,
    updated_at: dna.updated_at || now,
    analysis_version: dna.analysis_version || "2.0-enhanced"
  }
}

/**
 * Quick validation check for UI
 */
export function canGenerateFromDNA(dna: any): { canGenerate: boolean; reason?: string } {
  if (!dna) {
    return { canGenerate: false, reason: "No DNA data available" }
  }

  if (!dna.lyrical?.syllables_per_line?.average) {
    return { canGenerate: false, reason: "Missing syllable analysis data" }
  }

  if (dna.lyrical.syllables_per_line.average <= 0) {
    return { canGenerate: false, reason: "Invalid syllable count" }
  }

  return { canGenerate: true }
}