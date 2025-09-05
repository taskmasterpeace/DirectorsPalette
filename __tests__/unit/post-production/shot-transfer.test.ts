import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  convertStoryShots,
  convertMusicVideoShots,
  storeShotsForTransfer,
  retrieveTransferredShots,
  hasTransferredShots
} from '@/lib/post-production/transfer'
import type { ChapterBreakdown } from '@/lib/types'
import type { PostProductionShot } from '@/lib/post-production/types'

describe('Shot Transfer Utilities', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear()
  })

  describe('convertStoryShots', () => {
    it('should convert story chapters to post-production shots', () => {
      const chapterBreakdowns: ChapterBreakdown[] = [
        {
          chapterId: 'chapter_1',
          title: 'Introduction',
          shots: [
            'Wide shot of the city',
            'Close-up of protagonist',
            'Establishing shot of building'
          ]
        },
        {
          chapterId: 'chapter_2',
          title: 'Conflict',
          shots: [
            'Action sequence begins',
            'Chase scene through streets'
          ]
        }
      ]

      const projectId = 'story_123'
      const result = convertStoryShots(chapterBreakdowns, projectId)

      expect(result).toHaveLength(5)
      expect(result[0]).toMatchObject({
        id: 'chapter_1_shot_1',
        projectId: 'story_123',
        projectType: 'story',
        shotNumber: 1,
        description: 'Wide shot of the city',
        sourceChapter: 'chapter_1',
        status: 'pending'
      })
      expect(result[3]).toMatchObject({
        id: 'chapter_2_shot_1',
        projectId: 'story_123',
        projectType: 'story',
        shotNumber: 1,
        description: 'Action sequence begins',
        sourceChapter: 'chapter_2'
      })
    })

    it('should handle empty chapter breakdowns', () => {
      const result = convertStoryShots([], 'story_123')
      expect(result).toHaveLength(0)
    })

    it('should handle chapters with no shots', () => {
      const chapterBreakdowns: ChapterBreakdown[] = [
        {
          chapterId: 'chapter_1',
          title: 'Empty Chapter',
          shots: []
        }
      ]

      const result = convertStoryShots(chapterBreakdowns, 'story_123')
      expect(result).toHaveLength(0)
    })
  })

  describe('convertMusicVideoShots', () => {
    it('should convert music video sections to post-production shots', () => {
      const sectionBreakdowns = [
        {
          sectionId: 'verse_1',
          title: 'First Verse',
          shots: [
            'Singer in spotlight',
            'Band performing',
            'Crowd reaction'
          ]
        },
        {
          sectionId: 'chorus_1',
          title: 'Chorus',
          shots: [
            'Wide shot of stage',
            'Pyrotechnics display'
          ]
        }
      ]

      const projectId = 'mv_456'
      const result = convertMusicVideoShots(sectionBreakdowns, projectId)

      expect(result).toHaveLength(5)
      expect(result[0]).toMatchObject({
        id: 'verse_1_shot_1',
        projectId: 'mv_456',
        projectType: 'music-video',
        shotNumber: 1,
        description: 'Singer in spotlight',
        sourceSection: 'verse_1',
        status: 'pending'
      })
      expect(result[3]).toMatchObject({
        id: 'chorus_1_shot_1',
        projectId: 'mv_456',
        projectType: 'music-video',
        shotNumber: 1,
        description: 'Wide shot of stage',
        sourceSection: 'chorus_1'
      })
    })

    it('should handle sections without shots array', () => {
      const sectionBreakdowns = [
        {
          sectionId: 'intro',
          title: 'Intro',
          // No shots property
        }
      ]

      const result = convertMusicVideoShots(sectionBreakdowns, 'mv_456')
      expect(result).toHaveLength(0)
    })
  })

  describe('storeShotsForTransfer', () => {
    it('should store shots in sessionStorage', () => {
      const shots: PostProductionShot[] = [
        {
          id: 'shot_1',
          projectId: 'project_1',
          projectType: 'story',
          shotNumber: 1,
          description: 'Test shot',
          status: 'pending',
          metadata: { timestamp: new Date().toISOString() }
        }
      ]

      storeShotsForTransfer(shots)

      const stored = sessionStorage.getItem('postProductionShots')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.shots).toHaveLength(1)
      expect(parsed.shots[0].id).toBe('shot_1')
      expect(parsed.source).toBe('directors-palette')
      expect(parsed.transferredAt).toBeTruthy()
    })

    it('should overwrite existing shots in sessionStorage', () => {
      const firstShots: PostProductionShot[] = [{
        id: 'shot_1',
        projectId: 'project_1',
        projectType: 'story',
        shotNumber: 1,
        description: 'First shot',
        status: 'pending'
      }]

      const secondShots: PostProductionShot[] = [{
        id: 'shot_2',
        projectId: 'project_2',
        projectType: 'music-video',
        shotNumber: 1,
        description: 'Second shot',
        status: 'pending'
      }]

      storeShotsForTransfer(firstShots)
      storeShotsForTransfer(secondShots)

      const stored = sessionStorage.getItem('postProductionShots')
      const parsed = JSON.parse(stored!)
      
      expect(parsed.shots).toHaveLength(1)
      expect(parsed.shots[0].id).toBe('shot_2')
    })
  })

  describe('retrieveTransferredShots', () => {
    it('should retrieve and clear shots from sessionStorage', () => {
      const shots: PostProductionShot[] = [
        {
          id: 'shot_1',
          projectId: 'project_1',
          projectType: 'story',
          shotNumber: 1,
          description: 'Test shot',
          status: 'pending'
        }
      ]

      storeShotsForTransfer(shots)
      
      const retrieved = retrieveTransferredShots()
      expect(retrieved).toHaveLength(1)
      expect(retrieved![0].id).toBe('shot_1')

      // Should clear after retrieval
      const secondRetrieval = retrieveTransferredShots()
      expect(secondRetrieval).toBeNull()
    })

    it('should return null when no shots are stored', () => {
      const result = retrieveTransferredShots()
      expect(result).toBeNull()
    })

    it('should handle corrupted data gracefully', () => {
      sessionStorage.setItem('postProductionShots', 'invalid json {')
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = retrieveTransferredShots()
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error parsing transferred shots:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('hasTransferredShots', () => {
    it('should return true when shots are stored', () => {
      const shots: PostProductionShot[] = [{
        id: 'shot_1',
        projectId: 'project_1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }]

      storeShotsForTransfer(shots)
      expect(hasTransferredShots()).toBe(true)
    })

    it('should return false when no shots are stored', () => {
      expect(hasTransferredShots()).toBe(false)
    })

    it('should return false after shots are retrieved', () => {
      const shots: PostProductionShot[] = [{
        id: 'shot_1',
        projectId: 'project_1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }]

      storeShotsForTransfer(shots)
      expect(hasTransferredShots()).toBe(true)
      
      retrieveTransferredShots()
      expect(hasTransferredShots()).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should handle complete transfer workflow', () => {
      // Step 1: Convert story shots
      const chapterBreakdowns: ChapterBreakdown[] = [
        {
          chapterId: 'chapter_1',
          title: 'Test Chapter',
          shots: ['Shot 1', 'Shot 2']
        }
      ]
      
      const shots = convertStoryShots(chapterBreakdowns, 'test_project')
      expect(shots).toHaveLength(2)

      // Step 2: Store for transfer
      storeShotsForTransfer(shots)
      expect(hasTransferredShots()).toBe(true)

      // Step 3: Retrieve in post-production
      const retrieved = retrieveTransferredShots()
      expect(retrieved).toHaveLength(2)
      expect(retrieved![0].description).toBe('Shot 1')

      // Step 4: Verify cleanup
      expect(hasTransferredShots()).toBe(false)
      expect(retrieveTransferredShots()).toBeNull()
    })
  })
})