'use client'

import { StoryInputConnected } from '@/components/story/StoryInputConnected'
import { TemplateBanner } from '@/components/shared/TemplateBanner'
import { StoryMode } from '@/components/story/StoryMode'
import { StoryReferenceConfig } from '@/components/story/StoryReferenceConfig'
import { DirectorQuestionCards, type DirectorQuestion } from '@/components/story/DirectorQuestionCards'
import { MultiStageProgress } from '@/components/ui/multi-stage-progress'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useStoryWorkflowStore } from '@/stores/story-workflow-store'
import { useAppStore } from '@/stores/app-store'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story/references'
import { useToast } from '@/components/ui/use-toast'
import { curatedFilmDirectors } from '@/lib/curated-directors'

/**
 * Refactored StoryContainer - now a thin coordinator
 * Delegates input, workflow, and results to specialized components
 */
export function StoryContainer() {
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
  const handleExtractReferences = async () => {
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
        workflowStore.setShowReferenceConfig(true)
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
  }
  
  // Handle generation with configured references
  const handleGenerateWithReferences = async (configuredRefs: any) => {
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
        4
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
  }
  
  return (
    <div className="space-y-6">
      {/* Template Banner */}
      <TemplateBanner
        mode="story"
        templates={[]} // TODO: Add actual templates
        selectedTemplate={null}
        onTemplateSelect={() => {}} // TODO: Implement template selection
        onCreateNew={() => {}} // TODO: Implement template creation
      />
      
      {/* Story Input Section - Now connected directly to stores */}
      <StoryInputConnected
        onExtractReferences={handleExtractReferences}
        onClear={handleClearStory}
      />
      
      {/* Progress Tracking */}
      <MultiStageProgress
        stage={generationStage}
        currentStep={stageProgress.current}
        totalSteps={stageProgress.total}
        message={stageMessage}
        elapsedTime={elapsedTime / 1000}
        estimatedTime={30}
      />
      
      {/* Reference Configuration Dialog */}
      {workflowStore.showReferenceConfig && (
        <StoryReferenceConfig
          references={workflowStore.extractedReferences}
          isLoading={isLoading}
          onConfigurationComplete={handleGenerateWithReferences}
          onCancel={() => {
            workflowStore.setShowReferenceConfig(false)
            workflowStore.setExtractedReferences(null)
          }}
        />
      )}
      
      {/* Results Display - Only show if we have a breakdown */}
      {storyStore.breakdown && (
        <StoryMode
          story={storyStore.story}
          setStory={storyStore.setStory}
          storyDirectorNotes={storyStore.storyDirectorNotes}
          setStoryDirectorNotes={storyStore.setStoryDirectorNotes}
          selectedDirector={storyStore.selectedDirector}
          setSelectedDirector={storyStore.setSelectedDirector}
          curatedDirectors={curatedFilmDirectors || []}
          customDirectors={customDirectors || []}
          titleCardOptions={storyStore.titleCardOptions}
          setTitleCardOptions={storyStore.setTitleCardOptions}
          promptOptions={storyStore.promptOptions}
          setPromptOptions={storyStore.setPromptOptions}
          breakdown={storyStore.breakdown}
          setBreakdown={storyStore.setBreakdown}
          additionalShots={storyStore.additionalShots}
          setAdditionalShots={storyStore.setAdditionalShots}
          expandedChapters={storyStore.expandedChapters}
          setExpandedChapters={storyStore.setExpandedChapters}
          isLoading={isLoading}
          generationStage={generationStage}
          stageProgress={stageProgress}
          stageMessage={stageMessage}
          elapsedTime={elapsedTime}
          estimatedTime={30000}
          showEntitiesConfig={entitiesStore.showEntitiesConfig}
          setShowEntitiesConfig={entitiesStore.setShowEntitiesConfig}
          currentEntities={entitiesStore.currentEntities}
          setCurrentEntities={entitiesStore.setCurrentEntities}
          extractedEntities={entitiesStore.extractedEntities}
          setExtractedEntities={entitiesStore.setExtractedEntities}
          isExtracting={entitiesStore.isExtracting}
          isGeneratingWithEntities={entitiesStore.isGeneratingWithEntities}
          onGenerateBreakdown={() => {}} // Already handled above
          isExtractingReferences={workflowStore.isExtractingRefs}
          onExtractEntities={() => {}}
          onGenerateWithEntities={() => {}}
          onGenerateAdditionalShots={handleGenerateAdditionalShots}
          onClearStory={handleClearStory}
          onCopyToClipboard={(text: string) => {
            navigator.clipboard.writeText(text).catch(console.error)
          }}
        />
      )}
    </div>
  )
}