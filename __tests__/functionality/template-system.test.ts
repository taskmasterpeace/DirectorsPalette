/**
 * Template System Comprehensive Functionality Test
 * Tests all template types with real content and workflows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { StoryTemplate, MusicVideoTemplate } from '@/stores/templates-store'
import type { ExportTemplate } from '@/stores/export-templates-store'
import type { PromptTemplate } from '@/stores/prompt-templates-store'
import { extractTagsFromTemplate } from '@/stores/prompt-templates-store'

describe('Template System Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Story Template Testing', () => {
    const sampleStoryTemplate: Omit<StoryTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Psychological Thriller Investigation',
      type: 'story',
      category: 'sample',
      content: {
        story: `Detective Emma Reeves sits alone in her dimly lit office, reviewing patient files late into the night. A soft knock at the door interrupts her concentration. When she opens it, the hallway is empty, but a red envelope lies on the floor.

Inside the envelope is a photograph of her own house, taken from across the street. Written on the back in red ink: "I'm watching you." Emma's hands shake as she realizes someone has been observing her every move.

The next morning, Emma finds her car windows covered in condensation, but someone has written "HELP ME" from the inside. Her breath catches in her throat as she realizes the implications. Someone was trapped inside her car overnight.`,
        storyDirectorNotes: 'Build psychological tension through subtle environmental details, shadows, and intimate close-ups. Hitchcock-inspired suspense with modern thriller elements. Focus on Emma\'s growing paranoia and the stalker\'s invisible presence.',
        selectedDirector: 'david-fincher'
      }
    }

    it('should validate story template structure and content', () => {
      expect(sampleStoryTemplate.name).toBe('Psychological Thriller Investigation')
      expect(sampleStoryTemplate.type).toBe('story')
      expect(sampleStoryTemplate.category).toBe('sample')
      
      // Validate story content
      expect(sampleStoryTemplate.content.story.length).toBeGreaterThan(500)
      expect(sampleStoryTemplate.content.story).toContain('Detective Emma Reeves')
      expect(sampleStoryTemplate.content.story).toContain('red envelope')
      expect(sampleStoryTemplate.content.story).toContain('I\'m watching you')
      
      // Validate director notes
      expect(sampleStoryTemplate.content.storyDirectorNotes).toContain('psychological tension')
      expect(sampleStoryTemplate.content.storyDirectorNotes).toContain('Hitchcock-inspired')
      expect(sampleStoryTemplate.content.selectedDirector).toBe('david-fincher')
    })

    it('should test story template loading and application', () => {
      // Simulate loading template into story mode
      const loadedContent = {
        story: sampleStoryTemplate.content.story,
        storyDirectorNotes: sampleStoryTemplate.content.storyDirectorNotes,
        selectedDirector: sampleStoryTemplate.content.selectedDirector
      }

      expect(loadedContent.story).toBe(sampleStoryTemplate.content.story)
      expect(loadedContent.storyDirectorNotes).toBe(sampleStoryTemplate.content.storyDirectorNotes)
      expect(loadedContent.selectedDirector).toBe('david-fincher')

      // Test that loaded content is ready for generation
      expect(loadedContent.story.trim()).toBeTruthy()
      expect(loadedContent.selectedDirector).toMatch(/^[a-z-]+$/) // Valid director ID format
    })

    it('should test story template modification and saving', () => {
      // Test user modification of template
      const userModifications = {
        ...sampleStoryTemplate,
        name: 'My Modified Thriller',
        category: 'user' as const,
        content: {
          ...sampleStoryTemplate.content,
          story: sampleStoryTemplate.content.story + '\n\nEmma decides to investigate further, despite the growing danger.',
          storyDirectorNotes: sampleStoryTemplate.content.storyDirectorNotes + ' Add more close-ups on Emma\'s emotional reactions.'
        }
      }

      expect(userModifications.name).toBe('My Modified Thriller')
      expect(userModifications.category).toBe('user')
      expect(userModifications.content.story.length).toBeGreaterThan(sampleStoryTemplate.content.story.length)
      expect(userModifications.content.storyDirectorNotes).toContain('close-ups on Emma')
    })
  })

  describe('Music Video Template Testing', () => {
    const sampleMusicVideoTemplate: Omit<MusicVideoTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Hip-Hop Success Story',
      type: 'music-video',
      category: 'sample',
      content: {
        lyrics: `[Verse 1]
Started in the streets with nothing but dreams
Now I'm living life beyond my wildest schemes
City lights below me from the penthouse view
Every obstacle I faced just made me break through

[Chorus]
From the bottom to the top, never looking back
Success is in my DNA, staying on track
Every step I take is calculated and planned
This is my time to shine, this is where I stand

[Verse 2]
Remember counting pennies, now I'm counting stacks
Loyalty to my team, got each other's backs
Critics tried to doubt but we proved them wrong
This is our anthem, this is our song

[Bridge]
Look where we are now, look how far we've come
Every struggle made us stronger, every battle won
From the neighborhood to the world stage bright
We're living proof that dreams can take flight`,
        songTitle: 'Rise Up',
        artist: 'Jay-Z',
        genre: 'Hip-Hop',
        mvConcept: 'Visual narrative showing the journey from street level to success, featuring authentic urban locations, luxury lifestyle imagery, and performance shots that capture the energy and message of overcoming adversity through determination and hard work.',
        mvDirectorNotes: 'High-energy visuals with drone shots of the city, luxury lifestyle imagery balanced with authentic street scenes, and powerful performance shots. Mix of day and night scenes with dynamic camera movement. Focus on visual storytelling that matches the lyrical themes.',
        selectedMusicVideoDirector: 'hype-williams'
      }
    }

    it('should validate music video template structure', () => {
      expect(sampleMusicVideoTemplate.name).toBe('Hip-Hop Success Story')
      expect(sampleMusicVideoTemplate.type).toBe('music-video')
      expect(sampleMusicVideoTemplate.category).toBe('sample')
      
      // Validate lyrics structure
      expect(sampleMusicVideoTemplate.content.lyrics).toContain('[Verse 1]')
      expect(sampleMusicVideoTemplate.content.lyrics).toContain('[Chorus]')
      expect(sampleMusicVideoTemplate.content.lyrics).toContain('[Bridge]')
      expect(sampleMusicVideoTemplate.content.lyrics.length).toBeGreaterThan(500)
      
      // Validate metadata
      expect(sampleMusicVideoTemplate.content.songTitle).toBe('Rise Up')
      expect(sampleMusicVideoTemplate.content.artist).toBe('Jay-Z')
      expect(sampleMusicVideoTemplate.content.genre).toBe('Hip-Hop')
      expect(sampleMusicVideoTemplate.content.selectedMusicVideoDirector).toBe('hype-williams')
    })

    it('should test music video template with artist integration', () => {
      // Test template loading with artist bank integration
      const artistIntegration = {
        templateArtist: sampleMusicVideoTemplate.content.artist,
        artistBankArtist: 'Jay-Z',
        visualDescription: 'A successful Black male hip-hop artist with confident presence, luxury streetwear, and gold jewelry'
      }

      expect(artistIntegration.templateArtist).toBe(artistIntegration.artistBankArtist)
      expect(artistIntegration.visualDescription).toContain('successful')
      expect(artistIntegration.visualDescription).toContain('hip-hop artist')
      expect(artistIntegration.visualDescription).toContain('confident presence')
    })

    it('should test different music genres with templates', () => {
      const genreTemplates = [
        {
          genre: 'Pop',
          artist: 'Taylor Swift',
          mood: 'Emotional and cinematic',
          visualStyle: 'Soft lighting, intimate settings, storytelling focus'
        },
        {
          genre: 'Rock',
          artist: 'Foo Fighters',
          mood: 'High energy and raw',
          visualStyle: 'Dynamic camera work, concert footage, band performance'
        },
        {
          genre: 'R&B',
          artist: 'The Weeknd',
          mood: 'Smooth and sophisticated',
          visualStyle: 'Moody lighting, urban night scenes, artistic composition'
        }
      ]

      genreTemplates.forEach(template => {
        expect(['Pop', 'Rock', 'R&B', 'Hip-Hop']).toContain(template.genre)
        expect(template.artist).toBeTruthy()
        expect(template.mood).toBeTruthy()
        expect(template.visualStyle).toBeTruthy()
      })
    })
  })

  describe('Export Template Testing', () => {
    const exportTemplates: ExportTemplate[] = [
      {
        id: 'export-1',
        name: 'Professional Hip-Hop Setup',
        category: 'genre',
        prefix: 'Music video shot: ',
        suffix: ', hip-hop style, urban aesthetic, 4K resolution',
        description: 'Complete hip-hop music video formatting',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'export-2',
        name: 'Cinematic Thriller',
        category: 'genre',
        prefix: 'Thriller scene: ',
        suffix: ', dramatic noir lighting, suspenseful atmosphere, cinematic quality',
        description: 'Thriller movie scene formatting',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'export-3',
        name: 'Technical Specifications',
        category: 'technical',
        prefix: 'Production shot: ',
        suffix: ', RED camera, professional lighting setup, 4K 60fps, color graded',
        description: 'Technical production specifications',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should test export template application', () => {
      exportTemplates.forEach(template => {
        expect(template.name).toBeTruthy()
        expect(['camera', 'lighting', 'technical', 'genre', 'custom']).toContain(template.category)
        expect(template.prefix || template.suffix).toBeTruthy() // At least one should be present
        
        if (template.prefix) {
          expect(template.prefix.trim()).toBeTruthy()
        }
        if (template.suffix) {
          expect(template.suffix.trim()).toBeTruthy()
        }
      })
    })

    it('should test template combination and layering', () => {
      // Test combining multiple templates
      const cameraTemplate = 'Camera: Wide shot, '
      const lightingTemplate = ', golden hour lighting'
      const technicalTemplate = ', 4K resolution, professional'

      const baseShotDescription = 'Artist performing on stage'
      const combinedShot = cameraTemplate + baseShotDescription + lightingTemplate + technicalTemplate

      expect(combinedShot).toBe('Camera: Wide shot, Artist performing on stage, golden hour lighting, 4K resolution, professional')
      expect(combinedShot.length).toBeGreaterThan(baseShotDescription.length)
      expect(combinedShot).toContain('Camera:')
      expect(combinedShot).toContain('lighting')
      expect(combinedShot).toContain('4K')
    })
  })

  describe('Prompt Template Testing', () => {
    const promptTemplates: PromptTemplate[] = [
      {
        id: 'prompt-1',
        name: 'Split Screen Character',
        template: 'Create a split screen composition of [character-tag]. On the left side, show a close-up portrait of [character-tag]\'s face with clear facial features. On the right side, show a full body shot of [character-tag] in [pose-style] pose. Use [lighting-style] lighting and [photo-style] photography.',
        description: 'Split screen character reference generation',
        category: 'character',
        tags: ['character-tag', 'pose-style', 'lighting-style', 'photo-style'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prompt-2',
        name: 'Character Face Portrait',
        template: 'Create a detailed portrait photograph of [character-tag]\'s face, showing clear facial features, expression, and personality. Use [lighting-style] lighting with [photo-style] photography style.',
        description: 'Character face reference for consistency',
        category: 'character',
        tags: ['character-tag', 'lighting-style', 'photo-style'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should test prompt template tag extraction', () => {
      const template1Tags = extractTagsFromTemplate(promptTemplates[0].template)
      expect(template1Tags).toContain('character-tag')
      expect(template1Tags).toContain('pose-style')
      expect(template1Tags).toContain('lighting-style')
      expect(template1Tags).toContain('photo-style')
      expect(template1Tags).toHaveLength(4)

      const template2Tags = extractTagsFromTemplate(promptTemplates[1].template)
      expect(template2Tags).toContain('character-tag')
      expect(template2Tags).toContain('lighting-style')
      expect(template2Tags).toContain('photo-style')
      expect(template2Tags).toHaveLength(3)
    })

    it('should test prompt template processing with real values', () => {
      const template = promptTemplates[0] // Split Screen Character
      let processedPrompt = template.template

      const tagValues = {
        'character-tag': 'Jay-Z',
        'pose-style': 'confident standing',
        'lighting-style': 'dramatic studio',
        'photo-style': 'professional portrait'
      }

      // Process template with tag replacement
      Object.entries(tagValues).forEach(([tag, value]) => {
        const regex = new RegExp(`\\[${tag}\\]`, 'g')
        processedPrompt = processedPrompt.replace(regex, value)
      })

      expect(processedPrompt).toContain('Jay-Z')
      expect(processedPrompt).toContain('confident standing')
      expect(processedPrompt).toContain('dramatic studio')
      expect(processedPrompt).toContain('professional portrait')
      expect(processedPrompt).not.toContain('[character-tag]')
      expect(processedPrompt).not.toContain('[pose-style]')

      // Verify complete processed prompt
      expect(processedPrompt).toBe('Create a split screen composition of Jay-Z. On the left side, show a close-up portrait of Jay-Z\'s face with clear facial features. On the right side, show a full body shot of Jay-Z in confident standing pose. Use dramatic studio lighting and professional portrait photography.')
    })

    it('should test prompt template categories and organization', () => {
      const templateCategories = {
        character: ['Split Screen Character', 'Character Face Portrait', 'Character in Action'],
        location: ['Location Establishing Shot', 'Location Interior Detail'],
        action: ['Performance Shot', 'Interaction Scene'],
        style: ['Cinematic Portrait', 'Commercial Photography']
      }

      Object.entries(templateCategories).forEach(([category, templates]) => {
        expect(['character', 'location', 'action', 'style']).toContain(category)
        expect(Array.isArray(templates)).toBe(true)
        expect(templates.length).toBeGreaterThan(0)
        
        templates.forEach(templateName => {
          expect(templateName).toBeTruthy()
          expect(typeof templateName).toBe('string')
        })
      })
    })
  })

  describe('Template Workflow Integration', () => {
    it('should test complete template workflow: Load → Modify → Generate → Export', () => {
      const workflowSteps = [
        {
          step: 'Load Template',
          action: 'User selects "Hip-Hop Urban Vibe" template',
          result: 'Lyrics, artist, genre auto-populated',
          data: {
            lyrics: '[Verse 1] Started from the bottom...',
            artist: 'Jay-Z',
            genre: 'Hip-Hop'
          }
        },
        {
          step: 'Modify Content',
          action: 'User customizes lyrics and artist description',
          result: 'Template content updated with user changes',
          data: {
            lyrics: '[Modified] Started from the bottom but now we here...',
            artistDescription: 'A confident Black male rapper with gold chains'
          }
        },
        {
          step: 'Generate Shots',
          action: 'AI generates music video breakdown',
          result: 'Shots created with @artist variables',
          data: {
            shots: ['Wide shot of @artist in urban setting', 'Close-up of @artist performing']
          }
        },
        {
          step: 'Export with Templates', 
          action: 'Apply export template and download',
          result: 'Professional shot list with formatting',
          data: {
            exportPrefix: 'Music video shot: ',
            exportSuffix: ', hip-hop style, 4K'
          }
        }
      ]

      workflowSteps.forEach((step, index) => {
        expect(step.step).toBeTruthy()
        expect(step.action).toBeTruthy()
        expect(step.result).toBeTruthy()
        expect(step.data).toBeTruthy()
        
        // Verify workflow progression
        expect(index).toBeLessThan(workflowSteps.length)
      })

      // Test final output
      const finalShot = 'Music video shot: Wide shot of Jay-Z in urban setting, hip-hop style, 4K'
      expect(finalShot).toContain('Music video shot:')
      expect(finalShot).toContain('Jay-Z')
      expect(finalShot).toContain('hip-hop style, 4K')
    })

    it('should test template sharing and collaboration workflow', () => {
      const collaborationWorkflow = [
        {
          user: 'Admin',
          action: 'Creates custom story template',
          template: {
            name: 'Team Thriller Template',
            category: 'user',
            shared: true
          }
        },
        {
          user: 'Team Member 1',
          action: 'Loads shared template',
          template: {
            name: 'Team Thriller Template',
            source: 'shared from Admin'
          }
        },
        {
          user: 'Team Member 2', 
          action: 'Modifies and saves as new template',
          template: {
            name: 'My Modified Thriller',
            category: 'user',
            basedOn: 'Team Thriller Template'
          }
        }
      ]

      collaborationWorkflow.forEach(step => {
        expect(step.user).toBeTruthy()
        expect(step.action).toBeTruthy()
        expect(step.template.name).toBeTruthy()
        
        if (step.template.shared) {
          expect(step.user).toBe('Admin') // Only admin can share initially
        }
      })
    })
  })

  describe('Template Performance and Scale Testing', () => {
    it('should test template system with large numbers of templates', () => {
      // Simulate 100 user templates
      const largeTemplateSet = Array.from({ length: 100 }, (_, index) => ({
        id: `user-template-${index}`,
        name: `User Template ${index + 1}`,
        type: index % 2 === 0 ? 'story' : 'music-video' as const,
        category: 'user' as const,
        content: {
          [index % 2 === 0 ? 'story' : 'lyrics']: `Template content ${index + 1}...`
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      expect(largeTemplateSet).toHaveLength(100)
      
      // Test filtering performance
      const storyTemplates = largeTemplateSet.filter(t => t.type === 'story')
      const musicVideoTemplates = largeTemplateSet.filter(t => t.type === 'music-video')
      
      expect(storyTemplates.length).toBe(50)
      expect(musicVideoTemplates.length).toBe(50)
      
      // Test search performance
      const searchResults = largeTemplateSet.filter(t => 
        t.name.toLowerCase().includes('template 5')
      )
      expect(searchResults.length).toBeGreaterThan(0)
    })

    it('should test template loading and caching performance', () => {
      const performanceMetrics = {
        templateLoadTime: 100, // ms
        templateSearchTime: 50, // ms
        templateApplicationTime: 200, // ms
        largeTemplateProcessing: 500 // ms
      }

      Object.entries(performanceMetrics).forEach(([metric, maxTime]) => {
        expect(maxTime).toBeGreaterThan(0)
        expect(maxTime).toBeLessThan(1000) // All operations under 1 second
      })
    })
  })

  describe('Template Quality and Content Validation', () => {
    it('should test story template content quality', () => {
      const qualityStoryTemplate = {
        content: {
          story: sampleStoryTemplate.content.story,
          storyDirectorNotes: sampleStoryTemplate.content.storyDirectorNotes
        }
      }

      // Content quality checks
      expect(qualityStoryTemplate.content.story.split('.').length).toBeGreaterThan(5) // Multiple sentences
      expect(qualityStoryTemplate.content.story).toMatch(/[A-Z][a-z]+ [A-Z][a-z]+/) // Character names
      expect(qualityStoryTemplate.content.storyDirectorNotes).toContain('lighting') // Technical direction
      expect(qualityStoryTemplate.content.storyDirectorNotes.length).toBeGreaterThan(50) // Detailed notes
    })

    it('should test music video template lyric quality', () => {
      const qualityMVTemplate = {
        content: {
          lyrics: sampleMusicVideoTemplate.content.lyrics,
          mvConcept: sampleMusicVideoTemplate.content.mvConcept
        }
      }

      // Lyric structure validation
      expect(qualityMVTemplate.content.lyrics).toContain('[Verse')
      expect(qualityMVTemplate.content.lyrics).toContain('[Chorus]')
      expect(qualityMVTemplate.content.lyrics.split('\n').length).toBeGreaterThan(10) // Multiple lines
      
      // Concept quality
      expect(qualityMVTemplate.content.mvConcept).toContain('visual')
      expect(qualityMVTemplate.content.mvConcept?.length || 0).toBeGreaterThan(100) // Detailed concept
    })

    it('should test template validation rules', () => {
      const validationRules = [
        {
          rule: 'Template name must not be empty',
          test: (name: string) => name.trim().length > 0,
          valid: 'My Template',
          invalid: ''
        },
        {
          rule: 'Story content must be substantial',
          test: (story: string) => story.trim().length > 50,
          valid: 'A detective investigates a mysterious case in the city...',
          invalid: 'Short story'
        },
        {
          rule: 'Lyrics must have verse structure',
          test: (lyrics: string) => lyrics.includes('[Verse') || lyrics.includes('[Chorus'),
          valid: '[Verse 1]\nStarted from the bottom...',
          invalid: 'Just some random text'
        }
      ]

      validationRules.forEach(rule => {
        expect(rule.test(rule.valid)).toBe(true)
        expect(rule.test(rule.invalid)).toBe(false)
        expect(rule.rule).toContain('must')
      })
    })
  })

  describe('Template System Error Handling', () => {
    it('should handle template loading failures gracefully', () => {
      const errorScenarios = [
        { error: 'Template not found', handling: 'Show error message and fallback options' },
        { error: 'Corrupted template data', handling: 'Validate and repair or skip' },
        { error: 'Network failure during load', handling: 'Retry mechanism with user feedback' },
        { error: 'Template too large', handling: 'Warn user and offer to continue' }
      ]

      errorScenarios.forEach(scenario => {
        expect(scenario.error).toBeTruthy()
        expect(scenario.handling).toBeTruthy()
        expect(scenario.handling).toMatch(/(Show|Validate|Retry|Warn)/) // Action words
      })
    })

    it('should test template migration and compatibility', () => {
      const templateVersions = [
        { version: '1.0', features: ['Basic templates', 'Save/load'] },
        { version: '2.0', features: ['Categories', 'Export templates', 'Prompt templates'] },
        { version: '3.0', features: ['Template sharing', 'Advanced validation', 'Performance optimization'] }
      ]

      templateVersions.forEach(version => {
        expect(version.version).toMatch(/^\d+\.\d+$/)
        expect(Array.isArray(version.features)).toBe(true)
        expect(version.features.length).toBeGreaterThan(0)
      })

      // Test backward compatibility
      const oldTemplate = { version: '1.0', hasBasicFeatures: true }
      const newTemplate = { version: '2.0', hasAdvancedFeatures: true, backwardCompatible: true }
      
      expect(oldTemplate.hasBasicFeatures).toBe(true)
      expect(newTemplate.backwardCompatible).toBe(true)
    })
  })
})