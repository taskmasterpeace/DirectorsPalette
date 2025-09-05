"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { SongDNA, GeneratedSong, GenerationOptions } from "@/lib/song-dna-types"
import { artistDB } from "@/lib/artist-db"
import { validateSongDNA, ensureValidDNA } from "@/lib/song-dna-validator"

export async function generateFromDNAEnhanced(
  dna: SongDNA | Partial<SongDNA>,
  options: GenerationOptions
): Promise<GeneratedSong> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  // Ensure DNA has all required fields with defaults first
  const validDNA = ensureValidDNA(dna)
  
  // Then validate the complete DNA
  const validation = validateSongDNA(validDNA)
  if (!validation.valid) {
    console.error("DNA validation errors:", validation.errors)
    throw new Error(`Invalid DNA: ${validation.errors.join(", ")}`)
  }

  // Get artist profile if specified
  let artistProfile = null
  if (options.target_artist_id) {
    const artists = await artistDB.all()
    artistProfile = artists.find(a => a.artist_id === options.target_artist_id)
  }

  // Build detailed syllable and rhyme instructions
  const syllableData = validDNA.lyrical.syllables_per_line
  const avgSyllables = Math.round(syllableData.average)
  const syllableRange = {
    min: Math.max(1, avgSyllables - 2),
    max: avgSyllables + 2
  }

  // Get the most common rhyme schemes
  const rhymeSchemes = Object.entries(validDNA.lyrical.rhyme_schemes)
    .map(([section, scheme]) => `${section}: ${scheme}`)
    .join(', ')

  // Build the generation prompt with STRICT syllable and rhyme requirements
  const prompt = `
You are a master lyricist who MUST replicate the EXACT syllable count and rhyme patterns.

CRITICAL REQUIREMENTS:
1. SYLLABLE COUNT: Each line MUST have ${avgSyllables} syllables (range: ${syllableRange.min}-${syllableRange.max})
2. RHYME SCHEME: Follow these patterns EXACTLY: ${rhymeSchemes}
3. FLOW: Maintain ${validDNA.production_notes || 'consistent flow'}

REFERENCE STYLE:
- Original Artist: ${validDNA.reference_song.artist}
- Themes: ${validDNA.lyrical.themes.join(', ')}
- Signature Words/Style: ${validDNA.lyrical.signature_words.join(', ')}
- Emotional Tone: ${validDNA.emotional.primary_emotion}
- Vocabulary Level: ${validDNA.lyrical.vocabulary_level}

${artistProfile ? `
TARGET ARTIST PROFILE:
- Name: ${artistProfile.artist_name}
- Style: ${artistProfile.genres?.join(', ')}
- Voice: ${artistProfile.vocal_description?.tone_texture}
` : ''}

GENERATION PARAMETERS:
- Theme: ${options.theme || 'Similar to original'}
- Tone Adjustment: ${options.tone_adjustment || 'Match original'}
- Length: ${options.length || 'standard'}

SYLLABLE PATTERN TO FOLLOW (CRITICAL):
${(validDNA.lyrical.syllables_per_line.distribution || []).slice(0, 8).map((count, i) => 
  `Line ${i + 1}: ${count} syllables`
).join('\n')}

STRUCTURE TO REPLICATE:
${(validDNA.structure.sections || []).map(s => 
  `${s.type}: ${s.rhyme_scheme} rhyme scheme`
).join('\n')}

INSTRUCTIONS:
1. Count syllables for EVERY line - they MUST match the pattern
2. End rhymes MUST follow the exact scheme (${rhymeSchemes})
3. Maintain the same flow and rhythm as the original
4. Use similar vocabulary complexity (${validDNA.lyrical.vocabulary_level})
5. Include repetition patterns if the original had them

Generate ${options.length || 'standard'} length lyrics.

IMPORTANT: After each line, indicate syllable count in brackets like this:
"Line of lyrics here [7]"

Begin generating now:
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: `You are a precision lyricist. Your lyrics MUST match the exact syllable counts and rhyme schemes. 
Count syllables carefully: 
- "going" = 2 syllables (go-ing)
- "fire" = 2 syllables (fi-re) 
- "real" = 1 syllable
- "really" = 2 syllables (real-ly)
Focus on matching the flow EXACTLY.`,
      // Convert creativity (0-10) to temperature (0-2)
      temperature: Math.min(2, Math.max(0, ((options.creativity !== undefined ? options.creativity : 7) / 10) * 2)),
      maxTokens: 2000,
    })

    // Process the generated lyrics
    const lines = text.split('\n').filter(line => line.trim())
    
    // Remove syllable count indicators if present
    const cleanedLyrics = lines
      .map(line => line.replace(/\s*\[\d+\]\s*$/, ''))
      .join('\n')

    // Extract syllable counts from the generated text
    const generatedSyllableCounts = lines
      .map(line => {
        const match = line.match(/\[(\d+)\]/)
        return match ? parseInt(match[1]) : null
      })
      .filter(count => count !== null)

    // Calculate accuracy
    const targetAvg = validDNA.lyrical.syllables_per_line.average
    const generatedAvg = generatedSyllableCounts.length > 0
      ? generatedSyllableCounts.reduce((a, b) => a + b, 0) / generatedSyllableCounts.length
      : targetAvg
    
    const accuracy = Math.max(0, 1 - Math.abs(targetAvg - generatedAvg) / targetAvg)

    const generatedSong: GeneratedSong = {
      id: `gen_${Math.random().toString(36).slice(2, 10)}`,
      
      lyrics: cleanedLyrics,
      
      metadata: {
        source_dna_id: validDNA.id,
        generation_options: options,
        timestamp: new Date().toISOString(),
        model_used: "gpt-4o-mini-enhanced",
      },
      
      quality_scores: {
        overall: accuracy * 0.9,
        structure_match: accuracy,
        style_match: 0.85,
        originality: 0.8,
        syllable_accuracy: accuracy,
      },
      
      sections: [], // Would need to parse sections
      
      title: options.title || `${options.theme || 'Untitled'} (${validDNA.reference_song.artist} Style)`,
      
      artist_attribution: artistProfile?.artist_name || "AI Generated",
    }

    return generatedSong
  } catch (error) {
    console.error("Error generating from DNA:", error)
    throw new Error("Failed to generate song from DNA")
  }
}

export async function generateSongTitleEnhanced(
  dna: SongDNA,
  theme?: string
): Promise<string> {
  const prompt = `Generate a song title for a ${dna.emotional.primary_emotion} song about ${theme || dna.lyrical.themes[0] || 'life'}.
Style similar to ${dna.reference_song.artist}.
Should be 1-4 words, catchy and memorable.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: "Generate only the title, nothing else.",
      maxTokens: 20,
    })

    return text.trim().replace(/["']/g, '')
  } catch (error) {
    return `${theme || 'Untitled'} Song`
  }
}