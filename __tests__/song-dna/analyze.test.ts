import { describe, it, expect, beforeAll, vi } from 'vitest'
import { analyzeSongDNA, quickAnalyze } from '@/app/actions/song-dna'
import type { AnalysisRequest } from '@/lib/song-dna-types'

// Mock the OpenAI API
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model')
}))

describe('Song DNA Analysis', () => {
  const sampleLyrics = `[Verse]
You just glance over scripts and never know the plots
So many occupied with designer clothes or their hoes and opps
Rappers who couldn't load a Glock, but grow some locks
And tell you that, you ain't shit 'cause you sold some rocks

[Chorus]
I came out the booth, it look like a storm hit it
Horrific, them contracts lyin', they put they clause in it
So forfeit it, fuck all critics
Giants don't involve midgets

[Verse 2]
Said fuck the world 'cause you broke and thought shit would come for free
Nah, them thoughts don't comfort me, not when I almost lost my life
Out of town in South Carolina, sold all the Charleston White
But I ain't ever lost my sight, money see what it do to people`

  const shortLyrics = `Walking down the street at night
City lights are burning bright
We're dancing in the moonlight
Everything's gonna be alright`

  describe('Quick Analysis', () => {
    it('should perform quick analysis without AI', async () => {
      const result = await quickAnalyze(sampleLyrics)
      
      expect(result).toBeDefined()
      expect(result.structure).toBeDefined()
      expect(result.lyrical).toBeDefined()
      expect(result.lyrical?.syllables_per_line?.average).toBeGreaterThan(0)
    })

    it('should handle empty lyrics', async () => {
      const result = await quickAnalyze('')
      
      expect(result).toBeDefined()
      expect(result.structure?.total_bars).toBe(0)
    })
  })

  describe('Full Analysis', () => {
    const request: AnalysisRequest = {
      lyrics: sampleLyrics,
      title: 'Test Song',
      artist: 'Test Artist',
      genre: 'Hip-Hop',
      year: 2024
    }

    it('should analyze song DNA with proper structure', async () => {
      // Mock the generateObject function to return expected data
      vi.mock('ai', () => ({
        generateObject: vi.fn().mockResolvedValue({
          object: {
            sections: [
              { type: 'verse', line_count: 4, rhyme_scheme: 'AABB' },
              { type: 'chorus', line_count: 4, rhyme_scheme: 'ABAB' },
              { type: 'verse', line_count: 4, rhyme_scheme: 'AABB' }
            ],
            overall_pattern: ['verse', 'chorus', 'verse'],
            themes: ['struggle', 'authenticity', 'success'],
            primary_emotion: 'defiance',
            emotional_arc: [
              { section: 'verse', emotion: 'anger', intensity: 7 },
              { section: 'chorus', emotion: 'defiance', intensity: 8 },
              { section: 'verse', emotion: 'reflection', intensity: 6 }
            ],
            vocabulary_complexity: 'complex',
            signature_words: ['plots', 'opps', 'Glock', 'critics'],
            metaphor_examples: ['storm hit it', 'Giants don\'t involve midgets'],
            metaphor_density: 7,
            alliteration_frequency: 5,
            internal_rhyme_density: 8,
            repetition_level: 3,
            suggested_tempo: '90-100 BPM',
            energy_level: 7,
            suggested_key: 'C minor'
          }
        }),
        generateText: vi.fn()
      }))

      const result = await analyzeSongDNA(request)
      
      expect(result).toBeDefined()
      expect(result.song_dna).toBeDefined()
      expect(result.confidence_scores).toBeDefined()
      expect(result.suggestions).toBeInstanceOf(Array)
      
      // Check structure
      expect(result.song_dna.structure.pattern).toContain('verse')
      expect(result.song_dna.structure.sections).toHaveLength(3)
      
      // Check lyrical analysis
      expect(result.song_dna.lyrical.themes).toContain('struggle')
      expect(result.song_dna.lyrical.vocabulary_level).toBe('complex')
      
      // Check emotional mapping
      expect(result.song_dna.emotional.primary_emotion).toBe('defiance')
      expect(result.song_dna.emotional.emotional_arc).toHaveLength(3)
    })

    it('should handle analysis errors gracefully', async () => {
      // Mock to simulate API failure
      vi.mock('ai', () => ({
        generateObject: vi.fn().mockRejectedValue(new Error('API Error')),
        generateText: vi.fn().mockRejectedValue(new Error('API Error'))
      }))

      const result = await analyzeSongDNA(request)
      
      // Should return basic analysis
      expect(result).toBeDefined()
      expect(result.confidence_scores.overall).toBeLessThan(0.5)
      expect(result.suggestions).toContain('AI analysis failed')
    })

    it('should use fallback when generateObject fails', async () => {
      // Mock generateObject to fail but generateText to succeed
      vi.mock('ai', () => ({
        generateObject: vi.fn().mockRejectedValue(new Error('Schema mismatch')),
        generateText: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            sections: [{ type: 'verse', line_count: 4, rhyme_scheme: 'AABB' }],
            overall_pattern: ['verse'],
            themes: ['life'],
            primary_emotion: 'neutral',
            emotional_arc: [],
            vocabulary_complexity: 'moderate',
            signature_words: [],
            metaphor_examples: [],
            metaphor_density: 5,
            alliteration_frequency: 3,
            internal_rhyme_density: 3,
            repetition_level: 2,
            suggested_tempo: '120 BPM',
            energy_level: 5
          })
        })
      }))

      const result = await analyzeSongDNA(request)
      
      expect(result).toBeDefined()
      expect(result.song_dna).toBeDefined()
      expect(result.confidence_scores.overall).toBe(0.7) // Fallback confidence
      expect(result.suggestions).toContain('fallback method')
    })
  })

  describe('Real Lyrics Test', () => {
    it('should handle complex real-world lyrics', async () => {
      const complexRequest: AnalysisRequest = {
        lyrics: sampleLyrics,
        title: 'Real Test',
        artist: 'Ron-Ron'
      }

      // This would actually call the API in integration tests
      // For unit tests, we just verify the structure
      const result = await quickAnalyze(sampleLyrics)
      
      expect(result).toBeDefined()
      expect(result.structure).toBeDefined()
      expect(result.lyrical?.syllables_per_line?.distribution).toHaveLength(
        sampleLyrics.split('\n').filter(line => line.trim() && !line.startsWith('[')).length
      )
    })
  })
})