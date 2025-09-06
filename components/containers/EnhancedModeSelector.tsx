'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from '@/components/ui/premium-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { cn } from '@/lib/utils'
import { Film, Music, Briefcase, BookOpen, ChevronRight, Sparkles } from 'lucide-react'

const modes = [
  {
    id: 'story',
    label: 'Story Mode',
    title: 'Cinematic Stories',
    description: 'Transform narratives into professional shot lists with director-specific styling',
    icon: Film,
    emoji: '🎬',
    backgroundImage: '/images/mode-backgrounds/story-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.90))',
    colorScheme: 'blue' as const,
    features: ['Chapter breakdown', 'Director styles', 'Shot composition']
  },
  {
    id: 'music-video',
    label: 'Music Video',
    title: 'Dynamic Music Videos',
    description: 'Create rhythm-based visuals that sync perfectly with musical structure',
    icon: Music,
    emoji: '🎵',
    backgroundImage: '/images/mode-backgrounds/music-video-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(120, 53, 15, 0.85), rgba(194, 65, 12, 0.80))',
    colorScheme: 'purple' as const,
    features: ['Lyric sync', 'Beat matching', 'Visual themes']
  },
  {
    id: 'commercial',
    label: 'Commercial',
    title: 'Brand Commercials',
    description: 'Professional campaign concepts that align with brand messaging',
    icon: Briefcase,
    emoji: '💼',
    backgroundImage: '/images/mode-backgrounds/commercial-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(4, 120, 87, 0.85), rgba(6, 95, 70, 0.90))',
    colorScheme: 'emerald' as const,
    features: ['Brand alignment', 'Target audience', 'CTA integration']
  },
  {
    id: 'children-book',
    label: "Children's Book",
    title: 'Kids Book Illustrations',
    description: 'Age-appropriate illustrations with engaging educational narratives',
    icon: BookOpen,
    emoji: '📚',
    backgroundImage: '/images/mode-backgrounds/children-book-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(254, 242, 242, 0.92), rgba(254, 226, 226, 0.88))',
    colorScheme: 'rose' as const,
    features: ['Age-appropriate', 'Educational content', 'Playful design']
  }
] as const

interface ModeCardProps {
  mode: typeof modes[number]
  isActive: boolean
  onClick: () => void
}

function ModeCard({ mode, isActive, onClick }: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = mode.icon

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
    >
      <PremiumCard
        variant={isActive ? "neon" : "glass"}
        colorScheme={mode.colorScheme}
        backgroundImage={mode.backgroundImage}
        backgroundOverlay={mode.backgroundOverlay}
        className={cn(
          "h-48 transition-all duration-300 cursor-pointer group-hover:scale-[1.02]",
          isActive && "ring-2 ring-offset-2 ring-offset-transparent",
          isActive && mode.colorScheme === 'blue' && "ring-blue-400",
          isActive && mode.colorScheme === 'purple' && "ring-purple-400",
          isActive && mode.colorScheme === 'emerald' && "ring-emerald-400", 
          isActive && mode.colorScheme === 'rose' && "ring-rose-400",
          isHovered && !isActive && "scale-[1.02] shadow-xl"
        )}
      >
        <PremiumCardContent className="h-full flex flex-col justify-between p-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                mode.colorScheme === 'blue' && "bg-blue-500/20 text-blue-400",
                mode.colorScheme === 'purple' && "bg-purple-500/20 text-purple-400",
                mode.colorScheme === 'emerald' && "bg-emerald-500/20 text-emerald-400",
                mode.colorScheme === 'rose' && "bg-rose-500/20 text-slate-700",
                isHovered && "scale-110"
              )}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-lg leading-tight",
                  mode.id === 'children-book' ? "text-slate-800" : "text-white"
                )}>
                  {mode.title}
                </h3>
              </div>
              {isActive && (
                <div className="ml-auto">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    mode.colorScheme === 'blue' && "bg-blue-400",
                    mode.colorScheme === 'purple' && "bg-purple-400", 
                    mode.colorScheme === 'emerald' && "bg-emerald-400",
                    mode.colorScheme === 'rose' && "bg-rose-500"
                  )} />
                </div>
              )}
            </div>
            
            <p className={cn(
              "text-sm mb-4 leading-relaxed",
              mode.id === 'children-book' ? "text-slate-700" : "text-slate-200"
            )}>
              {mode.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {mode.features.map((feature, index) => (
                <span
                  key={index}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full transition-all duration-200",
                    mode.id === 'children-book'
                      ? "bg-white/80 text-slate-700"
                      : "bg-white/15 text-white hover:bg-white/25",
                    isHovered && "transform scale-105"
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>
            
            {/* Action indicator */}
            <div className={cn(
              "mt-3 flex items-center gap-2 text-sm transition-all duration-200",
              mode.id === 'children-book' ? "text-slate-600" : "text-slate-300",
              isActive && "opacity-100",
              !isActive && isHovered && "opacity-80",
              !isActive && !isHovered && "opacity-60"
            )}>
              <Sparkles className="w-4 h-4" />
              <span>{isActive ? 'Active Mode' : 'Click to activate'}</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform duration-200",
                isHovered && "translate-x-1"
              )} />
            </div>
          </div>
        </PremiumCardContent>
      </PremiumCard>
    </button>
  )
}

export function EnhancedModeSelector() {
  const { mode, setMode } = useAppStore()
  const [selectedMode, setSelectedMode] = useState(mode)

  // Dispatch custom event when mode changes
  useEffect(() => {
    const event = new CustomEvent('dsvb:mode-change', { detail: { mode: selectedMode } })
    window.dispatchEvent(event)
  }, [selectedMode])

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
    setMode(modeId)
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">
          Choose Your Creative{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Medium
          </span>
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Each mode is tailored for specific creative needs, with AI models trained for professional results
        </p>
      </div>

      {/* Mode Grid */}
      <div className="max-w-6xl mx-auto">
        {/* Desktop: 2x2 Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {modes.map((modeData) => (
            <ModeCard
              key={modeData.id}
              mode={modeData}
              isActive={selectedMode === modeData.id}
              onClick={() => handleModeSelect(modeData.id)}
            />
          ))}
        </div>

        {/* Mobile: Single Column */}
        <div className="md:hidden space-y-4">
          {modes.map((modeData) => (
            <ModeCard
              key={modeData.id}
              mode={modeData}
              isActive={selectedMode === modeData.id}
              onClick={() => handleModeSelect(modeData.id)}
            />
          ))}
        </div>
      </div>

      {/* Mode Description */}
      {selectedMode && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-600">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              selectedMode === 'story' && "bg-blue-400",
              selectedMode === 'music-video' && "bg-purple-400",
              selectedMode === 'commercial' && "bg-emerald-400",
              selectedMode === 'children-book' && "bg-rose-400"
            )} />
            <span className="text-slate-300 text-sm">
              {modes.find(m => m.id === selectedMode)?.label} Ready
            </span>
          </div>
        </div>
      )}
    </div>
  )
}