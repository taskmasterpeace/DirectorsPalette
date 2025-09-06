'use client'

import { useState } from 'react'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { cn } from '@/lib/utils'
import { Wand2, Sparkles, Loader2 } from 'lucide-react'

interface MagicWandButtonProps {
  onMagic: () => Promise<void>
  disabled?: boolean
  variant?: 'glass' | 'sleek' | 'neon'
  colorScheme?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber'
  size?: 'sm' | 'default' | 'lg'
  tooltip?: string
  className?: string
}

export function MagicWandButton({
  onMagic,
  disabled = false,
  variant = 'glass',
  colorScheme = 'blue',
  size = 'sm',
  tooltip = 'Auto-generate with AI',
  className
}: MagicWandButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [justGenerated, setJustGenerated] = useState(false)

  const handleClick = async () => {
    if (isGenerating || disabled) return
    
    setIsGenerating(true)
    try {
      await onMagic()
      setJustGenerated(true)
      setTimeout(() => setJustGenerated(false), 2000)
    } catch (error) {
      console.error('Magic wand error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative group">
      <EnhancedButton
        variant={variant}
        colorScheme={colorScheme}
        size={size}
        onClick={handleClick}
        disabled={disabled || isGenerating}
        className={cn(
          "transition-all duration-300 relative",
          isGenerating && "animate-pulse",
          justGenerated && "animate-bounce",
          !disabled && !isGenerating && "hover:scale-110",
          className
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : justGenerated ? (
          <Sparkles className="w-4 h-4 animate-pulse" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
      </EnhancedButton>

      {/* Tooltip */}
      <div className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50",
        disabled && "hidden"
      )}>
        {isGenerating ? 'Generating...' : justGenerated ? 'Generated!' : tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-900" />
      </div>

      {/* Magic sparkles animation */}
      {isGenerating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-current rounded-full animate-ping"
              style={{
                top: `${20 + (i * 20)}%`,
                left: `${20 + (i * 20)}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}