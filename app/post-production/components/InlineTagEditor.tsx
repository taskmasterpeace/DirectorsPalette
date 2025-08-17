'use client'

import { useState, useRef, useEffect } from 'react'
import { Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface InlineTagEditorProps {
  value?: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export default function InlineTagEditor({
  value = '',
  onSave,
  placeholder = 'Add tag...',
  className,
  autoFocus = true
}: InlineTagEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing, autoFocus])

  const handleSave = () => {
    const cleanValue = editValue.trim().replace(/[@\s]/g, '').toLowerCase()
    if (cleanValue !== value) {
      onSave(cleanValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Tag className="w-3 h-3 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-6 text-xs bg-transparent border-slate-600 focus:border-purple-500 px-2"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
    >
      <Tag className="w-3 h-3" />
      <span className={cn("text-xs", !value && "text-slate-400")}>
        {value ? `@${value}` : placeholder}
      </span>
    </div>
  )
}