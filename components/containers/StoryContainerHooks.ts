'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useStoryWorkflowStore } from '@/stores/story-workflow-store'
import { useAppStore } from '@/stores/app-store'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story/references'
import type { StoryContainerHandlers, StoryContainerState } from './StoryContainerTypes'

export function useStoryContainer(): StoryContainerState & StoryContainerHandlers {
  const { toast } = useToast()
  const storyStore = useStoryStore()
  const entitiesStore = useStoryEntitiesStore()
  const workflowStore = useStoryWorkflowStore()
  const { isLoading, setIsLoading } = useAppStore()
  
  // Custom hooks for specific concerns
  const {
    generationStage,
    stageProgress,
    stageMessage,
    elapsedTime,
    handleGenerateAdditionalShots,
    handleClearStory
  } = useStoryGeneration()
  
  const { customDirectors } = useDirectorManagement()

  // Handle reference extraction with improved error handling
  const handleExtractReferences = useCallback(async () => {
    if (!storyStore.story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter a story to extract references.",
        variant: "destructive"
      })
      return
    }
    
    workflowStore.setIsExtractingRefs(true)
    try {
      const result = await extractStoryReferences(
        storyStore.story,
        storyStore.selectedDirector,
        storyStore.storyDirectorNotes
      )
      
      if (result.success) {
        workflowStore.setExtractedReferences(result.data)
        workflowStore.setShowShotSelection(true)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error extracting references:', error)
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract references",
        variant: "destructive"
      })
    } finally {
      workflowStore.setIsExtractingRefs(false)
    }
  }, [storyStore.story, storyStore.selectedDirector, storyStore.storyDirectorNotes, workflowStore, toast])

  // Handle shot selection completion
  const handleShotSelectionComplete = useCallback((method: 'auto' | 'manual', selections?: any[]) => {
    workflowStore.setShotSelectionMethod(method)
    if (method === 'manual' && selections) {
      workflowStore.setManualShotSelections(selections)
    }
    workflowStore.setShowShotSelection(false)
    workflowStore.setShowReferenceConfig(true)
  }, [workflowStore])
  
  const handleShotSelectionNext = useCallback(() => {
    // After shot selection, proceed to reference configuration
    workflowStore.setShowReferenceConfig(true)
  }, [workflowStore])

  // Handle generation with configured references
  const handleGenerateWithReferences = useCallback(async (configuredRefs: any) => {
    setIsLoading(true)
    try {
      // Serialize all data to avoid SSR issues
      const serializedTitleCardOptions = {
        enabled: Boolean(storyStore.titleCardOptions?.enabled),
        format: storyStore.titleCardOptions?.format || "full",
        approaches: Array.isArray(storyStore.titleCardOptions?.approaches) 
          ? storyStore.titleCardOptions.approaches 
          : []
      }
      
      const serializedPromptOptions = {
        includeCameraStyle: Boolean(storyStore.promptOptions?.includeCameraStyle),
        includeColorPalette: Boolean(storyStore.promptOptions?.includeColorPalette)
      }
      
      console.log('🔍 Calling server action with serialized data...')
      
      const result = await generateStoryBreakdownWithReferences(
        storyStore.story,
        storyStore.selectedDirector,
        storyStore.storyDirectorNotes,
        configuredRefs,
        Boolean(storyStore.titleCardOptions?.enabled),
        Boolean(storyStore.promptOptions?.includeCameraStyle),
        Boolean(storyStore.promptOptions?.includeColorPalette),
        'ai-suggested',
        4,
        workflowStore.shotSelectionMethod || 'auto',
        workflowStore.manualShotSelections
      )
      
      if (result.success && result.data) {
        storyStore.setBreakdown(result.data)
        workflowStore.setShowReferenceConfig(false)
        
        // Expand all chapters
        const chapters = result.data.chapters || []
        const expandedChapters = chapters.reduce((acc: any, chapter: any) => {
          acc[chapter.id] = true
          return acc
        }, {})
        storyStore.setExpandedChapters(expandedChapters)
        
        toast({
          title: "Breakdown Generated",
          description: `Successfully generated ${chapters.length} chapters`
        })
      } else {
        throw new Error(result.error || 'Failed to generate breakdown')
      }
    } catch (error) {
      console.error('Error generating with references:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate breakdown",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [storyStore, workflowStore, setIsLoading, toast])

  return {
    // State
    isLoading,
    generationStage,
    stageProgress,
    stageMessage,
    elapsedTime,
    
    // Handlers
    handleExtractReferences,
    handleShotSelectionComplete,
    handleShotSelectionNext,
    handleGenerateWithReferences,
    handleGenerateAdditionalShots,
    handleClearStory
  }
}