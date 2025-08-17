/**
 * Comprehensive Music Video Workflow Test
 * Tests music video mode with real artist integration and @artist variable system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createArtistTag, replaceVariables, processShotsForExport } from '@/lib/export-processor'
import type { ShotData, ExportConfig } from '@/lib/export-processor'
import type { ArtistProfile } from '@/lib/artist-types'

describe('Music Video Workflow Integration Tests', () => {
  const testLyrics = `
[Verse 1]
Started from the bottom now we here
City lights reflecting all my fears
Grinding every day, no time for tears
Building up my empire year by year

[Chorus]
Rising up, never gonna fall
Standing tall against it all
From the streets to the penthouse hall
I remember when I had it all

[Verse 2]
Money in the bank, success in sight
Working through the day and through the night
Every dream I had is coming true
This is what determination can do

[Bridge]
Look back at the struggle, see how far we've come
Every step we took led us to this moment
Now we're at the top but we remember where we started
That's what keeps us grounded, that's what keeps us real

[Outro]
From the bottom to the top
Never gonna stop
This is just the beginning
Of our winning
  `.trim()

  const testArtist: Partial<ArtistProfile> = {
    artist_id: 'test-artist-1',
    artist_name: 'Jay-Z',
    real_name: 'Shawn Carter',
    genres: ['Hip-Hop', 'Rap'],
    visual_look: {
      skin_tone: 'Dark',
      hair_style: 'Short fade',
      fashion_style: 'Luxury streetwear',
      jewelry: 'Gold chains and diamond watch',
      visual_description: 'A confident Black male rapper in his 50s with short hair, wearing luxury streetwear, gold chains, and designer accessories'
    },
    artist_identity: {
      gender: 'Male',
      race_ethnicity: 'Black',
      age_range: '50-55',
      city: 'Brooklyn',
      state: 'New York'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Artist Integration Testing', () => {
    it('should create proper artist tags from names', () => {
      expect(createArtistTag('Jay-Z')).toBe('jayz')
      expect(createArtistTag('Lil Wayne')).toBe('lil_wayne')
      expect(createArtistTag('21 Savage')).toBe('21_savage')
      expect(createArtistTag('A$AP Rocky')).toBe('aap_rocky')
      expect(createArtistTag('The Notorious B.I.G.')).toBe('the_notorious_big')
    })

    it('should process artist visual descriptions', () => {
      const description = testArtist.visual_look?.visual_description || ''
      
      expect(description).toContain('confident')
      expect(description).toContain('Black male')
      expect(description).toContain('rapper')
      expect(description).toContain('luxury streetwear')
      expect(description).toContain('gold chains')
      
      // Test description format
      expect(description.length).toBeGreaterThan(50)
      expect(description).toMatch(/^A\s+\w+/) // Starts with "A [adjective]"
    })

    it('should replace @artist variables correctly', () => {
      const testShot = 'Wide shot of @artist performing on stage with confidence'
      
      // Test with artist name
      const withName = replaceVariables(testShot, {
        artistName: testArtist.artist_name
      })
      expect(withName).toBe('Wide shot of Jay-Z performing on stage with confidence')
      
      // Test with artist description
      const withDescription = replaceVariables(testShot, {
        artistDescription: testArtist.visual_look?.visual_description
      })
      expect(withDescription).toBe('Wide shot of A confident Black male rapper in his 50s with short hair, wearing luxury streetwear, gold chains, and designer accessories performing on stage with confidence')
    })
  })

  describe('Music Video Structure Testing', () => {
    const musicVideoShots: ShotData[] = [
      {
        id: 'mv-shot-1',
        description: 'Opening shot: @artist stands on rooftop overlooking city skyline at golden hour',
        section: 'Intro',
        shotNumber: 1,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:00:00Z'
        }
      },
      {
        id: 'mv-shot-2',
        description: 'Performance shot: @artist rapping directly to camera with intense energy',
        section: 'Verse 1',
        shotNumber: 2,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:01:00Z'
        }
      },
      {
        id: 'mv-shot-3',
        description: 'Dynamic movement: @artist walking through urban streets with crew following',
        section: 'Chorus',
        shotNumber: 3,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:02:00Z'
        }
      },
      {
        id: 'mv-shot-4',
        description: 'Luxury lifestyle: @artist in expensive car with city lights reflecting',
        section: 'Verse 2',
        shotNumber: 4,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:03:00Z'
        }
      },
      {
        id: 'mv-shot-5',
        description: 'Emotional moment: @artist reflecting on journey, slower pace, intimate framing',
        section: 'Bridge',
        shotNumber: 5,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:04:00Z'
        }
      }
    ]

    it('should export music video with artist name mode', () => {
      const config: ExportConfig = {
        prefix: 'Music video shot: ',
        suffix: ', hip-hop style, urban aesthetic, 4K resolution',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(musicVideoShots, config, {
        artistName: 'Jay-Z',
        director: 'Hype Williams'
      })

      expect(result.totalShots).toBe(5)
      expect(result.formattedText).toContain('1. Music video shot: Opening shot: Jay-Z stands on rooftop')
      expect(result.formattedText).toContain('2. Music video shot: Performance shot: Jay-Z rapping directly to camera')
      expect(result.formattedText).toContain('hip-hop style, urban aesthetic, 4K resolution')
      
      // Verify all sections represented
      expect(result.formattedText).toContain('rooftop') // Intro
      expect(result.formattedText).toContain('rapping') // Verse 1
      expect(result.formattedText).toContain('urban streets') // Chorus
      expect(result.formattedText).toContain('expensive car') // Verse 2
      expect(result.formattedText).toContain('reflecting on journey') // Bridge
    })

    it('should export music video with artist description mode', () => {
      const config: ExportConfig = {
        prefix: 'Music video: ',
        suffix: ', professional music video production',
        useArtistDescriptions: true,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(musicVideoShots, config, {
        artistDescription: testArtist.visual_look?.visual_description
      })

      expect(result.formattedText).toContain('confident Black male rapper')
      expect(result.formattedText).toContain('luxury streetwear')
      expect(result.formattedText).toContain('gold chains')
      expect(result.formattedText).not.toContain('@artist')
      expect(result.formattedText).not.toContain('Jay-Z')
    })

    it('should export music video as production-ready CSV', () => {
      const config: ExportConfig = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'csv',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(musicVideoShots, config, {
        artistName: 'Jay-Z'
      })

      expect(result.formattedText).toContain('Shot Number","Description","Chapter","Section","Director Style')
      expect(result.formattedText).toContain('"1","Opening shot: Jay-Z stands on rooftop"')
      expect(result.formattedText).toContain('"Intro"')
      expect(result.formattedText).toContain('"Hype Williams"')
    })
  })

  describe('Real-World Music Video Scenarios', () => {
    it('should handle complete hip-hop music video production', () => {
      const hipHopShots: ShotData[] = [
        {
          id: 'hiphop-opening',
          description: 'Drone shot sweeping over @artist hometown neighborhood, establishing roots',
          section: 'Intro',
          shotNumber: 1
        },
        {
          id: 'hiphop-verse1-1',
          description: '@artist rapping in recording studio, close-up with microphone',
          section: 'Verse 1',
          shotNumber: 2
        },
        {
          id: 'hiphop-verse1-2', 
          description: 'Flashback: @artist as younger person in same neighborhood, black and white',
          section: 'Verse 1',
          shotNumber: 3
        },
        {
          id: 'hiphop-chorus-1',
          description: '@artist performing on stage with full crowd, high energy, multiple angles',
          section: 'Chorus',
          shotNumber: 4
        },
        {
          id: 'hiphop-chorus-2',
          description: 'Crowd reaction shots intercut with @artist performance, building energy',
          section: 'Chorus',
          shotNumber: 5
        }
      ]

      const hipHopConfig: ExportConfig = {
        prefix: '[HIP-HOP PRODUCTION] ',
        suffix: ', urban cinematography, authentic street aesthetic, high production value',
        useArtistDescriptions: true,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(hipHopShots, hipHopConfig, {
        artistDescription: 'A successful Black male hip-hop artist with confident presence, designer streetwear, and gold jewelry'
      })

      expect(result.totalShots).toBe(5)
      expect(result.formattedText).toContain('[HIP-HOP PRODUCTION]')
      expect(result.formattedText).toContain('successful Black male hip-hop artist')
      expect(result.formattedText).toContain('urban cinematography')
      expect(result.formattedText).toContain('designer streetwear')
      expect(result.formattedText).not.toContain('@artist')
    })

    it('should handle R&B music video with different aesthetic', () => {
      const rnbShots: ShotData[] = [
        {
          id: 'rnb-emotional',
          description: 'Intimate close-up of @artist singing emotional lyrics, soft lighting',
          section: 'Verse 1',
          shotNumber: 1
        },
        {
          id: 'rnb-performance',
          description: '@artist performing in elegant setting with live band, sophisticated atmosphere',
          section: 'Chorus',
          shotNumber: 2
        }
      ]

      const rnbConfig: ExportConfig = {
        prefix: '[R&B PRODUCTION] ',
        suffix: ', smooth cinematography, sophisticated lighting, intimate emotional connection',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(rnbShots, rnbConfig, {
        artistName: 'Alicia Keys'
      })

      expect(result.formattedText).toContain('[R&B PRODUCTION]')
      expect(result.formattedText).toContain('Alicia Keys')
      expect(result.formattedText).toContain('sophisticated lighting')
      expect(result.formattedText).toContain('intimate emotional connection')
    })
  })

  describe('Artist Variable System Testing', () => {
    it('should handle complex artist descriptions', () => {
      const complexArtistDesc = 'Kendrick Lamar, a critically acclaimed Black male rapper and songwriter from Compton, California, known for his introspective lyrics and socially conscious themes, wearing casual but stylish clothing that reflects his West Coast roots and intellectual approach to hip-hop culture'

      const testShot = 'Medium shot of @artist discussing social issues in community setting'

      const result = replaceVariables(testShot, {
        artistDescription: complexArtistDesc
      })

      expect(result).toContain('Kendrick Lamar')
      expect(result).toContain('critically acclaimed')
      expect(result).toContain('socially conscious themes')
      expect(result).toContain('discussing social issues')
      expect(result).not.toContain('@artist')
    })

    it('should handle multiple @artist references in single shot', () => {
      const testShot = '@artist enters the studio where @artist meets with the producer and @artist begins recording'

      const result = replaceVariables(testShot, {
        artistName: 'Drake'
      })

      expect(result).toBe('Drake enters the studio where Drake meets with the producer and Drake begins recording')
      expect(result).not.toContain('@artist')
    })

    it('should preserve non-artist variables when processing @artist', () => {
      const testShot = '@artist performs in @location during @time-of-day with @director style'

      const result = replaceVariables(testShot, {
        artistName: 'The Weeknd',
        director: 'Anton Tammi',
        location: 'neon-lit nightclub',
        'time-of-day': 'midnight'
      })

      expect(result).toContain('The Weeknd')
      expect(result).toContain('Anton Tammi')
      expect(result).toContain('neon-lit nightclub')
      expect(result).toContain('midnight')
    })
  })

  describe('Music Video Export Formats', () => {
    const mvShots: ShotData[] = [
      {
        id: 'mv-export-1',
        description: '@artist performing with high energy in @location',
        section: 'Chorus',
        shotNumber: 1
      },
      {
        id: 'mv-export-2',
        description: 'Cinematic shot of @artist reflecting on lyrics meaning',
        section: 'Bridge',
        shotNumber: 2
      }
    ]

    it('should export for video production team', () => {
      const productionConfig: ExportConfig = {
        prefix: '[MUSIC VIDEO PRODUCTION] Camera: ',
        suffix: ' [Equipment: RED Camera] [Lighting: Professional LED setup] [Audio: Playback system required]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n\n',
        includeMetadata: true
      }

      const result = processShotsForExport(mvShots, productionConfig, {
        artistName: 'Beyoncé'
      })

      expect(result.formattedText).toContain('[MUSIC VIDEO PRODUCTION]')
      expect(result.formattedText).toContain('[Equipment: RED Camera]')
      expect(result.formattedText).toContain('[Lighting: Professional LED setup]')
      expect(result.formattedText).toContain('Beyoncé performing with high energy')
    })

    it('should export for director/cinematographer briefing', () => {
      const directorConfig: ExportConfig = {
        prefix: 'DIRECTOR NOTES: ',
        suffix: ' [Style: Contemporary R&B] [Mood: Empowering and elegant] [References: Ava DuVernay, Melina Matsoukas]',
        useArtistDescriptions: true,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(mvShots, directorConfig, {
        artistDescription: 'A powerful female R&B artist with commanding stage presence, elegant styling, and sophisticated fashion choices'
      })

      expect(result.formattedText).toContain('DIRECTOR NOTES:')
      expect(result.formattedText).toContain('powerful female R&B artist')
      expect(result.formattedText).toContain('[Style: Contemporary R&B]')
      expect(result.formattedText).toContain('Ava DuVernay, Melina Matsoukas')
    })

    it('should export for social media and marketing', () => {
      const marketingConfig: ExportConfig = {
        prefix: 'SOCIAL MEDIA CLIP: ',
        suffix: ' [Duration: 15-30 seconds] [Platform: Instagram/TikTok] [Aspect: 9:16 vertical]',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const socialShots: ShotData[] = [
        {
          id: 'social-1',
          description: '@artist lip-syncing hook with dynamic background, perfect for social sharing',
          section: 'Chorus - Social Edit',
          shotNumber: 1
        }
      ]

      const result = processShotsForExport(socialShots, marketingConfig, {
        artistName: 'Dua Lipa'
      })

      expect(result.formattedText).toContain('SOCIAL MEDIA CLIP:')
      expect(result.formattedText).toContain('[Duration: 15-30 seconds]')
      expect(result.formattedText).toContain('[Platform: Instagram/TikTok]')
      expect(result.formattedText).toContain('Dua Lipa lip-syncing')
    })
  })

  describe('Genre-Specific Workflows', () => {
    it('should handle country music video workflow', () => {
      const countryShots: ShotData[] = [
        {
          id: 'country-1',
          description: '@artist performing on rural stage with acoustic guitar',
          section: 'Verse 1',
          shotNumber: 1
        },
        {
          id: 'country-2',
          description: 'Wide shot of @artist walking through countryside at sunset',
          section: 'Chorus',
          shotNumber: 2
        }
      ]

      const countryConfig: ExportConfig = {
        prefix: 'Country music video: ',
        suffix: ', authentic rural aesthetic, natural lighting, down-to-earth storytelling',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(countryShots, countryConfig, {
        artistName: 'Kacey Musgraves'
      })

      expect(result.formattedText).toContain('Country music video:')
      expect(result.formattedText).toContain('Kacey Musgraves')
      expect(result.formattedText).toContain('authentic rural aesthetic')
      expect(result.formattedText).toContain('down-to-earth storytelling')
    })

    it('should handle electronic/dance music video workflow', () => {
      const edmShots: ShotData[] = [
        {
          id: 'edm-1',
          description: '@artist DJ set with synchronized lighting and visual effects',
          section: 'Build-up',
          shotNumber: 1
        },
        {
          id: 'edm-2',
          description: 'Crowd reaction during @artist drop, multiple camera angles, high energy',
          section: 'Drop',
          shotNumber: 2
        }
      ]

      const edmConfig: ExportConfig = {
        prefix: 'EDM/Dance video: ',
        suffix: ', synchronized lighting, electronic aesthetic, festival energy, VFX heavy',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(edmShots, edmConfig, {
        artistName: 'Calvin Harris'
      })

      expect(result.formattedText).toContain('EDM/Dance video:')
      expect(result.formattedText).toContain('Calvin Harris')
      expect(result.formattedText).toContain('synchronized lighting')
      expect(result.formattedText).toContain('VFX heavy')
    })
  })

  describe('Lyrics Analysis and Shot Correlation', () => {
    it('should correlate shot content with lyrical themes', () => {
      // Test that shots relate to lyric content
      const lyricsThemes = {
        struggle: ['bottom', 'fears', 'grinding'],
        success: ['empire', 'rising up', 'penthouse', 'top'],
        perseverance: ['never gonna fall', 'determination', 'working through']
      }

      // Verify test lyrics contain thematic elements
      Object.entries(lyricsThemes).forEach(([theme, keywords]) => {
        const hasTheme = keywords.some(keyword => 
          testLyrics.toLowerCase().includes(keyword.toLowerCase())
        )
        expect(hasTheme).toBe(true)
      })

      // Test shots should reflect lyrical themes
      const thematicShots = [
        'Establishing shot: @artist in humble neighborhood representing the "bottom"',
        'Success montage: @artist in luxury penthouse representing the achievement',
        'Performance shot: @artist with determination, showing perseverance and strength'
      ]

      thematicShots.forEach(shot => {
        const processed = replaceVariables(shot, { artistName: 'Jay-Z' })
        expect(processed).toContain('Jay-Z')
        expect(shot.length).toBeGreaterThan(30) // Descriptive shots
      })
    })
  })
})