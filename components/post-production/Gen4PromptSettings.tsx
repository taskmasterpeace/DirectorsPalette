'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Settings, Sparkles, Upload, Edit, Plus, Clock, Loader2, Pencil } from 'lucide-react'
import type { Gen4Settings } from '@/lib/post-production/enhanced-types'
import { useGenerationQueueStore } from '@/stores/generation-queue-store'

interface Gen4PromptSettingsProps {
  gen4Prompt: string
  setGen4Prompt: (prompt: string) => void
  gen4Settings: Gen4Settings
  setGen4Settings: (settings: Gen4Settings) => void
  gen4Processing: boolean
  onGenerate: () => void
  canGenerate: boolean
  referenceImagesCount: number
  compact?: boolean
}

export function Gen4PromptSettings({
  gen4Prompt,
  setGen4Prompt,
  gen4Settings, 
  setGen4Settings,
  gen4Processing,
  onGenerate,
  canGenerate,
  referenceImagesCount
}: Gen4PromptSettingsProps) {
  const [gen4Prefix, setGen4Prefix] = useState('')
  const [gen4Suffix, setGen4Suffix] = useState('')
  const [showPrefixSuffix, setShowPrefixSuffix] = useState(false)
  const { addToQueue, getQueuedCount, getProcessingCount, clearStuckProcessing } = useGenerationQueueStore()
  
  // Clear stuck processing jobs on mount
  useEffect(() => {
    clearStuckProcessing()
  }, [clearStuckProcessing])
  
  // Preset templates for Shot Creator
  const [creatorPresets, setCreatorPresets] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPresets = localStorage.getItem('directors-palette-creator-presets')
        if (savedPresets) {
          return JSON.parse(savedPresets)
        }
      } catch {
        // Fall back to defaults
      }
    }
    return {
      'cinematic-portrait': 'A cinematic portrait with dramatic lighting',
      'product-shot': 'Professional product photography with clean background',
      'artistic-concept': 'Creative artistic concept with unique composition',
      'lifestyle-photo': 'Natural lifestyle photography with authentic feel'
    }
  })
  
  const applyPreset = (presetKey: string) => {
    const presetPrompt = creatorPresets[presetKey] || presetKey
    setGen4Prompt(presetPrompt)
  }

  return (
    <div className="space-y-4">
      {/* Prompt Enhancement */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Prompt Enhancement</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrefixSuffix(!showPrefixSuffix)}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Show Prefix/Suffix
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prefix/Suffix Section */}
          <Collapsible open={showPrefixSuffix} onOpenChange={setShowPrefixSuffix}>
            <CollapsibleContent className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-xs">Prefix (added before prompt)</Label>
                  <Input
                    value={gen4Prefix}
                    onChange={(e) => setGen4Prefix(e.target.value)}
                    placeholder="e.g., 'A cinematic shot of'"
                    className="bg-slate-800 border-slate-600 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-white text-xs">Suffix (added after prompt)</Label>
                  <Input
                    value={gen4Suffix}
                    onChange={(e) => setGen4Suffix(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-sm"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Preset Templates */}
          <div className="mb-4">
            <Label className="text-white text-xs mb-2 block">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(creatorPresets).slice(0, 4).map(([key, value]) => (
                <div key={key} className="relative group">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => applyPreset(key)}
                    className="h-7 w-full text-xs justify-start px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    {key.replace('-', ' ')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Open preset edit dialog
                      console.log('Edit preset:', key, value)
                    }}
                    className="absolute right-0 top-0 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Prompt */}
          <div>
            <Label className="text-white">Prompt (Enhanced with Prefix/Suffix)</Label>
            <Textarea
              placeholder="Describe the image you want to generate... (Ctrl+Enter to generate)"
              value={gen4Prompt}
              onChange={(e) => setGen4Prompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter' && canGenerate) {
                  onGenerate()
                }
              }}
              className="min-h-24 bg-slate-800 border-slate-600 text-white"
            />
            {showPrefixSuffix && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
                <strong>Final prompt:</strong> {gen4Prefix} {gen4Prompt} {gen4Suffix}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation Settings */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Generation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white text-sm">Aspect Ratio</Label>
              <Select 
                value={gen4Settings.aspectRatio} 
                onValueChange={(value) => setGen4Settings({ ...gen4Settings, aspectRatio: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="4:3">4:3 Classic</SelectItem>
                  <SelectItem value="3:4">3:4 Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white text-sm">Resolution</Label>
              <Select 
                value={gen4Settings.resolution} 
                onValueChange={(value) => setGen4Settings({ ...gen4Settings, resolution: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white text-sm">Seed (Optional)</Label>
              <Input
                type="number"
                value={gen4Settings.seed || ''}
                onChange={(e) => setGen4Settings({ 
                  ...gen4Settings, 
                  seed: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Random"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => {
                if (canGenerate) {
                  // Add to queue instead of direct generation
                  addToQueue({
                    type: 'gen4-create',
                    prompt: `${gen4Prefix} ${gen4Prompt} ${gen4Suffix}`.trim(),
                    inputData: {
                      prompt: gen4Prompt,
                      settings: gen4Settings,
                      referenceImages: referenceImagesCount
                    }
                  })
                  
                  // Still call onGenerate for backwards compatibility
                  onGenerate()
                }
              }}
              disabled={!canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {getQueuedCount() > 0 || getProcessingCount() > 0 
                ? `Add to Queue (${getQueuedCount() + getProcessingCount()} active)`
                : 'Generate'
              }
            </Button>

            {/* Queue Status */}
            {(getQueuedCount() > 0 || getProcessingCount() > 0) && (
              <div className="flex items-center justify-center gap-4 text-sm">
                {getQueuedCount() > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Clock className="w-3 h-3" />
                    <span>{getQueuedCount()} queued</span>
                  </div>
                )}
                {getProcessingCount() > 0 && (
                  <div className="flex items-center gap-1 text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{getProcessingCount()} processing</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Validation messages */}
            {!canGenerate && !gen4Processing && (
              <div className="text-center text-sm text-slate-400 mt-2 space-y-1">
                {referenceImagesCount === 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Add at least 1 reference image to generate</span>
                  </div>
                )}
                {!gen4Prompt.trim() && (
                  <div className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    <span>Enter a prompt to describe what you want</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}