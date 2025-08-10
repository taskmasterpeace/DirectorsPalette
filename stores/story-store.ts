import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface TitleCardOptions {
  enabled: boolean
  format: "full" | "name-only" | "roman-numerals"
  approaches: string[]
}

interface PromptOptions {
  includeCameraStyle: boolean
  includeColorPalette: boolean
}

interface StoryState {
  // Story input
  story: string
  storyDirectorNotes: string
  
  // Director selection
  selectedDirector: string
  
  // Options
  titleCardOptions: TitleCardOptions
  promptOptions: PromptOptions
  
  // Results
  breakdown: any | null
  additionalShots: { [key: string]: string[] }
  
  // UI state
  expandedChapters: { [key: string]: boolean }
  selectedChapter: string
}

interface StoryActions {
  // Story input actions
  setStory: (story: string) => void
  setStoryDirectorNotes: (notes: string) => void
  
  // Director actions
  setSelectedDirector: (directorId: string) => void
  
  // Options actions
  setTitleCardOptions: (options: TitleCardOptions) => void
  setPromptOptions: (options: PromptOptions) => void
  
  // Results actions
  setBreakdown: (breakdown: any) => void
  setAdditionalShots: (shots: { [key: string]: string[] }) => void
  addAdditionalShots: (chapterId: string, shots: string[]) => void
  
  // UI actions
  setExpandedChapters: (chapters: { [key: string]: boolean }) => void
  toggleChapterExpansion: (chapterId: string) => void
  setSelectedChapter: (chapterId: string) => void
  
  // Reset action
  resetStoryState: () => void
}

const initialStoryState: StoryState = {
  story: "",
  storyDirectorNotes: "",
  selectedDirector: "nolan",
  titleCardOptions: {
    enabled: false,
    format: "full",
    approaches: []
  },
  promptOptions: {
    includeCameraStyle: true,
    includeColorPalette: true
  },
  breakdown: null,
  additionalShots: {},
  expandedChapters: {},
  selectedChapter: ""
}

export const useStoryStore = create<StoryState & StoryActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialStoryState,
        
        // Story input actions
        setStory: (story) => set({ story }),
        setStoryDirectorNotes: (storyDirectorNotes) => set({ storyDirectorNotes }),
        
        // Director actions
        setSelectedDirector: (selectedDirector) => set({ selectedDirector }),
        
        // Options actions
        setTitleCardOptions: (titleCardOptions) => set({ titleCardOptions }),
        setPromptOptions: (promptOptions) => set({ promptOptions }),
        
        // Results actions
        setBreakdown: (breakdown) => set({ breakdown }),
        setAdditionalShots: (additionalShots) => set({ additionalShots }),
        addAdditionalShots: (chapterId, shots) => set((state) => ({
          additionalShots: {
            ...state.additionalShots,
            [chapterId]: [...(state.additionalShots[chapterId] || []), ...shots]
          }
        })),
        
        // UI actions
        setExpandedChapters: (expandedChapters) => set({ expandedChapters }),
        toggleChapterExpansion: (chapterId) => set((state) => ({
          expandedChapters: {
            ...state.expandedChapters,
            [chapterId]: !state.expandedChapters[chapterId]
          }
        })),
        setSelectedChapter: (selectedChapter) => set({ selectedChapter }),
        
        // Reset action
        resetStoryState: () => set(initialStoryState)
      }),
      {
        name: 'story-store',
        partialize: (state) => ({
          story: state.story,
          storyDirectorNotes: state.storyDirectorNotes,
          selectedDirector: state.selectedDirector,
          titleCardOptions: state.titleCardOptions,
          promptOptions: state.promptOptions,
          breakdown: state.breakdown,
          additionalShots: state.additionalShots,
          expandedChapters: state.expandedChapters,
          selectedChapter: state.selectedChapter
        })
      }
    ),
    { name: 'story-store' }
  )
)