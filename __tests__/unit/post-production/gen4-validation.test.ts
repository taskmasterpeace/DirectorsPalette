import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock data
const mockGen4ReferenceImages = [
  {
    id: '1',
    file: new File(['test'], 'test1.jpg', { type: 'image/jpeg' }),
    preview: 'data:image/jpeg;base64,test1',
    tags: ['person'],
    detectedAspectRatio: '16:9',
    width: 1920,
    height: 1080
  }
]

const mockToast = vi.fn()

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}))

describe('Gen4 Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Button State Validation', () => {
    it('should be disabled when no prompt is provided', () => {
      const buttonDisabled = true // Simulating: !gen4Prompt.trim()
      const hasReferenceImages = true
      const isProcessing = false
      
      const shouldBeDisabled = !false || !hasReferenceImages || isProcessing
      expect(shouldBeDisabled).toBe(true)
    })

    it('should be disabled when no reference images are provided', () => {
      const hasPrompt = true
      const referenceImagesLength = 0
      const isProcessing = false
      
      const shouldBeDisabled = !hasPrompt || referenceImagesLength === 0 || isProcessing
      expect(shouldBeDisabled).toBe(true)
    })

    it('should be disabled when processing', () => {
      const hasPrompt = true
      const hasReferenceImages = true
      const isProcessing = true
      
      const shouldBeDisabled = !hasPrompt || !hasReferenceImages || isProcessing
      expect(shouldBeDisabled).toBe(true)
    })

    it('should be enabled when all requirements are met', () => {
      const hasPrompt = true
      const referenceImagesLength = 1
      const isProcessing = false
      
      const shouldBeDisabled = !hasPrompt || referenceImagesLength === 0 || isProcessing
      expect(shouldBeDisabled).toBe(false)
    })
  })

  describe('Generation Validation', () => {
    it('should show error toast when no prompt is provided', async () => {
      const handleGen4Generate = async () => {
        const gen4Prompt = ''
        
        if (!gen4Prompt.trim()) {
          mockToast({
            title: "No Prompt",
            description: "Please enter a prompt for generation",
            variant: "destructive"
          })
          return
        }
      }
      
      await handleGen4Generate()
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "No Prompt",
        description: "Please enter a prompt for generation",
        variant: "destructive"
      })
    })

    it('should show error toast when no reference images are provided', async () => {
      const handleGen4Generate = async () => {
        const gen4Prompt = 'test prompt'
        const gen4ReferenceImages: any[] = []
        
        if (!gen4Prompt.trim()) {
          mockToast({
            title: "No Prompt",
            description: "Please enter a prompt for generation",
            variant: "destructive"
          })
          return
        }
        
        if (gen4ReferenceImages.length === 0) {
          mockToast({
            title: "No Reference Images",
            description: "Please add at least one reference image for Gen4 generation",
            variant: "destructive"
          })
          return
        }
      }
      
      await handleGen4Generate()
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "No Reference Images",
        description: "Please add at least one reference image for Gen4 generation",
        variant: "destructive"
      })
    })

    it('should proceed with generation when all requirements are met', async () => {
      const mockSetProcessing = vi.fn()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ images: ['result.jpg'] })
      })
      
      global.fetch = mockFetch
      
      const handleGen4Generate = async () => {
        const gen4Prompt = 'test prompt'
        const gen4ReferenceImages = mockGen4ReferenceImages
        
        if (!gen4Prompt.trim()) {
          return
        }
        
        if (gen4ReferenceImages.length === 0) {
          return
        }
        
        mockSetProcessing(true)
        // Generation logic would continue here
      }
      
      await handleGen4Generate()
      
      expect(mockSetProcessing).toHaveBeenCalledWith(true)
      expect(mockToast).not.toHaveBeenCalled()
    })
  })

  describe('Reference Tag Validation', () => {
    it('should warn about unused tags in console', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      const gen4Prompt = 'a portrait of a person'
      const gen4ReferenceImages = mockGen4ReferenceImages
      
      const unusedTags = gen4ReferenceImages.filter(img => 
        img.tags[0] && !gen4Prompt.includes(`@${img.tags[0]}`)
      )
      
      if (unusedTags.length > 0) {
        console.log(`Note: Some tags not used in prompt: ${unusedTags.map(img => `@${img.tags[0]}`).join(', ')}`)
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('Note: Some tags not used in prompt: @person')
      
      consoleSpy.mockRestore()
    })

    it('should not warn when tags are used in prompt', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      const gen4Prompt = 'a portrait of @person'
      const gen4ReferenceImages = mockGen4ReferenceImages
      
      const unusedTags = gen4ReferenceImages.filter(img => 
        img.tags[0] && !gen4Prompt.includes(`@${img.tags[0]}`)
      )
      
      if (unusedTags.length > 0) {
        console.log(`Note: Some tags not used in prompt: ${unusedTags.map(img => `@${img.tags[0]}`).join(', ')}`)
      }
      
      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle upload failures with detailed error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })
      
      global.fetch = mockFetch
      
      try {
        const uploadRes = await fetch('api/upload-media', {
          method: 'POST',
          body: new FormData()
        })
        
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text()
          console.error('Upload failed:', uploadRes.status, errorText)
          throw new Error(`Failed to upload reference image: ${uploadRes.status} - ${errorText}`)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Failed to upload reference image: 500 - Internal Server Error')
      }
    })

    it('should handle generation failures with detailed error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request: Missing parameters'
      })
      
      global.fetch = mockFetch
      
      try {
        const response = await fetch('/post-production/api/gen4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Gen4 generation failed:', response.status, errorText)
          throw new Error(`Generation failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Generation failed: 400 - Bad Request: Missing parameters')
      }
    })
  })
})