'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { cn } from '@/lib/utils'
import { ChevronDown, Wand2, Sparkles, Plus } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  data: Record<string, any>
}

interface TemplateBannerProps {
  mode: 'story' | 'music-video' | 'commercial' | 'children-book'
  templates: Template[]
  selectedTemplate?: Template | null
  onTemplateSelect: (template: Template) => void
  onCreateNew: () => void
  backgroundImage?: string
}

const modeConfig = {
  'story': {
    backgroundImage: '/images/mode-backgrounds/story-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.90), rgba(30, 41, 59, 0.85))',
    colorScheme: 'blue' as const,
    title: 'Story Templates',
    description: 'Pre-built story structures and formats'
  },
  'music-video': {
    backgroundImage: '/images/mode-backgrounds/music-video-mode.png', 
    backgroundOverlay: 'linear-gradient(135deg, rgba(120, 53, 15, 0.90), rgba(194, 65, 12, 0.85))',
    colorScheme: 'purple' as const,
    title: 'Music Video Templates',
    description: 'Genre-specific video concepts and structures'
  },
  'commercial': {
    backgroundImage: '/images/mode-backgrounds/commercial-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(4, 120, 87, 0.90), rgba(6, 95, 70, 0.85))',
    colorScheme: 'emerald' as const,
    title: 'Commercial Templates',
    description: 'Brand campaign structures and formats'
  },
  'children-book': {
    backgroundImage: '/images/mode-backgrounds/children-book-mode.png',
    backgroundOverlay: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.90))',
    colorScheme: 'rose' as const,
    title: 'Book Templates',
    description: 'Age-appropriate story formats'
  }
}

export function TemplateBanner({ mode, templates, selectedTemplate, onTemplateSelect, onCreateNew }: TemplateBannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  
  const config = modeConfig[mode]

  return (
    <div className="relative mb-6">
      {/* Main Banner - Full Width */}
      <PremiumCard
        variant="glass"
        backgroundImage={config.backgroundImage}
        backgroundOverlay={config.backgroundOverlay}
        className="h-32 cursor-pointer transition-all duration-300 hover:shadow-2xl w-full border-2 border-white/30 hover:border-white/60 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-full flex items-center justify-between p-6">
          {/* Left: Title and Current Selection */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg",
              mode === 'children-book' ? "bg-rose-200/30" : "bg-white/10"
            )}>
              <Sparkles className={cn(
                "w-5 h-5",
                mode === 'children-book' ? "text-slate-700" : "text-white"
              )} />
            </div>
            
            <div>
              <h3 className={cn(
                "font-bold text-3xl drop-shadow-lg",
                mode === 'children-book' ? "text-slate-800" : "text-white"
              )}>
                {config.title}
              </h3>
              <p className={cn(
                "text-lg drop-shadow-md",
                mode === 'children-book' ? "text-slate-700" : "text-slate-200"
              )}>
                {selectedTemplate ? selectedTemplate.name : config.description}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <div className={cn(
                "px-3 py-1 rounded-full text-sm",
                mode === 'children-book' ? "bg-rose-200/50 text-slate-700" : "bg-white/20 text-white"
              )}>
                {selectedTemplate.name}
              </div>
            )}
            
            <EnhancedButton
              variant="glass"
              size="sm"
              className="h-8"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </EnhancedButton>
          </div>
        </div>
      </PremiumCard>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2">
          <PremiumCard variant="glass" className="overflow-hidden">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Choose Template</h4>
                <EnhancedButton
                  variant="sleek"
                  colorScheme={config.colorScheme}
                  size="sm"
                  onClick={onCreateNew}
                  className="h-8"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </EnhancedButton>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    onClick={() => {
                      onTemplateSelect(template)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "p-4 rounded-lg text-left transition-all duration-200 group",
                      "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
                      selectedTemplate?.id === template.id && "ring-2 ring-blue-400 bg-blue-500/10"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-white text-sm">
                          {template.name}
                        </h5>
                        {hoveredTemplate === template.id && (
                          <Wand2 className="w-4 h-4 text-blue-400 animate-pulse" />
                        )}
                      </div>
                      
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {template.description}
                      </p>
                      
                      {selectedTemplate?.id === template.id && (
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          Currently Active
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-sm">
                    No templates available yet
                  </div>
                  <EnhancedButton
                    variant="sleek" 
                    colorScheme={config.colorScheme}
                    size="sm"
                    onClick={onCreateNew}
                    className="mt-3 h-8"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Template
                  </EnhancedButton>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}