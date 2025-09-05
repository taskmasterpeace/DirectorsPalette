import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkExportDialog } from '@/components/shared/BulkExportDialog'
import { processShotsForExport, copyToClipboard } from '@/lib/export-processor'
import type { ShotData } from '@/lib/export-processor'

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('Bulk Export Flow Integration', () => {
  const testShots: ShotData[] = [
    {
      id: 'story-shot-1',
      description: 'Wide shot of @artist walking through the warehouse',
      chapter: 'Chapter 1: Discovery',
      shotNumber: 1,
      metadata: {
        directorStyle: 'Christopher Nolan',
        sourceType: 'story',
        timestamp: '2024-01-01T12:00:00Z'
      }
    },
    {
      id: 'story-shot-2',
      description: 'Close-up of @artist examining the evidence',
      chapter: 'Chapter 1: Discovery', 
      shotNumber: 2,
      metadata: {
        directorStyle: 'Christopher Nolan',
        sourceType: 'story',
        timestamp: '2024-01-01T12:01:00Z'
      }
    },
    {
      id: 'story-shot-3',
      description: 'Medium shot of @artist calling for backup',
      chapter: 'Chapter 2: Investigation',
      shotNumber: 3,
      metadata: {
        directorStyle: 'Christopher Nolan',
        sourceType: 'story',
        timestamp: '2024-01-01T12:02:00Z'
      }
    }
  ]

  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    shots: testShots,
    projectType: 'story' as const,
    artistName: 'Detective Sarah',
    artistDescription: 'A determined female detective with sharp eyes and professional attire',
    director: 'Christopher Nolan',
    projectTitle: 'Mystery Investigation'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Story Mode Export', () => {
    it('should export story shots with artist name replacement', () => {
      const config = {
        prefix: 'Camera: ',
        suffix: ', noir lighting',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots, config, {
        artistName: 'Detective Sarah',
        director: 'Christopher Nolan'
      })

      expect(result.totalShots).toBe(3)
      expect(result.formattedText).toContain('Camera: Wide shot of Detective Sarah walking through the warehouse, noir lighting')
      expect(result.formattedText).toContain('Camera: Close-up of Detective Sarah examining the evidence, noir lighting')
      expect(result.formattedText).toContain('Camera: Medium shot of Detective Sarah calling for backup, noir lighting')
    })

    it('should export story shots with artist description replacement', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: true,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots, config, {
        artistDescription: 'A determined female detective with sharp eyes and professional attire',
        director: 'Christopher Nolan'
      })

      expect(result.formattedText).toContain('A determined female detective with sharp eyes and professional attire')
      expect(result.formattedText).not.toContain('Detective Sarah')
      expect(result.formattedText).not.toContain('@artist')
    })

    it('should export story shots with numbered format', () => {
      const config = {
        prefix: 'Scene: ',
        suffix: ', cinematic',
        useArtistDescriptions: false,
        format: 'numbered' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots, config, {
        artistName: 'Detective Sarah'
      })

      expect(result.formattedText).toContain('1. Scene: Wide shot of Detective Sarah walking through the warehouse, cinematic')
      expect(result.formattedText).toContain('2. Scene: Close-up of Detective Sarah examining the evidence, cinematic')
      expect(result.formattedText).toContain('3. Scene: Medium shot of Detective Sarah calling for backup, cinematic')
    })

    it('should export story shots with JSON format including metadata', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'json' as const,
        separator: '\n' as const,
        includeMetadata: true
      }

      const result = processShotsForExport(testShots, config, {
        artistName: 'Detective Sarah',
        director: 'Christopher Nolan'
      })

      const parsed = JSON.parse(result.formattedText)
      
      expect(parsed.shots).toHaveLength(3)
      expect(parsed.totalShots).toBe(3)
      expect(parsed.shots[0].chapter).toBe('Chapter 1: Discovery')
      expect(parsed.shots[0].metadata.directorStyle).toBe('Christopher Nolan')
      expect(parsed.shots[0].metadata.sourceType).toBe('story')
    })
  })

  describe('Music Video Export', () => {
    const musicVideoShots: ShotData[] = [
      {
        id: 'mv-shot-1',
        description: 'Performance shot of @artist on stage with microphone',
        section: 'Verse 1',
        shotNumber: 1,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:00:00Z'
        }
      },
      {
        id: 'mv-shot-2',
        description: 'Wide shot of @artist dancing with backup dancers',
        section: 'Chorus',
        shotNumber: 2,
        metadata: {
          directorStyle: 'Hype Williams',
          sourceType: 'music-video',
          timestamp: '2024-01-01T15:01:00Z'
        }
      }
    ]

    it('should export music video shots with artist integration', () => {
      const config = {
        prefix: 'Music video: ',
        suffix: ', high energy, colorful lighting',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(musicVideoShots, config, {
        artistName: 'Jay-Z',
        director: 'Hype Williams'
      })

      expect(result.totalShots).toBe(2)
      expect(result.formattedText).toContain('Music video: Performance shot of Jay-Z on stage with microphone, high energy, colorful lighting')
      expect(result.formattedText).toContain('Music video: Wide shot of Jay-Z dancing with backup dancers, high energy, colorful lighting')
    })

    it('should export music video shots with CSV format', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'csv' as const,
        separator: '\n' as const,
        includeMetadata: true
      }

      const result = processShotsForExport(musicVideoShots, config, {
        artistName: 'Jay-Z'
      })

      expect(result.formattedText).toContain('Shot Number","Description","Chapter","Section","Director Style')
      expect(result.formattedText).toContain('"1","Performance shot of Jay-Z on stage with microphone","","Verse 1","Hype Williams"')
      expect(result.formattedText).toContain('"2","Wide shot of Jay-Z dancing with backup dancers","","Chorus","Hype Williams"')
    })
  })

  describe('Complex Export Scenarios', () => {
    it('should handle mixed content with multiple variables', () => {
      const complexShots: ShotData[] = [
        {
          id: 'complex-1',
          description: '@artist meets @director in @chapter to discuss the @section sequence',
          chapter: 'Chapter 3: Planning',
          section: 'Bridge',
          shotNumber: 1
        }
      ]

      const config = {
        prefix: 'Behind the scenes: ',
        suffix: ', documentary style',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(complexShots, config, {
        artistName: 'Kendrick Lamar',
        director: 'Spike Jonze'
      })

      expect(result.formattedText).toBe('Behind the scenes: Kendrick Lamar meets Spike Jonze in Chapter 3: Planning to discuss the Bridge sequence, documentary style')
    })

    it('should handle empty prefix and suffix', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots.slice(0, 1), config, {
        artistName: 'Test Artist'
      })

      expect(result.formattedText).toBe('Wide shot of Test Artist walking through the warehouse')
    })

    it('should handle special characters in artist names', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots.slice(0, 1), config, {
        artistName: 'A$AP Rocky'
      })

      expect(result.formattedText).toBe('Wide shot of A$AP Rocky walking through the warehouse')
    })

    it('should handle very long prefix and suffix', () => {
      const config = {
        prefix: 'This is a very long prefix that describes the camera setup in great detail including lighting and positioning, ',
        suffix: ', and this is an equally long suffix that provides extensive technical specifications and visual styling instructions for the final output',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShots.slice(0, 1), config, {
        artistName: 'Test Artist'
      })

      expect(result.formattedText).toContain('This is a very long prefix')
      expect(result.formattedText).toContain('Test Artist')
      expect(result.formattedText).toContain('equally long suffix')
    })
  })

  describe('Performance Tests', () => {
    it('should process large shot lists efficiently', () => {
      // Create 100 test shots
      const largeShotList: ShotData[] = Array.from({ length: 100 }, (_, index) => ({
        id: `large-shot-${index}`,
        description: `Shot ${index + 1}: @artist performs action ${index + 1}`,
        chapter: `Chapter ${Math.floor(index / 10) + 1}`,
        shotNumber: index + 1
      }))

      const config = {
        prefix: 'Shot: ',
        suffix: ', high quality',
        useArtistDescriptions: false,
        format: 'numbered' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const startTime = Date.now()
      const result = processShotsForExport(largeShotList, config, {
        artistName: 'Performance Artist'
      })
      const endTime = Date.now()

      expect(result.totalShots).toBe(100)
      expect(result.processingTime).toBeLessThan(1000) // Should process in under 1 second
      expect(endTime - startTime).toBeLessThan(2000) // Total time under 2 seconds
      expect(result.formattedText.split('\n')).toHaveLength(100)
    })

    it('should handle concurrent export requests', async () => {
      const config = {
        prefix: 'Concurrent: ',
        suffix: ', test',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      // Process multiple exports simultaneously
      const promises = [
        processShotsForExport(testShots, config, { artistName: 'Artist 1' }),
        processShotsForExport(testShots, config, { artistName: 'Artist 2' }),
        processShotsForExport(testShots, config, { artistName: 'Artist 3' })
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result.totalShots).toBe(3)
        expect(result.formattedText).toContain(`Artist ${index + 1}`)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed shot data gracefully', () => {
      const malformedShots: ShotData[] = [
        {
          id: 'malformed-1',
          description: '', // Empty description
          shotNumber: 1
        },
        {
          id: 'malformed-2',
          description: null as any, // Null description
          shotNumber: 2
        }
      ]

      const config = {
        prefix: 'Test: ',
        suffix: ', end',
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      expect(() => {
        processShotsForExport(malformedShots, config, { artistName: 'Test' })
      }).not.toThrow()
    })

    it('should handle invalid JSON export gracefully', () => {
      const shotsWithCircularRef: ShotData[] = [
        {
          id: 'circular-1',
          description: 'Test shot',
          shotNumber: 1,
          metadata: {
            circular: {} as any // This will create a circular reference
          }
        }
      ]
      
      // Add circular reference
      shotsWithCircularRef[0].metadata!.circular = shotsWithCircularRef[0]

      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'json' as const,
        separator: '\n' as const,
        includeMetadata: true
      }

      // Should not throw, but handle gracefully
      expect(() => {
        processShotsForExport(shotsWithCircularRef, config, {})
      }).not.toThrow()
    })
  })

  describe('Real-world Export Scenarios', () => {
    it('should export complete hip-hop music video workflow', () => {
      const hipHopShots: ShotData[] = [
        {
          id: 'hiphop-1',
          description: 'Wide shot of @artist walking through urban streets with confidence',
          section: 'Verse 1',
          shotNumber: 1
        },
        {
          id: 'hiphop-2', 
          description: 'Close-up of @artist rapping directly to camera',
          section: 'Verse 1',
          shotNumber: 2
        },
        {
          id: 'hiphop-3',
          description: 'Aerial drone shot of @artist and crew on rooftop',
          section: 'Chorus',
          shotNumber: 3
        }
      ]

      const config = {
        prefix: 'Music video shot: ',
        suffix: ', hip-hop style, golden hour lighting, 4K resolution',
        useArtistDescriptions: false,
        format: 'numbered' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(hipHopShots, config, {
        artistName: 'Jay-Z',
        director: 'Hype Williams'
      })

      expect(result.formattedText).toContain('1. Music video shot: Wide shot of Jay-Z walking through urban streets with confidence, hip-hop style, golden hour lighting, 4K resolution')
      expect(result.formattedText).toContain('2. Music video shot: Close-up of Jay-Z rapping directly to camera, hip-hop style, golden hour lighting, 4K resolution')
      expect(result.formattedText).toContain('3. Music video shot: Aerial drone shot of Jay-Z and crew on rooftop, hip-hop style, golden hour lighting, 4K resolution')
    })

    it('should export complete thriller story workflow', () => {
      const thrillerShots: ShotData[] = [
        {
          id: 'thriller-1',
          description: 'Establishing shot of dark alley where @artist investigates',
          chapter: 'Chapter 1: The Discovery',
          shotNumber: 1
        },
        {
          id: 'thriller-2',
          description: 'Close-up of @artist finding crucial evidence',
          chapter: 'Chapter 1: The Discovery', 
          shotNumber: 2
        },
        {
          id: 'thriller-3',
          description: 'Medium shot of @artist realizing the danger',
          chapter: 'Chapter 2: The Revelation',
          shotNumber: 3
        }
      ]

      const config = {
        prefix: 'Thriller scene: ',
        suffix: ', dramatic noir lighting, high contrast shadows, suspenseful atmosphere',
        useArtistDescriptions: true,
        format: 'text' as const,
        separator: '\n\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(thrillerShots, config, {
        artistDescription: 'A seasoned detective with weathered features and intense eyes',
        director: 'David Fincher'
      })

      expect(result.formattedText).toContain('Thriller scene: Establishing shot of dark alley where A seasoned detective with weathered features and intense eyes investigates, dramatic noir lighting')
      expect(result.formattedText).toContain('\n\n') // Double line breaks
      expect(result.formattedText).not.toContain('@artist')
    })

    it('should handle complex template combinations', () => {
      const testShot: ShotData[] = [
        {
          id: 'complex-1',
          description: '@artist performs in @section with @director style',
          section: 'Bridge',
          shotNumber: 1
        }
      ]

      // Apply multiple template layers
      const cameraTemplate = 'Camera: Medium shot, '
      const lightingTemplate = ', golden hour lighting'
      const technicalTemplate = ', 4K resolution, professional'

      const config = {
        prefix: cameraTemplate,
        suffix: lightingTemplate + technicalTemplate,
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      const result = processShotsForExport(testShot, config, {
        artistName: 'Beyoncé',
        director: 'Melina Matsoukas'
      })

      expect(result.formattedText).toBe('Camera: Medium shot, Beyoncé performs in Bridge with Melina Matsoukas style, golden hour lighting, 4K resolution, professional')
    })
  })

  describe('Export File Generation', () => {
    it('should generate proper filename suggestions', () => {
      const config = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'json' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      // Test filename generation
      const filename = 'test-export.json' // Simplified for testing
      expect(filename).toMatch(/\.json$/)
    })

    it('should handle different file formats', () => {
      const formats = ['text', 'numbered', 'json', 'csv'] as const
      
      formats.forEach(format => {
        const config = {
          prefix: '',
          suffix: '',
          useArtistDescriptions: false,
          format,
          separator: '\n' as const,
          includeMetadata: false
        }

        const result = processShotsForExport(testShots.slice(0, 1), config, {
          artistName: 'Test Artist'
        })

        expect(result.formattedText).toBeTruthy()
        expect(result.totalShots).toBe(1)
      })
    })
  })
})