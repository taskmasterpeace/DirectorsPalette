'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sparkles,
  Palette,
  Library,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Copy,
  Hash
} from 'lucide-react'
import { getModelConfig, type ModelId } from '@/lib/post-production/model-config'
import { PromptLibrary } from '@/components/prompt-library/PromptLibrary'
import type { Gen4Settings } from '@/lib/post-production/enhanced-types'

interface Gen4PromptSettingsProps {
  gen4Prompt: string
  setGen4Prompt: (prompt: string) => void
  gen4Settings: Gen4Settings
  setGen4Settings: (settings: Gen4Settings) => void
  gen4Processing: boolean
  hasNonPipelineImages: boolean
  onGenerate: () => void
  canGenerate: boolean
  referenceImagesCount: number
  compact?: boolean
  userId?: string
}

// Quick preset prompts for different styles
const quickPresets = [
  { name: 'Cinematic', prompt: 'cinematic shot, dramatic lighting, professional photography' },
  { name: 'Portrait', prompt: 'professional portrait, soft lighting, shallow depth of field' },
  { name: 'Landscape', prompt: 'stunning landscape, golden hour lighting, wide angle view' },
  { name: 'Abstract', prompt: 'abstract composition, vibrant colors, artistic interpretation' },
  { name: 'Street', prompt: 'street photography, candid moment, urban environment' },
  { name: 'Macro', prompt: 'macro photography, extreme close-up, fine details' }
]

// Model-specific aspect ratios
const aspectRatios = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:2', label: 'Photo (3:2)' },
  { value: '21:9', label: 'Ultra-wide (21:9)' }
]

// Resolution options
const resolutions = [
  { value: 'SD', label: 'SD (512x512)' },
  { value: 'HD', label: 'HD (1024x1024)' },
  { value: 'FHD', label: 'Full HD (1920x1080)' },
  { value: 'custom', label: 'Custom' }
]

export function Gen4PromptSettings({
  gen4Prompt,
  setGen4Prompt,
  gen4Settings,
  setGen4Settings,
  gen4Processing,
  hasNonPipelineImages,
  onGenerate,
  canGenerate,
  referenceImagesCount,
  compact = false,
  userId
}: Gen4PromptSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const modelConfig = getModelConfig((gen4Settings.model || 'seedream-4') as ModelId)
  const isEditingMode = gen4Settings.model === 'qwen-image-edit'

  // Generate random seed
  const generateRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000)
    setGen4Settings({ ...gen4Settings, seed: newSeed })
  }, [gen4Settings, setGen4Settings])

  // Insert preset into prompt at cursor position
  const insertPreset = useCallback((presetPrompt: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentPrompt = gen4Prompt

      // Insert preset at cursor position
      const newPrompt = currentPrompt.slice(0, start) + presetPrompt + currentPrompt.slice(end)
      setGen4Prompt(newPrompt)

      // Update cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + presetPrompt.length, start + presetPrompt.length)
      }, 0)
    }
  }, [gen4Prompt, setGen4Prompt])

  // Handle @ symbol for reference support
  const handlePromptChange = useCallback((value: string) => {
    setGen4Prompt(value)
  }, [setGen4Prompt])

  // Copy current settings
  const copySettings = useCallback(() => {
    const settingsText = JSON.stringify(gen4Settings, null, 2)
    navigator.clipboard.writeText(settingsText)
  }, [gen4Settings])

  // Handle selecting prompt from library
  const handleSelectPrompt = useCallback((prompt: string) => {
    setGen4Prompt(prompt)
    setIsPromptLibraryOpen(false)
  }, [setGen4Prompt])

  return (
    <TooltipProvider>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">
              {isEditingMode ? 'Edit Instructions' : 'Prompt & Settings'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySettings}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy settings</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-1" />
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Quick Presets */}
        {!compact && (
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => insertPreset(preset.prompt)}
                  className="text-xs bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-300"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">
              {isEditingMode ? 'Edit Instructions' : 'Prompt'}
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                @ for references
              </Badge>
              <span className="text-xs text-slate-400">
                {gen4Prompt.length}/1000
              </span>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            value={gen4Prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder={
              isEditingMode
                ? "Describe how you want to edit the image (e.g., 'change the background to a sunset', 'add more lighting')"
                : "Describe your shot... Use @ to reference tagged images"
            }
            className="min-h-[100px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
            maxLength={1000}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement
              setCursorPosition(target.selectionStart)
            }}
          />
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Aspect Ratio</Label>
            <Select
              value={gen4Settings.aspectRatio}
              onValueChange={(value) => setGen4Settings({ ...gen4Settings, aspectRatio: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Resolution</Label>
            <Select
              value={gen4Settings.resolution}
              onValueChange={(value) => setGen4Settings({ ...gen4Settings, resolution: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resolutions.map((res) => (
                  <SelectItem key={res.value} value={res.value}>
                    {res.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 border-t border-slate-700 pt-4">
            {/* Seed */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Seed (Optional)</Label>
              <div className="flex gap-2">
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateRandomSeed}
                      className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate random seed</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Model-specific settings */}
            {gen4Settings.model === 'seedream-4' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Max Images</Label>
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    value={gen4Settings.maxImages || 1}
                    onChange={(e) => setGen4Settings({
                      ...gen4Settings,
                      maxImages: parseInt(e.target.value)
                    })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}

            {gen4Settings.model?.includes('qwen') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Guidance</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={gen4Settings.guidance || 7.5}
                    onChange={(e) => setGen4Settings({
                      ...gen4Settings,
                      guidance: parseFloat(e.target.value)
                    })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Steps</Label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={gen4Settings.num_inference_steps || 20}
                    onChange={(e) => setGen4Settings({
                      ...gen4Settings,
                      num_inference_steps: parseInt(e.target.value)
                    })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || gen4Processing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
          >
            {gen4Processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {isEditingMode ? 'Edit Image' : 'Generate'}
              </>
            )}
          </Button>

          {/* Prompt Library Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPromptLibraryOpen(true)}
                className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-300"
              >
                <Hash className="w-4 h-4 mr-1" />
                Prompts
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Prompt Library</TooltipContent>
          </Tooltip>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {referenceImagesCount} reference image{referenceImagesCount !== 1 ? 's' : ''} • {modelConfig.name}
          </span>
          {hasNonPipelineImages && (
            <Badge variant="secondary" className="text-xs">
              Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Prompt Library Dialog */}
      <Dialog open={isPromptLibraryOpen} onOpenChange={setIsPromptLibraryOpen}>
        <DialogContent className="bg-slate-900 border-purple-500/30 w-[80vw] max-w-none max-h-[90vh] overflow-hidden" aria-describedby="prompt-library-description">
          <DialogHeader>
            <DialogTitle className="text-white">Prompt Library</DialogTitle>
            <DialogDescription id="prompt-library-description" className="text-gray-400">
              Browse and select prompts from your library. Create custom prompts or use pre-made templates.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[600px] overflow-y-auto">
            <PromptLibrary
              onSelectPrompt={handleSelectPrompt}
              showQuickAccess={true}
              className="h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}