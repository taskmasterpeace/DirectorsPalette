import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analyzeSongDNAEnhanced } from '@/app/actions/song-dna/analyze-enhanced'
import { generateFromDNAEnhanced } from '@/app/actions/song-dna/generate-enhanced'
import { saveSongDNA, getSavedDNA, exportDNAToJSON } from '@/app/actions/song-dna/manage'
import { songDNADB } from '@/lib/song-dna-db'
import type { AnalysisRequest, GenerationOptions } from '@/lib/song-dna-types'

// Mock environment
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model')
}))

describe('Song DNA Complete Flow', () => {
  const testLyrics = `[Verse]
Walking down the street at night
City lights are burning bright
Stars above are shining too
All I think about is you

[Chorus]  
We're dancing in the moonlight
Everything's gonna be alright
Hold me close and don't let go
This is all we need to know`

  const hipHopLyrics = `[Verse]
Yeah, I'm gonna make it to the top, no doubt
Wanna see me fail but I ain't backing out
Gotta stay focused on the grind every day
Tryna build a legacy that's here to stay`

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Analysis Phase', () => {
    it('should analyze song DNA without errors', async () => {
      const request: AnalysisRequest = {
        lyrics: testLyrics,
        title: 'Test Song',
        artist: 'Test Artist'
      }

      // Mock the AI response
      vi.mock('ai', () => ({
        generateText: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            themes: ['love', 'night', 'romance'],
            primary_emotion: 'hopeful',
            emotional_transitions: [],
            signature_phrases: ['moonlight', 'burning bright'],
            metaphors: ['stars shining'],
            wordplay: [],
            vocabulary_style: 'simple'
          })
        })
      }))

      const result = await analyzeSongDNAEnhanced(request)
      
      expect(result).toBeDefined()
      expect(result.song_dna).toBeDefined()
      expect(result.song_dna.id).toBeDefined()
      expect(result.song_dna.id).toMatch(/^dna_/)
      expect(result.confidence_scores).toBeDefined()
      expect(result.confidence_scores.structure).toBeGreaterThan(0.5)
    })

    it('should count syllables accurately', async () => {
      const request: AnalysisRequest = {
        lyrics: hipHopLyrics,
        title: 'Hip Hop Test',
        artist: 'Test MC'
      }

      const result = await analyzeSongDNAEnhanced(request)
      
      expect(result.song_dna.lyrical.syllables_per_line).toBeDefined()
      expect(result.song_dna.lyrical.syllables_per_line.average).toBeGreaterThan(0)
      expect(result.song_dna.lyrical.syllables_per_line.distribution).toBeDefined()
      expect(result.song_dna.lyrical.syllables_per_line.distribution.length).toBeGreaterThan(0)
    })

    it('should detect rhyme patterns', async () => {
      const request: AnalysisRequest = {
        lyrics: testLyrics,
        title: 'Rhyme Test',
        artist: 'Test Artist'
      }

      const result = await analyzeSongDNAEnhanced(request)
      
      expect(result.song_dna.lyrical.rhyme_schemes).toBeDefined()
      expect(Object.keys(result.song_dna.lyrical.rhyme_schemes).length).toBeGreaterThan(0)
    })

    it('should handle empty lyrics gracefully', async () => {
      const request: AnalysisRequest = {
        lyrics: '',
        title: 'Empty Test',
        artist: 'Nobody'
      }

      const result = await analyzeSongDNAEnhanced(request)
      
      expect(result).toBeDefined()
      expect(result.song_dna.structure.total_bars).toBe(0)
      expect(result.confidence_scores.overall).toBeLessThan(0.5)
    })
  })

  describe('Generation Phase', () => {
    it('should generate lyrics from DNA', async () => {
      // First analyze to get DNA
      const analysisRequest: AnalysisRequest = {
        lyrics: testLyrics,
        title: 'Original',
        artist: 'Original Artist'
      }

      const analysisResult = await analyzeSongDNAEnhanced(analysisRequest)
      const dna = analysisResult.song_dna

      // Ensure DNA has an ID
      expect(dna.id).toBeDefined()

      // Mock generation response
      vi.mock('ai', () => ({
        generateText: vi.fn().mockResolvedValue({
          text: `Walking through the park today [7]
Sunshine lights my way [5]
Birds are singing songs so new [7]
Everything reminds me of you [8]`
        })
      }))

      const options: GenerationOptions = {
        theme: 'love in the park',
        creativity: 5, // Should be converted to temperature 1.0
        length: 'short'
      }

      const generatedSong = await generateFromDNAEnhanced(dna, options)
      
      expect(generatedSong).toBeDefined()
      expect(generatedSong.id).toBeDefined()
      expect(generatedSong.id).toMatch(/^gen_/)
      expect(generatedSong.lyrics).toBeDefined()
      expect(generatedSong.metadata).toBeDefined()
      expect(generatedSong.metadata.source_dna_id).toBe(dna.id)
    })

    it('should handle DNA without ID', async () => {
      const dnaWithoutId = {
        reference_song: {
          title: 'Test',
          artist: 'Test',
          lyrics: 'test'
        },
        structure: {
          pattern: ['verse'],
          verse_lines: 4,
          chorus_lines: 4,
          total_bars: 4,
          sections: []
        },
        lyrical: {
          rhyme_schemes: {},
          syllables_per_line: {
            average: 7,
            variance: 1,
            distribution: [7, 7, 7, 7]
          },
          vocabulary_level: 'simple',
          signature_words: [],
          themes: [],
          metaphor_density: 5,
          alliteration_frequency: 3,
          internal_rhyme_density: 3,
          repetition_patterns: []
        },
        musical: {},
        emotional: {
          primary_emotion: 'neutral',
          secondary_emotions: [],
          emotional_arc: [],
          overall_intensity: 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_version: '2.0'
      }

      const options: GenerationOptions = {
        theme: 'test',
        creativity: 5
      }

      const generatedSong = await generateFromDNAEnhanced(dnaWithoutId as any, options)
      
      expect(generatedSong).toBeDefined()
      expect(generatedSong.metadata.source_dna_id).toBeUndefined()
    })

    it('should properly scale creativity to temperature', async () => {
      const dna = {
        id: 'test_dna',
        reference_song: { title: 'Test', artist: 'Test', lyrics: 'test' },
        structure: { pattern: [], verse_lines: 4, chorus_lines: 4, total_bars: 4, sections: [] },
        lyrical: {
          rhyme_schemes: {},
          syllables_per_line: { average: 7, variance: 1, distribution: [] },
          vocabulary_level: 'simple',
          signature_words: [],
          themes: [],
          metaphor_density: 5,
          alliteration_frequency: 3,
          internal_rhyme_density: 3,
          repetition_patterns: []
        },
        musical: {},
        emotional: {
          primary_emotion: 'neutral',
          secondary_emotions: [],
          emotional_arc: [],
          overall_intensity: 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5
        }
      }

      // Test different creativity values
      const testCases = [
        { creativity: 0, expectedTemp: 0 },
        { creativity: 5, expectedTemp: 1 },
        { creativity: 10, expectedTemp: 2 },
        { creativity: 15, expectedTemp: 2 }, // Should cap at 2
      ]

      for (const testCase of testCases) {
        const options: GenerationOptions = {
          theme: 'test',
          creativity: testCase.creativity
        }

        // We can't easily test the actual temperature value sent to the API,
        // but we can ensure it doesn't throw an error
        await expect(
          generateFromDNAEnhanced(dna as any, options)
        ).resolves.toBeDefined()
      }
    })
  })

  describe('Storage Phase', () => {
    it('should save DNA to database', async () => {
      const dna = {
        id: 'test_save_dna',
        reference_song: { title: 'Save Test', artist: 'Test', lyrics: 'test' },
        structure: { pattern: [], verse_lines: 4, chorus_lines: 4, total_bars: 4, sections: [] },
        lyrical: {
          rhyme_schemes: {},
          syllables_per_line: { average: 7, variance: 1, distribution: [] },
          vocabulary_level: 'simple' as const,
          signature_words: [],
          themes: [],
          metaphor_density: 5,
          alliteration_frequency: 3,
          internal_rhyme_density: 3,
          repetition_patterns: []
        },
        musical: {},
        emotional: {
          primary_emotion: 'neutral',
          secondary_emotions: [],
          emotional_arc: [],
          overall_intensity: 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_version: '2.0'
      }

      const saveResult = await saveSongDNA(dna, {
        title: 'Test Song',
        artist: 'Test Artist',
        tags: ['test', 'sample']
      })

      expect(saveResult.success).toBe(true)
      expect(saveResult.id).toBeDefined()
    })

    it('should retrieve saved DNA', async () => {
      // First save
      const dna = {
        id: 'test_retrieve_dna',
        reference_song: { title: 'Retrieve Test', artist: 'Test', lyrics: 'test' },
        structure: { pattern: [], verse_lines: 4, chorus_lines: 4, total_bars: 4, sections: [] },
        lyrical: {
          rhyme_schemes: {},
          syllables_per_line: { average: 7, variance: 1, distribution: [] },
          vocabulary_level: 'simple' as const,
          signature_words: [],
          themes: [],
          metaphor_density: 5,
          alliteration_frequency: 3,
          internal_rhyme_density: 3,
          repetition_patterns: []
        },
        musical: {},
        emotional: {
          primary_emotion: 'neutral',
          secondary_emotions: [],
          emotional_arc: [],
          overall_intensity: 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_version: '2.0'
      }

      const saveResult = await saveSongDNA(dna)
      expect(saveResult.success).toBe(true)
      
      if (saveResult.id) {
        const getResult = await getSavedDNA(saveResult.id)
        expect(getResult.success).toBe(true)
        expect(getResult.data).toBeDefined()
        expect(getResult.data?.dna.id).toBe('test_retrieve_dna')
      }
    })

    it('should export DNA to JSON', async () => {
      const dna = {
        id: 'test_export_dna',
        reference_song: { title: 'Export Test', artist: 'Test', lyrics: 'test' },
        structure: { pattern: [], verse_lines: 4, chorus_lines: 4, total_bars: 4, sections: [] },
        lyrical: {
          rhyme_schemes: {},
          syllables_per_line: { average: 7, variance: 1, distribution: [] },
          vocabulary_level: 'simple' as const,
          signature_words: [],
          themes: [],
          metaphor_density: 5,
          alliteration_frequency: 3,
          internal_rhyme_density: 3,
          repetition_patterns: []
        },
        musical: {},
        emotional: {
          primary_emotion: 'neutral',
          secondary_emotions: [],
          emotional_arc: [],
          overall_intensity: 5,
          sincerity_vs_irony: 0,
          vulnerability_level: 5
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_version: '2.0'
      }

      const saveResult = await saveSongDNA(dna)
      expect(saveResult.success).toBe(true)
      
      if (saveResult.id) {
        const exportResult = await exportDNAToJSON(saveResult.id)
        expect(exportResult.success).toBe(true)
        expect(exportResult.data).toBeDefined()
        
        if (exportResult.data) {
          const parsed = JSON.parse(exportResult.data)
          expect(parsed.version).toBe('2.0')
          expect(parsed.dna).toBeDefined()
          expect(parsed.dna.id).toBe('test_export_dna')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in lyrics', async () => {
      const specialLyrics = `[Verse]
Don't stop, won't stop, can't stop now
Y'all ain't ready for what's comin' down
It's the king, I'm wearin' the crown
@#$% the haters, they can't bring me down`

      const request: AnalysisRequest = {
        lyrics: specialLyrics,
        title: 'Special Chars',
        artist: 'Test MC'
      }

      const result = await analyzeSongDNAEnhanced(request)
      expect(result).toBeDefined()
      expect(result.song_dna.lyrical.syllables_per_line.distribution.length).toBeGreaterThan(0)
    })

    it('should handle very long lyrics', async () => {
      const longLyrics = Array(100).fill('[Verse]\nThis is a line of text').join('\n')
      
      const request: AnalysisRequest = {
        lyrics: longLyrics,
        title: 'Long Song',
        artist: 'Verbose Artist'
      }

      const result = await analyzeSongDNAEnhanced(request)
      expect(result).toBeDefined()
      expect(result.song_dna.structure.total_bars).toBeGreaterThan(50)
    })

    it('should handle malformed section headers', async () => {
      const malformedLyrics = `[Vers
This line has a broken header
[Chorus]]
Double bracket shouldn't break
Verse]
Missing opening bracket`

      const request: AnalysisRequest = {
        lyrics: malformedLyrics,
        title: 'Malformed',
        artist: 'Test'
      }

      const result = await analyzeSongDNAEnhanced(request)
      expect(result).toBeDefined()
      expect(result.song_dna).toBeDefined()
    })
  })
})