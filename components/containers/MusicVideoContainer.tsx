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
      onLyricsChange={musicVideoStore.setLyrics}
      songTitle={musicVideoStore.songTitle}
      onSongTitleChange={musicVideoStore.setSongTitle}
      artist={musicVideoStore.artist}
      onArtistChange={musicVideoStore.setArtist}
      genre={musicVideoStore.genre}
      onGenreChange={musicVideoStore.setGenre}
      concept={musicVideoStore.mvConcept}
      onConceptChange={musicVideoStore.setMvConcept}
      directorNotes={musicVideoStore.mvDirectorNotes}
      onDirectorNotesChange={musicVideoStore.setMvDirectorNotes}
      selectedArtistId={musicVideoStore.selectedArtistId}
      onArtistSelect={(id, profile) => {
        musicVideoStore.setSelectedArtistId(id)
        musicVideoStore.setSelectedArtistProfile(profile)
      }}
      selectedDirector={musicVideoStore.selectedMusicVideoDirector}
      onDirectorChange={musicVideoStore.setSelectedMusicVideoDirector}
      breakdown={musicVideoStore.musicVideoBreakdown}
      config={musicVideoStore.musicVideoConfig}
      showConfig={musicVideoStore.showMusicVideoConfig}
      onConfigUpdate={musicVideoStore.setMusicVideoConfig}
      onConfigClose={() => musicVideoStore.setShowMusicVideoConfig(false)}
      onGenerateReferences={handleGenerateMusicVideoReferences}
      onGenerateBreakdown={handleGenerateMusicVideoBreakdown}
      onClearBreakdown={handleClearMusicVideo}
      curatedDirectors={curatedMusicVideoDirectors || []}
      customDirectors={customMusicVideoDirectors || []}
      onGenerateAdditionalShots={handleGenerateAdditionalMusicVideoShots}
      additionalShots={musicVideoStore.additionalMusicVideoShots}
      expandedSections={musicVideoStore.expandedSections}
      onToggleSectionExpansion={musicVideoStore.toggleSectionExpansion}
      selectedSection={musicVideoStore.selectedMusicVideoSection}
      onSelectSection={musicVideoStore.setSelectedMusicVideoSection}
      showCustomDirectorForm={showCustomDirectorForm}
      onShowCustomDirectorForm={setShowCustomDirectorForm}
      customDirectorName={customDirectorName}
      onCustomDirectorNameChange={setCustomDirectorName}
      customDirectorDescription={customDirectorDescription}
      onCustomDirectorDescriptionChange={setCustomDirectorDescription}
      isGeneratingDirectorStyle={isGeneratingDirectorStyle}
      onCreateCustomDirector={handleCreateCustomDirector}
    />
  )
}