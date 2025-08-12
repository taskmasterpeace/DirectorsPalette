'use client'

import { MusicVideoMode } from '@/components/music-video/MusicVideoMode'
import { useMusicVideoGeneration } from '@/hooks/useMusicVideoGeneration'
import { useDirectorManagement } from '@/hooks/useDirectorManagement'
import { useMusicVideoStore } from '@/stores/music-video-store'
import { curatedMusicVideoDirectors } from '@/lib/curated-directors'

export function MusicVideoContainer() {
  const musicVideoStore = useMusicVideoStore()
  const {
    handleGenerateMusicVideoReferences,
    handleGenerateMusicVideoBreakdown,
    handleGenerateAdditionalMusicVideoShots,
    handleClearMusicVideo
  } = useMusicVideoGeneration()
  
  const {
    customMusicVideoDirectors,
    showCustomDirectorForm,
    customDirectorName,
    customDirectorDescription,
    isGeneratingDirectorStyle,
    handleCreateCustomDirector,
    setShowCustomDirectorForm,
    setCustomDirectorName,
    setCustomDirectorDescription
  } = useDirectorManagement()

  return (
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
      isLoading={false}
      onGenerateMusicVideoReferences={handleGenerateMusicVideoReferences}
      onGenerateMusicVideoBreakdown={handleGenerateMusicVideoBreakdown}
      onClearMusicVideo={handleClearMusicVideo}
      onGenerateAdditionalMusicVideoShots={handleGenerateAdditionalMusicVideoShots}
      onCopyToClipboard={(text: string) => {
        navigator.clipboard.writeText(text).catch(console.error)
      }}
    />
  )
}