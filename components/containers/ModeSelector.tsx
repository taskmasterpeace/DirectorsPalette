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
    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
      <Button
        variant={mode === 'story' ? 'default' : 'ghost'}
        size="default"
        onClick={() => setMode('story')}
        className={cn(
          "transition-all min-h-[48px] relative overflow-hidden",
          mode === 'story' 
            ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md text-white" 
            : "hover:bg-slate-700 text-slate-300 hover:text-white"
        )}
      >
        {mode === 'story' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
        )}
        <span className="relative">📖 Story</span>
      </Button>
      <Button
        variant={mode === 'music-video' ? 'default' : 'ghost'}
        size="default"
        onClick={() => setMode('music-video')}
        className={cn(
          "transition-all min-h-[48px] relative overflow-hidden",
          mode === 'music-video' 
            ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-md text-white" 
            : "hover:bg-slate-700 text-slate-300 hover:text-white"
        )}
      >
        {mode === 'music-video' && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
        )}
        <span className="relative">🎵 Music Video</span>
      </Button>
      <Button
        variant={mode === 'commercial' ? 'default' : 'ghost'}
        size="default"
        onClick={() => setMode('commercial')}
        className={cn(
          "transition-all min-h-[48px] relative overflow-hidden",
          mode === 'commercial' 
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md text-white" 
            : "hover:bg-slate-700 text-slate-300 hover:text-white"
        )}
      >
        {mode === 'commercial' && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent"></div>
        )}
        <span className="relative">💼 Commercial</span>
      </Button>
    </div>
  )
}