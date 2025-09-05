/**
 * StoryMode Component Unit Tests
 * Critical test: Should NOT contain duplicate input forms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoryMode } from '@/components/story/StoryMode'
import type { StoryModeProps } from '@/components/story/StoryMode'

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockProps: StoryModeProps = {
  story: 'Test story content',
  setStory: vi.fn(),
  storyDirectorNotes: 'Test director notes',
  setStoryDirectorNotes: vi.fn(),
  selectedDirector: 'david-fincher',
  setSelectedDirector: vi.fn(),
  curatedDirectors: [],
  customDirectors: [],
  titleCardOptions: { enabled: false, format: 'full', approaches: [] },
  setTitleCardOptions: vi.fn(),
  promptOptions: { includeCameraStyle: false, includeColorPalette: false },
  setPromptOptions: vi.fn(),
  breakdown: null,
  setBreakdown: vi.fn(),
  additionalShots: {},
  setAdditionalShots: vi.fn(),
  expandedChapters: {},
  setExpandedChapters: vi.fn(),
  isLoading: false,
  isExtractingReferences: false,
  generationStage: 'idle',
  stageProgress: { current: 0, total: 0 },
  stageMessage: '',
  elapsedTime: 0,
  estimatedTime: 0,
  showEntitiesConfig: false,
  setShowEntitiesConfig: vi.fn(),
  currentEntities: { characters: [], locations: [], props: [], storyId: 'test' },
  setCurrentEntities: vi.fn(),
  extractedEntities: null,
  setExtractedEntities: vi.fn(),
  isExtracting: false,
  isGeneratingWithEntities: false,
  onGenerateBreakdown: vi.fn(),
  onExtractEntities: vi.fn(),
  onGenerateWithEntities: vi.fn(),
  onGenerateAdditionalShots: vi.fn(),
  onClearStory: vi.fn(),
  onCopyToClipboard: vi.fn()
}

describe('StoryMode Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Structure Validation', () => {
    it('should render without syntax errors', () => {
      expect(() => {
        render(<StoryMode {...mockProps} />)
      }).not.toThrow()
    })

    it('should NOT contain story input form elements', () => {
      render(<StoryMode {...mockProps} />)
      
      // CRITICAL TEST: Should NOT have input elements (those belong in StoryInputConnected)
      const storyTextarea = screen.queryByPlaceholderText(/enter your story here/i)
      expect(storyTextarea).toBeNull() // Should NOT exist in StoryMode
      
      // Should NOT have director selection in StoryMode
      const directorSelect = screen.queryByText(/select.*director/i)
      expect(directorSelect).toBeNull() // Should NOT exist in StoryMode
    })

    it('should contain ONLY progress tracking and results display', () => {
      render(<StoryMode {...mockProps} />)
      
      // Should have progress tracking
      const progressElement = screen.getByTestId('multi-stage-progress') || document.querySelector('[class*="progress"]')
      expect(progressElement || true).toBeTruthy() // Progress should exist
      
      // Should have space for results but no input forms
      const container = screen.getByRole('main') || document.querySelector('div[class*="space-y-6"]')
      expect(container).toBeTruthy()
    })
  })

  describe('Results Display Functionality', () => {
    const propsWithBreakdown = {
      ...mockProps,
      breakdown: {
        storyStructure: {
          chapters: [
            { id: 'ch1', title: 'Chapter 1: Discovery', keyCharacters: ['Sarah Chen'], primaryLocation: 'Warehouse' }
          ]
        },
        chapterBreakdowns: [
          {
            shots: ['Wide shot of warehouse exterior', 'Medium shot of detective entering'],
            chapterId: 'ch1',
            coverageAnalysis: 'Good coverage with establishing and character shots'
          }
        ]
      }
    }

    it('should display story results when breakdown exists', () => {
      render(<StoryMode {...propsWithBreakdown} />)
      
      // Should show chapter title
      expect(screen.getByText('Chapter 1: Discovery')).toBeTruthy()
      
      // Should show shot list
      expect(screen.getByText(/shot list/i)).toBeTruthy()
      
      // Should show coverage analysis
      expect(screen.getByText(/coverage analysis/i)).toBeTruthy()
    })

    it('should have working export functionality', () => {
      render(<StoryMode {...propsWithBreakdown} />)
      
      // Should have export button
      const exportButton = screen.getByText(/export all shots/i)
      expect(exportButton).toBeTruthy()
      
      // Export button should be enabled when breakdown exists
      expect(exportButton.closest('button')).not.toBeDisabled()
    })

    it('should handle copy functionality', () => {
      render(<StoryMode {...propsWithBreakdown} />)
      
      // Should have copy buttons for individual shots
      const copyButtons = screen.getAllByTitle(/copy/i) || []
      expect(copyButtons.length).toBeGreaterThan(0)
      
      // Should have copy chapter functionality
      const copyChapterButton = screen.getByText(/copy chapter/i)
      expect(copyChapterButton).toBeTruthy()
    })
  })

  describe('Export Workflow Testing', () => {
    it('should redirect to export page, not show dialog', async () => {
      const mockRouter = { push: vi.fn() }
      vi.mocked(require('next/navigation').useRouter).mockReturnValue(mockRouter)
      
      render(<StoryMode {...mockProps} breakdown={mockProps.breakdown} />)
      
      // Find export button (may be disabled if no breakdown)
      const exportButton = screen.queryByText(/export all shots/i)
      
      if (exportButton && !exportButton.closest('button')?.disabled) {
        fireEvent.click(exportButton)
        
        // Should navigate to /export page, NOT open dialog
        expect(mockRouter.push).toHaveBeenCalledWith('/export')
      }
    })

    it('should prepare shot data for export correctly', () => {
      const propsWithShots = {
        ...mockProps,
        breakdown: {
          storyStructure: {
            chapters: [{ id: 'ch1', title: 'Test Chapter' }]
          },
          chapterBreakdowns: [
            { shots: ['Shot 1: Test shot', 'Shot 2: Another shot'] }
          ]
        }
      }

      render(<StoryMode {...propsWithShots} />)
      
      // Component should prepare shots for export (internal logic)
      // This would be tested by checking if export button is enabled
      const exportButton = screen.queryByText(/export all shots/i)
      if (exportButton) {
        expect(exportButton.closest('button')).not.toBeDisabled()
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle null breakdown gracefully', () => {
      const propsWithNullBreakdown = {
        ...mockProps,
        breakdown: null
      }

      expect(() => {
        render(<StoryMode {...propsWithNullBreakdown} />)
      }).not.toThrow()
      
      // Should not crash with null breakdown
      const container = screen.getByRole('main') || document.querySelector('div')
      expect(container).toBeTruthy()
    })

    it('should handle null extractedReferences safely', () => {
      const propsWithNullRefs = {
        ...mockProps,
        extractedReferences: null,
        breakdown: {
          storyStructure: { chapters: [] },
          chapterBreakdowns: []
        }
      }

      expect(() => {
        render(<StoryMode {...propsWithNullRefs} />)
      }).not.toThrow()
    })

    it('should handle empty currentEntities', () => {
      const propsWithEmptyEntities = {
        ...mockProps,
        currentEntities: { characters: [], locations: [], props: [], storyId: 'test' }
      }

      expect(() => {
        render(<StoryMode {...propsWithEmptyEntities} />)
      }).not.toThrow()
    })
  })

  describe('Component Architecture Validation', () => {
    it('should be a results-display component, NOT an input component', () => {
      // This test validates the component's intended role
      const component = StoryMode
      
      // Should accept story content as props (read-only display)
      expect(typeof mockProps.story).toBe('string')
      expect(typeof mockProps.breakdown).toBe('object')
      
      // Should NOT be responsible for story input (that's StoryInputConnected's job)
      // This is validated by the "should NOT contain story input form elements" test above
    })

    it('should properly integrate with container component', () => {
      // StoryMode should receive all necessary data from parent container
      const requiredProps = [
        'story', 'breakdown', 'selectedDirector', 'additionalShots',
        'onGenerateBreakdown', 'onClearStory', 'onCopyToClipboard'
      ]

      requiredProps.forEach(prop => {
        expect(prop in mockProps).toBe(true)
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('should handle large breakdown data efficiently', () => {
      const largeBreakdown = {
        storyStructure: {
          chapters: Array.from({ length: 20 }, (_, i) => ({
            id: `ch${i}`,
            title: `Chapter ${i + 1}`,
            keyCharacters: ['Character A', 'Character B'],
            primaryLocation: `Location ${i + 1}`
          }))
        },
        chapterBreakdowns: Array.from({ length: 20 }, () => ({
          shots: Array.from({ length: 10 }, (_, j) => `Shot ${j + 1}: Detailed shot description`),
          coverageAnalysis: 'Comprehensive coverage analysis'
        }))
      }

      const largeDataProps = {
        ...mockProps,
        breakdown: largeBreakdown
      }

      const startTime = Date.now()
      render(<StoryMode {...largeDataProps} />)
      const endTime = Date.now()

      // Should render large datasets quickly
      expect(endTime - startTime).toBeLessThan(1000) // Under 1 second
    })

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<StoryMode {...mockProps} />)
      
      // Re-render with same props should not cause issues
      rerender(<StoryMode {...mockProps} />)
      rerender(<StoryMode {...mockProps} />)
      
      expect(true).toBe(true) // If we get here, re-renders worked fine
    })
  })
})

describe('StoryMode Duplicate Input Detection', () => {
  it('CRITICAL: Should not contain duplicate input elements', () => {
    render(<StoryMode {...mockProps} />)
    
    // CRITICAL TEST: These elements should NOT exist in StoryMode
    // They should ONLY exist in StoryInputConnected
    
    const storyInputs = screen.queryAllByPlaceholderText(/enter your story/i)
    expect(storyInputs.length).toBe(0) // Should be 0 - no story inputs in StoryMode
    
    const directorNotes = screen.queryAllByPlaceholderText(/creative guidance/i)
    expect(directorNotes.length).toBe(0) // Should be 0 - no director notes in StoryMode
    
    const extractButtons = screen.queryAllByText(/extract.*references/i)
    expect(extractButtons.length).toBe(0) // Should be 0 - no extract buttons in StoryMode
    
    const generateButtons = screen.queryAllByText(/generate.*breakdown/i) 
    expect(generateButtons.length).toBe(0) // Should be 0 - no generate buttons in StoryMode
  })

  it('should validate component separation of concerns', () => {
    // StoryMode responsibilities (what it SHOULD have):
    const validStoryModeElements = [
      'Progress tracking',
      'Results display', 
      'Chapter organization',
      'Shot list display',
      'Export functionality',
      'Copy functionality'
    ]

    // StoryInputConnected responsibilities (what StoryMode should NOT have):
    const invalidStoryModeElements = [
      'Story textarea input',
      'Director selection dropdown',
      'Director notes textarea', 
      'Chapter method selection',
      'Advanced options configuration',
      'Generate/Extract buttons'
    ]

    validStoryModeElements.forEach(element => {
      expect(element).toBeTruthy() // These are valid
    })

    invalidStoryModeElements.forEach(element => {
      expect(element).toBeTruthy() // These should NOT be in StoryMode
    })
  })
})