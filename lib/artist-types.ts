import { z } from "zod"

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const

export const RACE_ETHNICITY_OPTIONS = [
  "Black/African American",
  "White/Caucasian",
  "Hispanic/Latino",
  "Asian",
  "Native American",
  "Middle Eastern",
  "Mixed/Multiracial",
  "Pacific Islander",
] as const

export const ArtistIdentitySchema = z.object({
  gender: z.string().optional(),
  race_ethnicity: z.string().optional(),
  age_range: z.string().optional(),
  accent: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  hometown_city: z.string().optional(),
  state: z.string().optional(),
  hometown_state: z.string().optional(),
  zip: z.string().optional(),
})

export const VocalDescriptionSchema = z.object({
  tone_texture: z.string().optional(),
  delivery_style: z.string().optional(),
  quirks: z.array(z.string()).optional(),
})

export const SignatureEssenceSchema = z.object({
  sonic_hallmark: z.string().optional(),
})

export const ProductionPreferencesSchema = z.object({
  tempo_energy: z.string().optional(),
  drums_bass_chords: z.string().optional(),
  emotional_arc: z.string().optional(),
  emotional_arc_rules: z.string().optional(),
})

export const WritingPersonaSchema = z.object({
  narrative_pov: z.string().optional(),
  linguistic_base: z.string().optional(),
  rhyme_form: z.string().optional(),
  themes: z.array(z.string()).optional(),
  signature_devices: z.array(z.string()).optional(),
})

export const PersonalitySchema = z.object({
  mbti: z.enum(MBTI_TYPES).optional(),
})

export const VisualLookSchema = z.object({
  skin_tone: z.string().optional(),
  hair_style: z.string().optional(),
  fashion_style: z.string().optional(),
  jewelry: z.string().optional(),
  visual_description: z.string().optional(),
})

export const MaterialPrefsSchema = z.object({
  cars: z.array(z.string()).optional(),
  diamonds: z.array(z.string()).optional(),
  weapons: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
})

export const AdlibProfileSchema = z.object({
  bank: z.array(z.string()).optional(),
  placement_rules: z.string().optional(),
})

export const CareerDirectionSchema = z.object({
  target_markets: z.array(z.string()).optional(),
  north_star: z.string().optional(),
})

export const ChatVoiceSchema = z.object({
  tone: z.string().optional(),
  never_say: z.array(z.string()).optional(),
})

export const MetaSchema = z.object({
  version: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ArtistProfileSchema = z.object({
  artist_id: z.string(),
  artist_name: z.string().optional(),
  real_name: z.string().optional(),
  image_data_url: z.string().optional(),
  artist_identity: ArtistIdentitySchema.optional(),
  genres: z.array(z.string()).optional(),
  sub_genres: z.array(z.string()).optional(),
  micro_genres: z.array(z.string()).optional(),
  vocal_description: VocalDescriptionSchema.optional(),
  signature_essence: SignatureEssenceSchema.optional(),
  production_preferences: ProductionPreferencesSchema.optional(),
  writing_persona: WritingPersonaSchema.optional(),
  personality: PersonalitySchema.optional(),
  visual_look: VisualLookSchema.optional(),
  material_prefs: MaterialPrefsSchema.optional(),
  adlib_profile: AdlibProfileSchema.optional(),
  career_direction: CareerDirectionSchema.optional(),
  chat_voice: ChatVoiceSchema.optional(),
  meta: MetaSchema.optional(),
})

export type ArtistProfile = z.infer<typeof ArtistProfileSchema>

export function blankArtist(): ArtistProfile {
  return {
    artist_id: `art_${Math.random().toString(36).slice(2, 10)}`,
    artist_name: "",
    real_name: "",
    artist_identity: {
      gender: "",
      race_ethnicity: "",
      age_range: "",
      accent: "",
      neighborhood: "",
      city: "",
      state: "",
      zip: "",
    },
    genres: [],
    sub_genres: [],
    micro_genres: [],
    vocal_description: {
      tone_texture: "",
      delivery_style: "",
      quirks: [],
    },
    signature_essence: {
      sonic_hallmark: "",
    },
    production_preferences: {
      tempo_energy: "",
      drums_bass_chords: "",
      emotional_arc_rules: "",
    },
    writing_persona: {
      narrative_pov: "",
      linguistic_base: "",
      rhyme_form: "",
      themes: [],
      signature_devices: [],
    },
    personality: {
      mbti: undefined,
    },
    visual_look: {
      skin_tone: "",
      hair_style: "",
      fashion_style: "",
      jewelry: "",
      visual_description: "",
    },
    material_prefs: {
      cars: [],
      diamonds: [],
      weapons: [],
      exclude: [],
    },
    adlib_profile: {
      bank: [],
      placement_rules: "",
    },
    career_direction: {
      target_markets: [],
      north_star: "",
    },
    chat_voice: {
      tone: "",
      never_say: [],
    },
    meta: {
      version: "1.0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }
}

export function mergeArtist<T extends Partial<ArtistProfile>>(base: T, updates: Partial<ArtistProfile>): T {
  const result = { ...base }

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value) && value.length > 0) {
        ;(result as any)[key] = value
      } else if (typeof value === "object" && value !== null) {
        ;(result as any)[key] = { ...(result as any)[key], ...value }
      } else if (typeof value === "string" && value.trim() !== "") {
        ;(result as any)[key] = value
      } else if (typeof value !== "string") {
        ;(result as any)[key] = value
      }
    }
  }

  return result
}

export function toCSVArray(str: string): string[] {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}
