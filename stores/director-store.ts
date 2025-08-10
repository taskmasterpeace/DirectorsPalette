import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FilmDirector, MusicVideoDirector } from '@/lib/director-types'

interface CustomDirector {
  id: string
  name: string
  description: string
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  category?: string
  tags?: string[]
  disciplines?: string[]
}

interface CustomMusicVideoDirector {
  id: string
  name: string
  description: string
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  category?: string
  tags?: string[]
  disciplines?: string[]
}

interface DirectorState {
  // Custom directors
  customDirectors: CustomDirector[]
  customMusicVideoDirectors: CustomMusicVideoDirector[]
  
  // Loading state
  directorsLoaded: boolean
}

interface DirectorActions {
  // Custom directors actions
  setCustomDirectors: (directors: CustomDirector[]) => void
  addCustomDirector: (director: CustomDirector) => void
  removeCustomDirector: (directorId: string) => void
  
  // Custom music video directors actions
  setCustomMusicVideoDirectors: (directors: CustomMusicVideoDirector[]) => void
  addCustomMusicVideoDirector: (director: CustomMusicVideoDirector) => void
  removeCustomMusicVideoDirector: (directorId: string) => void
  
  // Loading actions
  setDirectorsLoaded: (loaded: boolean) => void
  
  // Reset action
  resetDirectorState: () => void
}

const initialDirectorState: DirectorState = {
  customDirectors: [],
  customMusicVideoDirectors: [],
  directorsLoaded: false
}

export const useDirectorStore = create<DirectorState & DirectorActions>()(
  devtools(
    (set, get) => ({
      ...initialDirectorState,
      
      // Custom directors actions
      setCustomDirectors: (customDirectors) => set({ customDirectors }),
      addCustomDirector: (director) => set((state) => ({
        customDirectors: [...state.customDirectors, director]
      })),
      removeCustomDirector: (directorId) => set((state) => ({
        customDirectors: state.customDirectors.filter(d => d.id !== directorId)
      })),
      
      // Custom music video directors actions
      setCustomMusicVideoDirectors: (customMusicVideoDirectors) => set({ customMusicVideoDirectors }),
      addCustomMusicVideoDirector: (director) => set((state) => ({
        customMusicVideoDirectors: [...state.customMusicVideoDirectors, director]
      })),
      removeCustomMusicVideoDirector: (directorId) => set((state) => ({
        customMusicVideoDirectors: state.customMusicVideoDirectors.filter(d => d.id !== directorId)
      })),
      
      // Loading actions
      setDirectorsLoaded: (directorsLoaded) => set({ directorsLoaded }),
      
      // Reset action
      resetDirectorState: () => set(initialDirectorState)
    }),
    { name: 'director-store' }
  )
)