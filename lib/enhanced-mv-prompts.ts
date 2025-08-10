/**
 * Enhanced Music Video Prompts with Timestamp Integration
 */
import type { ArtistProfile } from "./artist-types"

// Enhanced context for MV generation
interface EnhancedMVContext {
  songTitle: string
  artist: string
  genre: string
  directorStyle: string
  directorNotes: string
  videoConcept: string
  artistProfileStr: string
  performanceRatio: number // 0-100, where 100 = all performance
  sectionStartTime?: string
  sectionEndTime?: string
  beatMarkers?: string[] // Key beats/drops for sync
}

export const enhancedMVPrompts = {
  
  musicVideoBreakdown: (ctx: EnhancedMVContext & {
    sectionTitle: string
    sectionLyrics: string
    treatmentName: string
    treatmentConcept: string
    locations: string
    artistVersions: string // Different looks/outfits
    props: string
  }) => `
You are a world-class music video director creating shot lists for "${ctx.sectionTitle}" (${ctx.sectionStartTime || '0:00'} - ${ctx.sectionEndTime || '0:30'}).

DIRECTOR STYLE PROFILE:
${ctx.directorStyle}

ARTIST PROFILE & PERSONALITY:
${ctx.artistProfileStr}

CREATIVE DIRECTION:
Director Notes: ${ctx.directorNotes}
Video Concept: ${ctx.videoConcept}
Treatment: "${ctx.treatmentName}" - ${ctx.treatmentConcept}

PERFORMANCE/NARRATIVE BALANCE: ${ctx.performanceRatio}% Performance, ${100 - ctx.performanceRatio}% Narrative

SECTION DETAILS:
Title: ${ctx.sectionTitle}
Timing: ${ctx.sectionStartTime} - ${ctx.sectionEndTime}
Lyrics: "${ctx.sectionLyrics}"
${ctx.beatMarkers?.length ? `Beat Markers: ${ctx.beatMarkers.join(', ')}` : ''}

PRODUCTION ELEMENTS:
LOCATIONS: ${ctx.locations}
ARTIST VERSIONS: ${ctx.artistVersions}
PROPS: ${ctx.props}

CRITICAL MUSIC VIDEO REQUIREMENTS:
1. TIMESTAMPS: Every shot must include precise timing [MM:SS-MM:SS] within the section
2. LIP SYNC: For vocal sections, include "lip sync accurate" in performance shots
3. BEAT SYNC: Align cut points and movements with beat markers
4. ARTIST VERSIONS: Reference specific looks (@artist_v1, @artist_v2) based on section mood
5. PERFORMANCE SHOTS: Include wide performance, close-up performance, instrument focus (if applicable)
6. ENTITY REFERENCES: Use @location_name, @artist_v1, @prop_name format

PERFORMANCE SHOT TYPES (use ${ctx.performanceRatio}% of shots):
- Wide performance shot with full body, showing energy
- Medium performance shot focusing on upper body and expression
- Close-up performance shot emphasizing lip sync and emotion
- Detail shots of hands, instruments, or signature moves
- Crowd/audience reaction shots (if applicable)

NARRATIVE SHOT TYPES (use ${100 - ctx.performanceRatio}% of shots):
- Story-driven scenes based on lyrics
- Cinematic B-roll supporting themes
- Abstract/artistic shots reflecting mood
- Character interactions or solo narrative moments

Generate 6-10 shots with precise timestamps, mixing performance and narrative according to the specified ratio. Each shot should be a complete visual prompt including location, artist version, action, camera movement, and timing.

Return ONLY JSON with: shots[], performanceNotes[], syncPoints[], timestamps[]`,

  artistFeedbackSimulation: (ctx: {
    artistProfile: ArtistProfile
    options: Array<{ id: string, description: string }>
  }) => `
You are ${ctx.artistProfile.artist_name}, responding to treatment options for your music video.

YOUR PERSONALITY:
${ctx.artistProfile.chat_voice?.tone || 'Authentic and thoughtful'}
MBTI: ${ctx.artistProfile.personality?.mbti || 'Unknown'}
Communication Style: ${ctx.artistProfile.chat_voice?.communication_style || 'Direct but friendly'}

Respond as a TEXT MESSAGE to each option, giving:
1. Your genuine reaction (excited, confused, not feeling it, etc.)
2. A 1-10 rating
3. Specific feedback about what you like/dislike
4. Use your authentic voice and slang from your profile

OPTIONS TO REVIEW:
${ctx.options.map((opt, i) => `Option ${i+1}: ${opt.description}`).join('\n')}

Respond in character as if texting your director. Be honest and specific.

Return JSON: { responses: [{ optionId, message, rating, emoji }] }`,

  directorQuestions: (ctx: {
    directorName: string
    directorStyle: string
    songAnalysis: string
    artistProfile: ArtistProfile
  }) => `
You are ${ctx.directorName}, analyzing "${ctx.artistProfile.artist_name}'s" new song for a music video.

YOUR DIRECTORIAL APPROACH:
${ctx.directorStyle}

SONG ANALYSIS:
${ctx.songAnalysis}

ARTIST PROFILE:
${buildArtistProfileString(ctx.artistProfile)}

Based on your directorial style and this specific song/artist combination, generate 4 CONVERSATIONAL questions that feel like you're having a creative discussion. Questions should:

1. Be specific to this song's themes/mood (not generic)
2. Reflect your directorial personality
3. Address choices that will significantly impact the visual outcome
4. Reference specific elements from the lyrics or artist's style
5. Feel like a real creative conversation, not a survey

Each question should have 4 multiple choice answers that reflect different creative directions.

Example tone: "I'm hearing vulnerability in these lyrics about [specific lyric]. Should we lean into that raw emotion or contrast it with something unexpected?"

Return JSON: { questions: [{ question, options: [{ value, label, description }] }] }`,

  enhancedShotGeneration: (ctx: EnhancedMVContext & {
    sectionTitle: string
    directorAnswers: Array<{ questionId: string, selectedValue: string }>
    artistFeedback?: { preferredTreatment: string, notes: string }
  }) => `
Generate shots incorporating the creative decisions made during the director-artist collaboration.

DIRECTOR-ARTIST COLLABORATION RESULTS:
Director Decisions: ${ctx.directorAnswers.map(a => `${a.questionId}: ${a.selectedValue}`).join('\n')}
${ctx.artistFeedback ? `Artist Feedback: Prefers "${ctx.artistFeedback.preferredTreatment}" - ${ctx.artistFeedback.notes}` : ''}

PERFORMANCE/NARRATIVE SPLIT: ${ctx.performanceRatio}% performance shots

Now generate shots that authentically reflect these collaborative decisions, ensuring the creative vision feels unified and purposeful.

Each shot must include:
- Precise timestamp [MM:SS-MM:SS]
- Specific @entity references  
- Artist version (@artist_v1, @artist_v2, etc.)
- Beat sync markers for cuts/movements
- Camera movement and framing
- Lighting mood
- Performance vs narrative classification

Return JSON with detailed shot list incorporating the collaborative creative decisions.`
}

// Helper function to build artist profile (reusing existing)
function buildArtistProfileString(p?: ArtistProfile): string {
  if (!p) return "No additional artist profile provided."
  // ... existing implementation
  return "Artist profile details..."
}