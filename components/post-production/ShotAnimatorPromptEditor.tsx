/**
 * Shot Animator Prompt Editor
 * Expandable prompt window with batch animation support
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Sparkles,
  Expand,
  Minimize2,
  Shuffle,
  Settings,
  Zap,
  Type
} from 'lucide-react'

interface ShotAnimatorPromptEditorProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  seed?: number
  onSeedChange: (seed: number | undefined) => void
  creditsEstimate: number
  className?: string
}

export function ShotAnimatorPromptEditor({
  prompt,
  onPromptChange,
  seed,
  onSeedChange,
  creditsEstimate,
  className
}: ShotAnimatorPromptEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(100, Math.min(300, textarea.scrollHeight))}px`
    }
  }, [prompt, isExpanded])

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000)
    onSeedChange(newSeed)
  }

  const promptLines = prompt.split('\n').length
  const promptWords = prompt.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <Card className={`bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-400" />
            Video Prompt & Settings
            {promptWords > 0 && (
              <Badge variant="outline" className="text-xs">
                {promptWords} words
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Expand className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="video-prompt" className="text-slate-300">
            Describe your video
          </Label>
          <Textarea
            ref={textareaRef}
            id="video-prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the video you want to create... (e.g., 'a cinematic shot of a detective walking through an abandoned warehouse')"
            className={`min-h-[100px] bg-slate-800 border-slate-600 text-white resize-none transition-all duration-300 ${
              isExpanded ? 'min-h-[200px]' : ''
            }`}
            maxLength={3000}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{prompt.length}/3000 characters</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              {creditsEstimate} credits
            </span>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-cyan-400" />
              <Label className="text-slate-300 font-medium">Advanced Settings</Label>
            </div>

            {/* Seed Control */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">
                Seed (for reproducible results)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={seed || ''}
                  onChange={(e) => onSeedChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Random"
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                  min={0}
                  max={1000000}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRandomSeed}
                  className="px-3"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Use the same seed to reproduce identical results
              </p>
            </div>
          </div>
        )}

        {/* Prompt Templates/Suggestions */}
        {isExpanded && (
          <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <Label className="text-slate-300 font-medium">Quick Prompts</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'cinematic wide shot of character walking',
                'close-up of character with emotional expression',
                'dynamic action sequence with camera movement',
                'atmospheric establishing shot of location'
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onPromptChange(template)}
                  className="text-left justify-start text-xs h-auto py-2 px-3"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}