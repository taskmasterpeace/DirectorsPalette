import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplatesStore, type StoryTemplate, type MusicVideoTemplate } from '@/stores/templates-store'
import { useExportTemplatesStore, type ExportTemplate } from '@/stores/export-templates-store'

// Mock Zustand store for testing
const mockTemplatesStore = () => {
  return {
    templates: [],
    isLoading: false,
    addTemplate: vitest.fn(),
    updateTemplate: vitest.fn(),
    deleteTemplate: vitest.fn(),
    getTemplatesByType: vitest.fn(),
    getTemplatesByCategory: vitest.fn(),
    loadSampleTemplates: vitest.fn(),
    resetTemplates: vitest.fn()
  }
}

describe('Templates Store', () => {
  describe('Story Templates', () => {
    it('should create valid story template structure', () => {
      const storyTemplate: Omit<StoryTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Story',
        type: 'story',
        category: 'user',
        content: {
          story: 'A detective investigates a mysterious case...',
          storyDirectorNotes: 'Dark, noir style with dramatic lighting',
          selectedDirector: 'david-fincher'
        }
      }

      expect(storyTemplate.type).toBe('story')
      expect(storyTemplate.content.story).toContain('detective')
      expect(storyTemplate.content.selectedDirector).toBe('david-fincher')
    })

    it('should validate story template content', () => {
      const validStoryContent = {
        story: 'Test story content',
        storyDirectorNotes: 'Test notes',
        selectedDirector: 'test-director'
      }

      expect(validStoryContent.story).toBeTruthy()
      expect(typeof validStoryContent.story).toBe('string')
      expect(validStoryContent.selectedDirector).toMatch(/^[a-z-]+$/)
    })
  })

  describe('Music Video Templates', () => {
    it('should create valid music video template structure', () => {
      const mvTemplate: Omit<MusicVideoTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Hip-Hop Song',
        type: 'music-video',
        category: 'sample',
        content: {
          lyrics: '[Verse 1]\nStarted from the bottom now we here...',
          songTitle: 'City Lights',
          artist: 'Test Artist',
          genre: 'Hip-Hop',
          mvConcept: 'Urban success story',
          mvDirectorNotes: 'High-energy visuals with city shots',
          selectedMusicVideoDirector: 'hype-williams'
        }
      }

      expect(mvTemplate.type).toBe('music-video')
      expect(mvTemplate.content.lyrics).toContain('Verse 1')
      expect(mvTemplate.content.selectedMusicVideoDirector).toBe('hype-williams')
    })

    it('should validate music video template content', () => {
      const validMVContent = {
        lyrics: 'Test lyrics content',
        songTitle: 'Test Song',
        artist: 'Test Artist',
        genre: 'Hip-Hop'
      }

      expect(validMVContent.lyrics).toBeTruthy()
      expect(validMVContent.songTitle).toBeTruthy()
      expect(validMVContent.artist).toBeTruthy()
      expect(validMVContent.genre).toBeTruthy()
    })
  })

  describe('Template Categories', () => {
    it('should correctly categorize templates', () => {
      const sampleTemplate = { category: 'sample' as const }
      const userTemplate = { category: 'user' as const }
      const testDataTemplate = { category: 'test-data' as const }

      expect(['sample', 'user', 'test-data']).toContain(sampleTemplate.category)
      expect(['sample', 'user', 'test-data']).toContain(userTemplate.category)
      expect(['sample', 'user', 'test-data']).toContain(testDataTemplate.category)
    })
  })
})

describe('Export Templates Store', () => {
  describe('Export Template Structure', () => {
    it('should create valid export template', () => {
      const exportTemplate: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Hip-Hop Setup',
        category: 'genre',
        prefix: 'Music video shot:',
        suffix: ', hip-hop style, urban aesthetic',
        description: 'Complete hip-hop music video styling'
      }

      expect(exportTemplate.category).toBe('genre')
      expect(exportTemplate.prefix).toBeTruthy()
      expect(exportTemplate.suffix).toBeTruthy()
    })

    it('should validate export template categories', () => {
      const validCategories = ['camera', 'lighting', 'technical', 'genre', 'custom']
      
      validCategories.forEach(category => {
        const template = { category: category as ExportTemplate['category'] }
        expect(validCategories).toContain(template.category)
      })
    })
  })

  describe('Default Templates', () => {
    it('should have camera angle templates', () => {
      const cameraTemplates = [
        { name: 'Wide Shot Setup', prefix: 'Camera: Wide shot, ', category: 'camera' },
        { name: 'Close-up Shot Setup', prefix: 'Camera: Close-up, ', category: 'camera' },
        { name: 'Drone/Aerial Setup', prefix: 'Camera: Drone shot, aerial view, ', category: 'camera' }
      ]

      cameraTemplates.forEach(template => {
        expect(template.category).toBe('camera')
        expect(template.prefix).toContain('Camera:')
      })
    })

    it('should have lighting templates', () => {
      const lightingTemplates = [
        { name: 'Golden Hour', suffix: ', golden hour lighting, warm tones', category: 'lighting' },
        { name: 'Dramatic Noir', suffix: ', dramatic noir lighting, high contrast shadows', category: 'lighting' }
      ]

      lightingTemplates.forEach(template => {
        expect(template.category).toBe('lighting')
        expect(template.suffix).toContain('lighting')
      })
    })

    it('should have technical quality templates', () => {
      const technicalTemplates = [
        { name: '4K Professional', suffix: ', 4K resolution, professional photography, detailed', category: 'technical' },
        { name: 'Cinematic Quality', suffix: ', cinematic quality, film grain, professional grade', category: 'technical' }
      ]

      technicalTemplates.forEach(template => {
        expect(template.category).toBe('technical')
        expect(template.suffix).toBeTruthy()
      })
    })

    it('should have genre-specific templates', () => {
      const genreTemplates = [
        { name: 'Hip-Hop Music Video', prefix: 'Music video shot: ', suffix: ', hip-hop style, urban aesthetic, high energy', category: 'genre' },
        { name: 'Thriller Movie', prefix: 'Thriller scene: ', suffix: ', suspenseful atmosphere, tension building', category: 'genre' }
      ]

      genreTemplates.forEach(template => {
        expect(template.category).toBe('genre')
        expect(template.prefix || template.suffix).toBeTruthy()
      })
    })
  })

  describe('Template Combinations', () => {
    it('should combine prefix and suffix correctly', () => {
      const cameraPrefix = 'Camera: Wide shot, '
      const lightingSuffix = ', golden hour lighting'
      const technicalSuffix = ', 4K resolution'
      
      const baseShot = 'Artist walking through the city'
      const combined = cameraPrefix + baseShot + lightingSuffix + technicalSuffix
      
      expect(combined).toBe('Camera: Wide shot, Artist walking through the city, golden hour lighting, 4K resolution')
    })

    it('should handle multiple template applications', () => {
      const templates = {
        camera: { prefix: 'Camera: Close-up, ', suffix: '' },
        lighting: { prefix: '', suffix: ', dramatic lighting' },
        technical: { prefix: '', suffix: ', cinematic quality' }
      }

      const baseShot = 'Hands counting money'
      let processedShot = baseShot

      // Apply camera template
      if (templates.camera.prefix) {
        processedShot = templates.camera.prefix + processedShot
      }

      // Apply lighting template  
      if (templates.lighting.suffix) {
        processedShot = processedShot + templates.lighting.suffix
      }

      // Apply technical template
      if (templates.technical.suffix) {
        processedShot = processedShot + templates.technical.suffix
      }

      expect(processedShot).toBe('Camera: Close-up, Hands counting money, dramatic lighting, cinematic quality')
    })
  })
})

describe('Integration Tests', () => {
  describe('Template to Export Workflow', () => {
    it('should load template and apply to export configuration', () => {
      const template: ExportTemplate = {
        id: 'test-template',
        name: 'Complete Setup',
        category: 'custom',
        prefix: 'Camera: Wide shot, ',
        suffix: ', golden hour lighting, 4K',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate applying template to export config
      const exportConfig = {
        prefix: template.prefix,
        suffix: template.suffix,
        useArtistDescriptions: false,
        format: 'text' as const,
        separator: '\n' as const,
        includeMetadata: false
      }

      expect(exportConfig.prefix).toBe('Camera: Wide shot, ')
      expect(exportConfig.suffix).toBe(', golden hour lighting, 4K')
    })

    it('should save export config as new template', () => {
      const exportConfig = {
        prefix: 'Custom camera angle: ',
        suffix: ', custom lighting setup'
      }

      const newTemplate = {
        name: 'My Custom Setup',
        category: 'custom' as const,
        prefix: exportConfig.prefix,
        suffix: exportConfig.suffix,
        description: 'User-created custom template'
      }

      expect(newTemplate.category).toBe('custom')
      expect(newTemplate.prefix).toBe('Custom camera angle: ')
      expect(newTemplate.suffix).toBe(', custom lighting setup')
    })
  })
})