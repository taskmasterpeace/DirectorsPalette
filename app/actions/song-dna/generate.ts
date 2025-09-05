"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { 
  SongDNA, 
  GenerationOptions, 
  GeneratedSong 
} from "@/lib/song-dna-types"
import type { ArtistProfile } from "@/lib/artist-types"
import { artistDB } from "@/lib/artist-db"

export async function generateFromDNA(
  dna: SongDNA,
  options: GenerationOptions,
  artistProfileId?: string
): Promise<GeneratedSong[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  // Get artist profile if provided
  let artistProfile: ArtistProfile | null = null
  if (artistProfileId) {
    const artists = await artistDB.all()
    artistProfile = artists.find(a => a.artist_id === artistProfileId) || null
  }

  const songs: GeneratedSong[] = []
  
  // Generate requested number of songs
  for (let i = 0; i < (options.count || 2); i++) {
    const variation = options.variation_mode === "diverse" ? 
      `Variation ${String.fromCharCode(65 + i)}: Make this version ${i === 0 ? "closer to the original style" : "more creative and different"}` :
      `Version ${i + 1}: Keep very similar to the original style`

    const prompt = buildGenerationPrompt(dna, options, artistProfile, variation)
    
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        system: buildSystemPrompt(dna, artistProfile),
      })

      // Parse the generated song
      const parsed = parseSongOutput(text, dna, options)
      songs.push(parsed)
    } catch (error) {
      console.error(`Error generating song ${i + 1}:`, error)
      throw new Error(`Failed to generate song ${i + 1}`)
    }
  }

  return songs
}

function buildSystemPrompt(dna: SongDNA, artistProfile: ArtistProfile | null): string {
  return `You are an expert lyricist capable of perfectly replicating song styles and structures.

${artistProfile ? `
Artist Profile:
- Name: ${artistProfile.artist_name}
- Style: ${artistProfile.genres?.join(", ")}
- Vocal: ${artistProfile.vocal_description?.tone_texture}
- Themes: ${artistProfile.writing_persona?.themes?.join(", ")}
` : ""}

Reference Song Analysis:
- Structure: ${dna.structure.pattern.join(" → ")}
- Rhyme Schemes: ${JSON.stringify(dna.lyrical.rhyme_schemes)}
- Syllables per line: ${dna.lyrical.syllables_per_line.average.toFixed(1)} average
- Themes: ${dna.lyrical.themes.join(", ")}
- Emotional tone: ${dna.emotional.primary_emotion}

Your task is to generate new songs that:
1. Match the exact structure pattern
2. Use similar rhyme schemes
3. Maintain similar syllable counts per line
4. Feel authentic to the artist's style
5. Are completely original and don't copy any existing lyrics`
}

function buildGenerationPrompt(
  dna: SongDNA,
  options: GenerationOptions,
  artistProfile: ArtistProfile | null,
  variation: string
): string {
  const structure = options.custom_structure || dna.structure.pattern
  
  return `Generate a new song with this exact structure and style.

${variation}

Theme: ${options.theme}
Structure to follow: ${structure.join(" → ")}

Detailed Requirements:
- Verse: ${dna.structure.verse_lines} lines, ${dna.lyrical.rhyme_schemes.verse || "ABAB"} rhyme
- Chorus: ${dna.structure.chorus_lines} lines, ${dna.lyrical.rhyme_schemes.chorus || "AABB"} rhyme
${dna.structure.bridge_lines ? `- Bridge: ${dna.structure.bridge_lines} lines` : ""}

Style Guidelines:
- Syllables per line: aim for ${dna.lyrical.syllables_per_line.average.toFixed(0)} (±2)
- Vocabulary: ${dna.lyrical.vocabulary_level}
- Include these stylistic elements: ${dna.lyrical.signature_words.slice(0, 5).join(", ")}
- Emotional tone: ${options.emotional_override || dna.emotional.primary_emotion}
- Energy level: ${options.energy_level || dna.emotional.overall_intensity}/10
- Creativity level: ${options.creativity}/10

${artistProfile ? `
Artist-specific requirements:
- Typical themes: ${artistProfile.writing_persona?.themes?.join(", ")}
- Language style: ${artistProfile.writing_persona?.linguistic_base}
- Signature devices: ${artistProfile.writing_persona?.signature_devices?.join(", ")}
` : ""}

${options.modernize ? "Modernize any dated references to feel current." : ""}
${!options.explicit_allowed ? "Keep content clean and family-friendly." : ""}

Format the output as:
TITLE: [Song Title]
---
[VERSE 1]
[lyrics]

[CHORUS]
[lyrics]

[Continue with full song structure]
---
MOOD: [Primary emotional tone]
BPM: [Suggested tempo]
KEY: [Suggested musical key]`
}

function parseSongOutput(
  text: string,
  dna: SongDNA,
  options: GenerationOptions
): GeneratedSong {
  // Extract title
  const titleMatch = text.match(/TITLE:\s*(.+)/i)
  const title = titleMatch ? titleMatch[1].trim() : "Untitled"
  
  // Extract mood, BPM, key
  const moodMatch = text.match(/MOOD:\s*(.+)/i)
  const bpmMatch = text.match(/BPM:\s*(\d+)/i)
  const keyMatch = text.match(/KEY:\s*(.+)/i)
  
  // Extract lyrics between dividers
  const lyricsMatch = text.match(/---\n([\s\S]+?)\n---/m)
  const lyrics = lyricsMatch ? lyricsMatch[1].trim() : text
  
  // Parse into sections
  const sections = []
  const sectionRegex = /\[([^\]]+)\]\n([\s\S]+?)(?=\[|$)/g
  let match
  
  while ((match = sectionRegex.exec(lyrics)) !== null) {
    sections.push({
      section: match[1].trim(),
      lines: match[2].trim().split('\n').filter(line => line.trim()),
    })
  }
  
  // If no sections found, treat as single verse
  if (sections.length === 0) {
    sections.push({
      section: "VERSE",
      lines: lyrics.split('\n').filter(line => line.trim()),
    })
  }
  
  return {
    id: `song_${Math.random().toString(36).slice(2, 10)}`,
    title,
    lyrics,
    structure: sections,
    theme: options.theme,
    estimated_bpm: bpmMatch ? parseInt(bpmMatch[1]) : undefined,
    suggested_key: keyMatch ? keyMatch[1].trim() : undefined,
    emotional_tone: moodMatch ? moodMatch[1].trim() : dna.emotional.primary_emotion,
    song_dna_id: dna.id,
    artist_profile_id: options.artist_profile_id,
    generation_params: options,
    created_at: new Date().toISOString(),
  }
}

export async function generateSongTitle(theme: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }
  
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Generate a creative song title for a song about: ${theme}
      
Output only the title, nothing else.`,
      system: "You are a creative songwriter. Generate catchy, memorable song titles.",
    })
    
    return text.trim()
  } catch (error) {
    console.error("Error generating title:", error)
    return "Untitled"
  }
}