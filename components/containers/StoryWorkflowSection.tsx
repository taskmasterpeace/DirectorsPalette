'use client'

import { MultiStageProgress } from '@/components/ui/multi-stage-progress'
import { UniversalShotSelector } from '@/components/shared/UniversalShotSelector'
import { StoryReferenceConfig } from '@/components/story/StoryReferenceConfig'
import { useStoryStore } from '@/stores/story-store'
import { useStoryWorkflowStore } from '@/stores/story-workflow-store'
import type { StoryContainerHandlers, StoryContainerState } from './StoryContainerTypes'

interface StoryWorkflowSectionProps extends StoryContainerHandlers, StoryContainerState {}

export function StoryWorkflowSection({
  isLoading,
  generationStage,
  stageProgress,
  stageMessage,
  elapsedTime,
  handleShotSelectionComplete,
  handleShotSelectionNext,
  handleGenerateWithReferences
}: StoryWorkflowSectionProps) {
  const storyStore = useStoryStore()
  const workflowStore = useStoryWorkflowStore()

  return (
    <>
      {/* Progress Tracking */}
      <MultiStageProgress
        stage={generationStage}
        currentStep={stageProgress.current}
        totalSteps={stageProgress.total}
        message={stageMessage}
        elapsedTime={elapsedTime / 1000}
        estimatedTime={30}
      />
      
      {/* Shot Selection Interface */}
      {workflowStore.showShotSelection && (
        <UniversalShotSelector
          mode="story"
          content={storyStore.story}
          onSelectionComplete={handleShotSelectionComplete}
          onNext={handleShotSelectionNext}
        />
      )}
      
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
    </>
  )
}