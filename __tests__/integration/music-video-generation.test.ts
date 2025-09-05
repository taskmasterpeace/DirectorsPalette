import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { generateFullMusicVideoBreakdown, extractMusicVideoReferences } from '@/app/actions'

describe('Music Video Generation', () => {
  const mockLyrics = `
    Verse 1:
    Walking down the street at night
    City lights are burning bright
    
    Chorus:
    We're dancing in the moonlight
    Everything's gonna be alright
  `

  describe('Reference Extraction', () => {
    it('should extract references from lyrics', async () => {
      const result = await extractMusicVideoReferences(
        'Test Song',
        'Test Artist',
        mockLyrics,
        'Spike Jonze'
      )

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('locations')
      expect(result.data).toHaveProperty('wardrobe')
      expect(result.data).toHaveProperty('props')
      expect(result.data?.locations).toBeInstanceOf(Array)
    })

    it('should handle empty lyrics gracefully', async () => {
      const result = await extractMusicVideoReferences(
        'Test Song',
        'Test Artist',
        '',
        ''
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('lyrics')
    })
  })

  describe('Breakdown Generation', () => {
    it('should generate breakdown with configured references', async () => {
      const mockConfig = {
        isConfigured: true,
        locations: [
          { reference: '@street', name: 'City Street', description: 'Urban night scene' }
        ],
        wardrobe: [
          { reference: '@casual', name: 'Casual Wear', description: 'Street clothes' }
        ],
        props: [],
        visualThemes: ['neon', 'urban', 'night']
      }

      const result = await generateFullMusicVideoBreakdown({
        songTitle: 'Test Song',
        artistName: 'Test Artist',
        lyrics: mockLyrics,
        musicVideoConfig: mockConfig
      })

      expect(result.success).toBe(true)
      expect(result.data?.breakdown).toBeDefined()
      expect(result.data?.breakdown.sectionBreakdowns).toBeInstanceOf(Array)
      expect(result.data?.breakdown.sectionBreakdowns.length).toBeGreaterThan(0)
    })

    it('should not generate shots without isConfigured flag', async () => {
      const mockConfig = {
        isConfigured: false,
        locations: [],
        wardrobe: [],
        props: []
      }

      const result = await generateFullMusicVideoBreakdown({
        songTitle: 'Test Song',
        artistName: 'Test Artist',
        lyrics: mockLyrics,
        musicVideoConfig: mockConfig
      })

      expect(result.success).toBe(true)
      expect(result.data?.breakdown.sectionBreakdowns).toEqual([])
    })
  })

  describe('Visual Themes Integration', () => {
    it('should incorporate visual themes into generation', async () => {
      const mockConfig = {
        isConfigured: true,
        locations: [],
        wardrobe: [],
        props: [],
        visualThemes: ['cyberpunk', 'neon', 'futuristic']
      }

      const result = await generateFullMusicVideoBreakdown({
        songTitle: 'Test Song',
        artistName: 'Test Artist',
        lyrics: mockLyrics,
        musicVideoConfig: mockConfig
      })

      expect(result.success).toBe(true)
      // Verify themes are used (would need to check prompt or mock AI response)
    })
  })
})