import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ArtistProfile } from '@/lib/artist-types'

interface MusicVideoState {
  // Song details
  lyrics: string
  songTitle: string
  artist: string
  genre: string
  
  // Creative direction
  mvConcept: string
  mvDirectorNotes: string
  
  // Artist selection
  selectedArtistId: string | null
  selectedArtistProfile: ArtistProfile | undefined
  artistVisualDescription: string
  showDescriptions: boolean
  
  // Director selection
  selectedMusicVideoDirector: string
  
  // Music video config
  musicVideoConfig: any | null
  showMusicVideoConfig: boolean
  
  // Results
  musicVideoBreakdown: any | null
  additionalMusicVideoShots: { [key: string]: string[] }
  
  // UI state
  expandedSections: { [key: string]: boolean }
  selectedMusicVideoSection: string
}

interface MusicVideoActions {
  // Song details actions
  setLyrics: (lyrics: string) => void
  setSongTitle: (title: string) => void
  setArtist: (artist: string) => void
  setGenre: (genre: string) => void
  
  // Creative direction actions
  setMvConcept: (concept: string) => void
  setMvDirectorNotes: (notes: string) => void
  
  // Import action
  importFromSongDNA: (data: {
    songTitle: string
    artist: string
    lyrics: string
    genre?: string
    mvConcept?: string
  }) => void
  
  // Artist selection actions
  setSelectedArtistId: (id: string | null) => void
  setSelectedArtistProfile: (profile: ArtistProfile | undefined) => void
  setArtistVisualDescription: (description: string) => void
  setShowDescriptions: (show: boolean) => void
  
  // Director actions
  setSelectedMusicVideoDirector: (directorId: string) => void
  
  // Config actions
  setMusicVideoConfig: (config: any) => void
  setShowMusicVideoConfig: (show: boolean) => void
  
  // Results actions
  setMusicVideoBreakdown: (breakdown: any) => void
  setAdditionalMusicVideoShots: (shots: { [key: string]: string[] }) => void
  addAdditionalMusicVideoShots: (sectionId: string, shots: string[]) => void
  
  // UI actions
  setExpandedSections: (sections: { [key: string]: boolean }) => void
  toggleSectionExpansion: (sectionId: string) => void
  setSelectedMusicVideoSection: (sectionId: string) => void
  
  // Reset action
  resetMusicVideoState: () => void
}

const initialMusicVideoState: MusicVideoState = {
  lyrics: "",
  songTitle: "",
  artist: "",
  genre: "",
  mvConcept: "",
  mvDirectorNotes: "",
  selectedArtistId: null,
  selectedArtistProfile: undefined,
  artistVisualDescription: "",
  showDescriptions: false,
  selectedMusicVideoDirector: "hype-williams",
  musicVideoConfig: null,
  showMusicVideoConfig: false,
  musicVideoBreakdown: null,
  additionalMusicVideoShots: {},
  expandedSections: {},
  selectedMusicVideoSection: ""
}

export const useMusicVideoStore = create<MusicVideoState & MusicVideoActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialMusicVideoState,
        
        // Song details actions
        setLyrics: (lyrics) => set({ lyrics }),
        setSongTitle: (songTitle) => set({ songTitle }),
        setArtist: (artist) => set({ artist }),
        setGenre: (genre) => set({ genre }),
        
        // Creative direction actions
        setMvConcept: (mvConcept) => set({ mvConcept }),
        setMvDirectorNotes: (mvDirectorNotes) => set({ mvDirectorNotes }),
        
        // Artist selection actions
        setSelectedArtistId: (selectedArtistId) => set({ selectedArtistId }),
        setSelectedArtistProfile: (selectedArtistProfile) => set({ selectedArtistProfile }),
        setArtistVisualDescription: (artistVisualDescription) => set({ artistVisualDescription }),
        setShowDescriptions: (showDescriptions) => set({ showDescriptions }),
        
        // Director actions
        setSelectedMusicVideoDirector: (selectedMusicVideoDirector) => set({ selectedMusicVideoDirector }),
        
        // Config actions
        setMusicVideoConfig: (musicVideoConfig) => set({ musicVideoConfig }),
        setShowMusicVideoConfig: (showMusicVideoConfig) => set({ showMusicVideoConfig }),
        
        // Results actions
        setMusicVideoBreakdown: (musicVideoBreakdown) => set({ musicVideoBreakdown }),
        setAdditionalMusicVideoShots: (additionalMusicVideoShots) => set({ additionalMusicVideoShots }),
        addAdditionalMusicVideoShots: (sectionId, shots) => set((state) => ({
          additionalMusicVideoShots: {
            ...state.additionalMusicVideoShots,
            [sectionId]: [...(state.additionalMusicVideoShots[sectionId] || []), ...shots]
          }
        })),
        
        // UI actions
        setExpandedSections: (expandedSections) => set({ expandedSections }),
        toggleSectionExpansion: (sectionId) => set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionId]: !state.expandedSections[sectionId]
          }
        })),
        setSelectedMusicVideoSection: (selectedMusicVideoSection) => set({ selectedMusicVideoSection }),
        
        // Import action
        importFromSongDNA: (data) => set({
          songTitle: data.songTitle,
          artist: data.artist,
          lyrics: data.lyrics,
          genre: data.genre || "",
          mvConcept: data.mvConcept || "",
          // Clear any existing breakdown when importing new song
          musicVideoBreakdown: null,
          additionalMusicVideoShots: {},
          expandedSections: {}
        }),
        
        // Reset action
        resetMusicVideoState: () => set(initialMusicVideoState)
      }),
      {
        name: 'music-video-store',
        partialize: (state) => ({
          lyrics: state.lyrics,
          songTitle: state.songTitle,
          artist: state.artist,
          genre: state.genre,
          mvConcept: state.mvConcept,
          mvDirectorNotes: state.mvDirectorNotes,
          selectedArtistId: state.selectedArtistId,
          selectedArtistProfile: state.selectedArtistProfile,
          selectedMusicVideoDirector: state.selectedMusicVideoDirector,
          musicVideoConfig: state.musicVideoConfig,
          showMusicVideoConfig: state.showMusicVideoConfig,
          musicVideoBreakdown: state.musicVideoBreakdown,
          additionalMusicVideoShots: state.additionalMusicVideoShots,
          expandedSections: state.expandedSections,
          selectedMusicVideoSection: state.selectedMusicVideoSection
        })
      }
    ),
    { name: 'music-video-store' }
  )
)