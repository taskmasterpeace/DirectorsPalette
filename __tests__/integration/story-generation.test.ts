import { describe, it, expect, beforeEach } from 'vitest'
import { 
  extractStoryReferences, 
  generateStoryBreakdownWithReferences,
  generateStoryBreakdown 
} from '@/app/actions'

describe('Story Generation', () => {
  const mockStory = `
    John walked into the abandoned warehouse, his flashlight cutting through the darkness.
    The old machinery cast long shadows on the walls. He pulled out the ancient map
    from his leather satchel and studied it carefully.
  `

  describe('Reference Extraction', () => {
    it('should extract characters, locations, and props from story', async () => {
      const result = await extractStoryReferences(
        mockStory,
        'Christopher Nolan',
        'Focus on practical effects and IMAX cinematography'
      )

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.characters).toBeInstanceOf(Array)
      expect(result.data?.locations).toBeInstanceOf(Array)
      expect(result.data?.props).toBeInstanceOf(Array)
      
      // Should find John as a character
      const hasJohn = result.data?.characters.some(c => 
        c.name.toLowerCase().includes('john')
      )
      expect(hasJohn).toBe(true)
      
      // Should find warehouse as location
      const hasWarehouse = result.data?.locations.some(l => 
        l.name.toLowerCase().includes('warehouse')
      )
      expect(hasWarehouse).toBe(true)
    })

    it('should generate references with @ symbols', async () => {
      const result = await extractStoryReferences(mockStory, '', '')
      
      expect(result.success).toBe(true)
      result.data?.characters.forEach(char => {
        expect(char.reference).toMatch(/^@/)
      })
    })
  })

  describe('Breakdown Generation', () => {
    it('should generate story breakdown with director style', async () => {
      const result = await generateStoryBreakdown(
        mockStory,
        'Stanley Kubrick',
        {
          enabled: false,
          format: 'full',
          approaches: []
        },
        [],
        {
          includeCameraStyle: true,
          includeColorPalette: true
        }
      )

      expect(result).toBeDefined()
      expect(result.storyStructure).toBeDefined()
      expect(result.storyStructure.chapters).toBeInstanceOf(Array)
      expect(result.chapterBreakdowns).toBeInstanceOf(Array)
    })

    it('should use configured references in breakdown', async () => {
      const configuredRefs = {
        characters: [
          { reference: '@john', name: 'John', description: 'The protagonist' }
        ],
        locations: [
          { reference: '@warehouse', name: 'Warehouse', description: 'Abandoned industrial building' }
        ],
        props: [
          { reference: '@map', name: 'Ancient Map', description: 'Weathered treasure map' }
        ]
      }

      const result = await generateStoryBreakdownWithReferences(
        mockStory,
        'David Fincher',
        'Dark, precise cinematography',
        configuredRefs
      )

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      // References should be included in the breakdown
    })
  })

  describe('Title Cards', () => {
    it('should generate title cards when enabled', async () => {
      const result = await generateStoryBreakdown(
        mockStory,
        'Wes Anderson',
        {
          enabled: true,
          format: 'full',
          approaches: ['minimalist', 'typography', 'animated']
        },
        [],
        {
          includeCameraStyle: true,
          includeColorPalette: true
        }
      )

      expect(result.chapterBreakdowns).toBeDefined()
      result.chapterBreakdowns.forEach(breakdown => {
        if (breakdown.titleCards) {
          expect(breakdown.titleCards).toBeInstanceOf(Array)
          breakdown.titleCards.forEach(card => {
            expect(card).toHaveProperty('id')
            expect(card).toHaveProperty('styleLabel')
            expect(card).toHaveProperty('description')
          })
        }
      })
    })
  })

  describe('Additional Shots', () => {
    it('should generate additional shots for specific categories', async () => {
      // First generate a breakdown
      const breakdown = await generateStoryBreakdown(
        mockStory,
        'Christopher Nolan',
        { enabled: false, format: 'full', approaches: [] },
        [],
        { includeCameraStyle: true, includeColorPalette: false }
      )

      expect(breakdown.storyStructure.chapters.length).toBeGreaterThan(0)
      
      // Mock additional shots generation would go here
      // This would require the generateAdditionalChapterShots function
    })
  })
})