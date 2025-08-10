import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { StoryEntities, ExtractedEntities } from '@/components/story/story-entities-config'

interface StoryEntitiesState {
  // Entity configuration
  showEntitiesConfig: boolean
  currentEntities: StoryEntities
  extractedEntities: ExtractedEntities | null
  
  // Loading states
  isExtracting: boolean
  isGeneratingWithEntities: boolean
}

interface StoryEntitiesActions {
  // UI actions
  setShowEntitiesConfig: (show: boolean) => void
  
  // Entity management
  setCurrentEntities: (entities: StoryEntities) => void
  setExtractedEntities: (entities: ExtractedEntities | null) => void
  resetEntities: () => void
  
  // Loading actions
  setIsExtracting: (loading: boolean) => void
  setIsGeneratingWithEntities: (loading: boolean) => void
  
  // Reset action
  resetStoryEntitiesState: () => void
}

const initialEntities: StoryEntities = {
  characters: [],
  locations: [],
  props: []
}

const initialStoryEntitiesState: StoryEntitiesState = {
  showEntitiesConfig: false,
  currentEntities: initialEntities,
  extractedEntities: null,
  isExtracting: false,
  isGeneratingWithEntities: false
}

export const useStoryEntitiesStore = create<StoryEntitiesState & StoryEntitiesActions>()( 
  devtools(
    persist(
      (set, get) => ({
        ...initialStoryEntitiesState,
        
        // UI actions
        setShowEntitiesConfig: (showEntitiesConfig) => set({ showEntitiesConfig }),
        
        // Entity management
        setCurrentEntities: (currentEntities) => set({ currentEntities }),
        setExtractedEntities: (extractedEntities) => set({ extractedEntities }),
        resetEntities: () => set({ 
          currentEntities: initialEntities,
          extractedEntities: null
        }),
        
        // Loading actions
        setIsExtracting: (isExtracting) => set({ isExtracting }),
        setIsGeneratingWithEntities: (isGeneratingWithEntities) => set({ isGeneratingWithEntities }),
        
        // Reset action
        resetStoryEntitiesState: () => set(initialStoryEntitiesState)
      }),
      {
        name: 'story-entities-store',
        partialize: (state) => ({
          currentEntities: state.currentEntities
        })
      }
    ),
    { name: 'story-entities-store' }
  )
)