import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MusicVideoWorkflowState {
  // Reference workflow
  showReferenceConfig: boolean
  extractedReferences: any | null
  isExtractingRefs: boolean
  
  // Shot selection workflow
  showShotSelection: boolean
  shotSelectionMethod: 'auto' | 'manual' | null
  manualShotSelections: any[]
  
  // Generation progress
  generationStage: 'idle' | 'structure' | 'breakdowns' | 'complete'
  stageProgress: { current: number; total: number }
  stageMessage: string
  elapsedTime: number
  estimatedTime: number
}

interface MusicVideoWorkflowActions {
  // Reference workflow actions
  setShowReferenceConfig: (show: boolean) => void
  setExtractedReferences: (refs: any | null) => void
  setIsExtractingRefs: (extracting: boolean) => void
  
  // Shot selection actions
  setShowShotSelection: (show: boolean) => void
  setShotSelectionMethod: (method: 'auto' | 'manual' | null) => void
  setManualShotSelections: (selections: any[]) => void
  
  // Progress actions
  setGenerationStage: (stage: 'idle' | 'structure' | 'breakdowns' | 'complete') => void
  setStageProgress: (progress: { current: number; total: number }) => void
  setStageMessage: (message: string) => void
  setElapsedTime: (time: number) => void
  setEstimatedTime: (time: number) => void
  
  // Reset workflow
  resetWorkflow: () => void
}

type MusicVideoWorkflowStore = MusicVideoWorkflowState & MusicVideoWorkflowActions

const initialState: MusicVideoWorkflowState = {
  showReferenceConfig: false,
  extractedReferences: null,
  isExtractingRefs: false,
  showShotSelection: false,
  shotSelectionMethod: null,
  manualShotSelections: [],
  generationStage: 'idle',
  stageProgress: { current: 0, total: 0 },
  stageMessage: '',
  elapsedTime: 0,
  estimatedTime: 30000
}

export const useMusicVideoWorkflowStore = create<MusicVideoWorkflowStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Reference workflow actions
      setShowReferenceConfig: (show) => set({ showReferenceConfig: show }),
      setExtractedReferences: (refs) => set({ extractedReferences: refs }),
      setIsExtractingRefs: (extracting) => set({ isExtractingRefs: extracting }),
      
      // Shot selection actions
      setShowShotSelection: (show) => set({ showShotSelection: show }),
      setShotSelectionMethod: (method) => set({ shotSelectionMethod: method }),
      setManualShotSelections: (selections) => set({ manualShotSelections: selections }),
      
      // Progress actions
      setGenerationStage: (stage) => set({ generationStage: stage }),
      setStageProgress: (progress) => set({ stageProgress: progress }),
      setStageMessage: (message) => set({ stageMessage: message }),
      setElapsedTime: (time) => set({ elapsedTime: time }),
      setEstimatedTime: (time) => set({ estimatedTime: time }),
      
      // Reset workflow
      resetWorkflow: () => set(initialState)
    }),
    {
      name: 'music-video-workflow-store'
    }
  )
)