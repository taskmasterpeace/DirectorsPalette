'use client'

import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react'
import { useReferenceAutocomplete, type ReferenceItem } from '@/hooks/useReferenceAutocomplete'
import { ReferenceAutocomplete } from './ReferenceAutocomplete'
import { cn } from '@/lib/utils'

interface ReferenceInputProps {
  value: string
  onChange: (value: string) => void
  onImageSelect?: (imageItem: ReferenceItem) => void
  placeholder?: string
  className?: string
  rows?: number
  disabled?: boolean
  autoFocus?: boolean
  maxLength?: number
  'data-testid'?: string
}

export interface ReferenceInputRef {
  focus: () => void
  blur: () => void
  setSelectionRange: (start: number, end: number) => void
  getValue: () => string
  setValue: (value: string) => void
}

export const ReferenceInput = forwardRef<ReferenceInputRef, ReferenceInputProps>(
  ({
    value,
    onChange,
    onImageSelect,
    placeholder = "Type @ to reference prompts and images...",
    className = '',
    rows = 4,
    disabled = false,
    autoFocus = false,
    maxLength,
    'data-testid': dataTestId,
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)

    // Handle image selection from autocomplete
    const handleImageSelect = useCallback((imageItem: ReferenceItem) => {
      // Call the external callback if provided
      onImageSelect?.(imageItem)
    }, [onImageSelect])

    // Handle text selection from autocomplete
    const handleReferenceSelect = useCallback((item: ReferenceItem, newText: string) => {
      onChange(newText)
    }, [onChange])

    const {
      textareaRef,
      autocompleteState,
      handleTextChange,
      handleKeyDown,
      selectItem,
      getDropdownPosition
    } = useReferenceAutocomplete({
      onSelect: handleReferenceSelect,
      onImageSelect: handleImageSelect,
      maxItems: 8, // Slightly reduced for better UX
      minQueryLength: 0 // Show all references immediately after @
    })

    // Combine refs
    useImperativeHandle(ref, () => ({
      focus: () => internalRef.current?.focus(),
      blur: () => internalRef.current?.blur(),
      setSelectionRange: (start: number, end: number) => {
        internalRef.current?.setSelectionRange(start, end)
      },
      getValue: () => internalRef.current?.value || '',
      setValue: (newValue: string) => {
        if (internalRef.current) {
          internalRef.current.value = newValue
          onChange(newValue)
        }
      }
    }), [onChange])

    // Set both refs
    const setRefs = useCallback((element: HTMLTextAreaElement | null) => {
      if (internalRef) {
        internalRef.current = element
      }
      if (textareaRef) {
        textareaRef.current = element
      }
    }, [textareaRef])

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const cursorPosition = e.target.selectionStart

      onChange(newValue)
      handleTextChange(newValue, cursorPosition)
    }, [onChange, handleTextChange])

    // Handle key events
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Let the autocomplete hook handle navigation keys
      const handled = handleKeyDown(e)

      // If not handled by autocomplete, continue with normal behavior
      if (!handled) {
        // Handle other key events if needed
      }
    }, [handleKeyDown])

    // Handle cursor position changes
    const handleSelectionChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement
      const cursorPosition = target.selectionStart
      handleTextChange(target.value, cursorPosition)
    }, [handleTextChange])

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          data-testid={dataTestId}
          className={cn(
            "w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none",
            "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        />

        {/* Autocomplete Dropdown */}
        <ReferenceAutocomplete
          autocompleteState={autocompleteState}
          position={getDropdownPosition()}
          onSelect={selectItem}
        />
      </div>
    )
  }
)

ReferenceInput.displayName = 'ReferenceInput'

export default ReferenceInput