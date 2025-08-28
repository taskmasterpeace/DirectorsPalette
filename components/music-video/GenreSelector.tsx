'use client'

import { CompactGenreSelector } from '@/components/shared/CompactGenreSelector'

interface GenreSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function GenreSelector({ value, onChange, className = '' }: GenreSelectorProps) {
  // Convert string value to array for compact selector
  const currentGenres = value ? value.split(', ').filter(Boolean) : []
  
  const handleChange = (newValue: string | string[]) => {
    if (Array.isArray(newValue)) {
      onChange(newValue.join(', '))
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className={className}>
      <CompactGenreSelector
        mode="multi"
        value={currentGenres}
        onChange={handleChange}
        maxSelections={5}
        placeholder="Choose genres..."
      />
    </div>
  )
}