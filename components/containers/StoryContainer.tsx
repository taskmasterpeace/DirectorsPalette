'use client'

import { useState } from 'react'
import { StoryMode } from '@/components/story/StoryMode'
import { DirectorQuestionCards, type DirectorQuestion } from '@/components/story/DirectorQuestionCards'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { curatedFilmDirectors } from '@/lib/curated-directors'

export function StoryContainer() {
  const storyStore = useStoryStore()
  const entitiesStore = useStoryEntitiesStore()
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
        onStoryChange={storyStore.setStory}
        selectedDirector={storyStore.selectedDirector}
        onDirectorChange={storyStore.setSelectedDirector}
        directorNotes={storyStore.storyDirectorNotes}
        onDirectorNotesChange={storyStore.setStoryDirectorNotes}
        titleCardOptions={storyStore.titleCardOptions}
        onTitleCardOptionsChange={storyStore.setTitleCardOptions}
        promptOptions={storyStore.promptOptions}
        onPromptOptionsChange={storyStore.setPromptOptions}
        breakdown={storyStore.breakdown}
        onGenerateBreakdown={handleGenerateBreakdown}
        onClearBreakdown={handleClearStory}
        curatedDirectors={curatedFilmDirectors || []}
        customDirectors={customDirectors || []}
        onGenerateAdditionalShots={handleGenerateAdditionalShots}
        additionalShots={storyStore.additionalShots}
        expandedChapters={storyStore.expandedChapters}
        onToggleChapterExpansion={storyStore.toggleChapterExpansion}
        selectedChapter={storyStore.selectedChapter}
        onSelectChapter={storyStore.setSelectedChapter}
        showCustomDirectorForm={showCustomDirectorForm}
        onShowCustomDirectorForm={setShowCustomDirectorForm}
        customDirectorName={customDirectorName}
        onCustomDirectorNameChange={setCustomDirectorName}
        customDirectorDescription={customDirectorDescription}
        onCustomDirectorDescriptionChange={setCustomDirectorDescription}
        isGeneratingDirectorStyle={isGeneratingDirectorStyle}
        onCreateCustomDirector={handleCreateCustomDirector}
        showEntitiesConfig={entitiesStore.showEntitiesConfig}
        currentEntities={entitiesStore.currentEntities}
        extractedEntities={entitiesStore.extractedEntities}
        isExtracting={entitiesStore.isExtracting}
        onExtractEntities={handleExtractEntities}
        onEntitiesUpdate={entitiesStore.setCurrentEntities}
        onGenerateWithEntities={handleGenerateWithEntitiesClick}
        generationStage={generationStage}
        stageProgress={stageProgress}
        stageMessage={stageMessage}
        elapsedTime={elapsedTime}
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