'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePromptLibraryStore } from '@/stores/prompt-library-store'
import { useImageReferenceStore } from '@/stores/image-reference-store'

export interface ReferenceItem {
  id: string
  type: 'prompt' | 'image'
  reference: string
  title: string
  content?: string // For prompts
  url?: string // For images
  thumbnailUrl?: string // For images
  categoryId: string
  tags: string[]
}

export interface AutocompleteState {
  isOpen: boolean
  query: string
  items: ReferenceItem[]
  selectedIndex: number
  triggerPosition: number
  cursorPosition: number
}

export interface UseReferenceAutocompleteOptions {
  onSelect?: (item: ReferenceItem, insertText: string) => void
  onImageSelect?: (imageItem: ReferenceItem) => void
  maxItems?: number
  minQueryLength?: number
}

export function useReferenceAutocomplete({
  onSelect,
  onImageSelect,
  maxItems = 10,
  minQueryLength = 0
}: UseReferenceAutocompleteOptions = {}) {
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    isOpen: false,
    query: '',
    items: [],
    selectedIndex: 0,
    triggerPosition: 0,
    cursorPosition: 0
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { prompts, getAllReferences: getPromptReferences, getPromptByReference } = usePromptLibraryStore()
  const { images, getAllReferences: getImageReferences, getImageByReference } = useImageReferenceStore()

  // Get all reference items
  const getAllReferenceItems = useCallback((): ReferenceItem[] => {
    const promptItems: ReferenceItem[] = prompts
      .filter(p => p.reference)
      .map(p => ({
        id: p.id,
        type: 'prompt' as const,
        reference: p.reference!,
        title: p.title,
        content: p.prompt,
        categoryId: p.categoryId,
        tags: p.tags
      }))

    const imageItems: ReferenceItem[] = images
      .filter(img => img.reference)
      .map(img => ({
        id: img.id,
        type: 'image' as const,
        reference: img.reference!,
        title: img.name,
        url: img.url,
        thumbnailUrl: img.url, // Could be optimized with actual thumbnails
        categoryId: img.categoryId,
        tags: img.tags
      }))

    return [...promptItems, ...imageItems]
  }, [prompts, images])

  // Filter items based on query
  const filterItems = useCallback((query: string): ReferenceItem[] => {
    if (query.length < minQueryLength) return []

    const allItems = getAllReferenceItems()
    const queryLower = query.toLowerCase()

    const filtered = allItems.filter(item => {
      const referenceMatch = item.reference.toLowerCase().includes(queryLower)
      const titleMatch = item.title.toLowerCase().includes(queryLower)
      const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(queryLower))
      const contentMatch = item.content?.toLowerCase().includes(queryLower)

      return referenceMatch || titleMatch || tagMatch || contentMatch
    })

    // Sort by relevance
    return filtered.sort((a, b) => {
      // Exact reference match first
      if (a.reference.toLowerCase() === queryLower) return -1
      if (b.reference.toLowerCase() === queryLower) return 1

      // Reference starts with query
      if (a.reference.toLowerCase().startsWith(queryLower)) return -1
      if (b.reference.toLowerCase().startsWith(queryLower)) return 1

      // Title starts with query
      if (a.title.toLowerCase().startsWith(queryLower)) return -1
      if (b.title.toLowerCase().startsWith(queryLower)) return 1

      // Alphabetical by title
      return a.title.localeCompare(b.title)
    }).slice(0, maxItems)
  }, [getAllReferenceItems, minQueryLength, maxItems])

  // Detect @ trigger and update autocomplete state
  const handleTextChange = useCallback((text: string, cursorPosition: number) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Find the last @ before cursor position
    const beforeCursor = text.slice(0, cursorPosition)
    const lastAtIndex = beforeCursor.lastIndexOf('@')

    if (lastAtIndex === -1 || lastAtIndex < beforeCursor.lastIndexOf(' ')) {
      // No @ or @ is before the last space (not current word)
      setAutocompleteState(prev => ({ ...prev, isOpen: false }))
      return
    }

    // Extract query after @
    const query = beforeCursor.slice(lastAtIndex + 1)

    // Check if query contains spaces (invalid for references)
    if (query.includes(' ')) {
      setAutocompleteState(prev => ({ ...prev, isOpen: false }))
      return
    }

    const filteredItems = filterItems(query)

    setAutocompleteState({
      isOpen: true,
      query,
      items: filteredItems,
      selectedIndex: 0,
      triggerPosition: lastAtIndex,
      cursorPosition
    })
  }, [filterItems])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!autocompleteState.isOpen) return false

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setAutocompleteState(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.items.length - 1)
        }))
        return true

      case 'ArrowUp':
        e.preventDefault()
        setAutocompleteState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0)
        }))
        return true

      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (autocompleteState.items.length > 0) {
          selectItem(autocompleteState.items[autocompleteState.selectedIndex])
        }
        return true

      case 'Escape':
        e.preventDefault()
        setAutocompleteState(prev => ({ ...prev, isOpen: false }))
        return true

      default:
        return false
    }
  }, [autocompleteState])

  // Select an item from autocomplete
  const selectItem = useCallback((item: ReferenceItem) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value
    const { triggerPosition } = autocompleteState

    // Replace from @ to cursor with the reference
    const beforeAt = text.slice(0, triggerPosition)
    const afterCursor = text.slice(autocompleteState.cursorPosition)
    const newText = beforeAt + item.reference + ' ' + afterCursor
    const newCursorPosition = triggerPosition + item.reference.length + 1

    // Update textarea value
    textarea.value = newText
    textarea.setSelectionRange(newCursorPosition, newCursorPosition)

    // Close autocomplete
    setAutocompleteState(prev => ({ ...prev, isOpen: false }))

    // Call callbacks
    onSelect?.(item, newText)

    // If it's an image reference, also call the image select callback
    if (item.type === 'image') {
      onImageSelect?.(item)
    }

    // Trigger change event for React
    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)
  }, [autocompleteState, onSelect, onImageSelect])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!textareaRef.current?.contains(event.target as Node)) {
        setAutocompleteState(prev => ({ ...prev, isOpen: false }))
      }
    }

    if (autocompleteState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [autocompleteState.isOpen])

  // Get dropdown position relative to textarea
  const getDropdownPosition = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return { top: 0, left: 0 }

    // Create a temporary element to measure text position
    const tempSpan = document.createElement('span')
    tempSpan.style.font = window.getComputedStyle(textarea).font
    tempSpan.style.whiteSpace = 'pre'
    tempSpan.style.position = 'absolute'
    tempSpan.style.visibility = 'hidden'
    tempSpan.textContent = textarea.value.slice(0, autocompleteState.triggerPosition)

    document.body.appendChild(tempSpan)
    const textWidth = tempSpan.offsetWidth
    const textHeight = tempSpan.offsetHeight
    document.body.removeChild(tempSpan)

    const rect = textarea.getBoundingClientRect()
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20

    return {
      top: rect.top + textHeight + lineHeight,
      left: rect.left + (textWidth % rect.width)
    }
  }, [autocompleteState.triggerPosition])

  return {
    textareaRef,
    autocompleteState,
    handleTextChange,
    handleKeyDown,
    selectItem,
    getDropdownPosition,
    closeAutocomplete: () => setAutocompleteState(prev => ({ ...prev, isOpen: false }))
  }
}