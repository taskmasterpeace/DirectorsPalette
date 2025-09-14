import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface StoryWorkflowState {
  // Chapter configuration
  chapterMethod: string
  userChapterCount: number
  
  // Reference workflow
  showReferenceConfig: boolean
  extractedReferences: any | null
  isExtractingRefs: boolean
  
  // Shot selection workflow
  showShotSelection: boolean
  shotSelectionMethod: 'auto' | 'manual' | null
  manualShotSelections: any[]
  
  // Director questions workflow
  showDirectorQuestions: boolean
  directorAnswers: any[]
}

interface StoryWorkflowActions {
  // Chapter configuration actions
  setChapterMethod: (method: string) => void
  setUserChapterCount: (count: number) => void
  
  // Reference workflow actions
  setShowReferenceConfig: (show: boolean) => void
  setExtractedReferences: (refs: any | null) => void
  setIsExtractingRefs: (extracting: boolean) => void
  
  // Shot selection actions
  setShowShotSelection: (show: boolean) => void
  setShotSelectionMethod: (method: 'auto' | 'manual' | null) => void
  setManualShotSelections: (selections: any[]) => void
  
  // Director questions actions
  setShowDirectorQuestions: (show: boolean) => void
  setDirectorAnswers: (answers: any[]) => void
  
  // Reset workflow
  resetWorkflow: () => void
}

type StoryWorkflowStore = StoryWorkflowState & StoryWorkflowActions

const initialState: StoryWorkflowState = {
  chapterMethod: 'ai-suggested',
  userChapterCount: 4,
  showReferenceConfig: false,
  extractedReferences: null,
  isExtractingRefs: false,
  showShotSelection: false,
  shotSelectionMethod: null,
  manualShotSelections: [],
  showDirectorQuestions: false,
  directorAnswers: []
}

export const useStoryWorkflowStore = create<StoryWorkflowStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Chapter configuration actions
      setChapterMethod: (method) => set({ chapterMethod: method }),
      setUserChapterCount: (count) => set({ userChapterCount: count }),
      
      // Reference workflow actions
      setShowReferenceConfig: (show) => set({ showReferenceConfig: show }),
      setExtractedReferences: (refs) => set({ extractedReferences: refs }),
      setIsExtractingRefs: (extracting) => set({ isExtractingRefs: extracting }),
      
      // Shot selection actions
      setShowShotSelection: (show) => set({ showShotSelection: show }),
      setShotSelectionMethod: (method) => set({ shotSelectionMethod: method }),
      setManualShotSelections: (selections) => set({ manualShotSelections: selections }),
      
      // Director questions actions
      setShowDirectorQuestions: (show) => set({ showDirectorQuestions: show }),
      setDirectorAnswers: (answers) => set({ directorAnswers: answers }),
      
      // Reset workflow
      resetWorkflow: () => set(initialState)
    }),
    {
      name: 'story-workflow-store'
    }
  )
)