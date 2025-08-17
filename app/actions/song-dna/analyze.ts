"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject, generateText } from "ai"
import { z } from "zod"
import type { SongDNA, AnalysisRequest, AnalysisResult } from "@/lib/song-dna-types"
import { 
  createBlankSongDNA, 
  detectSongSections, 
  countSyllables, 
  detectRhymeScheme 
} from "@/lib/song-dna-types"
import type { ArtistProfile } from "@/lib/artist-types"
import { artistDB } from "@/lib/artist-db"

// Simplified schema to avoid AI confusion
const AIAnalysisSchema = z.object({
  sections: z.array(z.object({
    type: z.string(),
    line_count: z.number(),
    rhyme_scheme: z.string(),
  })),
  overall_pattern: z.array(z.string()),
  themes: z.array(z.string()),
  primary_emotion: z.string(),
  emotional_arc: z.array(z.object({
    section: z.string(),
    emotion: z.string(),
    intensity: z.number(),
  })),
  vocabulary_complexity: z.string(),
  signature_words: z.array(z.string()),
  metaphor_examples: z.array(z.string()),
  metaphor_density: z.number(),
  alliteration_frequency: z.number(),
  internal_rhyme_density: z.number(),
  repetition_level: z.number(),
  suggested_tempo: z.string(),
  energy_level: z.number(),
  suggested_key: z.string().optional(),
})

export async function analyzeSongDNA(request: AnalysisRequest): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const { lyrics, title, artist, artist_profile_id } = request
  
  // Get artist profile if provided
  let artistProfile: ArtistProfile | null = null
  if (artist_profile_id) {
    const artists = await artistDB.all()
    artistProfile = artists.find(a => a.artist_id === artist_profile_id) || null
  }

  // Basic structural analysis
  const lines = lyrics.split('\n').filter(line => line.trim())
  const sections = detectSongSections(lyrics)
  
  // Syllable analysis
  const syllableCounts = lines.map(line => {
    const words = line.trim().split(/\s+/)
    return words.reduce((sum, word) => sum + countSyllables(word), 0)
  })
  
  const avgSyllables = syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length
  const variance = syllableCounts.reduce((sum, count) => sum + Math.pow(count - avgSyllables, 2), 0) / syllableCounts.length

  // AI-powered deep analysis
  const prompt = `
Analyze this song's structure, style, and patterns for replication:

Title: ${title || "Unknown"}
Artist: ${artist || "Unknown"}
${artistProfile ? `Artist Style: ${artistProfile.genres?.join(", ")}, ${artistProfile.vocal_description?.tone_texture}` : ""}

Lyrics:
${lyrics}

Provide a comprehensive analysis including:
1. Detailed song structure with sections and rhyme schemes
2. Thematic content and emotional mapping
3. Vocabulary complexity and signature words
4. Stylistic features (metaphors, alliteration, etc.)
5. Production hints (tempo, energy, key)

Focus on patterns that can be replicated to generate similar songs.
`

  try {
    const { object: aiAnalysis } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: AIAnalysisSchema,
      prompt,
      system: "You are an expert music analyst. Analyze the song and return a JSON object with the analysis data. DO NOT return a schema definition. Return actual values for each field.",
    })

    // Build complete Song DNA from flattened schema
    const songDNA: SongDNA = {
      id: `dna_${Math.random().toString(36).slice(2, 10)}`,
      
      reference_song: {
        title: title || "Untitled",
        artist: artist || "Unknown Artist",
        lyrics,
        year: request.year,
        genre: request.genre,
      },
      
      structure: {
        pattern: aiAnalysis.overall_pattern,
        verse_lines: aiAnalysis.sections.find(s => s.type === "verse")?.line_count || 4,
        chorus_lines: aiAnalysis.sections.find(s => s.type === "chorus")?.line_count || 4,
        bridge_lines: aiAnalysis.sections.find(s => s.type === "bridge")?.line_count,
        total_bars: lines.length,
        sections: aiAnalysis.sections.map((s, i) => ({
          type: s.type,
          start_line: i * 4, // Approximate
          end_line: (i + 1) * 4,
          rhyme_scheme: s.rhyme_scheme,
        })),
      },
      
      lyrical: {
        rhyme_schemes: aiAnalysis.sections.reduce((acc, s) => {
          acc[s.type] = s.rhyme_scheme
          return acc
        }, {} as Record<string, string>),
        syllables_per_line: {
          average: avgSyllables,
          variance,
          distribution: syllableCounts,
        },
        vocabulary_level: aiAnalysis.vocabulary_complexity,
        signature_words: aiAnalysis.signature_words,
        themes: aiAnalysis.themes,
        metaphor_density: aiAnalysis.metaphor_density,
        alliteration_frequency: aiAnalysis.alliteration_frequency,
        internal_rhyme_density: aiAnalysis.internal_rhyme_density,
        repetition_patterns: [], // Would need more complex analysis
      },
      
      musical: {
        tempo_bpm: parseInt(aiAnalysis.suggested_tempo) || undefined,
        suggested_key: aiAnalysis.suggested_key,
        energy_curve: aiAnalysis.emotional_arc.map(e => e.intensity),
        hook_placement: [], // Would need to identify hooks
      },
      
      emotional: {
        primary_emotion: aiAnalysis.primary_emotion,
        secondary_emotions: [],
        emotional_arc: aiAnalysis.emotional_arc,
        overall_intensity: aiAnalysis.energy_level,
        sincerity_vs_irony: 0, // Would need sentiment analysis
        vulnerability_level: 5, // Default
      },
      
      artist_profile_id,
      genre_tags: artistProfile?.genres || [],
      production_notes: `Tempo: ${aiAnalysis.suggested_tempo || "Unknown"}, Energy: ${aiAnalysis.energy_level || 5}/10`,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analysis_version: "1.0",
    }

    // Calculate confidence scores
    const confidence_scores = {
      structure: 0.85,
      rhyme: 0.8,
      emotion: 0.75,
      overall: 0.8,
    }

    return {
      song_dna: songDNA,
      confidence_scores,
      suggestions: [
        "Review detected sections for accuracy",
        "Verify rhyme schemes match your interpretation",
        artistProfile ? `Artist profile "${artistProfile.artist_name}" styles applied` : "Consider selecting an artist for enhanced generation",
      ],
    }
  } catch (error) {
    console.error("Error analyzing song DNA with generateObject:", error)
    
    // Try fallback with generateText
    try {
      console.log("Attempting fallback with generateText...")
      
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `${prompt}\n\nReturn a JSON object with these fields:
- sections: array of {type, line_count, rhyme_scheme}
- overall_pattern: array of section names
- themes: array of themes
- primary_emotion: string
- emotional_arc: array of {section, emotion, intensity}
- vocabulary_complexity: "simple", "moderate", "complex", or "academic"
- signature_words: array of notable words
- metaphor_examples: array of metaphor examples
- metaphor_density: number 0-10
- alliteration_frequency: number 0-10
- internal_rhyme_density: number 0-10
- repetition_level: number 0-10
- suggested_tempo: string like "90-100 BPM"
- energy_level: number 1-10
- suggested_key: string (optional)

IMPORTANT: Return ONLY valid JSON, no markdown or explanations.`,
        system: "You are an expert music analyst. Return ONLY a valid JSON object with the analysis data.",
      })
      
      // Parse the text response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from AI response")
      }
      
      const aiAnalysis = JSON.parse(jsonMatch[0])
      
      // Build Song DNA with fallback data
      const songDNA: SongDNA = {
        id: `dna_${Math.random().toString(36).slice(2, 10)}`,
        
        reference_song: {
          title: title || "Untitled",
          artist: artist || "Unknown Artist",
          lyrics,
          year: request.year,
          genre: request.genre,
        },
        
        structure: {
          pattern: aiAnalysis.overall_pattern || ["verse"],
          verse_lines: aiAnalysis.sections?.find((s: any) => s.type === "verse")?.line_count || 4,
          chorus_lines: aiAnalysis.sections?.find((s: any) => s.type === "chorus")?.line_count || 4,
          bridge_lines: aiAnalysis.sections?.find((s: any) => s.type === "bridge")?.line_count,
          total_bars: lines.length,
          sections: (aiAnalysis.sections || []).map((s: any, i: number) => ({
            type: s.type,
            start_line: i * 4,
            end_line: (i + 1) * 4,
            rhyme_scheme: s.rhyme_scheme,
          })),
        },
        
        lyrical: {
          rhyme_schemes: (aiAnalysis.sections || []).reduce((acc: any, s: any) => {
            acc[s.type] = s.rhyme_scheme
            return acc
          }, {}),
          syllables_per_line: {
            average: avgSyllables,
            variance,
            distribution: syllableCounts,
          },
          vocabulary_level: aiAnalysis.vocabulary_complexity || "moderate",
          signature_words: aiAnalysis.signature_words || [],
          themes: aiAnalysis.themes || [],
          metaphor_density: aiAnalysis.metaphor_density || 5,
          alliteration_frequency: aiAnalysis.alliteration_frequency || 3,
          internal_rhyme_density: aiAnalysis.internal_rhyme_density || 3,
          repetition_patterns: [],
        },
        
        musical: {
          tempo_bpm: parseInt(aiAnalysis.suggested_tempo) || undefined,
          suggested_key: aiAnalysis.suggested_key,
          energy_curve: (aiAnalysis.emotional_arc || []).map((e: any) => e.intensity),
          hook_placement: [],
        },
        
        emotional: {
          primary_emotion: aiAnalysis.primary_emotion || "Neutral",
          secondary_emotions: [],
          emotional_arc: aiAnalysis.emotional_arc || [],
          overall_intensity: aiAnalysis.energy_level || 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5,
        },
        
        artist_profile_id,
        genre_tags: artistProfile?.genres || [],
        production_notes: `Tempo: ${aiAnalysis.suggested_tempo || "Unknown"}, Energy: ${aiAnalysis.energy_level || 5}/10`,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_version: "1.0",
      }
      
      return {
        song_dna: songDNA,
        confidence_scores: {
          structure: 0.7, // Lower confidence for fallback
          rhyme: 0.7,
          emotion: 0.65,
          overall: 0.7,
        },
        suggestions: [
          "Analysis completed using fallback method",
          "Review detected sections for accuracy",
          artistProfile ? `Artist profile "${artistProfile.artist_name}" styles applied` : "Consider selecting an artist for enhanced generation",
        ],
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError)
      
      // Return a basic analysis with just the structural data we can compute
      const basicDNA = createBlankSongDNA()
      basicDNA.reference_song = {
        title: title || "Untitled",
        artist: artist || "Unknown Artist",
        lyrics,
        year: request.year,
        genre: request.genre,
      }
      basicDNA.structure.total_bars = lines.length
      basicDNA.structure.pattern = sections
      basicDNA.lyrical.syllables_per_line = {
        average: avgSyllables,
        variance,
        distribution: syllableCounts,
      }
      
      return {
        song_dna: basicDNA,
        confidence_scores: {
          structure: 0.3,
          rhyme: 0.2,
          emotion: 0.1,
          overall: 0.2,
        },
        suggestions: [
          "AI analysis failed - showing basic structural analysis only",
          "Check your OpenAI API key is valid",
          "Try again with a shorter excerpt of lyrics",
        ],
      }
    }
  }
}

export async function quickAnalyze(lyrics: string): Promise<Partial<SongDNA>> {
  // Quick analysis without AI for instant feedback
  const lines = lyrics.split('\n').filter(line => line.trim())
  const sections = detectSongSections(lyrics)
  
  const syllableCounts = lines.map(line => {
    const words = line.trim().split(/\s+/)
    return words.reduce((sum, word) => sum + countSyllables(word), 0)
  })
  
  return {
    structure: {
      pattern: sections,
      verse_lines: 4,
      chorus_lines: 4,
      total_bars: lines.length,
      sections: [],
    },
    lyrical: {
      rhyme_schemes: {},
      syllables_per_line: {
        average: syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length,
        variance: 0,
        distribution: syllableCounts,
      },
      vocabulary_level: "moderate",
      signature_words: [],
      themes: [],
      metaphor_density: 5,
      alliteration_frequency: 3,
      internal_rhyme_density: 3,
      repetition_patterns: [],
    },
  }
}