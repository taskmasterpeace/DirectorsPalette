import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Mode = "story" | "music-video" | "commercial"

interface AppState {
  // Mode state
  mode: Mode
  
  // Loading state
  isLoading: boolean
  
  // Project state
  showProjectManager: boolean
  currentProjectId: string | null
  
  // Custom director creation state
  showCustomDirectorForm: boolean
  customDirectorName: string
  customDirectorDescription: string
  isGeneratingDirectorStyle: boolean
}

interface AppActions {
  // Mode actions
  setMode: (mode: Mode) => void
  
  // Loading actions
  setIsLoading: (loading: boolean) => void
  
  // Project actions
  setShowProjectManager: (show: boolean) => void
  setCurrentProjectId: (id: string | null) => void
  
  // Custom director actions
  setShowCustomDirectorForm: (show: boolean) => void
  setCustomDirectorName: (name: string) => void
  setCustomDirectorDescription: (description: string) => void
  setIsGeneratingDirectorStyle: (generating: boolean) => void
  
  // Reset action
  resetAppState: () => void
  reset: () => void
}

const initialAppState: AppState = {
  mode: "story",
  isLoading: false,
  showProjectManager: false,
  currentProjectId: null,
  showCustomDirectorForm: false,
  customDirectorName: "",
  customDirectorDescription: "",
  isGeneratingDirectorStyle: false
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialAppState,
        
        // Mode actions
        setMode: (mode) => set({ mode }),
        
        // Loading actions
        setIsLoading: (isLoading) => set({ isLoading }),
        
        // Project actions
        setShowProjectManager: (showProjectManager) => set({ showProjectManager }),
        setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
        
        // Custom director actions
        setShowCustomDirectorForm: (showCustomDirectorForm) => set({ showCustomDirectorForm }),
        setCustomDirectorName: (customDirectorName) => set({ customDirectorName }),
        setCustomDirectorDescription: (customDirectorDescription) => set({ customDirectorDescription }),
        setIsGeneratingDirectorStyle: (isGeneratingDirectorStyle) => set({ isGeneratingDirectorStyle }),
        
        // Reset action
        resetAppState: () => set(initialAppState),
        reset: () => set(initialAppState)
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          mode: state.mode,
          currentProjectId: state.currentProjectId
        })
      }
    ),
    { name: 'app-store' }
  )
)