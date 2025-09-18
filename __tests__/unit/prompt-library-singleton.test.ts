import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearAllPromptDuplicates, resetPromptLoader } from '@/components/prompt-library/NanoBananaPromptLoader'
import { usePromptLibraryStore } from '@/stores/prompt-library-store'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('NanoBananaPromptLoader Singleton Pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)

    // Reset the store
    usePromptLibraryStore.setState({
      prompts: [],
      quickPrompts: [],
    })

    // Reset the singleton for each test
    resetPromptLoader()
  })

  it('should clear duplicate prompts correctly', async () => {
    // Setup duplicate prompts in localStorage
    const duplicatedData = {
      state: {
        prompts: [
          { id: 'light-001', title: 'Golden Hour', categoryId: 'lighting', isQuickAccess: true },
          { id: 'light-001', title: 'Golden Hour', categoryId: 'lighting', isQuickAccess: true }, // Duplicate
          { id: 'light-002', title: 'Neon Light', categoryId: 'lighting', isQuickAccess: false },
          { id: 'light-002', title: 'Neon Light', categoryId: 'lighting', isQuickAccess: false }, // Duplicate
          { id: 'cin-001', title: 'Wide Shot', categoryId: 'cinematic', isQuickAccess: false },
        ],
        quickPrompts: [
          { id: 'light-001', title: 'Golden Hour', isQuickAccess: true },
          { id: 'light-001', title: 'Golden Hour', isQuickAccess: true }, // Duplicate
        ]
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(duplicatedData))

    await clearAllPromptDuplicates()

    // Verify localStorage.setItem was called with deduplicated data
    expect(localStorageMock.setItem).toHaveBeenCalled()

    const setItemCalls = localStorageMock.setItem.mock.calls
    const lastCall = setItemCalls[setItemCalls.length - 1]
    const updatedData = JSON.parse(lastCall[1])

    // Should have 3 unique prompts (removed 2 duplicates)
    expect(updatedData.state.prompts).toHaveLength(3)

    // Check that we have the correct unique IDs
    const uniqueIds = updatedData.state.prompts.map((p: any) => p.id)
    expect(uniqueIds).toEqual(['light-001', 'light-002', 'cin-001'])

    // Quick prompts should also be deduplicated
    expect(updatedData.state.quickPrompts).toHaveLength(1)
  })

  it('should handle empty localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    await clearAllPromptDuplicates()

    // Should not throw error and should not call setItem
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  it('should handle malformed localStorage data gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    await clearAllPromptDuplicates()

    // Should not throw error and should not call setItem
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  it('should preserve non-duplicate prompts', async () => {
    const uniqueData = {
      state: {
        prompts: [
          { id: 'light-001', title: 'Golden Hour', categoryId: 'lighting' },
          { id: 'light-002', title: 'Neon Light', categoryId: 'lighting' },
          { id: 'cin-001', title: 'Wide Shot', categoryId: 'cinematic' },
        ],
        quickPrompts: [
          { id: 'light-001', isQuickAccess: true },
        ]
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(uniqueData))

    await clearAllPromptDuplicates()

    // Should not modify localStorage if no duplicates found
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  it('should update Zustand store when duplicates are found', async () => {
    const duplicatedData = {
      state: {
        prompts: [
          { id: 'light-001', title: 'Golden Hour', categoryId: 'lighting', isQuickAccess: true },
          { id: 'light-001', title: 'Golden Hour', categoryId: 'lighting', isQuickAccess: true }, // Duplicate
        ],
        quickPrompts: [
          { id: 'light-001', title: 'Golden Hour', isQuickAccess: true },
          { id: 'light-001', title: 'Golden Hour', isQuickAccess: true }, // Duplicate
        ]
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(duplicatedData))

    await clearAllPromptDuplicates()

    // Check that the store was updated with deduplicated data
    const storeState = usePromptLibraryStore.getState()
    expect(storeState.prompts).toHaveLength(1)
    expect(storeState.quickPrompts).toHaveLength(1)
    expect(storeState.prompts[0].id).toBe('light-001')
  })

  it('should handle prompts with missing properties gracefully', async () => {
    const malformedData = {
      state: {
        prompts: [
          { id: 'light-001', title: 'Golden Hour' }, // Missing categoryId
          { title: 'No ID Prompt', categoryId: 'lighting' }, // Missing id
          { id: 'light-002', title: 'Neon Light', categoryId: 'lighting' },
          { id: 'light-002', title: 'Neon Light', categoryId: 'lighting' }, // Duplicate to test filtering
        ],
        quickPrompts: []
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(malformedData))

    await clearAllPromptDuplicates()

    // Should handle malformed data without crashing and remove duplicates
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })
})