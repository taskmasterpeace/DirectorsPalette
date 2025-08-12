'use client'

import { useState } from 'react'
import { StoryMode } from '@/components/story/StoryMode'
import { DirectorQuestionCards, type DirectorQuestion } from '@/components/story/DirectorQuestionCards'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useAppStore } from '@/stores/app-store'
import { curatedFilmDirectors } from '@/lib/curated-directors'

export function StoryContainer() {
  const storyStore = useStoryStore()
  const entitiesStore = useStoryEntitiesStore()
  const { isLoading } = useAppStore()
  const {
    generationStage,
    stageProgress,
    stageMessage,
    elapsedTime,
    handleGenerateBreakdown,
    handleGenerateAdditionalShots,
    handleExtractEntities,
    handleGenerateWithEntities,
    handleClearStory
  } = useStoryGeneration()
  
  const {
    customDirectors,
    showCustomDirectorForm,
    customDirectorName,
    customDirectorDescription,
    isGeneratingDirectorStyle,
    handleCreateCustomDirector,
    setShowCustomDirectorForm,
    setCustomDirectorName,
    setCustomDirectorDescription
  } = useDirectorManagement()

  const [showDirectorQuestions, setShowDirectorQuestions] = useState(false)
  const [directorAnswers, setDirectorAnswers] = useState<DirectorQuestion[]>([])

  const handleDirectorQuestionsAnswered = async (answers: DirectorQuestion[]) => {
    setDirectorAnswers(answers)
    setShowDirectorQuestions(false)
    await handleGenerateWithEntities(answers)
  }

  const handleGenerateWithEntitiesClick = () => {
    if (!storyStore.story.trim()) return
    entitiesStore.setShowEntitiesConfig(false)
    setShowDirectorQuestions(true)
  }

  return (
    <>
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
        onGenerateBreakdown={handleGenerateBreakdown}
        onExtractEntities={handleExtractEntities}
        onGenerateWithEntities={handleGenerateWithEntitiesClick}
        onGenerateAdditionalShots={handleGenerateAdditionalShots}
        onClearStory={handleClearStory}
        onCopyToClipboard={(text: string) => {
          navigator.clipboard.writeText(text).catch(console.error)
        }}
      />
      
      {showDirectorQuestions && storyStore.selectedDirector && (
        <DirectorQuestionCards
          director={storyStore.selectedDirector}
          story={storyStore.story}
          onAnswersComplete={handleDirectorQuestionsAnswered}
          onCancel={() => setShowDirectorQuestions(false)}
        />
      )}
    </>
  )
}