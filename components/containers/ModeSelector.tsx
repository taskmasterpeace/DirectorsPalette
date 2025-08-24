'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

interface ModeButtonProps {
  mode: string
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
  className?: string
}

function ModeButton({ mode, icon, label, isActive, onClick, className }: ModeButtonProps) {
  const gradientColors = {
    story: 'from-blue-600 to-blue-500',
    'music-video': 'from-purple-600 to-purple-500', 
    commercial: 'from-emerald-600 to-emerald-500',
    'children-book': 'from-orange-600 to-orange-500'
  }

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      onClick={onClick}
      className={cn(
        "transition-all relative overflow-hidden h-11 sm:h-12 text-sm sm:text-sm font-medium",
        isActive 
          ? `bg-gradient-to-r ${gradientColors[mode as keyof typeof gradientColors]} hover:opacity-90 shadow-md text-white` 
          : "hover:bg-slate-700 text-slate-300 hover:text-white",
        className
      )}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      )}
      <span className="relative flex items-center gap-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs">{label}</span>
      </span>
    </Button>
  )
}

export function ModeSelector() {
  const { mode, setMode } = useAppStore()

  // Dispatch custom event when mode changes
  useEffect(() => {
    const event = new CustomEvent('dsvb:mode-change', { detail: { mode } })
    window.dispatchEvent(event)
  }, [mode])

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mobile Layout: 2x2 Grid for better touch targets */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700 shadow-lg sm:hidden">
        <ModeButton 
          mode="story" 
          icon="📖" 
          label="Story" 
          isActive={mode === 'story'} 
          onClick={() => setMode('story')} 
        />
        <ModeButton 
          mode="music-video" 
          icon="🎵" 
          label="Music Video" 
          isActive={mode === 'music-video'} 
          onClick={() => setMode('music-video')} 
        />
        <ModeButton 
          mode="commercial" 
          icon="💼" 
          label="Commercial" 
          isActive={mode === 'commercial'} 
          onClick={() => setMode('commercial')} 
        />
        <ModeButton 
          mode="children-book" 
          icon="📚" 
          label="Kids Book" 
          isActive={mode === 'children-book'} 
          onClick={() => setMode('children-book')} 
        />
      </div>
      
      {/* Desktop Layout: Single Row */}
      <div className="hidden sm:grid sm:grid-cols-4 sm:gap-1 sm:p-1 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
        <ModeButton 
          mode="story" 
          icon="📖" 
          label="Story" 
          isActive={mode === 'story'} 
          onClick={() => setMode('story')} 
        />
        <ModeButton 
          mode="music-video" 
          icon="🎵" 
          label="Music Video" 
          isActive={mode === 'music-video'} 
          onClick={() => setMode('music-video')} 
        />
        <ModeButton 
          mode="commercial" 
          icon="💼" 
          label="Commercial" 
          isActive={mode === 'commercial'} 
          onClick={() => setMode('commercial')} 
        />
        <ModeButton 
          mode="children-book" 
          icon="📚" 
          label="Children's Book" 
          isActive={mode === 'children-book'} 
          onClick={() => setMode('children-book')} 
        />
      </div>
    </div>
  )
}