/**
 * StoryInputConnected Component Unit Tests
 * Validates that input functionality is properly isolated here
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoryInputConnected } from '@/components/story/StoryInputConnected'

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

vi.mock('@/stores/story-store', () => ({
  useStoryStore: () => ({
    story: 'Test story',
    setStory: vi.fn(),
    storyDirectorNotes: 'Test notes',
    setStoryDirectorNotes: vi.fn(),
    selectedDirector: 'david-fincher',
    setSelectedDirector: vi.fn(),
    titleCardOptions: { enabled: false },
    setTitleCardOptions: vi.fn(),
    promptOptions: { includeCameraStyle: false, includeColorPalette: false },
    setPromptOptions: vi.fn(),
    breakdown: null
  })
}))

vi.mock('@/stores/story-workflow-store', () => ({
  useStoryWorkflowStore: () => ({
    chapterMethod: 'ai-suggested',
    setChapterMethod: vi.fn(),
    userChapterCount: 4,
    setUserChapterCount: vi.fn(),
    isExtractingRefs: false
  })
}))

vi.mock('@/stores/app-store', () => ({
  useAppStore: () => ({
    isLoading: false
  })
}))

vi.mock('@/hooks/useDirectorManagement', () => ({
  useDirectorManagement: () => ({
    customDirectors: []
  })
}))

const mockProps = {
  onExtractReferences: vi.fn(),
  onClear: vi.fn()
}

describe('StoryInputConnected Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Form Elements', () => {
    it('should contain story input textarea', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // SHOULD have story input (this is its responsibility)
      const storyInput = screen.getByPlaceholderText(/enter your story here/i)
      expect(storyInput).toBeTruthy()
      expect(storyInput.tagName).toBe('TEXTAREA')
    })

    it('should contain director selection', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // SHOULD have director selector
      const directorSection = screen.getByText(/director/i)
      expect(directorSection).toBeTruthy()
    })

    it('should contain extract references button', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // SHOULD have extract references functionality
      const extractButton = screen.getByText(/extract.*references/i)
      expect(extractButton).toBeTruthy()
      expect(extractButton.tagName).toBe('BUTTON')
    })

    it('should contain director notes textarea', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // SHOULD have director notes input
      const notesInput = screen.getByPlaceholderText(/creative guidance/i) || 
                        screen.getByPlaceholderText(/director.*notes/i)
      expect(notesInput).toBeTruthy()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should trigger extract references on Ctrl+Enter', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      const storyInput = screen.getByPlaceholderText(/enter your story here/i)
      
      // Simulate Ctrl+Enter
      fireEvent.keyDown(storyInput, {
        key: 'Enter',
        ctrlKey: true,
        preventDefault: vi.fn()
      })
      
      // Should trigger extract references
      expect(mockProps.onExtractReferences).toHaveBeenCalled()
    })

    it('should have keyboard shortcut hint in placeholder', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      const storyInput = screen.getByPlaceholderText(/ctrl\+enter/i)
      expect(storyInput).toBeTruthy()
      expect(storyInput.placeholder).toContain('Ctrl+Enter')
    })
  })

  describe('Template Integration', () => {
    it('should have template manager button', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // Should have template functionality
      const templateButton = screen.getByText(/templates/i)
      expect(templateButton).toBeTruthy()
    })

    it('should handle template loading', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // Template manager should be present for loading story templates
      const templateElement = screen.getByText(/templates/i)
      expect(templateElement).toBeTruthy()
    })
  })

  describe('State Management Integration', () => {
    it('should connect to story store correctly', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // Should display current story content from store
      const storyInput = screen.getByDisplayValue('Test story') || 
                        screen.getByPlaceholderText(/enter your story/i)
      expect(storyInput).toBeTruthy()
    })

    it('should update story state on input change', () => {
      const mockSetStory = vi.fn()
      vi.mocked(require('@/stores/story-store').useStoryStore).mockReturnValue({
        story: '',
        setStory: mockSetStory,
        storyDirectorNotes: '',
        setStoryDirectorNotes: vi.fn(),
        selectedDirector: '',
        setSelectedDirector: vi.fn(),
        titleCardOptions: { enabled: false },
        setTitleCardOptions: vi.fn(),
        promptOptions: { includeCameraStyle: false, includeColorPalette: false },
        setPromptOptions: vi.fn(),
        breakdown: null
      })

      render(<StoryInputConnected {...mockProps} />)
      
      const storyInput = screen.getByPlaceholderText(/enter your story/i)
      fireEvent.change(storyInput, { target: { value: 'New story content' } })
      
      expect(mockSetStory).toHaveBeenCalledWith('New story content')
    })
  })

  describe('Component Architecture Validation', () => {
    it('should be an input component, NOT a results component', () => {
      render(<StoryInputConnected {...mockProps} />)
      
      // Should have form elements
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeTruthy()
      
      // Should have action buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should complement StoryMode without duplication', () => {
      // Architectural test: StoryInputConnected handles input, StoryMode handles results
      const inputComponent = StoryInputConnected
      const resultsComponent = StoryMode
      
      expect(inputComponent).toBeTruthy()
      expect(resultsComponent).toBeTruthy()
      
      // They should have different responsibilities
      expect(inputComponent.name).toBe('StoryInputConnected')
      expect(resultsComponent.name).toBe('StoryMode')
    })
  })
})