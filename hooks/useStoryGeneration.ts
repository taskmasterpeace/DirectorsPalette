import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useStoryStore } from '@/stores/story-store'
import { useStoryEntitiesStore } from '@/stores/story-entities-store'
import { useAppStore } from '@/stores/app-store'
import { generateBreakdown, generateAdditionalChapterShots } from '@/app/actions-story'
import { extractStoryEntities, generateStoryBreakdownWithEntities } from '@/app/actions/story-actions'
import type { DirectorQuestion } from '@/components/story/DirectorQuestionCards'

export function useStoryGeneration() {
  const { toast } = useToast()
  const { setIsLoading } = useAppStore()
  const storyStore = useStoryStore()
  const entitiesStore = useStoryEntitiesStore()
  
  // Progress tracking state
  const [generationStage, setGenerationStage] = useState<'idle' | 'structure' | 'breakdowns' | 'complete'>('idle')
  const [stageProgress, setStageProgress] = useState({ current: 0, total: 0 })
  const [stageMessage, setStageMessage] = useState('')
  const [generationStartTime, setGenerationStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [generationHistory, setGenerationHistory] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('story-generation-times')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const handleGenerateBreakdown = useCallback(async (chapterMethod: string = 'ai-suggested', userChapterCount: number = 4) => {
    const { story, selectedDirector, storyDirectorNotes, titleCardOptions, promptOptions } = storyStore
    
    if (!story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter a story to generate a breakdown.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setGenerationStage('structure')
    setStageMessage('Analyzing story structure...')
    setGenerationStartTime(Date.now())
    
    const progressInterval = setInterval(() => {
      setElapsedTime(Date.now() - generationStartTime)
    }, 100)

    try {
      const result = await generateBreakdown(
        story,
        selectedDirector,
        storyDirectorNotes,
        titleCardOptions || undefined,
        promptOptions || undefined,
        chapterMethod,
        userChapterCount,
        (stage, current, total, message) => {
          setGenerationStage(stage as any)
          setStageProgress({ current, total })
          setStageMessage(message || '')
        }
      )

      if (result.success && result.data) {
        storyStore.setBreakdown(result.data)
        
        const chapters = result.data.chapters || []
        const expandedChapters = chapters.reduce((acc, chapter) => {
          acc[chapter.id] = true
          return acc
        }, {} as Record<string, boolean>)
        storyStore.setExpandedChapters(expandedChapters)

        toast({
          title: "Breakdown Generated",
          description: `Successfully generated ${chapters.length} chapters`
        })

        // Record generation time
        const generationTime = Date.now() - generationStartTime
        const newHistory = [...generationHistory, generationTime].slice(-10)
        setGenerationHistory(newHistory)
        localStorage.setItem('story-generation-times', JSON.stringify(newHistory))
      } else {
        throw new Error(result.error || 'Failed to generate breakdown')
      }
    } catch (error) {
      console.error('Error generating breakdown:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate breakdown",
        variant: "destructive"
      })
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setGenerationStage('complete')
      setTimeout(() => setGenerationStage('idle'), 2000)
    }
  }, [storyStore, setIsLoading, toast, generationStartTime, generationHistory])

  const handleGenerateAdditionalShots = useCallback(async (
    chapterId: string,
    categories: string[],
    customRequest: string
  ) => {
    const { breakdown, selectedDirector } = storyStore
    
    if (!breakdown || !breakdown.chapters) return

    setIsLoading(true)
    try {
      const chapter = breakdown.chapters?.find(c => c.id === chapterId)
      if (!chapter) throw new Error('Chapter not found')

      const result = await generateAdditionalChapterShots(
        chapter,
        breakdown.storyTitle || 'Story',
        selectedDirector,
        categories,
        customRequest
      )

      if (result.success && result.data) {
        storyStore.addAdditionalShots(chapterId, result.data)
        toast({
          title: "Additional Shots Generated",
          description: `Generated ${result.data.length} additional shots`
        })
      } else {
        throw new Error(result.error || 'Failed to generate shots')
      }
    } catch (error) {
      console.error('Error generating additional shots:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate additional shots",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [storyStore, setIsLoading, toast])

  const handleExtractEntities = useCallback(async () => {
    const { story } = storyStore
    
    if (!story.trim()) {
      toast({
        title: "Story Required",
        description: "Please enter a story to extract entities.",
        variant: "destructive"
      })
      return
    }

    entitiesStore.setIsExtracting(true)
    try {
      const result = await extractStoryEntities(story)
      if (result.success && result.data) {
        entitiesStore.setExtractedEntities(result.data)
        entitiesStore.setCurrentEntities(result.data)
        entitiesStore.setShowEntitiesConfig(true)
      } else {
        throw new Error(result.error || 'Failed to extract entities')
      }
    } catch (error) {
      console.error('Error extracting entities:', error)
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract entities",
        variant: "destructive"
      })
    } finally {
      entitiesStore.setIsExtracting(false)
    }
  }, [storyStore, entitiesStore, toast])

  const handleGenerateWithEntities = useCallback(async (directorAnswers: DirectorQuestion[]) => {
    const { story, selectedDirector, storyDirectorNotes } = storyStore
    const { currentEntities } = entitiesStore
    
    if (!story.trim() || !currentEntities) {
      toast({
        title: "Missing Requirements",
        description: "Story and entities are required for generation.",
        variant: "destructive"
      })
      return
    }

    entitiesStore.setIsGeneratingWithEntities(true)
    try {
      const result = await generateStoryBreakdownWithEntities(
        story,
        selectedDirector,
        storyDirectorNotes,
        currentEntities,
        directorAnswers
      )

      if (result.success && result.data) {
        storyStore.setBreakdown(result.data)
        
        const chapters = result.data.chapters || []
        const expandedChapters = chapters.reduce((acc, chapter) => {
          acc[chapter.id] = true
          return acc
        }, {} as Record<string, boolean>)
        storyStore.setExpandedChapters(expandedChapters)

        toast({
          title: "Enhanced Breakdown Generated",
          description: `Successfully generated ${chapters.length} chapters with entity references`
        })
      } else {
        throw new Error(result.error || 'Failed to generate breakdown')
      }
    } catch (error) {
      console.error('Error generating with entities:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate breakdown",
        variant: "destructive"
      })
    } finally {
      entitiesStore.setIsGeneratingWithEntities(false)
      entitiesStore.setShowEntitiesConfig(false)
    }
  }, [storyStore, entitiesStore, toast])

  const handleClearStory = useCallback(() => {
    storyStore.resetStoryState()
    entitiesStore.setExtractedEntities(null)
    entitiesStore.setCurrentEntities(null)
    entitiesStore.setShowEntitiesConfig(false)
    setGenerationStage('idle')
    setStageProgress({ current: 0, total: 0 })
    setStageMessage('')
  }, [storyStore, entitiesStore])

  return {
    // State
    generationStage,
    stageProgress,
    stageMessage,
    elapsedTime,
    generationHistory,
    
    // Handlers
    handleGenerateBreakdown,
    handleGenerateAdditionalShots,
    handleExtractEntities,
    handleGenerateWithEntities,
    handleClearStory
  }
}