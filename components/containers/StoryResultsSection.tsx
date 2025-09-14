'use client'

import { StoryMode } from '@/components/story/StoryMode'
import { curatedFilmDirectors } from '@/lib/curated-directors'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useStoryWorkflowStore } from '@/stores/story-workflow-store'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import type { StoryContainerHandlers, StoryContainerState } from './StoryContainerTypes'

interface StoryResultsSectionProps extends StoryContainerHandlers, StoryContainerState {}

export function StoryResultsSection({
  isLoading,
  generationStage,
  stageProgress,
  stageMessage,
  elapsedTime,
  handleGenerateAdditionalShots,
  handleClearStory
}: StoryResultsSectionProps) {
  const storyStore = useStoryStore()
  const entitiesStore = useStoryEntitiesStore()
  const workflowStore = useStoryWorkflowStore()
  const { customDirectors } = useDirectorManagement()

  // Only show if we have a breakdown
  if (!storyStore.breakdown) {
    return null
  }

  return (
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
  )
}