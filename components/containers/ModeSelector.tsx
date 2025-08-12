'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

export function ModeSelector() {
  const { mode, setMode } = useAppStore()

  // Dispatch custom event when mode changes
  useEffect(() => {
    const event = new CustomEvent('dsvb:mode-change', { detail: { mode } })
    window.dispatchEvent(event)
  }, [mode])

  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === 'story' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('story')}
        className={cn(
          "flex-1 transition-all",
          mode === 'story' && "shadow-sm"
        )}
      >
        Story Mode
      </Button>
      <Button
        variant={mode === 'music-video' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('music-video')}
        className={cn(
          "flex-1 transition-all",
          mode === 'music-video' && "shadow-sm"
        )}
      >
        Music Video Mode
      </Button>
    </div>
  )
}