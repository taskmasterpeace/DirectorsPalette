'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface PromptModalConfig {
  title: string
  description?: string
  placeholder?: string
  defaultValue?: string
  validation?: (value: string) => string | null // Return error message or null if valid
  required?: boolean
  maxLength?: number
  variant?: 'default' | 'destructive'
}

interface PromptModalProps {
  isOpen: boolean
  config: PromptModalConfig
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function PromptModal({ isOpen, config, onConfirm, onCancel }: PromptModalProps) {
  const [value, setValue] = useState(config.defaultValue || '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = ''
    }
    return () => {
      document.body.style.pointerEvents = ''
    }
  }, [isOpen])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue(config.defaultValue || '')
      setError(null)
      // Focus input after a short delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, config.defaultValue])

  // Validate input value
  const validateValue = useCallback((inputValue: string) => {
    const trimmedValue = inputValue.trim()

    // Check if required
    if (config.required && !trimmedValue) {
      return 'This field is required'
    }

    // Check max length
    if (config.maxLength && trimmedValue.length > config.maxLength) {
      return `Maximum ${config.maxLength} characters allowed`
    }

    // Custom validation
    if (config.validation) {
      return config.validation(trimmedValue)
    }

    return null
  }, [config])

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Clear error if user is typing
    if (error) {
      setError(null)
    }
  }

  // Handle form submission
  const handleConfirm = () => {
    const trimmedValue = value.trim()
    const validationError = validateValue(trimmedValue)

    if (validationError) {
      setError(validationError)
      inputRef.current?.focus()
      return
    }

    onConfirm(trimmedValue)
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  // Prevent modal from closing when clicking inside content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className={cn(
          "sm:max-w-md",
          config.variant === 'destructive' && "border-red-200 dark:border-red-900"
        )}
        onClick={handleContentClick}
        showCloseButton={false}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className={cn(
            "text-lg font-semibold",
            config.variant === 'destructive' ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"
          )}>
            {config.title}
          </DialogTitle>
          {config.description && (
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {config.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Enter value:
            </Label>
            <Input
              id="prompt-input"
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder}
              maxLength={config.maxLength}
              className={cn(
                "transition-all duration-200",
                error && "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-700"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? "prompt-error" : undefined}
            />
            {error && (
              <p id="prompt-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            {config.maxLength && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {value.length} / {config.maxLength} characters
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant={config.variant === 'destructive' ? 'destructive' : 'default'}
            className={cn(
              "flex-1 sm:flex-none",
              config.variant !== 'destructive' && "bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-600/20 dark:bg-purple-700 dark:hover:bg-purple-600"
            )}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export function usePromptModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    config: PromptModalConfig
    resolve?: (value: string | null) => void
  }>({
    isOpen: false,
    config: { title: '' }
  })

  const showPrompt = useCallback((config: PromptModalConfig): Promise<string | null> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        config,
        resolve
      })
    })
  }, [])

  const handleConfirm = useCallback((value: string) => {
    if (modalState.resolve) {
      modalState.resolve(value)
    }
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [modalState])

  const handleCancel = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve(null)
    }
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [modalState])

  const PromptModalComponent = useCallback(() => (
    <PromptModal
      isOpen={modalState.isOpen}
      config={modalState.config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [modalState.isOpen, modalState.config, handleConfirm, handleCancel])

  return {
    showPrompt,
    PromptModal: PromptModalComponent
  }
}