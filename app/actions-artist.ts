"use server"

import type { ArtistProfile } from "@/lib/artist-types"

/**
 * Stub server action that fills only missing fields.
 * You can later replace this with AI SDK logic if needed.
 */
export async function autofillArtistProfile(input: ArtistProfile): Promise<{ fill: Partial<ArtistProfile> }> {
  // A minimal example fill:
  const fill: Partial<ArtistProfile> = {}

  if (!input.personality?.mbti) {
    fill.personality = { ...(input.personality || {}), mbti: "INTJ" }
  }
  if (!input.production_preferences?.tempo_energy) {
    fill.production_preferences = {
      ...(input.production_preferences || {}),
      tempo_energy: "mid-tempo 85–95 BPM; subtle swing",
    }
  }
  if (!input.signature_essence?.sonic_hallmark) {
    fill.signature_essence = { ...(input.signature_essence || {}), sonic_hallmark: "808-low end; airy pads" }
  }

  return { fill }
}
