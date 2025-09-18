'use client'

import { useState, useCallback } from 'react'
import { Gen4Settings, Generation, ImageReference } from './types'
import { saveImageToLibrary, referenceLibraryDB } from '@/lib/referenceLibrary'
import { useTagPrompt } from '@/components/providers/PromptProvider'

export function useGen4Logic(props: {
  gen4Generations: Generation[]
  gen4ReferenceImages: ImageReference[]
  gen4Prompt: string
  gen4Settings: Gen4Settings
  generateGen4: () => void
  removeGeneration: (id: string) => void
  saveToLibrary: (generation: Generation) => void
}) {
  const [showPromptTemplates, setShowPromptTemplates] = useState(false)
  const [showLibraryBrowser, setShowLibraryBrowser] = useState(false)
  const showTagPrompt = useTagPrompt()

  const handleSaveToLibrary = useCallback(async (generation: Generation) => {
    if (!generation.outputUrl) {
      console.log('No outputUrl found')
      return
    }

    try {
      const result = await saveImageToLibrary(
        generation.outputUrl,
        [], // Start with no tags
        props.gen4Prompt,
        'generated',
        props.gen4Settings
      )

      console.log('Saved to library successfully! ID:', result)

      // Trigger a refresh of the library component
      window.dispatchEvent(new CustomEvent('libraryUpdated'))
    } catch (error) {
      console.error('Error saving to library:', error)
    }
  }, [props.gen4Prompt, props.gen4Settings])

  const handleSwapReference = useCallback(async (libraryReferenceId: string, targetIndex: number) => {
    try {
      const libraryRef = await referenceLibraryDB.getReference(libraryReferenceId)
      if (!libraryRef) {
        console.error('Library reference not found')
        return
      }

      // Create new reference from library item
      const newRef: ImageReference = {
        id: `lib_${Date.now()}`,
        url: libraryRef.url,
        source: 'library',
        libraryId: libraryReferenceId
      }

      // Update reference images at the target index
      const newRefs = [...props.gen4ReferenceImages]
      newRefs[targetIndex] = newRef

      // This would normally call a prop function to update parent state
      console.log('Reference swapped at index', targetIndex)
    } catch (error) {
      console.error('Error swapping reference:', error)
    }
  }, [props.gen4ReferenceImages])

  const handlePasteToSlot = useCallback((slotIndex: number) => {
    navigator.clipboard.read().then(items => {
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            item.getType(type).then(blob => {
              const files = new DataTransfer()
              const fileName = `pasted-ref-${slotIndex}-${Date.now()}.${type.split('/')[1]}`
              files.items.add(new File([blob], fileName, { type }))

              // This would normally call the handleFileUpload prop
              console.log('Pasted to slot', slotIndex)
            })
          }
        }
      }
    }).catch(err => {
      console.error("Error accessing clipboard:", err)
      alert("Unable to paste. Try Ctrl+V instead.")
    })
  }, [])

  const handleAddTag = useCallback(async (genId: string) => {
    const tag = await showTagPrompt()
    if (tag && tag.trim()) {
      // This would normally call the addTagToGen4Image prop
      console.log('Add tag to generation', genId, tag)
    }
  }, [showTagPrompt])

  return {
    showPromptTemplates,
    setShowPromptTemplates,
    showLibraryBrowser,
    setShowLibraryBrowser,
    handleSaveToLibrary,
    handleSwapReference,
    handlePasteToSlot,
    handleAddTag
  }
}