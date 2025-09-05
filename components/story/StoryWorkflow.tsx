'use client'

import { useState } from 'react'
import { StoryReferenceConfig } from './StoryReferenceConfig'
import { DirectorQuestionCards, type DirectorQuestion } from './DirectorQuestionCards'
import { MultiStageProgress } from '@/components/ui/multi-stage-progress'
import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story/references'
import { useToast } from '@/components/ui/use-toast'

interface StoryWorkflowProps {
  // Story data
  story: string
  selectedDirector: string
  directorNotes: string
  titleCardOptions: any
  promptOptions: any
  chapterMethod: string
  userChapterCount: number
  
  // Workflow state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Results
  onBreakdownComplete: (breakdown: any) => void
  
  // Progress tracking
  generationStage: 'idle' | 'structure' | 'breakdowns' | 'complete'
  stageProgress: { current: number; total: number }
  stageMessage: string
  elapsedTime: number
  estimatedTime: number
}

export function StoryWorkflow({
  story,
  selectedDirector,
  directorNotes,
  titleCardOptions,
  promptOptions,
  chapterMethod,
  userChapterCount,
  isLoading,
  setIsLoading,
  onBreakdownComplete,
  generationStage,
  stageProgress,
  stageMessage,
  elapsedTime,
  estimatedTime
}: StoryWorkflowProps) {
  const { toast } = useToast()
  const [showReferenceConfig, setShowReferenceConfig] = useState(false)
  const [extractedReferences, setExtractedReferences] = useState<any>(null)
  const [showDirectorQuestions, setShowDirectorQuestions] = useState(false)
  const [isExtractingRefs, setIsExtractingRefs] = useState(false)

  const handleExtractReferences = async () => {
    if (!story.trim()) return
    
    setIsExtractingRefs(true)
    try {
      const result = await extractStoryReferences(
        story,
        selectedDirector,
        directorNotes
      )
      
      if (result.success) {
        setExtractedReferences(result.data)
        setShowReferenceConfig(true)
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
      setIsExtractingRefs(false)
    }
  }

  const handleGenerateWithReferences = async (configuredRefs: any) => {
    setIsLoading(true)
    try {
      const result = await generateStoryBreakdownWithReferences(
        story,
        selectedDirector,
        directorNotes,
        configuredRefs,
        titleCardOptions,
        promptOptions,
        chapterMethod,
        userChapterCount
      )
      
      if (result.success && result.data) {
        onBreakdownComplete(result.data)
        setShowReferenceConfig(false)
        
        toast({
          title: "Breakdown Generated",
          description: `Successfully generated ${result.data.chapters?.length || 0} chapters`
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

  const handleDirectorQuestionsAnswered = async (answers: DirectorQuestion[]) => {
    setShowDirectorQuestions(false)
    // Handle director questions if needed
  }

  return (
    <>
      {/* Progress Tracking */}
      <MultiStageProgress
        stage={generationStage}
        currentStep={stageProgress.current}
        totalSteps={stageProgress.total}
        message={stageMessage}
        elapsedTime={elapsedTime / 1000}
        estimatedTime={estimatedTime / 1000}
      />

      {/* Reference Configuration Dialog */}
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

      {/* Director Questions Dialog */}
      {showDirectorQuestions && selectedDirector && (
        <DirectorQuestionCards
          director={selectedDirector}
          story={story}
          onAnswersComplete={handleDirectorQuestionsAnswered}
          onCancel={() => setShowDirectorQuestions(false)}
        />
      )}
    </>
  )
}

// Export the extraction handler for parent component
export { handleExtractReferences }