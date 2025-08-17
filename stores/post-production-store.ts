import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PostProductionShot, GenerationSettings, ReplicateJob } from '@/lib/post-production/types'

interface PostProductionState {
  // Shot queue
  shotQueue: PostProductionShot[]
  processingShot: PostProductionShot | null
  completedShots: PostProductionShot[]
  failedShots: PostProductionShot[]
  
  // Generation settings
  settings: GenerationSettings
  activeJobs: ReplicateJob[]
  
  // UI state
  selectedShots: Set<string>
  isGenerating: boolean
  currentProgress: number
  totalProgress: number
}

interface PostProductionActions {
  // Shot management
  addShots: (shots: PostProductionShot[]) => void
  removeShot: (shotId: string) => void
  clearQueue: () => void
  
  // Processing
  setProcessingShot: (shot: PostProductionShot | null) => void
  markShotCompleted: (shotId: string, images: any[]) => void
  markShotFailed: (shotId: string, error: string) => void
  retryShot: (shotId: string) => void
  
  // Settings
  updateSettings: (settings: Partial<GenerationSettings>) => void
  
  // Jobs
  addJob: (job: ReplicateJob) => void
  updateJob: (jobId: string, updates: Partial<ReplicateJob>) => void
  removeJob: (jobId: string) => void
  
  // UI
  toggleShotSelection: (shotId: string) => void
  selectAllShots: () => void
  deselectAllShots: () => void
  setIsGenerating: (isGenerating: boolean) => void
  updateProgress: (current: number, total: number) => void
  
  // Reset
  resetStore: () => void
}

const initialState: PostProductionState = {
  shotQueue: [],
  processingShot: null,
  completedShots: [],
  failedShots: [],
  settings: {
    model: 'stability-ai/stable-diffusion',
    numOutputs: 1,
    quality: 'standard'
  },
  activeJobs: [],
  selectedShots: new Set(),
  isGenerating: false,
  currentProgress: 0,
  totalProgress: 0
}

export const usePostProductionStore = create<PostProductionState & PostProductionActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Shot management
        addShots: (shots) => set((state) => ({
          shotQueue: [...state.shotQueue, ...shots]
        })),
        
        removeShot: (shotId) => set((state) => ({
          shotQueue: state.shotQueue.filter(s => s.id !== shotId),
          completedShots: state.completedShots.filter(s => s.id !== shotId),
          failedShots: state.failedShots.filter(s => s.id !== shotId)
        })),
        
        clearQueue: () => set({
          shotQueue: [],
          processingShot: null,
          completedShots: [],
          failedShots: []
        }),
        
        // Processing
        setProcessingShot: (shot) => set({ processingShot: shot }),
        
        markShotCompleted: (shotId, images) => set((state) => {
          const shot = state.shotQueue.find(s => s.id === shotId) || state.processingShot
          if (!shot) return state
          
          const completedShot = {
            ...shot,
            status: 'completed' as const,
            generatedImages: images
          }
          
          return {
            shotQueue: state.shotQueue.filter(s => s.id !== shotId),
            processingShot: state.processingShot?.id === shotId ? null : state.processingShot,
            completedShots: [...state.completedShots, completedShot]
          }
        }),
        
        markShotFailed: (shotId, error) => set((state) => {
          const shot = state.shotQueue.find(s => s.id === shotId) || state.processingShot
          if (!shot) return state
          
          const failedShot = {
            ...shot,
            status: 'failed' as const
          }
          
          return {
            shotQueue: state.shotQueue.filter(s => s.id !== shotId),
            processingShot: state.processingShot?.id === shotId ? null : state.processingShot,
            failedShots: [...state.failedShots, failedShot]
          }
        }),
        
        retryShot: (shotId) => set((state) => {
          const shot = state.failedShots.find(s => s.id === shotId)
          if (!shot) return state
          
          return {
            failedShots: state.failedShots.filter(s => s.id !== shotId),
            shotQueue: [...state.shotQueue, { ...shot, status: 'pending' }]
          }
        }),
        
        // Settings
        updateSettings: (settings) => set((state) => ({
          settings: { ...state.settings, ...settings }
        })),
        
        // Jobs
        addJob: (job) => set((state) => ({
          activeJobs: [...state.activeJobs, job]
        })),
        
        updateJob: (jobId, updates) => set((state) => ({
          activeJobs: state.activeJobs.map(j => 
            j.id === jobId ? { ...j, ...updates } : j
          )
        })),
        
        removeJob: (jobId) => set((state) => ({
          activeJobs: state.activeJobs.filter(j => j.id !== jobId)
        })),
        
        // UI
        toggleShotSelection: (shotId) => set((state) => {
          const newSelection = new Set(state.selectedShots)
          if (newSelection.has(shotId)) {
            newSelection.delete(shotId)
          } else {
            newSelection.add(shotId)
          }
          return { selectedShots: newSelection }
        }),
        
        selectAllShots: () => set((state) => ({
          selectedShots: new Set([
            ...state.shotQueue.map(s => s.id),
            ...state.completedShots.map(s => s.id),
            ...state.failedShots.map(s => s.id)
          ])
        })),
        
        deselectAllShots: () => set({
          selectedShots: new Set()
        }),
        
        setIsGenerating: (isGenerating) => set({ isGenerating }),
        
        updateProgress: (current, total) => set({
          currentProgress: current,
          totalProgress: total
        }),
        
        // Reset
        resetStore: () => set(initialState)
      }),
      {
        name: 'post-production-store',
        partialize: (state) => ({
          shotQueue: state.shotQueue,
          completedShots: state.completedShots,
          failedShots: state.failedShots,
          settings: state.settings
        })
      }
    ),
    { name: 'post-production-store' }
  )
)