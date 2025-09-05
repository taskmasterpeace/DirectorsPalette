import type { ArtistProfile } from "./artist-types"

// Convert artist name to @ reference format (e.g., "D" -> "@d", "Drake" -> "@drake")
export function artistToReference(artistName: string): string {
  return `@${artistName.toLowerCase().replace(/\s+/g, '')}`
}

// Create combined artist-wardrobe reference format (e.g., "D" -> "@d_streetwear")
export function artistToWardrobeReference(artistName: string, wardrobeStyle: string): string {
  const artist = artistName.toLowerCase().replace(/\s+/g, '')
  const wardrobe = wardrobeStyle.toLowerCase().replace(/\s+/g, '')
  return `@${artist}_${wardrobe}`
}

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
Create three distinct music video treatments for "${ctx.songTitle}" by "${ctx.artist}" (${ctx.genre}).

🎯 DIRECTOR NOTES - HIGHEST PRIORITY (MUST FOLLOW EXACTLY):
${ctx.directorNotes || "No specific director notes provided."}

THESE DIRECTOR NOTES ARE MANDATORY REQUIREMENTS. Every treatment MUST incorporate and honor these specific instructions. If director notes specify particular themes, styles, locations, moods, or visual elements, ALL treatments must reflect these requirements.

CRITICAL STYLE RESTRICTIONS:
- NEVER use neon, cyberpunk, holographic, or futuristic themes
- NEVER suggest neon lighting, neon signs, or neon colors
- NEVER use cyberpunk aesthetics, digital effects, or sci-fi elements
- Focus on organic, natural, urban, desert, studio, or classic cinematic styles
- Use warm lighting, natural colors, and realistic environments

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

TREATMENT GENERATION RULES:
1. START with the director notes - these are non-negotiable requirements
2. INCORPORATE the artist's identity, style, and preferences from their profile
3. Build treatments that honor BOTH director vision AND artist authenticity
4. Ensure director notes criteria appear in concept, visual theme, and hook strategy
5. If director notes conflict with artist profile, PRIORITIZE director notes while finding creative ways to still honor the artist
6. Each treatment must authentically reflect the artist's brand, stage presence, and visual identity
7. Verify each treatment addresses director notes AND respects artist profile

BALANCE REQUIREMENTS:
- Director Notes: PRIMARY creative direction (highest priority)
- Artist Profile: ESSENTIAL character and authenticity (must be respected)
- Director Style: SUPPORTING aesthetic framework (guides overall approach)

Each treatment must authentically reflect BOTH the director's explicit requirements AND the artist's identity/brand.
The artist's fashion style, personality, hometown, and visual preferences should influence wardrobe and location choices.
AVOID: neon, cyberpunk, holographic, futuristic, digital, sci-fi themes.
PREFER: natural, urban, studio, desert, cinematic, organic styles that match both director notes and artist profile.
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

CRITICAL: For the "shots" array, provide SIMPLE STRING DESCRIPTIONS ONLY (not objects).
Each shot should be a single complete string describing the shot in detail.

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

🎯 DIRECTOR NOTES - HIGHEST PRIORITY (MUST FOLLOW EXACTLY):
${ctx.directorNotes || "No specific director notes provided."}

THESE DIRECTOR NOTES ARE MANDATORY. Every shot must align with the director's specific vision while authentically representing the artist's identity and brand from their profile.

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

ARTIST AUTHENTICITY REQUIREMENTS:
- Include artist presence and performance specifics informed by the Artist Profile
- Respect artist's fashion style, personality traits, and visual preferences  
- Honor artist's hometown, cultural background, and identity
- Incorporate artist's signature moves, quirks, and performance style
- Ensure wardrobe aligns with artist's established visual brand
- Location choices should resonate with artist's background when possible

IMPORTANT: The "shots" field must be an array of STRINGS, not objects. Each shot is a single descriptive string.

CRITICAL FORMATTING RULES:
- Artist "${ctx.artist}" MUST be referenced using combined artist_wardrobe format
- NEVER use separate references like "${artistToReference(ctx.artist)} wearing @outfit1"
- ALWAYS use combined format: @${ctx.artist.toLowerCase().replace(/\s+/g, '')}_wardrobestyle
- Examples: @d_streetwear, @d_formalwear, @d_casualwear, @d_vintage
- Locations use @reference (e.g., @location1, @location2)  
- Props use @reference (e.g., @prop1, @prop2)
- Supporting actors use @ references (e.g., @dancer1, @extra1)

WARDROBE ASSIGNMENT FOR SECTION "${ctx.sectionTitle}":
- Use ONLY combined artist_wardrobe format: @${ctx.artist.toLowerCase().replace(/\s+/g, '')}_streetwear
- Different sections should use different wardrobe styles for visual variety
- Wardrobe styles: streetwear, formal, casual, vintage, athletic, bohemian, grunge, etc.
- Each reference is ONE WORD combining artist + underscore + wardrobe style

Example shots for artist "${ctx.artist}":
"Wide shot of @d_streetwear performing in @location1, dramatic lighting emphasizing the urban environment"
"Close-up on @d_formalwear showing raw emotion as they deliver the hook, @prop1 visible in background"
"Tracking shot following @d_casualwear through @location2, fish-eye lens creating surreal perspective"

PERFORMANCE RATIO GUIDELINES BY TREATMENT TYPE:
- Performance-heavy treatments (concert, studio, artist-focused): 0.8-0.9 ratio
- Narrative treatments (story-driven, cinematic): 0.4-0.6 ratio  
- Mixed treatments (performance + narrative): 0.6-0.8 ratio
- Abstract/experimental treatments: 0.3-0.7 ratio (varies by concept)

Adjust performance ratio based on the selected treatment concept and section type.

REQUIRED JSON STRUCTURE - ALL fields must be present:
{
  "sectionId": "string (section identifier)", 
  "shots": ["array", "of", "shot", "strings"],
  "performanceNotes": ["array", "of", "performance", "directions"], 
  "syncPoints": ["array", "of", "key", "moments"],
  "performanceRatio": number (0.0-1.0, adjusted for treatment type and section)
}

Return ONLY JSON matching this exact structure.`.trim(),

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

🎯 DIRECTOR NOTES - HIGHEST PRIORITY (MUST FOLLOW EXACTLY):
${ctx.directorNotes || "No specific director notes provided."}

THESE DIRECTOR NOTES ARE MANDATORY. Every shot must align with the director's specific vision while authentically representing the artist's identity and brand from their profile.

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
Generate treatment-specific production elements for "${ctx.songTitle}" by ${ctx.artist} (${ctx.genre}).

SELECTED TREATMENT: "${ctx.treatmentName}"
TREATMENT CONCEPT: ${ctx.treatmentConcept}

CRITICAL STYLE RESTRICTIONS:
- NEVER suggest neon, cyberpunk, holographic, or futuristic elements
- NEVER use neon lighting, neon signs, neon colors, or sci-fi aesthetics
- Focus on natural, organic, urban, desert, studio, or cinematic environments
- Use realistic lighting and natural color palettes

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

🎯 DIRECTOR NOTES - HIGHEST PRIORITY (MUST FOLLOW EXACTLY):
${ctx.directorNotes || "No specific director notes provided."}

THESE DIRECTOR NOTES ARE MANDATORY. All suggestions must align with the director's requirements while authentically representing the artist.

ARTIST INFLUENCE ON SUGGESTIONS:
- Wardrobe MUST align with artist's fashion style and visual brand
- Locations should resonate with artist's hometown/cultural background when possible
- Props should complement artist's personality and signature style
- All suggestions should feel authentic to WHO the artist is

VIDEO CONCEPT / STORY:
${ctx.videoConcept}

SONG SECTIONS: ${ctx.sectionList}

Generate 2-3 suggestions each for locations, wardrobe, and props that specifically support the "${ctx.treatmentName}" treatment concept.

LOCATIONS:
- Must complement the treatment's visual aesthetic and narrative
- Consider how each location serves different song sections
- Include atmosphere, lighting conditions, and practical considerations

WARDROBE (detailed breakdown for each outfit):
- Top: specific shirt/jacket/hoodie/dress with colors, materials, fit
- Bottom: specific pants/skirt/shorts with style, fit, color  
- Footwear: shoes/boots that match the treatment aesthetic
- Accessories: jewelry, hats, makeup, hair styling
- Each outfit should reflect a different mood/style for visual variety

PROPS:
- Objects that enhance the treatment's story and visual language
- Practical items that the artist can interact with during performance
- Background elements that support the environment and mood

SECTION ASSIGNMENTS:
For each suggestion, specify which song sections it works best for and WHY (using emojis):
- 🎵 Intro/Outro: mood setting, atmosphere
- 🎤 Verse: storytelling, intimate moments  
- 🚀 Chorus: high energy, visual impact
- 🌉 Bridge: contrast, emotional shift

AVOID: neon, cyberpunk, holographic, futuristic themes.
PREFER: natural, urban, desert, studio, cinematic styles that match the treatment.

Format: id, reference (@id), name, description, purpose, and detailed section assignments.
Return ONLY JSON with enhanced treatment-specific suggestions.`.trim(),

  musicVideoSectionBreakdown: (ctx: {
    section: any
    selectedTreatment: string
    locations: string
    wardrobe: string
    props: string
    directorStyle: string
    directorNotes: string
    videoConcept: string
    artistProfileStr: string
    artist?: string
  }) =>
    `Create a shot list for section "${ctx.section.title}" (${ctx.section.type}).

DIRECTOR STYLE:
${ctx.directorStyle}

ARTIST PROFILE:
${ctx.artistProfileStr}

TREATMENT CONCEPT:
${ctx.selectedTreatment}

AVAILABLE ELEMENTS:
Locations: ${ctx.locations}
Wardrobe: ${ctx.wardrobe}
Props: ${ctx.props}

🎯 DIRECTOR NOTES - HIGHEST PRIORITY (MUST FOLLOW EXACTLY):
${ctx.directorNotes || "No specific director notes provided."}

THESE DIRECTOR NOTES ARE MANDATORY. Every shot must align with the director's specific vision while authentically representing the artist's identity and brand from their profile.

For the "shots" array, provide SIMPLE STRING DESCRIPTIONS ONLY (not objects).
Each shot should be a single string describing the complete shot in detail.

CRITICAL: Use @ symbol for ALL references:
- Artist: MUST use combined artist_wardrobe format (e.g., @d_streetwear, @d_formalwear)
- NEVER use separate references like "@artist wearing @outfit1"
- ALWAYS use combined format: @${ctx.artist ? ctx.artist.toLowerCase().replace(/\s+/g, '') : 'artist'}_wardrobestyle
- Locations: @location1, @location2, etc.
- Props: @prop1, @prop2, etc.

WARDROBE ASSIGNMENT FOR THIS SECTION "${ctx.section.title}":
- Use ONLY combined artist_wardrobe format: @${ctx.artist ? ctx.artist.toLowerCase().replace(/\s+/g, '') : 'artist'}_streetwear
- Different sections should use different wardrobe styles for visual variety
- Wardrobe styles: streetwear, formal, casual, vintage, athletic, bohemian, grunge, etc.
- Each reference is ONE WORD combining artist + underscore + wardrobe style

Example format${ctx.artist ? ` for artist "${ctx.artist}"` : ''}:
shots: [
  "Wide shot of @d_streetwear performing in @location1, with dramatic lighting and smoke effects",
  "Close-up of @d_formalwear showing intense emotion during the hook, @prop1 visible in foreground",  
  "Tracking shot following @d_casualwear through @location2 hallway, steadicam creating smooth movement"
]

PERFORMANCE RATIO GUIDELINES BY TREATMENT TYPE:
- Performance-heavy treatments (concert, studio, artist-focused): 0.8-0.9 ratio
- Narrative treatments (story-driven, cinematic): 0.4-0.6 ratio  
- Mixed treatments (performance + narrative): 0.6-0.8 ratio
- Abstract/experimental treatments: 0.3-0.7 ratio (varies by concept)

Adjust performance ratio based on the selected treatment concept and this specific section.

REQUIRED JSON STRUCTURE - include ALL fields:
{
  "sectionId": "${ctx.section.id}",
  "shots": [array of shot strings],
  "performanceNotes": [array of performance direction strings],
  "syncPoints": [array of key lyric/beat moments],
  "performanceRatio": number (0.0 to 1.0, adjusted for treatment type and section)
}

Return ONLY JSON matching this exact structure.`.trim(),
}
