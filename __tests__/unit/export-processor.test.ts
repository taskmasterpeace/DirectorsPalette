import { describe, it, expect } from 'vitest'
import {
  createArtistTag,
  replaceVariables,
  applyPrefixSuffix,
  processShotsForExport,
  type ExportConfig,
  type ShotData
} from '@/lib/export-processor'

describe('Export Processor', () => {
  describe('createArtistTag', () => {
    it('should convert artist names to valid tags', () => {
      expect(createArtistTag('Jay-Z')).toBe('jay-z')
      expect(createArtistTag('Lil Wayne')).toBe('lil_wayne')
      expect(createArtistTag('21 Savage')).toBe('21_savage')
      expect(createArtistTag('A$AP Rocky')).toBe('asap_rocky')
      expect(createArtistTag('The Notorious B.I.G.')).toBe('the_notorious_big')
    })

    it('should handle special cases', () => {
      expect(createArtistTag('')).toBe('artist')
      expect(createArtistTag('   ')).toBe('artist')
      expect(createArtistTag('Drake')).toBe('drake')
      expect(createArtistTag('Multiple  Spaces')).toBe('multiple_spaces')
    })

    it('should remove special characters', () => {
      expect(createArtistTag('Artist@#$%^&*()')).toBe('artist')
      expect(createArtistTag('Name-With-Dashes')).toBe('name-with-dashes')
      expect(createArtistTag('Name_With_Underscores')).toBe('name_with_underscores')
    })
  })

  describe('replaceVariables', () => {
    const testVariables = {
      artistName: 'Jay-Z',
      artistDescription: 'A confident Black male rapper with gold chains',
      artistTag: 'jay-z',
      director: 'Christopher Nolan',
      chapter: 'Chapter 1: The Beginning',
      section: 'Verse 1'
    }

    it('should replace @artist with artist name', () => {
      const input = 'Wide shot of @artist walking down the street'
      const expected = 'Wide shot of Jay-Z walking down the street'
      expect(replaceVariables(input, testVariables)).toBe(expected)
    })

    it('should replace multiple variables in one shot', () => {
      const input = '@artist talks to @director in @chapter about the scene'
      const expected = 'Jay-Z talks to Christopher Nolan in Chapter 1: The Beginning about the scene'
      expect(replaceVariables(input, testVariables)).toBe(expected)
    })

    it('should handle case-insensitive variables', () => {
      const input = 'Shot of @ARTIST and @Artist and @artist'
      const expected = 'Shot of Jay-Z and Jay-Z and Jay-Z'
      expect(replaceVariables(input, testVariables)).toBe(expected)
    })

    it('should handle missing variables gracefully', () => {
      const input = 'Shot of @nonexistent variable'
      expect(replaceVariables(input, testVariables)).toBe(input)
    })

    it('should replace @artist-desc with full description', () => {
      const input = 'Wide shot of @artist-desc performing on stage'
      const expected = 'Wide shot of A confident Black male rapper with gold chains performing on stage'
      expect(replaceVariables(input, testVariables)).toBe(expected)
    })
  })

  describe('applyPrefixSuffix', () => {
    it('should add prefix and suffix correctly', () => {
      const description = 'Wide shot of Jay-Z walking'
      const prefix = 'Camera: Wide shot,'
      const suffix = ', golden hour lighting'
      const expected = 'Camera: Wide shot, Wide shot of Jay-Z walking, golden hour lighting'
      expect(applyPrefixSuffix(description, prefix, suffix)).toBe(expected)
    })

    it('should handle empty prefix and suffix', () => {
      const description = 'Test shot'
      expect(applyPrefixSuffix(description, '', '')).toBe('Test shot')
    })

    it('should handle prefix only', () => {
      const description = 'Test shot'
      const prefix = 'Camera:'
      expect(applyPrefixSuffix(description, prefix, '')).toBe('Camera: Test shot')
    })

    it('should handle suffix only', () => {
      const description = 'Test shot'
      const suffix = ', 4K quality'
      expect(applyPrefixSuffix(description, '', suffix)).toBe('Test shot, 4K quality')
    })

    it('should handle spacing correctly', () => {
      const description = 'Test shot'
      const prefix = 'Camera: ' // Already has space
      const suffix = ' , lighting' // Already has space
      expect(applyPrefixSuffix(description, prefix, suffix)).toBe('Camera: Test shot , lighting')
    })
  })

  describe('processShotsForExport', () => {
    const testShots: ShotData[] = [
      {
        id: 'shot-1',
        description: 'Wide shot of @artist in the studio',
        chapter: 'Chapter 1',
        shotNumber: 1,
        metadata: { directorStyle: 'Christopher Nolan', sourceType: 'story' }
      },
      {
        id: 'shot-2', 
        description: 'Close-up of @artist recording vocals',
        chapter: 'Chapter 1',
        shotNumber: 2,
        metadata: { directorStyle: 'Christopher Nolan', sourceType: 'story' }
      }
    ]

    const testConfig: ExportConfig = {
      prefix: 'Camera:',
      suffix: ', 4K quality',
      useArtistDescriptions: false,
      format: 'text',
      separator: '\n',
      includeMetadata: false
    }

    const testVariables = {
      artistName: 'Drake',
      director: 'Christopher Nolan'
    }

    it('should process shots with text format', () => {
      const result = processShotsForExport(testShots, testConfig, testVariables)
      
      expect(result.totalShots).toBe(2)
      expect(result.formattedText).toContain('Camera: Wide shot of Drake in the studio, 4K quality')
      expect(result.formattedText).toContain('Camera: Close-up of Drake recording vocals, 4K quality')
    })

    it('should process shots with numbered format', () => {
      const numberedConfig = { ...testConfig, format: 'numbered' as const }
      const result = processShotsForExport(testShots, numberedConfig, testVariables)
      
      expect(result.formattedText).toContain('1. Camera: Wide shot of Drake in the studio, 4K quality')
      expect(result.formattedText).toContain('2. Camera: Close-up of Drake recording vocals, 4K quality')
    })

    it('should process shots with JSON format', () => {
      const jsonConfig = { ...testConfig, format: 'json' as const, includeMetadata: true }
      const result = processShotsForExport(testShots, jsonConfig, testVariables)
      
      const parsed = JSON.parse(result.formattedText)
      expect(parsed.shots).toHaveLength(2)
      expect(parsed.totalShots).toBe(2)
      expect(parsed.shots[0].description).toContain('Camera: Wide shot of Drake in the studio, 4K quality')
    })

    it('should process shots with CSV format', () => {
      const csvConfig = { ...testConfig, format: 'csv' as const }
      const result = processShotsForExport(testShots, csvConfig, testVariables)
      
      expect(result.formattedText).toContain('Shot Number","Description","Chapter')
      expect(result.formattedText).toContain('1","Camera: Wide shot of Drake in the studio, 4K quality"')
    })

    it('should handle artist descriptions when enabled', () => {
      const descConfig = { ...testConfig, useArtistDescriptions: true }
      const variables = {
        ...testVariables,
        artistDescription: 'A Canadian rapper with short hair and casual style'
      }
      
      const result = processShotsForExport(testShots, descConfig, variables)
      expect(result.formattedText).toContain('A Canadian rapper with short hair and casual style')
      expect(result.formattedText).not.toContain('Drake')
    })

    it('should measure processing time', () => {
      const result = processShotsForExport(testShots, testConfig, testVariables)
      expect(result.processingTime).toBeGreaterThan(0)
      expect(typeof result.processingTime).toBe('number')
    })

    it('should handle empty shots array', () => {
      const result = processShotsForExport([], testConfig, testVariables)
      expect(result.totalShots).toBe(0)
      expect(result.formattedText).toBe('')
    })

    it('should preserve chapter and section information', () => {
      const musicVideoShots: ShotData[] = [
        {
          id: 'mv-shot-1',
          description: 'Performance shot of @artist on stage',
          section: 'Verse 1',
          shotNumber: 1
        }
      ]

      const result = processShotsForExport(musicVideoShots, testConfig, testVariables)
      expect(result.formattedText).toContain('Performance shot of Drake on stage')
    })
  })

  describe('Edge Cases', () => {
    it('should handle shots with no variables', () => {
      const shots: ShotData[] = [
        {
          id: 'shot-1',
          description: 'Establishing shot of city skyline',
          shotNumber: 1
        }
      ]

      const config: ExportConfig = {
        prefix: 'Scene:',
        suffix: ', wide angle',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(shots, config, {})
      expect(result.formattedText).toBe('Scene: Establishing shot of city skyline, wide angle')
    })

    it('should handle complex variable combinations', () => {
      const shots: ShotData[] = [
        {
          id: 'complex-shot',
          description: '@artist meets @director in @chapter to discuss @section',
          chapter: 'Opening Scene',
          section: 'Intro',
          shotNumber: 1
        }
      ]

      const variables = {
        artistName: 'Kendrick Lamar',
        director: 'Spike Jonze'
      }

      const result = processShotsForExport(shots, {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }, variables)

      expect(result.formattedText).toBe('Kendrick Lamar meets Spike Jonze in Opening Scene to discuss Intro')
    })
  })
})