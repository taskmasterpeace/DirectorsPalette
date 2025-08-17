import { describe, it, expect, beforeEach } from 'vitest'
import { usePostProductionStore } from '@/stores/post-production-store'
import type { PostProductionShot, ReplicateJob } from '@/lib/post-production/types'

describe('Post Production Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePostProductionStore.getState().resetStore()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = usePostProductionStore.getState()
      
      expect(state.shotQueue).toHaveLength(0)
      expect(state.processingShot).toBeNull()
      expect(state.completedShots).toHaveLength(0)
      expect(state.failedShots).toHaveLength(0)
      expect(state.isGenerating).toBe(false)
      expect(state.currentProgress).toBe(0)
      expect(state.totalProgress).toBe(0)
      expect(state.selectedShots.size).toBe(0)
    })
  })

  describe('Shot Management', () => {
    it('should add shots to the queue', () => {
      const shots: PostProductionShot[] = [
        {
          id: 'shot_1',
          projectId: 'project_1',
          projectType: 'story',
          shotNumber: 1,
          description: 'Test shot 1',
          status: 'pending'
        },
        {
          id: 'shot_2',
          projectId: 'project_1',
          projectType: 'story',
          shotNumber: 2,
          description: 'Test shot 2',
          status: 'pending'
        }
      ]

      const { addShots } = usePostProductionStore.getState()
      addShots(shots)

      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(2)
      expect(state.shotQueue[0].id).toBe('shot_1')
      expect(state.shotQueue[1].id).toBe('shot_2')
    })

    it('should remove a specific shot', () => {
      const shots: PostProductionShot[] = [
        { id: 'shot_1', projectId: 'p1', projectType: 'story', shotNumber: 1, description: 'Shot 1', status: 'pending' },
        { id: 'shot_2', projectId: 'p1', projectType: 'story', shotNumber: 2, description: 'Shot 2', status: 'pending' },
        { id: 'shot_3', projectId: 'p1', projectType: 'story', shotNumber: 3, description: 'Shot 3', status: 'pending' }
      ]

      const { addShots, removeShot } = usePostProductionStore.getState()
      addShots(shots)
      removeShot('shot_2')

      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(2)
      expect(state.shotQueue.find(s => s.id === 'shot_2')).toBeUndefined()
      expect(state.shotQueue[0].id).toBe('shot_1')
      expect(state.shotQueue[1].id).toBe('shot_3')
    })

    it('should clear all queues', () => {
      const { addShots, markShotCompleted, markShotFailed, clearQueue } = usePostProductionStore.getState()
      
      const shots: PostProductionShot[] = [
        { id: 'shot_1', projectId: 'p1', projectType: 'story', shotNumber: 1, description: 'Shot 1', status: 'pending' },
        { id: 'shot_2', projectId: 'p1', projectType: 'story', shotNumber: 2, description: 'Shot 2', status: 'pending' },
        { id: 'shot_3', projectId: 'p1', projectType: 'story', shotNumber: 3, description: 'Shot 3', status: 'pending' }
      ]
      
      addShots(shots)
      markShotCompleted('shot_1', ['image1.jpg'])
      markShotFailed('shot_2', 'Test error')
      
      clearQueue()
      
      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(0)
      expect(state.completedShots).toHaveLength(0)
      expect(state.failedShots).toHaveLength(0)
      expect(state.processingShot).toBeNull()
    })
  })

  describe('Shot Processing', () => {
    it('should set processing shot', () => {
      const shot: PostProductionShot = {
        id: 'shot_1',
        projectId: 'p1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Processing shot',
        status: 'processing'
      }

      const { setProcessingShot } = usePostProductionStore.getState()
      setProcessingShot(shot)

      const state = usePostProductionStore.getState()
      expect(state.processingShot).toEqual(shot)
    })

    it('should mark shot as completed', () => {
      const shot: PostProductionShot = {
        id: 'shot_1',
        projectId: 'p1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }

      const { addShots, markShotCompleted } = usePostProductionStore.getState()
      addShots([shot])
      
      const images = ['image1.jpg', 'image2.jpg']
      markShotCompleted('shot_1', images)

      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(0)
      expect(state.completedShots).toHaveLength(1)
      expect(state.completedShots[0].status).toBe('completed')
      expect(state.completedShots[0].generatedImages).toEqual(images)
    })

    it('should mark shot as failed', () => {
      const shot: PostProductionShot = {
        id: 'shot_1',
        projectId: 'p1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }

      const { addShots, markShotFailed } = usePostProductionStore.getState()
      addShots([shot])
      markShotFailed('shot_1', 'Generation failed')

      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(0)
      expect(state.failedShots).toHaveLength(1)
      expect(state.failedShots[0].status).toBe('failed')
    })

    it('should retry a failed shot', () => {
      const shot: PostProductionShot = {
        id: 'shot_1',
        projectId: 'p1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }

      const { addShots, markShotFailed, retryShot } = usePostProductionStore.getState()
      addShots([shot])
      markShotFailed('shot_1', 'Generation failed')
      
      retryShot('shot_1')

      const state = usePostProductionStore.getState()
      expect(state.failedShots).toHaveLength(0)
      expect(state.shotQueue).toHaveLength(1)
      expect(state.shotQueue[0].status).toBe('pending')
    })
  })

  describe('Selection Management', () => {
    it('should toggle shot selection', () => {
      const { toggleShotSelection } = usePostProductionStore.getState()
      
      toggleShotSelection('shot_1')
      let state = usePostProductionStore.getState()
      expect(state.selectedShots.has('shot_1')).toBe(true)
      
      toggleShotSelection('shot_1')
      state = usePostProductionStore.getState()
      expect(state.selectedShots.has('shot_1')).toBe(false)
    })

    it('should select all shots', () => {
      const shots: PostProductionShot[] = [
        { id: 'shot_1', projectId: 'p1', projectType: 'story', shotNumber: 1, description: 'Shot 1', status: 'pending' },
        { id: 'shot_2', projectId: 'p1', projectType: 'story', shotNumber: 2, description: 'Shot 2', status: 'pending' }
      ]

      const { addShots, markShotCompleted, selectAllShots } = usePostProductionStore.getState()
      addShots(shots)
      markShotCompleted('shot_1', ['image.jpg'])
      
      selectAllShots()

      const state = usePostProductionStore.getState()
      expect(state.selectedShots.size).toBe(2)
      expect(state.selectedShots.has('shot_1')).toBe(true)
      expect(state.selectedShots.has('shot_2')).toBe(true)
    })

    it('should deselect all shots', () => {
      const { toggleShotSelection, deselectAllShots } = usePostProductionStore.getState()
      
      toggleShotSelection('shot_1')
      toggleShotSelection('shot_2')
      toggleShotSelection('shot_3')
      
      deselectAllShots()

      const state = usePostProductionStore.getState()
      expect(state.selectedShots.size).toBe(0)
    })
  })

  describe('Settings Management', () => {
    it('should update settings', () => {
      const { updateSettings } = usePostProductionStore.getState()
      
      updateSettings({
        model: 'new-model',
        numOutputs: 3,
        quality: 'high'
      })

      const state = usePostProductionStore.getState()
      expect(state.settings.model).toBe('new-model')
      expect(state.settings.numOutputs).toBe(3)
      expect(state.settings.quality).toBe('high')
    })

    it('should partially update settings', () => {
      const { updateSettings } = usePostProductionStore.getState()
      
      const initialSettings = usePostProductionStore.getState().settings
      updateSettings({ quality: 'premium' })

      const state = usePostProductionStore.getState()
      expect(state.settings.model).toBe(initialSettings.model)
      expect(state.settings.numOutputs).toBe(initialSettings.numOutputs)
      expect(state.settings.quality).toBe('premium')
    })
  })

  describe('Job Management', () => {
    it('should add a job', () => {
      const job: ReplicateJob = {
        id: 'job_1',
        predictionId: 'pred_123',
        status: 'starting',
        shotId: 'shot_1',
        createdAt: new Date().toISOString()
      }

      const { addJob } = usePostProductionStore.getState()
      addJob(job)

      const state = usePostProductionStore.getState()
      expect(state.activeJobs).toHaveLength(1)
      expect(state.activeJobs[0].id).toBe('job_1')
    })

    it('should update a job', () => {
      const job: ReplicateJob = {
        id: 'job_1',
        predictionId: 'pred_123',
        status: 'starting',
        shotId: 'shot_1',
        createdAt: new Date().toISOString()
      }

      const { addJob, updateJob } = usePostProductionStore.getState()
      addJob(job)
      updateJob('job_1', { status: 'succeeded', outputs: ['image.jpg'] })

      const state = usePostProductionStore.getState()
      expect(state.activeJobs[0].status).toBe('succeeded')
      expect(state.activeJobs[0].outputs).toEqual(['image.jpg'])
    })

    it('should remove a job', () => {
      const job1: ReplicateJob = {
        id: 'job_1',
        predictionId: 'pred_123',
        status: 'starting',
        shotId: 'shot_1',
        createdAt: new Date().toISOString()
      }
      const job2: ReplicateJob = {
        id: 'job_2',
        predictionId: 'pred_456',
        status: 'starting',
        shotId: 'shot_2',
        createdAt: new Date().toISOString()
      }

      const { addJob, removeJob } = usePostProductionStore.getState()
      addJob(job1)
      addJob(job2)
      removeJob('job_1')

      const state = usePostProductionStore.getState()
      expect(state.activeJobs).toHaveLength(1)
      expect(state.activeJobs[0].id).toBe('job_2')
    })
  })

  describe('UI State Management', () => {
    it('should set generating state', () => {
      const { setIsGenerating } = usePostProductionStore.getState()
      
      setIsGenerating(true)
      expect(usePostProductionStore.getState().isGenerating).toBe(true)
      
      setIsGenerating(false)
      expect(usePostProductionStore.getState().isGenerating).toBe(false)
    })

    it('should update progress', () => {
      const { updateProgress } = usePostProductionStore.getState()
      
      updateProgress(5, 10)

      const state = usePostProductionStore.getState()
      expect(state.currentProgress).toBe(5)
      expect(state.totalProgress).toBe(10)
    })
  })

  describe('Store Reset', () => {
    it('should reset store to initial state', () => {
      const { addShots, toggleShotSelection, setIsGenerating, updateProgress, resetStore } = usePostProductionStore.getState()
      
      // Add some data
      const shots: PostProductionShot[] = [
        { id: 'shot_1', projectId: 'p1', projectType: 'story', shotNumber: 1, description: 'Shot 1', status: 'pending' }
      ]
      addShots(shots)
      toggleShotSelection('shot_1')
      setIsGenerating(true)
      updateProgress(3, 5)
      
      // Reset
      resetStore()
      
      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(0)
      expect(state.selectedShots.size).toBe(0)
      expect(state.isGenerating).toBe(false)
      expect(state.currentProgress).toBe(0)
      expect(state.totalProgress).toBe(0)
    })
  })
})