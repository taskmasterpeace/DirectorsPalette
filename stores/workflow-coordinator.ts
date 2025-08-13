/**
 * Workflow Coordinator
 * Coordinates between different stores while respecting their differences
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface WorkflowState {
  // Current mode
  mode: 'story' | 'music-video'
  
  // Shared workflow state
  isLoading: boolean
  error: string | null
  stage: 'idle' | 'extracting' | 'configuring' | 'generating' | 'complete'
  progress: {
    current: number
    total: number
    message: string
  }
  
  // Reference workflow
  showReferenceConfig: boolean
  extractedReferences: any | null
  configuredReferences: any | null
}

interface WorkflowActions {
  // Mode
  setMode: (mode: 'story' | 'music-video') => void
  
  // Loading & Errors
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Workflow stages
  setStage: (stage: WorkflowState['stage']) => void
  updateProgress: (current: number, total: number, message?: string) => void
  
  // References
  setShowReferenceConfig: (show: boolean) => void
  setExtractedReferences: (refs: any) => void
  setConfiguredReferences: (refs: any) => void
  
  // Reset
  resetWorkflow: () => void
}

type WorkflowStore = WorkflowState & WorkflowActions

const initialState: WorkflowState = {
  mode: 'story',
  isLoading: false,
  error: null,
  stage: 'idle',
  progress: {
    current: 0,
    total: 0,
    message: ''
  },
  showReferenceConfig: false,
  extractedReferences: null,
  configuredReferences: null
}

export const useWorkflowCoordinator = create<WorkflowStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Mode
      setMode: (mode) => set({ mode, error: null }),
      
      // Loading & Errors
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Workflow stages
      setStage: (stage) => set({ stage }),
      updateProgress: (current, total, message) => set((state) => ({
        progress: {
          current,
          total,
          message: message || state.progress.message
        }
      })),
      
      // References
      setShowReferenceConfig: (show) => set({ showReferenceConfig: show }),
      setExtractedReferences: (refs) => set({ 
        extractedReferences: refs,
        configuredReferences: null // Reset configured when new extraction
      }),
      setConfiguredReferences: (refs) => set({ configuredReferences: refs }),
      
      // Reset
      resetWorkflow: () => set({
        ...initialState,
        mode: useWorkflowCoordinator.getState().mode // Keep current mode
      })
    }),
    {
      name: 'workflow-coordinator'
    }
  )
)