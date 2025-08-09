import type { ArtistProfile } from "./artist-types"

// Build a readable multi-line artist profile for prompts.
export function buildArtistProfileString(p?: ArtistProfile): string {
  if (!p) return "No additional artist profile provided."
  const a = p
  const lines: Array<string | null> = [
    `ARTIST: ${a.artist_name}${a.real_name ? ` (${a.real_name})` : ""}`,
    a.artist_identity?.gender ? `GENDER: ${a.artist_identity.gender}` : null,
    a.artist_identity?.race_ethnicity ? `RACE/ETHNICITY: ${a.artist_identity.race_ethnicity}` : null,
    a.artist_identity?.accent ? `ACCENT / DIALECT: ${a.artist_identity.accent}` : null,
    a.artist_identity?.hometown_city || a.artist_identity?.neighborhood || a.artist_identity?.zip
      ? `HOMETOWN: ${[
          a.artist_identity?.neighborhood,
          a.artist_identity?.hometown_city,
          a.artist_identity?.hometown_state,
          a.artist_identity?.hometown_country,
        ]
          .filter(Boolean)
          .join(", ")}${a.artist_identity?.zip ? ` (${a.artist_identity.zip})` : ""}`
      : null,
    a.genres?.length ? `GENRES: ${a.genres.join(", ")}` : null,
    a.sub_genres?.length ? `SUB-GENRES: ${a.sub_genres.join(", ")}` : null,
    a.micro_genres?.length ? `MICRO-GENRES: ${a.micro_genres.join(", ")}` : null,
    `VOCALS: ${a.vocal_description?.tone_texture || ""}; ${a.vocal_description?.delivery_style || ""}`,
    a.vocal_description?.quirks?.length ? `VOCAL QUIRKS: ${a.vocal_description.quirks.join(", ")}` : null,
    a.personality?.mbti ? `MBTI: ${a.personality.mbti}` : null,
    a.signature_essence?.sonic_hallmark ? `SONIC HALLMARK: ${a.signature_essence.sonic_hallmark}` : null,
    a.visual_look?.fashion_style ? `FASHION: ${a.visual_look.fashion_style}` : null,
    a.production_preferences?.sound_palette ? `SOUND PALETTE: ${a.production_preferences.sound_palette}` : null,
    a.production_preferences?.tempo_energy ? `TEMPO: ${a.production_preferences.tempo_energy}` : null,
    a.production_preferences?.camera_movement_rules
      ? `CAMERA: ${a.production_preferences.camera_movement_rules}`
      : null,
    a.production_preferences?.lighting_lift_rules ? `LIGHTING: ${a.production_preferences.lighting_lift_rules}` : null,
    a.signature_slang?.catch_phrases?.length ? `CATCH PHRASES: ${a.signature_slang.catch_phrases.join(", ")}` : null,
    a.chat_voice?.tone ? `CHAT TONE: ${a.chat_voice.tone}` : null,
  ]
  return lines.filter(Boolean).join("\n")
}

export function buildDirectorStyleString(d?: {
  name?: string
  description?: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  disciplines?: string[]
  tags?: string[]
  category?: string
}) {
  if (!d) return "Standard, balanced, and modern music video style."
  return [
    `DIRECTOR: ${d.name || "Unknown"}`,
    d.description && `DESCRIPTION: ${d.description}`,
    d.visualHallmarks && `VISUAL HALLMARKS: ${d.visualHallmarks}`,
    d.narrativeStyle && `NARRATIVE STYLE: ${d.narrativeStyle}`,
    d.pacingAndEnergy && `PACING & ENERGY: ${d.pacingAndEnergy}`,
    d.genres?.length ? `GENRES: ${d.genres.join(", ")}` : null,
    d.category && `CATEGORY: ${d.category}`,
    d.disciplines?.length ? `DISCIPLINES: ${d.disciplines.join(", ")}` : null,
    d.tags?.length ? `STYLE TAGS: ${d.tags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

// Prompt registry for MV
type BaseCtx = {
  songTitle: string
  artist: string
  genre: string
  directorStyle: string
  directorNotes: string
  videoConcept: string
  artistProfileStr: string
}

export const mvPrompts = {
  musicVideoStructure: (ctx: Pick<BaseCtx, "songTitle" | "artist" | "genre">) =>
    `
Analyze the provided song lyrics for "${ctx.songTitle}" by "${ctx.artist}" (${ctx.genre}).
Break the song down into structural components using one of:
intro, verse, pre-chorus, chorus, post-chorus, bridge, instrumental, solo, refrain, outro, hook, interlude.
Use timestamps if present; otherwise infer structure. Identify recurring hooks.
Return ONLY JSON.`.trim(),

  musicVideoTreatments: (ctx: BaseCtx) =>
    `
Create three distinct music video treatments for "${ctx.songTitle}" by "${ctx.artist}" (${ctx.genre}) in a specific director's style.

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

DIRECTOR NOTES:
${ctx.directorNotes}

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

Each treatment must authentically reflect both the director's approach and the artist's brand, stage presence, and visual identity.
Return ONLY JSON.`.trim(),

  musicVideoBreakdown: (
    ctx: BaseCtx & {
      sectionTitle: string
      treatmentName: string
      treatmentConcept: string
      treatmentVisuals: string
      locations: string
      wardrobe: string
      props: string
    },
  ) =>
    `
Create a detailed shot list for the section "${ctx.sectionTitle}" in the director's style.

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

DIRECTOR NOTES:
${ctx.directorNotes}

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

TREATMENT: "${ctx.treatmentName}" - ${ctx.treatmentConcept}
VISUAL STYLE: ${ctx.treatmentVisuals}

PRODUCTION CONFIGURATION:
LOCATIONS:
${ctx.locations || "None"}

WARDROBE:
${ctx.wardrobe || "None"}

PROPS:
${ctx.props || "None"}

Ensure shots reference configured items using @handles (e.g., @location1, @outfit2, @prop3).
Include artist presence and performance specifics informed by the Artist Profile where appropriate.
Return ONLY JSON.`.trim(),

  additionalMusicVideoShots: (
    ctx: BaseCtx & {
      sectionTitle: string
      customRequest: string
      existingShots: string
      treatmentConcept: string
      locations: string
      wardrobe: string
      props: string
    },
  ) =>
    `
Generate additional shots for "${ctx.sectionTitle}" in the director's style.

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

DIRECTOR NOTES:
${ctx.directorNotes}

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

CUSTOM REQUEST: "${ctx.customRequest}"
EXISTING SHOTS:
${ctx.existingShots || "None"}

TREATMENT:
${ctx.treatmentConcept}

PRODUCTION CONFIGURATION:
LOCATIONS:
${ctx.locations || "None"}

WARDROBE:
${ctx.wardrobe || "None"}

PROPS:
${ctx.props || "None"}

Return ONLY JSON with 'newShots'.`.trim(),

  musicVideoSuggestions: (ctx: BaseCtx & { treatmentName: string; treatmentConcept: string; sectionList: string }) =>
    `
Based on "${ctx.songTitle}" by ${ctx.artist} (${ctx.genre}) and the selected treatment "${ctx.treatmentName}" (${ctx.treatmentConcept}),
generate 2-3 creative suggestions each for locations, wardrobe, and props.

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

DIRECTOR NOTES:
${ctx.directorNotes}

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

Provide: id, reference (@id), name, description, purpose, and assign to relevant sections from: ${ctx.sectionList}.
Return ONLY JSON.`.trim(),
}
