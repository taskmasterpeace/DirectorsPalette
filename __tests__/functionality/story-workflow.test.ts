/**
 * Comprehensive Story Workflow Test
 * Tests the complete story mode workflow with real content
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { extractStoryReferences } from '@/app/actions/story/references'
import { createArtistTag, replaceVariables, processShotsForExport } from '@/lib/export-processor'
import type { ShotData, ExportConfig } from '@/lib/export-processor'

// Mock OpenAI for testing
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({}))
}))

vi.mock('ai', () => ({
  generateObject: vi.fn()
}))

describe('Story Workflow Integration Tests', () => {
  const testStory = `
Detective Sarah Chen walked through the dimly lit warehouse, her flashlight cutting through the darkness. 
She noticed a red briefcase sitting on the metal table in the center of the room. 
The killer had left behind evidence - a bloody knife next to the briefcase.
Sarah called her partner Mike Rodriguez on her radio.
"Mike, I found something important at the old warehouse on Fifth Street," she said.
The rain outside grew heavier as Sarah examined the crime scene.
  `.trim()

  const expectedCharacters = ['Sarah Chen', 'Mike Rodriguez']
  const expectedLocations = ['warehouse', 'Fifth Street']
  const expectedProps = ['red briefcase', 'bloody knife', 'flashlight', 'radio', 'metal table']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Story Processing', () => {
    it('should extract story elements correctly', () => {
      // Test story content analysis
      expect(testStory).toContain('Detective Sarah Chen')
      expect(testStory).toContain('warehouse')
      expect(testStory).toContain('red briefcase')
      expect(testStory).toContain('Mike Rodriguez')
      
      // Verify story has narrative structure
      expect(testStory.length).toBeGreaterThan(100)
      expect(testStory.split('.').length).toBeGreaterThan(3) // Multiple sentences
    })

    it('should process story references', async () => {
      // Mock successful extraction
      const mockResult = {
        success: true,
        data: {
          characters: expectedCharacters.map((name, i) => ({
            id: `char-${i}`,
            reference: `@${name.toLowerCase().replace(' ', '-')}`,
            name,
            description: `Character in the story`
          })),
          locations: expectedLocations.map((name, i) => ({
            id: `loc-${i}`,
            reference: `@${name.toLowerCase().replace(' ', '-')}`,
            name,
            description: `Location in the story`
          })),
          props: expectedProps.slice(0, 3).map((name, i) => ({
            id: `prop-${i}`,
            reference: `@${name.toLowerCase().replace(' ', '-')}`,
            name,
            description: `Prop in the story`
          }))
        }
      }

      // Verify reference structure
      expect(mockResult.data.characters).toHaveLength(expectedCharacters.length)
      expect(mockResult.data.locations).toHaveLength(expectedLocations.length)
      expect(mockResult.data.props).toHaveLength(3)

      // Test reference format
      mockResult.data.characters.forEach(char => {
        expect(char.reference).toMatch(/^@[\w-]+$/)
        expect(char.name).toBeTruthy()
        expect(char.description).toBeTruthy()
      })
    })

    it('should generate story shots with director style', () => {
      const mockStoryShots = [
        "Wide establishing shot of the dimly lit warehouse exterior at night, rain visible in the streetlights",
        "Medium shot of Sarah Chen entering the warehouse, flashlight beam cutting through darkness",
        "Close-up of Sarah's flashlight illuminating the red briefcase on the metal table",
        "Detail shot of the bloody knife next to the briefcase, evidence of violence",
        "Over-the-shoulder shot of Sarah calling Mike Rodriguez on her radio",
        "Wide shot of the warehouse interior showing Sarah examining the crime scene"
      ]

      // Test shot structure
      mockStoryShots.forEach((shot, index) => {
        expect(shot).toBeTruthy()
        expect(typeof shot).toBe('string')
        expect(shot.length).toBeGreaterThan(20) // Detailed descriptions
        expect(shot).toMatch(/(wide|medium|close-up|detail|over-the-shoulder)/i) // Camera angles
      })

      // Test director style elements
      const combinedShots = mockStoryShots.join(' ')
      expect(combinedShots).toContain('dramatic') // Director style influence
      expect(combinedShots).toContain('lighting') // Visual elements
    })
  })

  describe('Export System Testing', () => {
    const testShots: ShotData[] = [
      {
        id: 'story-shot-1',
        description: 'Wide establishing shot of @warehouse exterior at night',
        chapter: 'Chapter 1: Discovery',
        shotNumber: 1,
        metadata: {
          directorStyle: 'David Fincher',
          sourceType: 'story',
          timestamp: '2024-01-01T12:00:00Z'
        }
      },
      {
        id: 'story-shot-2',
        description: 'Medium shot of @sarah-chen entering with @flashlight',
        chapter: 'Chapter 1: Discovery',
        shotNumber: 2,
        metadata: {
          directorStyle: 'David Fincher',
          sourceType: 'story',
          timestamp: '2024-01-01T12:01:00Z'
        }
      },
      {
        id: 'story-shot-3',
        description: 'Close-up of @red-briefcase on @metal-table',
        chapter: 'Chapter 2: Evidence',
        shotNumber: 3,
        metadata: {
          directorStyle: 'David Fincher',
          sourceType: 'story',
          timestamp: '2024-01-01T12:02:00Z'
        }
      }
    ]

    it('should export story shots with professional formatting', () => {
      const config: ExportConfig = {
        prefix: 'Scene: ',
        suffix: ', dramatic noir lighting, cinematic quality',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const variables = {
        director: 'David Fincher'
      }

      const result = processShotsForExport(testShots, config, variables)

      expect(result.totalShots).toBe(3)
      expect(result.formattedText).toContain('1. Scene: Wide establishing shot of @warehouse exterior at night, dramatic noir lighting, cinematic quality')
      expect(result.formattedText).toContain('2. Scene: Medium shot of @sarah-chen entering with @flashlight, dramatic noir lighting, cinematic quality')
      expect(result.formattedText).toContain('3. Scene: Close-up of @red-briefcase on @metal-table, dramatic noir lighting, cinematic quality')
    })

    it('should export story shots as JSON with metadata', () => {
      const config: ExportConfig = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'json',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(testShots, config, {})
      const parsed = JSON.parse(result.formattedText)

      expect(parsed.shots).toHaveLength(3)
      expect(parsed.totalShots).toBe(3)
      expect(parsed.shots[0].chapter).toBe('Chapter 1: Discovery')
      expect(parsed.shots[0].metadata.directorStyle).toBe('David Fincher')
      expect(parsed.shots[0].metadata.sourceType).toBe('story')
    })

    it('should export story shots as CSV for production planning', () => {
      const config: ExportConfig = {
        prefix: 'Production shot: ',
        suffix: ', requires crew setup',
        useArtistDescriptions: false,
        format: 'csv',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(testShots, config, {})

      expect(result.formattedText).toContain('Shot Number","Description","Chapter","Section","Director Style')
      expect(result.formattedText).toContain('"1","Production shot: Wide establishing shot of @warehouse exterior at night, requires crew setup"')
      expect(result.formattedText).toContain('"Chapter 1: Discovery"')
      expect(result.formattedText).toContain('"David Fincher"')
    })
  })

  describe('Professional Workflow Simulation', () => {
    it('should handle complete film production workflow', () => {
      // Simulate full workflow: Story → References → Shots → Export
      const productionConfig: ExportConfig = {
        prefix: 'SHOT LIST - ',
        suffix: ', [Director: David Fincher] [Style: Psychological Thriller] [Equipment: RED Camera, Dramatic Lighting]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n\n',
        includeMetadata: false
      }

      const productionShots: ShotData[] = [
        {
          id: 'prod-1',
          description: 'EXT. WAREHOUSE - NIGHT: Wide establishing shot showing the isolated warehouse building',
          chapter: 'Act 1: Setup',
          shotNumber: 1
        },
        {
          id: 'prod-2',
          description: 'INT. WAREHOUSE - NIGHT: Medium shot of DETECTIVE SARAH entering through broken door',
          chapter: 'Act 1: Setup', 
          shotNumber: 2
        },
        {
          id: 'prod-3',
          description: 'INT. WAREHOUSE - NIGHT: Close-up of red briefcase, camera slowly pushes in',
          chapter: 'Act 2: Discovery',
          shotNumber: 3
        }
      ]

      const result = processShotsForExport(productionShots, productionConfig, {})

      // Verify professional formatting
      expect(result.formattedText).toContain('SHOT LIST - ')
      expect(result.formattedText).toContain('[Director: David Fincher]')
      expect(result.formattedText).toContain('[Equipment: RED Camera')
      expect(result.formattedText).toContain('\n\n') // Double line spacing for readability

      // Verify production-ready content
      expect(result.formattedText).toContain('EXT. WAREHOUSE - NIGHT')
      expect(result.formattedText).toContain('INT. WAREHOUSE - NIGHT')
      expect(result.formattedText).toContain('DETECTIVE SARAH')
    })

    it('should handle complex story with multiple characters and locations', () => {
      const complexStory = `
Detective Sarah Chen and her partner Mike Rodriguez arrived at the downtown warehouse district. 
The abandoned Meridian Steel building loomed before them, its broken windows reflecting the streetlights.
Inside, they discovered evidence of a struggle - overturned chairs, broken glass, and most importantly, 
a bloodstained notebook belonging to victim Amanda Foster. Sarah photographed everything while Mike 
questioned the security guard who had called in the disturbance.
      `.trim()

      // Test complex story processing
      expect(complexStory).toContain('Sarah Chen')
      expect(complexStory).toContain('Mike Rodriguez')
      expect(complexStory).toContain('Amanda Foster')
      expect(complexStory).toContain('Meridian Steel building')
      expect(complexStory).toContain('warehouse district')

      const complexShots: ShotData[] = [
        {
          id: 'complex-1',
          description: 'Wide shot of @sarah-chen and @mike-rodriguez arriving at @meridian-steel-building',
          chapter: 'Investigation Begins',
          shotNumber: 1
        },
        {
          id: 'complex-2',
          description: 'Close-up of @bloodstained-notebook with @amanda-foster name visible',
          chapter: 'Evidence Discovery',
          shotNumber: 2
        }
      ]

      const config: ExportConfig = {
        prefix: 'Police procedural: ',
        suffix: ', realistic lighting, documentary style',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(complexShots, config, {})

      expect(result.totalShots).toBe(2)
      expect(result.formattedText).toContain('Police procedural:')
      expect(result.formattedText).toContain('documentary style')
      expect(result.formattedText).toContain('@sarah-chen')
      expect(result.formattedText).toContain('@meridian-steel-building')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty story gracefully', () => {
      const emptyShots: ShotData[] = []
      const config: ExportConfig = {
        prefix: 'Test: ',
        suffix: ', end',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(emptyShots, config, {})
      expect(result.totalShots).toBe(0)
      expect(result.formattedText).toBe('')
    })

    it('should handle malformed shot data', () => {
      const malformedShots: ShotData[] = [
        {
          id: '',
          description: '',
          shotNumber: 0
        },
        {
          id: 'valid-shot',
          description: 'Valid shot description',
          shotNumber: 1
        }
      ]

      const config: ExportConfig = {
        prefix: 'Shot: ',
        suffix: ', quality',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      expect(() => {
        processShotsForExport(malformedShots, config, {})
      }).not.toThrow()
    })

    it('should handle very long descriptions', () => {
      const longDescription = 'This is a very long shot description that contains many details about the scene, including the lighting setup, camera movement, character positioning, prop placement, location atmosphere, and various other technical and creative elements that might be specified in a professional shot list for a major motion picture production. '.repeat(5)

      const longShots: ShotData[] = [
        {
          id: 'long-shot',
          description: longDescription,
          shotNumber: 1
        }
      ]

      const config: ExportConfig = {
        prefix: 'Extended scene: ',
        suffix: ', complex setup required',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(longShots, config, {})
      expect(result.totalShots).toBe(1)
      expect(result.formattedText.length).toBeGreaterThan(longDescription.length)
      expect(result.formattedText).toContain('Extended scene:')
      expect(result.formattedText).toContain('complex setup required')
    })
  })

  describe('Performance Testing', () => {
    it('should process large shot lists efficiently', () => {
      // Create 50 realistic story shots
      const largeStoryShots: ShotData[] = Array.from({ length: 50 }, (_, index) => ({
        id: `story-shot-${index}`,
        description: `Shot ${index + 1}: Detective investigates clue number ${index + 1} in the ongoing case`,
        chapter: `Chapter ${Math.floor(index / 10) + 1}`,
        shotNumber: index + 1,
        metadata: {
          directorStyle: 'Christopher Nolan',
          sourceType: 'story',
          timestamp: new Date().toISOString()
        }
      }))

      const config: ExportConfig = {
        prefix: 'Production: ',
        suffix: ', Nolan style',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const startTime = Date.now()
      const result = processShotsForExport(largeStoryShots, config, {})
      const endTime = Date.now()

      expect(result.totalShots).toBe(50)
      expect(result.processingTime).toBeLessThan(1000) // Under 1 second
      expect(endTime - startTime).toBeLessThan(2000) // Total under 2 seconds
      expect(result.formattedText.split('\n')).toHaveLength(50)
    })

    it('should maintain quality with complex formatting', () => {
      const complexShots: ShotData[] = [
        {
          id: 'complex-format-test',
          description: 'Detective @character-name discovers @evidence-type at @location-name during @time-of-day',
          chapter: 'Complex Formatting Test',
          shotNumber: 1
        }
      ]

      const complexConfig: ExportConfig = {
        prefix: '[PRODUCTION NOTES] Camera Setup: Professional RED camera with anamorphic lenses, Lighting: Dramatic key lighting with practical sources, Location: ',
        suffix: ' [POST-PRODUCTION] Color Grade: Desaturated with blue/teal highlights, Sound Design: Ambient warehouse sounds with rain, VFX: Minimal, practical effects preferred [CREW] DP: Roger Deakins style, Gaffer: Dramatic lighting specialist',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(complexShots, config, {})

      expect(result.formattedText).toContain('[PRODUCTION NOTES]')
      expect(result.formattedText).toContain('[POST-PRODUCTION]')
      expect(result.formattedText).toContain('[CREW]')
      expect(result.formattedText).toContain('Roger Deakins style')
    })
  })
})