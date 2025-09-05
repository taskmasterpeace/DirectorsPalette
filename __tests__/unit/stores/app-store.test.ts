import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/app-store'

describe('App Store', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('should initialize with default values', () => {
    const state = useAppStore.getState()
    expect(state.mode).toBe('story')
    expect(state.isLoading).toBe(false)
    expect(state.showProjectManager).toBe(false)
  })

  it('should change mode', () => {
    const { setMode } = useAppStore.getState()
    setMode('music-video')
    
    const state = useAppStore.getState()
    expect(state.mode).toBe('music-video')
  })

  it('should toggle loading state', () => {
    const { setIsLoading } = useAppStore.getState()
    setIsLoading(true)
    
    expect(useAppStore.getState().isLoading).toBe(true)
    
    setIsLoading(false)
    expect(useAppStore.getState().isLoading).toBe(false)
  })

  it('should manage project manager visibility', () => {
    const { setShowProjectManager } = useAppStore.getState()
    setShowProjectManager(true)
    
    expect(useAppStore.getState().showProjectManager).toBe(true)
    
    setShowProjectManager(false)
    expect(useAppStore.getState().showProjectManager).toBe(false)
  })

  it('should set current project ID', () => {
    const { setCurrentProjectId } = useAppStore.getState()
    const projectId = 'test-project-123'
    
    setCurrentProjectId(projectId)
    expect(useAppStore.getState().currentProjectId).toBe(projectId)
  })

  it('should manage custom director form', () => {
    const { setShowCustomDirectorForm, setCustomDirectorName, setCustomDirectorDescription } = useAppStore.getState()
    
    setShowCustomDirectorForm(true)
    setCustomDirectorName('Test Director')
    setCustomDirectorDescription('Test Description')
    
    const state = useAppStore.getState()
    expect(state.showCustomDirectorForm).toBe(true)
    expect(state.customDirectorName).toBe('Test Director')
    expect(state.customDirectorDescription).toBe('Test Description')
  })
})