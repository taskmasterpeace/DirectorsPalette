// A structured profile the "director" can consider while planning a music video.

export type ArtistPersonaTone =
  | "playful"
  | "edgy"
  | "mysterious"
  | "romantic"
  | "rebellious"
  | "cinematic"
  | "raw"
  | "dreamy"
  | "confident"
  | "melancholic"

export interface MusicArtistProfile {
  // Identity
  stageName: string
  realName?: string
  pronouns?: string
  countryOrRegion?: string
  primaryGenres?: string[] // e.g., ["Pop", "R&B"]
  subGenres?: string[]
  eraInfluences?: string[] // e.g., ["90s R&B", "Y2K Pop"]

  // Style and aesthetics
  vocalStyle?: string // e.g., "breathy falsetto, tight harmonies"
  performanceStyle?: string // e.g., "high-energy choreography, intense eye contact"
  movementStyle?: string // e.g., "sharp hip-hop, fluid contemporary"
  fashionStyle?: string // e.g., "streetwear luxe, monochrome fits"
  brandKeywords?: string[] // e.g., ["avant-garde", "minimal", "glossy", "gritty"]
  colorAssociations?: string[] // artist "brand" colors
  visualMotifs?: string[] // e.g., "mirrors", "chrome", "neon rain"

  // Creative preferences and constraints
  preferredNarrativeRatio?: number // 0..1 narrative vs performance balance
  choreographyPriority?: "none" | "light" | "medium" | "heavy"
  contentRating?: "G" | "PG" | "PG-13" | "R" | "Explicit"
  doNotInclude?: string[] // red lines / brand safety
  mustInclude?: string[] // brand non-negotiables or product tie-ins
  labelNotes?: string // notes from label/management
  collaborators?: string[] // choreographers, DPs, stylists to nod to

  // Practical details
  performanceStrengths?: string[] // e.g., "live band", "stamina", "expressive closeups"
  instruments?: string[] // e.g., "guitar", "piano"
  preferredCameraAngles?: string[] // e.g., "low angles", "profile closeups"

  // Freeform
  bioShort?: string
}
