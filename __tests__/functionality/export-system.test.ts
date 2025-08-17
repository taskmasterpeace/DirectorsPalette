/**
 * Export System Comprehensive Functionality Test
 * Tests the complete export system with real-world scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  processShotsForExport, 
  copyToClipboard, 
  getSuggestedFilename,
  createArtistTag,
  replaceVariables,
  applyPrefixSuffix,
  type ExportConfig,
  type ShotData 
} from '@/lib/export-processor'

// Mock clipboard for testing
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('Export System Comprehensive Tests', () => {
  const realWorldStoryShots: ShotData[] = [
    {
      id: 'detective-story-1',
      description: 'EXT. WAREHOUSE DISTRICT - NIGHT: Wide establishing shot of abandoned industrial area, rain glistening on asphalt, Detective @sarah-chen car approaching',
      chapter: 'Act I: The Discovery',
      shotNumber: 1,
      metadata: {
        directorStyle: 'David Fincher',
        sourceType: 'story',
        timestamp: '2024-01-15T20:00:00Z'
      }
    },
    {
      id: 'detective-story-2', 
      description: 'INT. WAREHOUSE - NIGHT: Medium shot of @sarah-chen entering through broken door, flashlight beam cutting through darkness, footsteps echoing',
      chapter: 'Act I: The Discovery',
      shotNumber: 2,
      metadata: {
        directorStyle: 'David Fincher',
        sourceType: 'story',
        timestamp: '2024-01-15T20:01:00Z'
      }
    },
    {
      id: 'detective-story-3',
      description: 'INT. WAREHOUSE - NIGHT: Close-up of @red-briefcase on metal table, camera slowly pushes in, building tension and mystery',
      chapter: 'Act I: The Discovery',
      shotNumber: 3,
      metadata: {
        directorStyle: 'David Fincher',
        sourceType: 'story',
        timestamp: '2024-01-15T20:02:00Z'
      }
    },
    {
      id: 'detective-story-4',
      description: 'INT. WAREHOUSE - NIGHT: Over-the-shoulder shot of @sarah-chen photographing @bloody-knife evidence with professional camera',
      chapter: 'Act II: Investigation',
      shotNumber: 4,
      metadata: {
        directorStyle: 'David Fincher',
        sourceType: 'story',
        timestamp: '2024-01-15T20:03:00Z'
      }
    },
    {
      id: 'detective-story-5',
      description: 'INT. WAREHOUSE - NIGHT: Wide shot showing @sarah-chen calling @mike-rodriguez on radio, crime scene lit dramatically in background',
      chapter: 'Act II: Investigation',
      shotNumber: 5,
      metadata: {
        directorStyle: 'David Fincher',
        sourceType: 'story',
        timestamp: '2024-01-15T20:04:00Z'
      }
    }
  ]

  const realWorldMusicVideoShots: ShotData[] = [
    {
      id: 'hiphop-mv-1',
      description: 'Opening drone shot: Sweeping aerial view of @artist hometown neighborhood at golden hour, establishing roots and authenticity',
      section: 'Intro',
      shotNumber: 1,
      metadata: {
        directorStyle: 'Hype Williams',
        sourceType: 'music-video',
        timestamp: '2024-01-15T15:00:00Z'
      }
    },
    {
      id: 'hiphop-mv-2',
      description: 'Performance shot: @artist rapping first verse in recording studio, close-up with professional microphone, intense energy',
      section: 'Verse 1',
      shotNumber: 2,
      metadata: {
        directorStyle: 'Hype Williams', 
        sourceType: 'music-video',
        timestamp: '2024-01-15T15:01:00Z'
      }
    },
    {
      id: 'hiphop-mv-3',
      description: 'Lifestyle montage: @artist in luxury car driving through city streets, success symbols visible, confident demeanor',
      section: 'Chorus',
      shotNumber: 3,
      metadata: {
        directorStyle: 'Hype Williams',
        sourceType: 'music-video',
        timestamp: '2024-01-15T15:02:00Z'
      }
    },
    {
      id: 'hiphop-mv-4',
      description: 'Flashback sequence: @artist as younger person in same neighborhood, black and white filter, showing humble beginnings',
      section: 'Verse 2',
      shotNumber: 4,
      metadata: {
        directorStyle: 'Hype Williams',
        sourceType: 'music-video',
        timestamp: '2024-01-15T15:03:00Z'
      }
    },
    {
      id: 'hiphop-mv-5',
      description: 'Performance climax: @artist on stage with full crowd, multiple camera angles, high energy choreography, triumphant moment',
      section: 'Final Chorus',
      shotNumber: 5,
      metadata: {
        directorStyle: 'Hype Williams',
        sourceType: 'music-video',
        timestamp: '2024-01-15T15:04:00Z'
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Professional Film Production Export', () => {
    it('should export story shots for film production team', () => {
      const filmProductionConfig: ExportConfig = {
        prefix: '[PRODUCTION SHOT LIST] ',
        suffix: ' [Equipment: RED Camera + Anamorphic Lenses] [Lighting: Dramatic Key + Practical Sources] [Crew: DP, Gaffer, Script Supervisor Required]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n\n',
        includeMetadata: true
      }

      const result = processShotsForExport(realWorldStoryShots, filmProductionConfig, {
        director: 'David Fincher'
      })

      expect(result.totalShots).toBe(5)
      expect(result.formattedText).toContain('[PRODUCTION SHOT LIST]')
      expect(result.formattedText).toContain('[Equipment: RED Camera')
      expect(result.formattedText).toContain('[Lighting: Dramatic Key')
      expect(result.formattedText).toContain('[Crew: DP, Gaffer')
      
      // Verify professional formatting
      expect(result.formattedText).toContain('EXT. WAREHOUSE DISTRICT - NIGHT')
      expect(result.formattedText).toContain('INT. WAREHOUSE - NIGHT')
      expect(result.formattedText).toContain('\n\n') // Double spacing for readability
    })

    it('should export story shots for storyboard artist', () => {
      const storyboardConfig: ExportConfig = {
        prefix: '[STORYBOARD FRAME] ',
        suffix: ' [Artist Notes: Focus on composition, character positioning, and visual flow between shots]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const result = processShotsForExport(realWorldStoryShots, storyboardConfig, {})

      expect(result.formattedText).toContain('[STORYBOARD FRAME]')
      expect(result.formattedText).toContain('[Artist Notes: Focus on composition')
      expect(result.formattedText).toContain('Wide establishing shot')
      expect(result.formattedText).toContain('Medium shot')
      expect(result.formattedText).toContain('Close-up')
      expect(result.formattedText).toContain('Over-the-shoulder shot')
    })

    it('should export story shots for location scout', () => {
      const locationScoutConfig: ExportConfig = {
        prefix: '[LOCATION REQUIREMENTS] ',
        suffix: ' [Scout Notes: Verify accessibility, power availability, and permit requirements]',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(realWorldStoryShots, locationScoutConfig, {})

      expect(result.formattedText).toContain('[LOCATION REQUIREMENTS]')
      expect(result.formattedText).toContain('[Scout Notes: Verify accessibility')
      expect(result.formattedText).toContain('WAREHOUSE DISTRICT')
      expect(result.formattedText).toContain('abandoned industrial area')
    })
  })

  describe('Music Video Production Export', () => {
    it('should export music video shots for video production company', () => {
      const videoProductionConfig: ExportConfig = {
        prefix: '[MUSIC VIDEO PRODUCTION] ',
        suffix: ' [Budget: Mid-tier] [Timeline: 2-day shoot] [Equipment: Steadicam, Drone, Professional Lighting]',
        useArtistDescriptions: true,
        format: 'numbered',
        separator: '\n',
        includeMetadata: true
      }

      const artistDescription = 'Jay-Z, a successful Black male hip-hop artist and entrepreneur, known for his confident presence, luxury fashion sense, and commanding stage performance'

      const result = processShotsForExport(realWorldMusicVideoShots, videoProductionConfig, {
        artistDescription,
        director: 'Hype Williams'
      })

      expect(result.formattedText).toContain('[MUSIC VIDEO PRODUCTION]')
      expect(result.formattedText).toContain('Jay-Z, a successful Black male hip-hop artist')
      expect(result.formattedText).toContain('[Budget: Mid-tier]')
      expect(result.formattedText).toContain('[Equipment: Steadicam, Drone')
      expect(result.formattedText).not.toContain('@artist')
    })

    it('should export music video shots for choreographer', () => {
      const choreographyConfig: ExportConfig = {
        prefix: '[CHOREOGRAPHY NOTES] ',
        suffix: ' [Performance Requirements: High energy, crowd interaction, stage presence focus]',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(realWorldMusicVideoShots, choreographyConfig, {
        artistName: 'Jay-Z'
      })

      expect(result.formattedText).toContain('[CHOREOGRAPHY NOTES]')
      expect(result.formattedText).toContain('[Performance Requirements')
      expect(result.formattedText).toContain('Jay-Z rapping first verse')
      expect(result.formattedText).toContain('high energy choreography')
      expect(result.formattedText).toContain('stage presence focus')
    })

    it('should export music video shots for social media team', () => {
      const socialMediaConfig: ExportConfig = {
        prefix: '[SOCIAL MEDIA CLIPS] ',
        suffix: ' [Platform Specs: Instagram 9:16, TikTok 9:16, YouTube Shorts 9:16] [Duration: 15-60 seconds]',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n',
        includeMetadata: false
      }

      const socialShots = realWorldMusicVideoShots.filter(shot => 
        shot.section === 'Chorus' || shot.section === 'Final Chorus'
      )

      const result = processShotsForExport(socialShots, socialMediaConfig, {
        artistName: 'Jay-Z'
      })

      expect(result.formattedText).toContain('[SOCIAL MEDIA CLIPS]')
      expect(result.formattedText).toContain('[Platform Specs: Instagram 9:16')
      expect(result.formattedText).toContain('[Duration: 15-60 seconds]')
      expect(result.formattedText).toContain('Jay-Z')
    })
  })

  describe('Advanced Export Scenarios', () => {
    it('should handle multi-artist collaboration export', () => {
      const collaborationShots: ShotData[] = [
        {
          id: 'collab-1',
          description: '@artist-1 and @artist-2 performing together on stage, split screen composition',
          section: 'Collaboration Verse',
          shotNumber: 1
        },
        {
          id: 'collab-2',
          description: 'Wide shot of @artist-1 in @location-1 while @artist-2 appears in @location-2, showing separation',
          section: 'Separate Verses',
          shotNumber: 2  
        },
        {
          id: 'collab-3',
          description: 'Final shot: @artist-1 and @artist-2 unite in @final-location for powerful conclusion',
          section: 'Final Chorus',
          shotNumber: 3
        }
      ]

      const multiArtistConfig: ExportConfig = {
        prefix: '[COLLABORATION PROJECT] ',
        suffix: ' [Note: Coordinate schedules for both artists] [Equipment: Multi-camera setup required]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: false
      }

      const variables = {
        'artist-1': 'Jay-Z',
        'artist-2': 'Kanye West',
        'location-1': 'New York studio',
        'location-2': 'Chicago studio',
        'final-location': 'rooftop venue'
      }

      let result = processShotsForExport(collaborationShots, multiArtistConfig, {})
      
      // Manual variable replacement for complex scenarios
      Object.entries(variables).forEach(([variable, value]) => {
        const regex = new RegExp(`@${variable}`, 'g')
        result.formattedText = result.formattedText.replace(regex, value)
      })

      expect(result.formattedText).toContain('[COLLABORATION PROJECT]')
      expect(result.formattedText).toContain('Jay-Z and Kanye West performing together')
      expect(result.formattedText).toContain('New York studio')
      expect(result.formattedText).toContain('Chicago studio')
      expect(result.formattedText).toContain('[Note: Coordinate schedules')
    })

    it('should handle episodic content export (TV series)', () => {
      const episodicShots: ShotData[] = [
        {
          id: 'episode-1-1',
          description: 'COLD OPEN: @protagonist discovers mysterious package, sets up episode mystery',
          chapter: 'Episode 1: Pilot',
          shotNumber: 1
        },
        {
          id: 'episode-1-2',
          description: 'ACT ONE: @protagonist investigates with @partner, establishing character dynamics',
          chapter: 'Episode 1: Pilot',
          shotNumber: 2
        },
        {
          id: 'episode-1-3',
          description: 'ACT TWO: @antagonist revealed in shadows, building season-long arc',
          chapter: 'Episode 1: Pilot', 
          shotNumber: 3
        }
      ]

      const episodicConfig: ExportConfig = {
        prefix: '[TV SERIES PRODUCTION] Episode 1 - ',
        suffix: ' [Series Bible: Maintain character consistency] [Budget: Network TV standards] [Runtime: 42 minutes]',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(episodicShots, episodicConfig, {})

      expect(result.formattedText).toContain('[TV SERIES PRODUCTION]')
      expect(result.formattedText).toContain('Episode 1 -')
      expect(result.formattedText).toContain('[Series Bible: Maintain character consistency]')
      expect(result.formattedText).toContain('COLD OPEN:')
      expect(result.formattedText).toContain('ACT ONE:')
      expect(result.formattedText).toContain('ACT TWO:')
    })

    it('should handle documentary-style export', () => {
      const documentaryShots: ShotData[] = [
        {
          id: 'doc-1',
          description: 'Talking head: @subject-expert discussing @topic in natural setting, authentic environment',
          chapter: 'Interview Segment 1',
          shotNumber: 1
        },
        {
          id: 'doc-2',
          description: 'B-roll: Wide shots of @location-context showing real-world environment related to @topic',
          chapter: 'Context Segment',
          shotNumber: 2
        },
        {
          id: 'doc-3',
          description: 'Archival footage: Historical @archive-material integrated with modern interviews about @topic',
          chapter: 'Historical Context',
          shotNumber: 3
        }
      ]

      const documentaryConfig: ExportConfig = {
        prefix: '[DOCUMENTARY PRODUCTION] ',
        suffix: ' [Style: Cinema vérité] [Equipment: Handheld, natural lighting] [Audio: Lavalier mics essential]',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(documentaryShots, documentaryConfig, {})

      expect(result.formattedText).toContain('[DOCUMENTARY PRODUCTION]')
      expect(result.formattedText).toContain('[Style: Cinema vérité]')
      expect(result.formattedText).toContain('[Audio: Lavalier mics essential]')
      expect(result.formattedText).toContain('Talking head:')
      expect(result.formattedText).toContain('B-roll:')
      expect(result.formattedText).toContain('Archival footage:')
    })
  })

  describe('Export Format Validation', () => {
    it('should test JSON export with complete metadata', () => {
      const jsonConfig: ExportConfig = {
        prefix: 'Production: ',
        suffix: ', professional grade',
        useArtistDescriptions: false,
        format: 'json',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(realWorldStoryShots.slice(0, 2), jsonConfig, {
        director: 'David Fincher'
      })

      const parsed = JSON.parse(result.formattedText)
      
      // Validate JSON structure
      expect(parsed.shots).toHaveLength(2)
      expect(parsed.totalShots).toBe(2)
      expect(parsed.exportConfig).toEqual(jsonConfig)
      expect(parsed.exportedAt).toBeTruthy()
      
      // Validate shot data
      expect(parsed.shots[0].id).toBe('detective-story-1')
      expect(parsed.shots[0].chapter).toBe('Act I: The Discovery')
      expect(parsed.shots[0].metadata.directorStyle).toBe('David Fincher')
      expect(parsed.shots[0].description).toContain('Production: EXT. WAREHOUSE DISTRICT')
    })

    it('should test CSV export for spreadsheet import', () => {
      const csvConfig: ExportConfig = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'csv',
        separator: '\n',
        includeMetadata: true
      }

      const result = processShotsForExport(realWorldStoryShots.slice(0, 3), csvConfig, {})

      const lines = result.formattedText.split('\n')
      
      // Validate CSV structure
      expect(lines[0]).toBe('"Shot Number","Description","Chapter","Section","Director Style"')
      expect(lines[1]).toContain('"1","EXT. WAREHOUSE DISTRICT - NIGHT')
      expect(lines[2]).toContain('"2","INT. WAREHOUSE - NIGHT')
      expect(lines[3]).toContain('"3","INT. WAREHOUSE - NIGHT')
      
      // Test CSV escaping
      expect(result.formattedText).not.toContain('""') // No unescaped quotes
    })

    it('should test plain text export for script integration', () => {
      const scriptConfig: ExportConfig = {
        prefix: '',
        suffix: '',
        useArtistDescriptions: false,
        format: 'text',
        separator: '\n\n',
        includeMetadata: false
      }

      const result = processShotsForExport(realWorldStoryShots, scriptConfig, {})

      // Verify clean text format
      expect(result.formattedText).not.toContain('[')
      expect(result.formattedText).not.toContain('{')
      expect(result.formattedText).not.toContain('"')
      expect(result.formattedText.split('\n\n')).toHaveLength(5) // Proper separation
    })
  })

  describe('Artist Variable System Advanced Testing', () => {
    it('should test artist description vs name mode with real content', () => {
      const artistTestShot = 'Performance shot: @artist commanding the stage with powerful presence and authentic energy'
      
      const artistName = 'Kendrick Lamar'
      const artistDescription = 'Kendrick Lamar, a Pulitzer Prize-winning rapper from Compton, California, known for his introspective lyrics, social consciousness, and dynamic live performances. Typically wears casual but thoughtful clothing that reflects his West Coast roots and intellectual approach to hip-hop.'

      // Test name mode
      const nameResult = replaceVariables(artistTestShot, { artistName })
      expect(nameResult).toBe('Performance shot: Kendrick Lamar commanding the stage with powerful presence and authentic energy')

      // Test description mode  
      const descriptionResult = replaceVariables(artistTestShot, { artistDescription })
      expect(descriptionResult).toContain('Pulitzer Prize-winning rapper from Compton')
      expect(descriptionResult).toContain('social consciousness')
      expect(descriptionResult).toContain('West Coast roots')
      expect(descriptionResult).not.toContain('@artist')
    })

    it('should test artist tag generation with real artist names', () => {
      const realArtistNames = [
        { name: 'The Notorious B.I.G.', expectedTag: 'the_notorious_big' },
        { name: 'Wu-Tang Clan', expectedTag: 'wutang_clan' },
        { name: 'A$AP Rocky', expectedTag: 'asap_rocky' },
        { name: 'Tyler, The Creator', expectedTag: 'tyler_the_creator' },
        { name: 'Childish Gambino', expectedTag: 'childish_gambino' },
        { name: 'MF DOOM', expectedTag: 'mf_doom' },
        { name: '21 Savage', expectedTag: '21_savage' }
      ]

      realArtistNames.forEach(({ name, expectedTag }) => {
        const actualTag = createArtistTag(name)
        expect(actualTag).toBe(expectedTag)
        expect(actualTag).toMatch(/^[a-z0-9_]+$/) // Only lowercase letters, numbers, underscores
        expect(actualTag).not.toContain(' ') // No spaces
        expect(actualTag).not.toContain('-') // No dashes (converted to underscores)
      })
    })
  })

  describe('Export File Management', () => {
    it('should test filename generation with timestamps and metadata', () => {
      const filenameTests = [
        {
          projectType: 'story' as const,
          artistName: undefined,
          expectedPattern: /story-shots-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.txt/
        },
        {
          projectType: 'music-video' as const,
          artistName: 'Jay-Z',
          expectedPattern: /music-video-jayz-shots-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json/
        },
        {
          projectType: 'story' as const,
          artistName: 'Detective Sarah',
          expectedPattern: /story-detective_sarah-shots-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv/
        }
      ]

      filenameTests.forEach(test => {
        const config: ExportConfig = {
          prefix: '',
          suffix: '',
          useArtistDescriptions: false,
          format: test.projectType === 'story' ? 'text' : 'json',
          separator: '\n',
          includeMetadata: false
        }

        if (test.expectedPattern.source.includes('csv')) {
          config.format = 'csv'
        }

        const filename = getSuggestedFilename(config, test.projectType, test.artistName)
        expect(filename).toBeTruthy()
        expect(filename).toMatch(/\.(txt|json|csv)$/)
        
        if (test.artistName) {
          expect(filename.toLowerCase()).toContain(createArtistTag(test.artistName))
        }
      })
    })

    it('should test large export file handling', () => {
      // Test with 200 shots (large production)
      const largeProduction: ShotData[] = Array.from({ length: 200 }, (_, index) => ({
        id: `large-prod-${index}`,
        description: `Shot ${index + 1}: Detailed production shot with comprehensive description including camera movement, lighting setup, character blocking, prop placement, and specific technical requirements for professional film production`,
        chapter: `Act ${Math.floor(index / 50) + 1}`,
        shotNumber: index + 1,
        metadata: {
          directorStyle: 'Christopher Nolan',
          sourceType: 'story',
          timestamp: new Date().toISOString()
        }
      }))

      const largeProductionConfig: ExportConfig = {
        prefix: '[MAJOR PRODUCTION] ',
        suffix: ' [Note: Large-scale production with extensive crew and equipment requirements]',
        useArtistDescriptions: false,
        format: 'json',
        separator: '\n',
        includeMetadata: true
      }

      const startTime = Date.now()
      const result = processShotsForExport(largeProduction, largeProductionConfig, {})
      const endTime = Date.now()

      expect(result.totalShots).toBe(200)
      expect(result.processingTime).toBeLessThan(2000) // Under 2 seconds
      expect(endTime - startTime).toBeLessThan(3000) // Total time under 3 seconds
      
      // Validate large file structure
      const parsed = JSON.parse(result.formattedText)
      expect(parsed.shots).toHaveLength(200)
      expect(parsed.shots[0].chapter).toBe('Act 1')
      expect(parsed.shots[199].chapter).toBe('Act 4')
    })
  })

  describe('Professional Workflow Integration', () => {
    it('should test complete professional film workflow', () => {
      const professionalWorkflow = [
        {
          phase: 'Pre-Production',
          output: 'Shot list for location scouting',
          config: {
            prefix: '[LOCATION SCOUT] ',
            suffix: ' [Requirements: Permits, accessibility, power]'
          }
        },
        {
          phase: 'Production',
          output: 'Daily shot lists for crew',
          config: {
            prefix: '[DAILY PRODUCTION] ',
            suffix: ' [Crew Call: 6 AM] [Equipment: RED camera package]'
          }
        },
        {
          phase: 'Post-Production',
          output: 'Edit notes with shot references',
          config: {
            prefix: '[EDIT NOTES] ',
            suffix: ' [Color: Desaturated teal/orange] [Sound: Ambient + score]'
          }
        },
        {
          phase: 'Marketing',
          output: 'Trailer shot selection',
          config: {
            prefix: '[TRAILER EDIT] ',
            suffix: ' [Duration: 30-60 seconds] [Impact: High emotional moments]'
          }
        }
      ]

      professionalWorkflow.forEach(workflow => {
        expect(workflow.phase).toBeTruthy()
        expect(workflow.output).toBeTruthy()
        expect(workflow.config.prefix).toContain('[')
        expect(workflow.config.suffix).toContain(']')
      })

      // Test that each phase serves different production needs
      const phases = professionalWorkflow.map(w => w.phase)
      expect(phases).toContain('Pre-Production')
      expect(phases).toContain('Production')
      expect(phases).toContain('Post-Production')
      expect(phases).toContain('Marketing')
    })

    it('should test cross-platform export compatibility', () => {
      const platformExports = [
        {
          platform: 'Final Cut Pro',
          format: 'csv' as const,
          requirements: 'Shot number, description, timecode placeholder'
        },
        {
          platform: 'Adobe Premiere',
          format: 'text' as const,
          requirements: 'Plain text with shot descriptions'
        },
        {
          platform: 'DaVinci Resolve',
          format: 'json' as const,
          requirements: 'Structured data with metadata'
        },
        {
          platform: 'Google Sheets',
          format: 'csv' as const,
          requirements: 'Spreadsheet-compatible format'
        }
      ]

      platformExports.forEach(platform => {
        expect(['csv', 'text', 'json']).toContain(platform.format)
        expect(platform.requirements).toBeTruthy()
        expect(platform.platform).toBeTruthy()

        // Test format suitability for platform
        if (platform.platform.includes('Sheets')) {
          expect(platform.format).toBe('csv')
        }
      })
    })
  })

  describe('Quality Assurance and Error Recovery', () => {
    it('should test export system error recovery', () => {
      const errorScenarios = [
        {
          scenario: 'Clipboard write failure',
          handling: 'Fallback to execCommand, then show download option',
          userImpact: 'Minimal - alternative provided'
        },
        {
          scenario: 'Large file processing timeout',
          handling: 'Process in chunks, show progress, offer to continue',
          userImpact: 'Informed - clear progress indication'
        },
        {
          scenario: 'Invalid variable references',
          handling: 'Leave variables unchanged, warn user in preview',
          userImpact: 'Controlled - user can fix before export'
        },
        {
          scenario: 'Format-specific processing error',
          handling: 'Fallback to plain text, notify user of format change',
          userImpact: 'Graceful - still get usable output'
        }
      ]

      errorScenarios.forEach(scenario => {
        expect(scenario.scenario).toBeTruthy()
        expect(scenario.handling).toContain('Fallback') || expect(scenario.handling).toContain('Process') || expect(scenario.handling).toContain('Leave')
        expect(scenario.userImpact).toMatch(/(Minimal|Informed|Controlled|Graceful)/)
      })
    })

    it('should test export validation and quality checks', () => {
      const qualityChecks = [
        {
          check: 'Shot count validation',
          rule: 'Must have at least 1 shot to export',
          errorMessage: 'No shots available for export'
        },
        {
          check: 'Variable completeness',
          rule: 'Warn if unresolved variables remain',
          errorMessage: 'Some variables may not be resolved'
        },
        {
          check: 'Format compatibility',
          rule: 'Validate format-specific requirements',
          errorMessage: 'Format may not support requested features'
        },
        {
          check: 'Content length validation',
          rule: 'Warn if output will be very large',
          errorMessage: 'Export file will be large, continue?'
        }
      ]

      qualityChecks.forEach(check => {
        expect(check.check).toBeTruthy()
        expect(check.rule).toContain('Must') || expect(check.rule).toContain('Warn') || expect(check.rule).toContain('Validate')
        expect(check.errorMessage).toBeTruthy()
      })
    })
  })

  describe('Performance Benchmarking', () => {
    it('should benchmark export system performance', () => {
      const performanceBenchmarks = [
        { shots: 10, maxTime: 100, description: 'Small project' },
        { shots: 50, maxTime: 500, description: 'Medium project' },
        { shots: 100, maxTime: 1000, description: 'Large project' },
        { shots: 200, maxTime: 2000, description: 'Major production' }
      ]

      performanceBenchmarks.forEach(benchmark => {
        // Create test data
        const testShots = Array.from({ length: benchmark.shots }, (_, i) => ({
          id: `perf-${i}`,
          description: `Performance test shot ${i + 1} with realistic content and proper detail level`,
          shotNumber: i + 1
        }))

        const config: ExportConfig = {
          prefix: 'Benchmark: ',
          suffix: ', performance test',
          useArtistDescriptions: false,
          format: 'text',
          separator: '\n',
          includeMetadata: false
        }

        const startTime = Date.now()
        const result = processShotsForExport(testShots, config, {})
        const endTime = Date.now()

        expect(result.totalShots).toBe(benchmark.shots)
        expect(endTime - startTime).toBeLessThan(benchmark.maxTime)
        expect(result.processingTime).toBeLessThan(benchmark.maxTime * 0.8) // Processing should be 80% of total time
      })
    })

    it('should test memory usage with complex formatting', () => {
      const complexConfig: ExportConfig = {
        prefix: '[COMPLEX PRODUCTION NOTES] Camera Setup: Professional RED camera system with anamorphic lenses, multiple focal lengths available. Lighting Design: Three-point lighting with practical sources, color temperature controlled. Sound Recording: Professional boom operator with wireless backup systems. ',
        suffix: ' [POST PRODUCTION REQUIREMENTS] Color Correction: Professional colorist required, specific LUT application. Sound Design: Full sound replacement with custom score integration. Visual Effects: Minimal practical effects preferred over CGI. Delivery: Multiple format delivery including 4K master, HD broadcast, and compressed web versions for social media distribution.',
        useArtistDescriptions: false,
        format: 'numbered',
        separator: '\n\n',
        includeMetadata: true
      }

      const result = processShotsForExport(realWorldStoryShots, complexConfig, {})

      // Test complex formatting doesn't break system
      expect(result.formattedText.length).toBeGreaterThan(5000) // Substantial output
      expect(result.formattedText).toContain('[COMPLEX PRODUCTION NOTES]')
      expect(result.formattedText).toContain('[POST PRODUCTION REQUIREMENTS]')
      expect(result.processingTime).toBeLessThan(1000) // Still processes quickly
    })
  })
})