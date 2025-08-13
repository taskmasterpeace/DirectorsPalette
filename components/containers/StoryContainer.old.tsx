'use client'

import { useState } from 'react'
import { StoryMode } from '@/components/story/StoryMode'
import { StoryReferenceConfig } from '@/components/story/StoryReferenceConfig'
import { DirectorQuestionCards, type DirectorQuestion } from '@/components/story/DirectorQuestionCards'
import { useStoryGeneration } from '@/hooks/useStoryGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useAppStore } from '@/stores/app-store'
import { curatedFilmDirectors } from '@/lib/curated-directors'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story'

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
  const [showReferenceConfig, setShowReferenceConfig] = useState(false)
  const [extractedReferences, setExtractedReferences] = useState<any>(null)
  const [isExtractingRefs, setIsExtractingRefs] = useState(false)

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

  // New two-stage generation flow
  const handleExtractReferences = async () => {
    if (!storyStore.story.trim()) return
    
    setIsExtractingRefs(true)
    try {
      const result = await extractStoryReferences(
        storyStore.story,
        storyStore.selectedDirector,
        storyStore.storyDirectorNotes
      )
      
      if (result.success) {
        setExtractedReferences(result.data)
        setShowReferenceConfig(true)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error extracting references:', error)
    } finally {
      setIsExtractingRefs(false)
    }
  }

  const handleGenerateWithReferences = async (configuredRefs: any) => {
    const { isLoading: appIsLoading, setIsLoading: setAppIsLoading } = useAppStore.getState()
    
    setAppIsLoading(true)
    try {
      const result = await generateStoryBreakdownWithReferences(
        storyStore.story,
        storyStore.selectedDirector,
        storyStore.storyDirectorNotes,
        configuredRefs,
        storyStore.titleCardOptions,
        storyStore.promptOptions,
        'ai-suggested',
        4
      )
      
      if (result.success && result.data) {
        storyStore.setBreakdown(result.data)
        setShowReferenceConfig(false)
        
        const chapters = result.data.chapters || []
        const expandedChapters = chapters.reduce((acc: any, chapter: any) => {
          acc[chapter.id] = true
          return acc
        }, {})
        storyStore.setExpandedChapters(expandedChapters)
      } else {
        throw new Error(result.error || 'Failed to generate breakdown')
      }
    } catch (error) {
      console.error('Error generating with references:', error)
    } finally {
      setAppIsLoading(false)
    }
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
        onGenerateBreakdown={handleExtractReferences}
        isExtractingReferences={isExtractingRefs}
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
      
      {showReferenceConfig && (
        <StoryReferenceConfig
          references={extractedReferences}
          isLoading={isLoading}
          onConfigurationComplete={handleGenerateWithReferences}
          onCancel={() => {
            setShowReferenceConfig(false)
            setExtractedReferences(null)
          }}
        />
      )}
    </>
  )
}