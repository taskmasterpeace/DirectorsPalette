'use client'

import { MusicVideoInput } from '@/components/music-video/MusicVideoInput'
import { MusicVideoWorkflow } from '@/components/music-video/MusicVideoWorkflow'
import { MusicVideoMode } from '@/components/music-video/MusicVideoMode'
import { useMusicVideoGeneration } from '@/hooks/useMusicVideoGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useMusicVideoStore } from '@/stores/music-video-store'
import { useMusicVideoWorkflowStore } from '@/stores/music-video-workflow-store'
import { useAppStore } from '@/stores/app-store'
import { curatedMusicVideoDirectors } from '@/lib/curated-directors'
import { extractMusicVideoReferences } from '@/app/actions/music-video/references'
import { useToast } from '@/components/ui/use-toast'

/**
 * Refactored MusicVideoContainer - now a thin coordinator
 * Delegates input, workflow, and results to specialized components
 */
export function MusicVideoContainer() {
  const { toast } = useToast()
  const musicVideoStore = useMusicVideoStore()
  const workflowStore = useMusicVideoWorkflowStore()
  const { isLoading, setIsLoading } = useAppStore()
  
  // Custom hooks for specific concerns
  const {
    handleGenerateMusicVideoBreakdown,
    handleGenerateAdditionalMusicVideoShots,
    handleClearMusicVideo
  } = useMusicVideoGeneration()
  
  const { customMusicVideoDirectors } = useDirectorManagement()
  
  // All directors combined
  const allDirectors = [...(curatedMusicVideoDirectors || []), ...(customMusicVideoDirectors || [])]
  
  // Handle reference extraction
  const handleExtractReferences = async () => {
    if (!musicVideoStore.songTitle.trim() || !musicVideoStore.lyrics.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter song title and lyrics to extract references.",
        variant: "destructive"
      })
      return
    }
    
    workflowStore.setIsExtractingRefs(true)
    try {
      const result = await extractMusicVideoReferences(
        musicVideoStore.songTitle,
        musicVideoStore.artist,
        musicVideoStore.lyrics,
        musicVideoStore.selectedMusicVideoDirector,
        musicVideoStore.mvDirectorNotes,
        musicVideoStore.mvConcept
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
  
  // Handle breakdown completion
  const handleBreakdownComplete = (data: any) => {
    console.log('MusicVideoContainer - handleBreakdownComplete received:', data)
    
    // The data IS the breakdown directly from the action
    const breakdown = {
      ...data,
      isConfigured: true
    }
    
    console.log('Setting breakdown:', breakdown)
    musicVideoStore.setMusicVideoBreakdown(breakdown)
    
    // Also update config if provided
    if (data.musicVideoConfig) {
      musicVideoStore.setMusicVideoConfig(data.musicVideoConfig)
    }
    
    // Expand all sections
    const sections = data.sections || data.musicVideoStructure?.sections || []
    console.log('Found sections:', sections)
    
    const expandedSections = sections.reduce((acc: any, section: any) => {
      acc[section.id] = true
      return acc
    }, {})
    musicVideoStore.setExpandedSections(expandedSections)
    
    toast({
      title: "Breakdown Generated",
      description: `Successfully generated ${sections.length} sections with ${data.sectionBreakdowns?.length || 0} shot lists`
    })
  }

  return (
    <div className="space-y-6">
      {/* Only show input if we don't have a breakdown yet */}
      {!musicVideoStore.musicVideoBreakdown && (
        <>
          {/* Music Video Input Section */}
          <MusicVideoInput
            songTitle={musicVideoStore.songTitle}
            setSongTitle={musicVideoStore.setSongTitle}
            artist={musicVideoStore.artist}
            setArtist={musicVideoStore.setArtist}
            genre={musicVideoStore.genre}
            setGenre={musicVideoStore.setGenre}
            lyrics={musicVideoStore.lyrics}
            setLyrics={musicVideoStore.setLyrics}
            mvConcept={musicVideoStore.mvConcept}
            setMvConcept={musicVideoStore.setMvConcept}
            mvDirectorNotes={musicVideoStore.mvDirectorNotes}
            setMvDirectorNotes={musicVideoStore.setMvDirectorNotes}
            selectedArtistId={musicVideoStore.selectedArtistId}
            setSelectedArtistId={musicVideoStore.setSelectedArtistId}
            selectedArtistProfile={musicVideoStore.selectedArtistProfile}
            setSelectedArtistProfile={musicVideoStore.setSelectedArtistProfile}
            selectedMusicVideoDirector={musicVideoStore.selectedMusicVideoDirector}
            setSelectedMusicVideoDirector={musicVideoStore.setSelectedMusicVideoDirector}
            allDirectors={allDirectors}
            onGenerateReferences={handleExtractReferences}
            onClear={handleClearMusicVideo}
            isLoading={isLoading || workflowStore.isExtractingRefs}
            hasBreakdown={!!musicVideoStore.musicVideoBreakdown}
          />
          
          {/* Workflow Components (Progress, Reference Config) */}
          <MusicVideoWorkflow
            songTitle={musicVideoStore.songTitle}
            artist={musicVideoStore.artist}
            genre={musicVideoStore.genre}
            lyrics={musicVideoStore.lyrics}
            mvConcept={musicVideoStore.mvConcept}
            mvDirectorNotes={musicVideoStore.mvDirectorNotes}
            selectedMusicVideoDirector={musicVideoStore.selectedMusicVideoDirector}
            selectedArtistProfile={musicVideoStore.selectedArtistProfile}
            musicVideoConfig={musicVideoStore.musicVideoConfig}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onBreakdownComplete={(data) => {
              handleBreakdownComplete(data)
              // Hide the reference config after completion
              workflowStore.setShowReferenceConfig(false)
              workflowStore.setExtractedReferences(null)
            }}
          />
        </>
      )}
      
      {/* Results Display - Show full MusicVideoMode when we have a breakdown */}
      {musicVideoStore.musicVideoBreakdown && (
        <MusicVideoMode
          lyrics={musicVideoStore.lyrics}
          setLyrics={musicVideoStore.setLyrics}
          songTitle={musicVideoStore.songTitle}
          setSongTitle={musicVideoStore.setSongTitle}
          artist={musicVideoStore.artist}
          setArtist={musicVideoStore.setArtist}
          genre={musicVideoStore.genre}
          setGenre={musicVideoStore.setGenre}
          mvConcept={musicVideoStore.mvConcept}
          setMvConcept={musicVideoStore.setMvConcept}
          mvDirectorNotes={musicVideoStore.mvDirectorNotes}
          setMvDirectorNotes={musicVideoStore.setMvDirectorNotes}
          selectedArtistId={musicVideoStore.selectedArtistId}
          setSelectedArtistId={musicVideoStore.setSelectedArtistId}
          selectedArtistProfile={musicVideoStore.selectedArtistProfile}
          setSelectedArtistProfile={musicVideoStore.setSelectedArtistProfile}
          artistVisualDescription={musicVideoStore.artistVisualDescription}
          setArtistVisualDescription={musicVideoStore.setArtistVisualDescription}
          showDescriptions={musicVideoStore.showDescriptions}
          setShowDescriptions={musicVideoStore.setShowDescriptions}
          selectedMusicVideoDirector={musicVideoStore.selectedMusicVideoDirector}
          setSelectedMusicVideoDirector={musicVideoStore.setSelectedMusicVideoDirector}
          curatedDirectors={curatedMusicVideoDirectors || []}
          customDirectors={customMusicVideoDirectors || []}
          musicVideoConfig={musicVideoStore.musicVideoConfig}
          setMusicVideoConfig={musicVideoStore.setMusicVideoConfig}
          showMusicVideoConfig={musicVideoStore.showMusicVideoConfig}
          setShowMusicVideoConfig={musicVideoStore.setShowMusicVideoConfig}
          musicVideoBreakdown={musicVideoStore.musicVideoBreakdown}
          setMusicVideoBreakdown={musicVideoStore.setMusicVideoBreakdown}
          additionalMusicVideoShots={musicVideoStore.additionalMusicVideoShots}
          setAdditionalMusicVideoShots={musicVideoStore.setAdditionalMusicVideoShots}
          expandedSections={musicVideoStore.expandedSections}
          setExpandedSections={musicVideoStore.setExpandedSections}
          isLoading={isLoading}
          onGenerateMusicVideoReferences={() => {}}  // Already handled above
          onGenerateMusicVideoBreakdown={handleGenerateMusicVideoBreakdown}
          onClearMusicVideo={handleClearMusicVideo}
          onGenerateAdditionalMusicVideoShots={handleGenerateAdditionalMusicVideoShots}
          onCopyToClipboard={(text: string) => {
            navigator.clipboard.writeText(text).catch(console.error)
          }}
        />
      )}
    </div>
  )
}