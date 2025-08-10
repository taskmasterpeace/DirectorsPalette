/**
 * Comprehensive validation schemas using Zod
 */
import { z } from 'zod'

// ===== Base Validation Rules =====
const MAX_TEXT_LENGTH = 50000
const MAX_TITLE_LENGTH = 200
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 2000

// ===== Story Validation Schemas =====
export const StoryInputSchema = z.object({
  story: z.string()
    .min(10, 'Story must be at least 10 characters')
    .max(MAX_TEXT_LENGTH, `Story cannot exceed ${MAX_TEXT_LENGTH} characters`)
    .refine(
      (text) => text.trim().length > 0,
      'Story cannot be empty or only whitespace'
    ),
  directorNotes: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Director notes cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional(),
  selectedDirector: z.string()
    .min(1, 'Director selection is required')
    .max(100, 'Director ID too long'),
})

export const TitleCardOptionsSchema = z.object({
  enabled: z.boolean(),
  format: z.enum(['full', 'name-only', 'roman-numerals']),
  approaches: z.array(z.string().max(100)).max(10, 'Too many approaches'),
})

export const PromptOptionsSchema = z.object({
  includeCameraStyle: z.boolean(),
  includeColorPalette: z.boolean(),
})

export const AdditionalShotsRequestSchema = z.object({
  chapterId: z.string().min(1, 'Chapter ID is required'),
  categories: z.array(z.string().max(50)).min(1, 'At least one category required').max(10),
  customRequest: z.string()
    .max(500, 'Custom request too long')
    .optional(),
})

// ===== Music Video Validation Schemas =====
export const MusicVideoInputSchema = z.object({
  lyrics: z.string()
    .min(10, 'Lyrics must be at least 10 characters')
    .max(MAX_TEXT_LENGTH, `Lyrics cannot exceed ${MAX_TEXT_LENGTH} characters`)
    .refine(
      (text) => text.trim().length > 0,
      'Lyrics cannot be empty or only whitespace'
    ),
  songTitle: z.string()
    .min(1, 'Song title is required')
    .max(MAX_TITLE_LENGTH, `Song title cannot exceed ${MAX_TITLE_LENGTH} characters`)
    .refine(
      (title) => title.trim().length > 0,
      'Song title cannot be empty or only whitespace'
    ),
  artist: z.string()
    .min(1, 'Artist name is required')
    .max(MAX_NAME_LENGTH, `Artist name cannot exceed ${MAX_NAME_LENGTH} characters`),
  genre: z.string()
    .min(1, 'Genre is required')
    .max(50, 'Genre name too long'),
  mvConcept: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Video concept cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional(),
  mvDirectorNotes: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Director notes cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional(),
  selectedMusicVideoDirector: z.string()
    .min(1, 'Music video director selection is required'),
})

export const MusicVideoConfigSchema = z.object({
  selectedTreatmentId: z.string().min(1, 'Treatment selection is required'),
  locations: z.array(z.object({
    reference: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
  })).max(20, 'Too many locations'),
  wardrobe: z.array(z.object({
    reference: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
  })).max(20, 'Too many wardrobe items'),
  props: z.array(z.object({
    reference: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
  })).max(20, 'Too many props'),
  isConfigured: z.boolean().optional(),
})

// ===== Director Validation Schemas =====
export const CustomDirectorSchema = z.object({
  name: z.string()
    .min(1, 'Director name is required')
    .max(MAX_NAME_LENGTH, `Director name cannot exceed ${MAX_NAME_LENGTH} characters`)
    .refine(
      (name) => /^[a-zA-Z0-9\s\-.']+$/.test(name),
      'Director name contains invalid characters'
    ),
  description: z.string()
    .min(10, 'Director description must be at least 10 characters')
    .max(MAX_DESCRIPTION_LENGTH, `Director description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`)
    .refine(
      (desc) => desc.trim().length > 0,
      'Director description cannot be empty or only whitespace'
    ),
})

// ===== Artist Profile Validation Schemas =====
const ArtistIdentitySchema = z.object({
  gender: z.string().max(50).optional(),
  race_ethnicity: z.string().max(100).optional(),
  age_range: z.string().max(20).optional(),
  accent: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  hometown_city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  hometown_state: z.string().max(50).optional(),
  zip: z.string().max(10).optional(),
})

export const ArtistProfileSchema = z.object({
  artist_id: z.string().min(1).max(50),
  artist_name: z.string()
    .min(1, 'Artist name is required')
    .max(MAX_NAME_LENGTH)
    .optional(),
  real_name: z.string().max(MAX_NAME_LENGTH).optional(),
  image_data_url: z.string().url().optional().or(z.literal('')),
  artist_identity: ArtistIdentitySchema.optional(),
  genres: z.array(z.string().max(50)).max(10).optional(),
  sub_genres: z.array(z.string().max(50)).max(15).optional(),
  micro_genres: z.array(z.string().max(50)).max(10).optional(),
  vocal_description: z.object({
    tone_texture: z.string().max(200).optional(),
    delivery_style: z.string().max(200).optional(),
    quirks: z.array(z.string().max(100)).max(10).optional(),
  }).optional(),
  signature_essence: z.object({
    sonic_hallmark: z.string().max(500).optional(),
  }).optional(),
  production_preferences: z.object({
    tempo_energy: z.string().max(200).optional(),
    drums_bass_chords: z.string().max(500).optional(),
    emotional_arc: z.string().max(500).optional(),
    emotional_arc_rules: z.string().max(500).optional(),
  }).optional(),
  writing_persona: z.object({
    narrative_pov: z.string().max(200).optional(),
    linguistic_base: z.string().max(200).optional(),
    rhyme_form: z.string().max(200).optional(),
    themes: z.array(z.string().max(100)).max(20).optional(),
    signature_devices: z.array(z.string().max(100)).max(15).optional(),
  }).optional(),
  personality: z.object({
    mbti: z.string().length(4).optional(),
  }).optional(),
  visual_look: z.object({
    skin_tone: z.string().max(100).optional(),
    hair_style: z.string().max(200).optional(),
    fashion_style: z.string().max(500).optional(),
    jewelry: z.string().max(200).optional(),
  }).optional(),
  material_prefs: z.object({
    cars: z.array(z.string().max(100)).max(10).optional(),
    diamonds: z.array(z.string().max(100)).max(10).optional(),
    weapons: z.array(z.string().max(100)).max(10).optional(),
    exclude: z.array(z.string().max(100)).max(20).optional(),
  }).optional(),
  adlib_profile: z.object({
    bank: z.array(z.string().max(50)).max(50).optional(),
    placement_rules: z.string().max(500).optional(),
  }).optional(),
  career_direction: z.object({
    target_markets: z.array(z.string().max(100)).max(10).optional(),
    north_star: z.string().max(500).optional(),
  }).optional(),
  chat_voice: z.object({
    tone: z.string().max(200).optional(),
    never_say: z.array(z.string().max(100)).max(20).optional(),
  }).optional(),
  meta: z.object({
    version: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  }).optional(),
})

// ===== Project Validation Schemas =====
export const ProjectSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string()
    .min(1, 'Project name is required')
    .max(MAX_TITLE_LENGTH, `Project name cannot exceed ${MAX_TITLE_LENGTH} characters`)
    .refine(
      (name) => /^[a-zA-Z0-9\s\-_.']+$/.test(name),
      'Project name contains invalid characters'
    ),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  mode: z.enum(['story', 'music-video']),
  data: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// ===== General Input Sanitization =====
export const SanitizedStringSchema = z.string()
  .transform((str) => str.trim())
  .refine(
    (str) => !/<script|javascript:|on\w+=/i.test(str),
    'Input contains potentially harmful content'
  )
  .refine(
    (str) => !/SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM/i.test(str),
    'Input contains potentially harmful SQL content'
  )

// ===== Rate Limiting Schemas =====
export const RateLimitConfigSchema = z.object({
  windowMs: z.number().positive(),
  max: z.number().positive(),
  message: z.string().optional(),
})

// ===== API Response Schemas =====
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  timestamp: z.string().datetime().optional(),
})

// ===== Validation Helper Types =====
export type StoryInput = z.infer<typeof StoryInputSchema>
export type MusicVideoInput = z.infer<typeof MusicVideoInputSchema>
export type CustomDirectorInput = z.infer<typeof CustomDirectorSchema>
export type ArtistProfileInput = z.infer<typeof ArtistProfileSchema>
export type ProjectInput = z.infer<typeof ProjectSchema>
export type APIResponse = z.infer<typeof APIResponseSchema>