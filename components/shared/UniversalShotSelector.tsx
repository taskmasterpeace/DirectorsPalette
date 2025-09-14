'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Target, Zap, Hand, Brain, Sparkles, ChevronRight } from 'lucide-react'
import { ManualShotSelector } from '@/components/prototypes/ManualShotSelector'

interface UniversalShotSelectorProps {
  mode: 'story' | 'music-video' | 'commercial' | 'children-book'
  content: string
  onSelectionComplete: (method: 'auto' | 'manual', selections?: any[]) => void
  onNext: () => void
}

const modeConfig = {
  'story': {
    title: 'Story Shot Selection',
    autoDescription: 'AI analyzes your story and creates cinematic shot breakdowns',
    manualDescription: 'Highlight story sections you want as individual shots',
    colorScheme: 'blue',
    example: 'Each story paragraph or dramatic moment becomes a shot'
  },
  'music-video': {
    title: 'Music Video Shot Selection', 
    autoDescription: 'AI creates shots based on lyric structure and musical flow',
    manualDescription: 'Highlight lyric sections for custom shot timing',
    colorScheme: 'purple',
    example: 'Each verse, chorus, or bridge becomes a shot sequence'
  },
  'commercial': {
    title: 'Commercial Shot Selection',
    autoDescription: 'AI creates shots optimized for your campaign goals',
    manualDescription: 'Highlight key messages for targeted shot creation',
    colorScheme: 'emerald', 
    example: 'Each brand message or product benefit becomes a shot'
  },
  'children-book': {
    title: 'Book Page Selection',
    autoDescription: 'AI creates page-by-page illustrations from your story',
    manualDescription: 'Highlight story sections for individual page illustrations',
    colorScheme: 'rose',
    example: 'Each story beat becomes a book page illustration'
  }
}

export function UniversalShotSelector({ 
  mode, 
  content, 
  onSelectionComplete,
  onNext 
}: UniversalShotSelectorProps) {
  const [selectionMethod, setSelectionMethod] = useState<'auto' | 'manual'>('auto')
  const [manualSelections, setManualSelections] = useState<any[]>([])
  
  const config = modeConfig[mode]

  const handleContinueWithAuto = () => {
    onSelectionComplete('auto')
    onNext()
  }

  const handleManualSelectionComplete = (shots: any[]) => {
    setManualSelections(shots)
    onSelectionComplete('manual', shots)
    onNext()
  }

  if (!content.trim()) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="text-center py-8">
          <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">
            Enter your {mode === 'children-book' ? 'story' : mode.replace('-', ' ')} content first
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3">
            <Target className={cn(
              "w-6 h-6",
              config.colorScheme === 'blue' && "text-blue-400",
              config.colorScheme === 'purple' && "text-purple-400", 
              config.colorScheme === 'emerald' && "text-emerald-400",
              config.colorScheme === 'rose' && "text-rose-400"
            )} />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-6">
            Choose how you want to select shots from your content:
          </p>

          {/* Selection Method Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto Selection */}
            <button
              onClick={() => setSelectionMethod('auto')}
              className={cn(
                "p-6 rounded-lg border-2 transition-all text-left",
                selectionMethod === 'auto' 
                  ? cn(
                    "border-opacity-100 bg-opacity-20",
                    config.colorScheme === 'blue' && "border-blue-400 bg-blue-400",
                    config.colorScheme === 'purple' && "border-purple-400 bg-purple-400",
                    config.colorScheme === 'emerald' && "border-emerald-400 bg-emerald-400", 
                    config.colorScheme === 'rose' && "border-rose-400 bg-rose-400"
                  )
                  : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  config.colorScheme === 'blue' && "bg-blue-500/20 text-blue-400",
                  config.colorScheme === 'purple' && "bg-purple-500/20 text-purple-400",
                  config.colorScheme === 'emerald' && "bg-emerald-500/20 text-emerald-400",
                  config.colorScheme === 'rose' && "bg-rose-500/20 text-rose-400"
                )}>
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">AI Auto-Selection</h3>
                {selectionMethod === 'auto' && (
                  <Badge className={cn(
                    "text-white",
                    config.colorScheme === 'blue' && "bg-blue-600",
                    config.colorScheme === 'purple' && "bg-purple-600",
                    config.colorScheme === 'emerald' && "bg-emerald-600",
                    config.colorScheme === 'rose' && "bg-rose-600"
                  )}>
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300 mb-3">
                {config.autoDescription}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Recommended for most users</span>
              </div>
            </button>

            {/* Manual Selection */}
            <button
              onClick={() => setSelectionMethod('manual')}
              className={cn(
                "p-6 rounded-lg border-2 transition-all text-left",
                selectionMethod === 'manual'
                  ? cn(
                    "border-opacity-100 bg-opacity-20",
                    config.colorScheme === 'blue' && "border-blue-400 bg-blue-400",
                    config.colorScheme === 'purple' && "border-purple-400 bg-purple-400",
                    config.colorScheme === 'emerald' && "border-emerald-400 bg-emerald-400",
                    config.colorScheme === 'rose' && "border-rose-400 bg-rose-400"
                  )
                  : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  config.colorScheme === 'blue' && "bg-blue-500/20 text-blue-400",
                  config.colorScheme === 'purple' && "bg-purple-500/20 text-purple-400",
                  config.colorScheme === 'emerald' && "bg-emerald-500/20 text-emerald-400",
                  config.colorScheme === 'rose' && "bg-rose-500/20 text-rose-400"
                )}>
                  <Hand className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">Manual Selection</h3>
                {selectionMethod === 'manual' && (
                  <Badge className={cn(
                    "text-white",
                    config.colorScheme === 'blue' && "bg-blue-600",
                    config.colorScheme === 'purple' && "bg-purple-600",
                    config.colorScheme === 'emerald' && "bg-emerald-600",
                    config.colorScheme === 'rose' && "bg-rose-600"
                  )}>
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300 mb-3">
                {config.manualDescription}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Target className="w-3 h-3" />
                <span>For precise control</span>
              </div>
            </button>
          </div>

          {/* Example */}
          <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
            <p className="text-sm text-slate-400">
              <span className="font-medium">Example:</span> {config.example}
            </p>
          </div>

          {/* Continue Button for Auto */}
          {selectionMethod === 'auto' && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleContinueWithAuto}
                className={cn(
                  "flex items-center gap-2",
                  config.colorScheme === 'blue' && "bg-blue-600 hover:bg-blue-700",
                  config.colorScheme === 'purple' && "bg-purple-600 hover:bg-purple-700",
                  config.colorScheme === 'emerald' && "bg-emerald-600 hover:bg-emerald-700",
                  config.colorScheme === 'rose' && "bg-rose-600 hover:bg-rose-700"
                )}
              >
                Continue with AI Selection
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Selector Interface */}
      {selectionMethod === 'manual' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Hand className={cn(
                "w-5 h-5",
                config.colorScheme === 'blue' && "text-blue-400",
                config.colorScheme === 'purple' && "text-purple-400",
                config.colorScheme === 'emerald' && "text-emerald-400", 
                config.colorScheme === 'rose' && "text-rose-400"
              )} />
              Manual Shot Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <h4 className="font-medium text-blue-300 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Highlight text portions that should become individual shots</li>
                <li>• Each selection becomes one {mode === 'children-book' ? 'page illustration' : 'shot'}</li>
                <li>• Use @character_name references for consistency</li>
                <li>• Create engaging, dynamic shot selections</li>
              </ul>
            </div>

            <ManualShotSelector
              text={content}
              contentType={mode === 'children-book' ? 'children_book' : mode === 'music-video' ? 'lyrics' : 'story'}
              onShotsChange={handleManualSelectionComplete}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}