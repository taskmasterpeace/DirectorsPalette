export type ArtistProfile = {
  artist_id: string
  artist_name?: string
  real_name?: string
  image_data_url?: string
  artist_identity?: {
    gender?: string
    race_ethnicity?: string
    age_range?: string
    accent?: string
    neighborhood?: string
    city?: string
    state?: string
    zip?: string
    hometown_city?: string
    hometown_state?: string
  }
  genres?: string[]
  sub_genres?: string[]
  micro_genres?: string[]
  vocal_description?: {
    tone_texture?: string
    delivery_style?: string
    quirks?: string[]
  }
  signature_essence?: {
    sonic_hallmark?: string
  }
  production_preferences?: {
    tempo_energy?: string
    drums_bass_chords?: string
    emotional_arc_rules?: string
    emotional_arc?: string
  }
  writing_persona?: {
    narrative_pov?: string
    linguistic_base?: string
    rhyme_form?: string
    themes?: string[]
    signature_devices?: string[]
  }
  personality?: {
    mbti?: string
  }
  visual_look?: {
    skin_tone?: string
    hair_style?: string
    fashion_style?: string
    jewelry?: string
  }
  material_prefs?: {
    cars?: string[]
    diamonds?: string[]
    weapons?: string[]
    exclude?: string[]
  }
  adlib_profile?: {
    bank?: string[]
    placement_rules?: string
  }
  career_direction?: {
    target_markets?: string[]
    north_star?: string
  }
  chat_voice?: {
    tone?: string
    never_say?: string[]
  }
  meta?: {
    version?: string
    created_at?: string
    updated_at?: string
  }
}

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
  "Black/African",
  "Hispanic/Latine",
  "White/European",
  "Middle Eastern/North African",
  "South Asian",
  "East Asian",
  "Southeast Asian",
  "Indigenous/Native",
  "Pacific Islander",
  "Mixed",
] as const

export function blankArtist(): ArtistProfile {
  return {
    artist_id: `art_${Math.random().toString(36).slice(2, 10)}`,
    artist_name: "",
    artist_identity: {},
    genres: [],
    sub_genres: [],
    micro_genres: [],
    vocal_description: { quirks: [] },
    signature_essence: {},
    production_preferences: {},
    writing_persona: { themes: [], signature_devices: [] },
    personality: {},
    visual_look: {},
    material_prefs: { cars: [], diamonds: [], weapons: [], exclude: [] },
    adlib_profile: { bank: [] },
    career_direction: { target_markets: [] },
    chat_voice: { never_say: [] },
    meta: { version: "1.0" },
  }
}

export function toCSVArray(input: string | string[] | undefined): string[] {
  if (Array.isArray(input)) return input
  if (!input) return []
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Deep merge that prefers existing values in base and fills only missing/empty ones from incoming.
 */
export function mergeArtist<T extends object>(base: T, incoming: Partial<T>): T {
  function isObject(v: any) {
    return v && typeof v === "object" && !Array.isArray(v)
  }
  function merge(b: any, i: any): any {
    if (Array.isArray(b)) {
      // Keep base if it has content; otherwise use incoming array.
      return b.length ? b : Array.isArray(i) ? i : b
    }
    if (isObject(b) && isObject(i)) {
      const out: any = { ...b }
      for (const key of Object.keys(i)) {
        const bv = (b as any)[key]
        const iv = (i as any)[key]
        if (bv === undefined || bv === null || bv === "" || (Array.isArray(bv) && bv.length === 0)) {
          out[key] = isObject(iv) ? merge({}, iv) : iv
        } else if (isObject(bv) && isObject(iv)) {
          out[key] = merge(bv, iv)
        } else if (Array.isArray(bv) && Array.isArray(iv)) {
          out[key] = bv.length ? bv : iv
        } else {
          out[key] = bv
        }
      }
      return out
    }
    // If base is empty-ish, use incoming
    if (b === undefined || b === null || b === "" || (Array.isArray(b) && b.length === 0)) return i ?? b
    return b
  }
  return merge(base, incoming)
}
