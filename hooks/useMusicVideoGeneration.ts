import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useMusicVideoStore } from '@/stores/music-video-store'
import { useAppStore } from '@/stores/app-store'
import { generateFullMusicVideoBreakdown, generateAdditionalMusicVideoShots } from '@/app/actions-mv'

export function useMusicVideoGeneration() {
  const { toast } = useToast()
  const { setIsLoading } = useAppStore()
  const musicVideoStore = useMusicVideoStore()

  const handleGenerateMusicVideoReferences = useCallback(async () => {
    const { lyrics } = musicVideoStore
    
    if (!lyrics.trim()) {
      toast({
        title: "Lyrics Required",
        description: "Please enter song lyrics to generate a music video breakdown.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateFullMusicVideoBreakdown({
        songTitle: musicVideoStore.songTitle,
        artist: musicVideoStore.artist,
        genre: musicVideoStore.genre,
        lyrics: musicVideoStore.lyrics,
        concept: musicVideoStore.mvConcept,
        directorNotes: musicVideoStore.mvDirectorNotes,
        selectedDirector: musicVideoStore.selectedMusicVideoDirector,
        artistProfile: musicVideoStore.selectedArtistProfile
      })

      if (result.success && result.data) {
        musicVideoStore.setMusicVideoBreakdown(result.data.breakdown)
        musicVideoStore.setMusicVideoConfig(result.data.config)
        musicVideoStore.setShowMusicVideoConfig(true)
        
        toast({
          title: "References Generated",
          description: "Review and approve the suggested references before generating the final breakdown."
        })
      } else {
        throw new Error(result.error || 'Failed to generate references')
      }
    } catch (error) {
      console.error('Error generating references:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate references",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [musicVideoStore, setIsLoading, toast])

  const handleGenerateMusicVideoBreakdown = useCallback(async () => {
    const { musicVideoConfig, musicVideoBreakdown } = musicVideoStore
    
    if (!musicVideoConfig || !musicVideoBreakdown) {
      toast({
        title: "Configuration Required",
        description: "Please configure references before generating the final breakdown.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateFullMusicVideoBreakdown({
        songTitle: musicVideoStore.songTitle,
        artist: musicVideoStore.artist,
        genre: musicVideoStore.genre,
        lyrics: musicVideoStore.lyrics,
        concept: musicVideoStore.mvConcept,
        directorNotes: musicVideoStore.mvDirectorNotes,
        selectedDirector: musicVideoStore.selectedMusicVideoDirector,
        artistProfile: musicVideoStore.selectedArtistProfile,
        config: musicVideoConfig
      })

      if (result.success && result.data) {
        musicVideoStore.setMusicVideoBreakdown(result.data.breakdown)
        musicVideoStore.setShowMusicVideoConfig(false)
        
        // Expand all sections by default
        const sections = result.data.breakdown.sections || []
        const expandedSections = sections.map(s => s.id)
        musicVideoStore.setExpandedSections(expandedSections)
        
        toast({
          title: "Breakdown Generated",
          description: `Successfully generated ${sections.length} sections with approved references`
        })
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
      setIsLoading(false)
    }
  }, [musicVideoStore, setIsLoading, toast])

  const handleGenerateAdditionalMusicVideoShots = useCallback(async (
    sectionId: string,
    customRequest: string
  ) => {
    const { musicVideoBreakdown, selectedMusicVideoDirector } = musicVideoStore
    
    if (!musicVideoBreakdown || !musicVideoBreakdown.sections) return

    setIsLoading(true)
    try {
      const section = musicVideoBreakdown.sections?.find(s => s.id === sectionId)
      if (!section) throw new Error('Section not found')

      const result = await generateAdditionalMusicVideoShots(
        section,
        musicVideoBreakdown.songTitle || 'Song',
        selectedMusicVideoDirector,
        customRequest
      )

      if (result.success && result.data) {
        musicVideoStore.addAdditionalMusicVideoShots(sectionId, result.data)
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
  }, [musicVideoStore, setIsLoading, toast])

  const handleClearMusicVideo = useCallback(() => {
    musicVideoStore.setMusicVideoBreakdown(null)
    musicVideoStore.setMusicVideoConfig(null)
    musicVideoStore.setShowMusicVideoConfig(false)
    musicVideoStore.setAdditionalMusicVideoShots('', [])
    musicVideoStore.setExpandedSections([])
  }, [musicVideoStore])

  return {
    handleGenerateMusicVideoReferences,
    handleGenerateMusicVideoBreakdown,
    handleGenerateAdditionalMusicVideoShots,
    handleClearMusicVideo
  }
}