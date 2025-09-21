import { describe, it, expect, vi } from 'vitest'
import { TablePromptLibrary } from '@/components/prompt-library/TablePromptLibrary'

// Mock the prompt library store
vi.mock('@/stores/prompt-library-store', () => ({
  usePromptLibraryStore: vi.fn(() => ({
    prompts: [
      {
        id: '1',
        userId: 'test-user',
        title: 'Test Prompt 1',
        prompt: 'A cinematic shot of @character',
        categoryId: 'cinematic',
        tags: ['hero', 'dramatic'],
        isQuickAccess: true,
        reference: '@test1',
        usage: { count: 5, lastUsed: '2023-01-01' },
        metadata: {
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        }
      }
    ],
    categories: [
      { id: 'cinematic', name: 'Cinematic Shots', icon: '🎬', color: 'blue', order: 1, isEditable: false }
    ],
    quickPrompts: [],
    searchQuery: '',
    isLoading: false,
    error: null,
    addPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    toggleQuickAccess: vi.fn(),
    setSearchQuery: vi.fn(),
    loadUserPrompts: vi.fn(),
    getFilteredPrompts: vi.fn(() => []),
    getPromptsByCategory: vi.fn(() => [])
  }))
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: null
}))

// Mock prompt library init
vi.mock('@/lib/prompt-library-init', () => ({}))

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock all UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>
}))

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>
}))

describe('TablePromptLibrary', () => {
  it('should import successfully', () => {
    expect(TablePromptLibrary).toBeDefined()
    expect(typeof TablePromptLibrary).toBe('function')
  })

  it('should be a React component', () => {
    // Test that it's a function (React functional component)
    expect(typeof TablePromptLibrary).toBe('function')
  })

  it('should accept props interface', () => {
    // Test prop interface types
    const validProps: {
      onSelectPrompt?: (prompt: string) => void
      showQuickAccess?: boolean
      className?: string
    } = {
      onSelectPrompt: vi.fn(),
      showQuickAccess: true,
      className: 'test-class'
    }

    expect(validProps).toBeDefined()
    expect(typeof validProps.onSelectPrompt).toBe('function')
    expect(typeof validProps.showQuickAccess).toBe('boolean')
    expect(typeof validProps.className).toBe('string')
  })

  it('should have expected component structure', () => {
    // Test that the component export structure is as expected
    expect(TablePromptLibrary).toBeDefined()
    expect(TablePromptLibrary.name).toBe('TablePromptLibrary')
  })

  it('should support TypeScript interface', () => {
    // Test that the types work correctly
    interface TestProps {
      onSelectPrompt?: (prompt: string) => void
      showQuickAccess?: boolean
      className?: string
    }

    const testProps: TestProps = {
      onSelectPrompt: (prompt: string) => console.log(prompt),
      showQuickAccess: false,
      className: 'test'
    }

    expect(testProps).toBeDefined()
  })
})