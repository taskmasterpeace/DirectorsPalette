import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionManagement } from '@/hooks/useSessionManagement'

describe('useSessionManagement', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should save session state to localStorage', () => {
    const { result } = renderHook(() => useSessionManagement())
    
    act(() => {
      result.current.saveSessionState()
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'dsvb:session:v3',
      expect.any(String)
    )
  })

  it('should load session state from localStorage', () => {
    const mockSession = {
      version: 3,
      mode: 'story',
      story: {
        text: 'Test story',
        directorNotes: 'Test notes'
      },
      timestamp: Date.now()
    }
    
    localStorage.getItem.mockReturnValue(JSON.stringify(mockSession))
    
    const { result } = renderHook(() => useSessionManagement())
    
    act(() => {
      result.current.loadSessionState()
    })

    expect(localStorage.getItem).toHaveBeenCalledWith('dsvb:session:v3')
  })

  it('should clear session from localStorage', () => {
    const { result } = renderHook(() => useSessionManagement())
    
    act(() => {
      result.current.clearSession()
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('dsvb:session:v3')
  })
})