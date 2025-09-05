/**
 * Unified App Store
 * Single source of truth for all application state
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ReferenceSet, Breakdown, Shot } from '@/services/unified-generation-service'

// ============ STATE TYPES ============
interface AppMode {
  current: 'story' | 'music-video'
  isLoading: boolean
  error: string | null
}

interface ContentState {
  // Story mode content
  story: {
    text: string
    director: string
    directorNotes: string
    chapterMethod: string
    chapterCount: number
  }
  
  // Music video mode content
  musicVideo: {
    songTitle: string
    artist: string
    genre: string
    lyrics: string
    concept: string
    director: string
    directorNotes: string
  }
}

interface GenerationState {
  // Current generation workflow
  workflow: {
    stage: 'idle' | 'extracting' | 'configuring' | 'generating' | 'complete'
    progress: { current: number; total: number }
    message: string
  }
  
  // Extracted references (before configuration)
  extractedReferences: ReferenceSet | null
  
  // Configured references (after user edits)
  configuredReferences: ReferenceSet | null
  
  // Generated breakdown
  breakdown: Breakdown | null
  
  // Additional shots by section
  additionalShots: Record<string, Shot[]>
  
  // UI state
  ui: {
    showReferenceConfig: boolean
    expandedSections: Record<string, boolean>
    selectedSection: string | null
  }
}

// ============ ACTIONS ============
interface AppActions {
  // Mode management
  setMode: (mode: 'story' | 'music-video') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Content management
  updateStoryContent: (updates: Partial<ContentState['story']>) => void
  updateMusicVideoContent: (updates: Partial<ContentState['musicVideo']>) => void
  
  // Workflow management
  setWorkflowStage: (stage: GenerationState['workflow']['stage']) => void
  updateWorkflowProgress: (current: number, total: number, message?: string) => void
  
  // Reference management
  setExtractedReferences: (refs: ReferenceSet | null) => void
  setConfiguredReferences: (refs: ReferenceSet | null) => void
  updateReference: (type: 'characters' | 'locations' | 'props', id: string, updates: any) => void
  addReference: (type: 'characters' | 'locations' | 'props', ref: any) => void
  removeReference: (type: 'characters' | 'locations' | 'props', id: string) => void
  
  // Breakdown management
  setBreakdown: (breakdown: Breakdown | null) => void
  addAdditionalShots: (sectionId: string, shots: Shot[]) => void
  
  // UI management
  setShowReferenceConfig: (show: boolean) => void
  toggleSectionExpanded: (sectionId: string) => void
  setSelectedSection: (sectionId: string | null) => void
  
  // Reset functions
  resetWorkflow: () => void
  resetAll: () => void
}

// ============ STORE ============
type UnifiedAppStore = AppMode & ContentState & GenerationState & AppActions

const initialState: AppMode & ContentState & GenerationState = {
  // Mode
  current: 'story',
  isLoading: false,
  error: null,
  
  // Content
  story: {
    text: '',
    director: 'nolan',
    directorNotes: '',
    chapterMethod: 'ai-suggested',
    chapterCount: 4
  },
  musicVideo: {
    songTitle: '',
    artist: '',
    genre: '',
    lyrics: '',
    concept: '',
    director: 'hype-williams',
    directorNotes: ''
  },
  
  // Generation
  workflow: {
    stage: 'idle',
    progress: { current: 0, total: 0 },
    message: ''
  },
  extractedReferences: null,
  configuredReferences: null,
  breakdown: null,
  additionalShots: {},
  
  // UI
  ui: {
    showReferenceConfig: false,
    expandedSections: {},
    selectedSection: null
  }
}

export const useUnifiedStore = create<UnifiedAppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Mode management
        setMode: (mode) => set({ current: mode }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        // Content management
        updateStoryContent: (updates) => set((state) => ({
          story: { ...state.story, ...updates }
        })),
        updateMusicVideoContent: (updates) => set((state) => ({
          musicVideo: { ...state.musicVideo, ...updates }
        })),
        
        // Workflow management
        setWorkflowStage: (stage) => set((state) => ({
          workflow: { ...state.workflow, stage }
        })),
        updateWorkflowProgress: (current, total, message) => set((state) => ({
          workflow: {
            ...state.workflow,
            progress: { current, total },
            message: message || state.workflow.message
          }
        })),
        
        // Reference management
        setExtractedReferences: (refs) => set({ extractedReferences: refs }),
        setConfiguredReferences: (refs) => set({ configuredReferences: refs }),
        updateReference: (type, id, updates) => set((state) => {
          const refs = state.configuredReferences || state.extractedReferences
          if (!refs) return state
          
          const updated = { ...refs }
          updated[type] = updated[type].map(ref => 
            ref.id === id ? { ...ref, ...updates } : ref
          )
          
          return { configuredReferences: updated }
        }),
        addReference: (type, ref) => set((state) => {
          const refs = state.configuredReferences || state.extractedReferences || {
            characters: [],
            locations: [],
            props: []
          }
          
          const updated = { ...refs }
          updated[type] = [...updated[type], {
            ...ref,
            id: ref.id || `${type}-${Date.now()}`
          }]
          
          return { configuredReferences: updated }
        }),
        removeReference: (type, id) => set((state) => {
          const refs = state.configuredReferences || state.extractedReferences
          if (!refs) return state
          
          const updated = { ...refs }
          updated[type] = updated[type].filter(ref => ref.id !== id)
          
          return { configuredReferences: updated }
        }),
        
        // Breakdown management
        setBreakdown: (breakdown) => set({ 
          breakdown,
          // Auto-expand all sections when breakdown is set
          ui: {
            ...get().ui,
            expandedSections: breakdown 
              ? breakdown.sections.reduce((acc, section) => ({
                  ...acc,
                  [section.id]: true
                }), {})
              : {}
          }
        }),
        addAdditionalShots: (sectionId, shots) => set((state) => ({
          additionalShots: {
            ...state.additionalShots,
            [sectionId]: [...(state.additionalShots[sectionId] || []), ...shots]
          }
        })),
        
        // UI management
        setShowReferenceConfig: (show) => set((state) => ({
          ui: { ...state.ui, showReferenceConfig: show }
        })),
        toggleSectionExpanded: (sectionId) => set((state) => ({
          ui: {
            ...state.ui,
            expandedSections: {
              ...state.ui.expandedSections,
              [sectionId]: !state.ui.expandedSections[sectionId]
            }
          }
        })),
        setSelectedSection: (sectionId) => set((state) => ({
          ui: { ...state.ui, selectedSection: sectionId }
        })),
        
        // Reset functions
        resetWorkflow: () => set({
          workflow: initialState.workflow,
          extractedReferences: null,
          configuredReferences: null,
          breakdown: null,
          additionalShots: {},
          ui: initialState.ui
        }),
        resetAll: () => set(initialState)
      }),
      {
        name: 'unified-app-store',
        partialize: (state) => ({
          // Only persist content and preferences
          current: state.current,
          story: state.story,
          musicVideo: state.musicVideo
        })
      }
    ),
    {
      name: 'unified-app-store'
    }
  )
)

// ============ SELECTORS ============
export const selectCurrentContent = (state: UnifiedAppStore) => 
  state.current === 'story' ? state.story : state.musicVideo

export const selectReferences = (state: UnifiedAppStore) => 
  state.configuredReferences || state.extractedReferences

export const selectIsReady = (state: UnifiedAppStore) => {
  if (state.current === 'story') {
    return state.story.text.trim().length > 0
  } else {
    return state.musicVideo.songTitle.trim().length > 0 && 
           state.musicVideo.lyrics.trim().length > 0
  }
}