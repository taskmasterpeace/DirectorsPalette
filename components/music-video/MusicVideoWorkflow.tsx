'use client'

import { useState } from 'react'
import { MusicVideoReferenceConfigInline } from './MusicVideoReferenceConfigInline'
import { DirectorQuestionCards, type DirectorQuestion } from '../story/DirectorQuestionCards'
import { MultiStageProgress } from '@/components/ui/multi-stage-progress'
import { generateMusicVideoBreakdownWithReferences } from '@/app/actions/music-video/references'
import { useToast } from '@/components/ui/use-toast'
import { useMusicVideoWorkflowStore } from '@/stores/music-video-workflow-store'
import type { MusicVideoConfig } from '@/lib/indexeddb'
import type { ArtistProfile } from '@/lib/artist-types'

interface MusicVideoWorkflowProps {
  // Song data
  songTitle: string
  artist: string
  genre: string
  lyrics: string
  
  // Creative input
  mvConcept: string
  mvDirectorNotes: string
  selectedMusicVideoDirector: string
  selectedArtistProfile: ArtistProfile | null
  
  // Config
  musicVideoConfig: MusicVideoConfig | null
  
  // Workflow state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Results
  onBreakdownComplete: (breakdown: any) => void
  
  // Progress tracking
  generationStage?: 'idle' | 'structure' | 'breakdowns' | 'complete'
  stageProgress?: { current: number; total: number }
  stageMessage?: string
  elapsedTime?: number
  estimatedTime?: number
}

export function MusicVideoWorkflow({
  songTitle,
  artist,
  genre,
  lyrics,
  mvConcept,
  mvDirectorNotes,
  selectedMusicVideoDirector,
  selectedArtistProfile,
  musicVideoConfig,
  isLoading,
  setIsLoading,
  onBreakdownComplete,
  generationStage = 'idle',
  stageProgress = { current: 0, total: 0 },
  stageMessage = '',
  elapsedTime = 0,
  estimatedTime = 30000
}: MusicVideoWorkflowProps) {
  const { toast } = useToast()
  const workflowStore = useMusicVideoWorkflowStore()

  // Note: Extraction is now handled by the parent container
  // This component just displays the reference config when ready

  const handleGenerateWithReferences = async (configuredRefs: any) => {
    setIsLoading(true)
    try {
      const result = await generateMusicVideoBreakdownWithReferences(
        songTitle,
        artist,
        genre,
        lyrics,
        selectedMusicVideoDirector,
        mvDirectorNotes,
        mvConcept,
        configuredRefs,
        selectedArtistProfile,
        musicVideoConfig
      )
      
      console.log('MusicVideoWorkflow - result from generateMusicVideoBreakdownWithReferences:', result)
      console.log('MusicVideoWorkflow - result.data structure:', {
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        hasSections: !!result.data?.sections,
        hasSectionBreakdowns: !!result.data?.sectionBreakdowns,
        sectionBreakdownsLength: result.data?.sectionBreakdowns?.length
      })
      
      if (result.success && result.data) {
        // Pass the complete data object
        onBreakdownComplete(result.data)
        
        const sections = result.data.sections || result.data.musicVideoStructure?.sections || []
        toast({
          title: "Breakdown Generated",
          description: `Successfully generated breakdown for ${sections.length} sections`
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
    <>
      {/* Progress Tracking */}
      {generationStage !== 'idle' && (
        <MultiStageProgress
          stage={generationStage}
          currentStep={stageProgress.current}
          totalSteps={stageProgress.total}
          message={stageMessage}
          elapsedTime={elapsedTime / 1000}
          estimatedTime={estimatedTime / 1000}
        />
      )}

      {/* Reference Configuration (Inline, not popup) */}
      {workflowStore.showReferenceConfig && workflowStore.extractedReferences && (
        <MusicVideoReferenceConfigInline
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