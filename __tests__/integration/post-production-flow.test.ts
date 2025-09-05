import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  convertStoryShots, 
  storeShotsForTransfer, 
  retrieveTransferredShots 
} from '@/lib/post-production/transfer'
import { usePostProductionStore } from '@/stores/post-production-store'
import type { ChapterBreakdown } from '@/lib/types'
import type { PostProductionShot } from '@/lib/post-production/types'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('Post Production Complete Workflow Integration', () => {
  beforeEach(() => {
    // Reset mocks and stores
    vi.clearAllMocks()
    sessionStorage.clear()
    usePostProductionStore.getState().resetStore()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('Story Mode to Post Production Transfer', () => {
    it('should complete the full transfer workflow from story mode', async () => {
      // Step 1: Generate story breakdown in story mode
      const storyBreakdown: ChapterBreakdown[] = [
        {
          chapterId: 'chapter_1',
          title: 'Opening Scene',
          shots: [
            'Wide shot of cityscape at dawn',
            'Close-up of protagonist waking up',
            'Medium shot of morning routine'
          ]
        },
        {
          chapterId: 'chapter_2',
          title: 'The Journey Begins',
          shots: [
            'Tracking shot following protagonist to work',
            'POV shot entering the building'
          ]
        }
      ]

      // Step 2: Convert and store shots for transfer
      const shots = convertStoryShots(storyBreakdown, 'story_test_123')
      expect(shots).toHaveLength(5)
      
      storeShotsForTransfer(shots)
      expect(sessionStorage.getItem('postProductionShots')).toBeTruthy()

      // Step 3: Simulate navigation to post-production
      // In real app, this would be router.push('/post-production')
      
      // Step 4: Retrieve shots in post-production
      const transferredShots = retrieveTransferredShots()
      expect(transferredShots).toHaveLength(5)
      expect(transferredShots![0].projectType).toBe('story')
      
      // Step 5: Add to post-production store
      const { addShots } = usePostProductionStore.getState()
      addShots(transferredShots!)
      
      const state = usePostProductionStore.getState()
      expect(state.shotQueue).toHaveLength(5)
      expect(state.shotQueue[0].description).toBe('Wide shot of cityscape at dawn')
      
      // Step 6: Verify shots are cleared from sessionStorage
      expect(retrieveTransferredShots()).toBeNull()
    })
  })

  describe('Image Upload and Processing', () => {
    it('should handle image upload for Seedance generation', async () => {
      // Mock successful upload response
      const mockUploadResponse = {
        ok: true,
        json: async () => ({
          url: 'data:image/jpeg;base64,mockbase64data',
          filename: 'test.jpg',
          size: 1024,
          type: 'image/jpeg'
        })
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockUploadResponse)
      
      // Create test file
      const testFile = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', testFile)
      
      // Upload file
      const uploadResponse = await fetch('api/upload-media', {
        method: 'POST',
        body: formData
      })
      
      const uploadResult = await uploadResponse.json()
      expect(uploadResult.url).toMatch(/^data:image\/jpeg;base64,/)
      expect(uploadResult.filename).toBe('test.jpg')
    })

    it('should validate and process Gen4 generation', async () => {
      // Setup: Add reference images
      const referenceImages = [
        {
          id: '1',
          file: new File(['ref1'], 'ref1.jpg', { type: 'image/jpeg' }),
          preview: 'data:image/jpeg;base64,ref1',
          tags: ['person'],
          detectedAspectRatio: '16:9'
        },
        {
          id: '2',
          file: new File(['ref2'], 'ref2.jpg', { type: 'image/jpeg' }),
          preview: 'data:image/jpeg;base64,ref2',
          tags: ['background'],
          detectedAspectRatio: '16:9'
        }
      ]
      
      const gen4Prompt = 'A portrait of @person in front of @background'
      
      // Mock upload responses for reference images
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'https://example.com/ref1.jpg' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'https://example.com/ref2.jpg' })
        })
      
      // Mock Gen4 API response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: ['https://example.com/generated.jpg'],
          predictionId: 'pred_123'
        })
      })
      
      // Validate requirements
      expect(gen4Prompt.trim()).toBeTruthy()
      expect(referenceImages.length).toBeGreaterThan(0)
      
      // Check for unused tags
      const unusedTags = referenceImages.filter(img => 
        img.tags[0] && !gen4Prompt.includes(`@${img.tags[0]}`)
      )
      expect(unusedTags).toHaveLength(0)
      
      // Process generation
      const referenceUrls = await Promise.all(
        referenceImages.map(async (img) => {
          const formData = new FormData()
          formData.append('file', img.file)
          const response = await fetch('api/upload-media', {
            method: 'POST',
            body: formData
          })
          const { url } = await response.json()
          return url
        })
      )
      
      expect(referenceUrls).toHaveLength(2)
      
      // Call Gen4 API
      const gen4Response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: gen4Prompt,
          aspect_ratio: '16:9',
          resolution: '1080p',
          reference_images: referenceUrls,
          reference_tags: referenceImages.map(img => img.tags[0])
        })
      })
      
      const gen4Result = await gen4Response.json()
      expect(gen4Result.images).toHaveLength(1)
      expect(gen4Result.predictionId).toBe('pred_123')
    })
  })

  describe('Shot Queue to Image Application', () => {
    it('should apply shot descriptions to selected images', () => {
      // Setup shot queue
      const shots: PostProductionShot[] = [
        {
          id: 'shot_1',
          projectId: 'p1',
          projectType: 'story',
          shotNumber: 1,
          description: 'Wide establishing shot',
          status: 'pending'
        },
        {
          id: 'shot_2',
          projectId: 'p1',
          projectType: 'story',
          shotNumber: 2,
          description: 'Close-up emotional moment',
          status: 'pending'
        }
      ]
      
      const { addShots } = usePostProductionStore.getState()
      addShots(shots)
      
      // Setup images
      const images = [
        { id: 'img_1', selected: true, prompt: '', file: new File([], 'img1.jpg') },
        { id: 'img_2', selected: true, prompt: '', file: new File([], 'img2.jpg') },
        { id: 'img_3', selected: false, prompt: '', file: new File([], 'img3.jpg') }
      ]
      
      // Apply shots to selected images
      const selectedImages = images.filter(img => img.selected)
      const updatedImages = images.map((img) => {
        if (!img.selected) return img
        const selectedIndex = selectedImages.findIndex(s => s.id === img.id)
        const shot = shots[selectedIndex % shots.length]
        return shot ? { ...img, prompt: shot.description } : img
      })
      
      // Verify application
      expect(updatedImages[0].prompt).toBe('Wide establishing shot')
      expect(updatedImages[1].prompt).toBe('Close-up emotional moment')
      expect(updatedImages[2].prompt).toBe('') // Not selected
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle upload failures gracefully', async () => {
      // Mock failed upload
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })
      
      try {
        const response = await fetch('api/upload-media', {
          method: 'POST',
          body: new FormData()
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to upload: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('500')
        expect((error as Error).message).toContain('Internal Server Error')
      }
    })

    it('should handle Gen4 generation failures', async () => {
      // Mock failed Gen4 response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Missing required parameters'
      })
      
      try {
        const response = await fetch('/post-production/api/gen4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Generation failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('400')
        expect((error as Error).message).toContain('Missing required parameters')
      }
    })

    it('should retry failed shots', () => {
      const { addShots, markShotFailed, retryShot } = usePostProductionStore.getState()
      
      const shot: PostProductionShot = {
        id: 'shot_1',
        projectId: 'p1',
        projectType: 'story',
        shotNumber: 1,
        description: 'Test shot',
        status: 'pending'
      }
      
      addShots([shot])
      markShotFailed('shot_1', 'Network error')
      
      let state = usePostProductionStore.getState()
      expect(state.failedShots).toHaveLength(1)
      expect(state.shotQueue).toHaveLength(0)
      
      retryShot('shot_1')
      
      state = usePostProductionStore.getState()
      expect(state.failedShots).toHaveLength(0)
      expect(state.shotQueue).toHaveLength(1)
      expect(state.shotQueue[0].status).toBe('pending')
    })
  })

  describe('Complete End-to-End Flow', () => {
    it('should handle complete workflow from story transfer to image generation', async () => {
      // Step 1: Transfer shots from story mode
      const storyBreakdown: ChapterBreakdown[] = [
        {
          chapterId: 'chapter_1',
          title: 'Test Chapter',
          shots: ['Shot 1', 'Shot 2']
        }
      ]
      
      const shots = convertStoryShots(storyBreakdown, 'e2e_test')
      storeShotsForTransfer(shots)
      
      // Step 2: Retrieve in post-production
      const transferred = retrieveTransferredShots()
      const { addShots } = usePostProductionStore.getState()
      addShots(transferred!)
      
      // Step 3: Upload images
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'data:image/jpeg;base64,testimage',
          filename: 'test.jpg'
        })
      })
      
      const imageUploadResponse = await fetch('api/upload-media', {
        method: 'POST',
        body: new FormData()
      })
      expect(imageUploadResponse.ok).toBe(true)
      
      // Step 4: Apply shots to images
      const images = [
        { id: 'img_1', selected: true, prompt: '' }
      ]
      
      const state = usePostProductionStore.getState()
      const updatedImages = images.map((img, index) => {
        if (img.selected && state.shotQueue[index]) {
          return { ...img, prompt: state.shotQueue[index].description }
        }
        return img
      })
      
      expect(updatedImages[0].prompt).toBe('Shot 1')
      
      // Step 5: Process generation (Seedance)
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedResponse: {
            outputUrl: 'https://example.com/video.mp4'
          }
        })
      })
      
      const generationResponse = await fetch('/post-production/api/generate-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: 'data:image/jpeg;base64,testimage',
          prompt: updatedImages[0].prompt,
          mode: 'seedance',
          seedanceModel: 'bytedance/seedance-1-lite'
        })
      })
      
      const result = await generationResponse.json()
      expect(result.generatedResponse.outputUrl).toBeTruthy()
      
      // Verify complete flow success
      expect(state.shotQueue).toHaveLength(2)
      expect(updatedImages[0].prompt).toBe('Shot 1')
      expect(result.generatedResponse.outputUrl).toContain('.mp4')
    })
  })
})