'use client'

import { StoryInputSection } from './StoryInputSection'
import { StoryWorkflowSection } from './StoryWorkflowSection'
import { StoryResultsSection } from './StoryResultsSection'
import { useStoryContainer } from './StoryContainerHooks'

/**
 * Ultra-thin StoryContainer orchestrator
 * Coordinates input, workflow, and results sections
 * Following ultra-thin architecture standards: under 100 lines
 */
export function StoryContainerRefactored() {
  const {
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
  } = useStoryContainer()

  return (
    <div className="space-y-6">
      {/* Story Input and Templates */}
      <StoryInputSection
        onExtractReferences={handleExtractReferences}
        onClearStory={handleClearStory}
      />
      
      {/* Workflow: Progress, Shot Selection, Reference Config */}
      <StoryWorkflowSection
        isLoading={isLoading}
        generationStage={generationStage}
        stageProgress={stageProgress}
        stageMessage={stageMessage}
        elapsedTime={elapsedTime}
        handleShotSelectionComplete={handleShotSelectionComplete}
        handleShotSelectionNext={handleShotSelectionNext}
        handleGenerateWithReferences={handleGenerateWithReferences}
        handleGenerateAdditionalShots={handleGenerateAdditionalShots}
        handleClearStory={handleClearStory}
        handleExtractReferences={handleExtractReferences}
      />
      
      {/* Results Display */}
      <StoryResultsSection
        isLoading={isLoading}
        generationStage={generationStage}
        stageProgress={stageProgress}
        stageMessage={stageMessage}
        elapsedTime={elapsedTime}
        handleExtractReferences={handleExtractReferences}
        handleShotSelectionComplete={handleShotSelectionComplete}
        handleShotSelectionNext={handleShotSelectionNext}
        handleGenerateWithReferences={handleGenerateWithReferences}
        handleGenerateAdditionalShots={handleGenerateAdditionalShots}
        handleClearStory={handleClearStory}
      />
    </div>
  )
}