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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Settings, Sparkles, Upload, Edit, Plus, Clock, Loader2, Pencil, Save, X, Download, FileUp, Wand2 } from 'lucide-react'
import type { Gen4Settings } from '@/lib/post-production/enhanced-types'
import { useGenerationQueueStore } from '@/stores/generation-queue-store'
import { EnhancedPresetManager } from '@/components/shared/EnhancedPresetManager'
import { getPresetsForTool, type Preset } from '@/lib/presets/preset-categories'
import { calculateUserCredits } from '@/lib/credits/model-costs'
import { DynamicPromptInput } from './DynamicPromptInput'
import { PipelinePromptInput } from './PipelinePromptInput'
import { parseDynamicPrompt } from '@/lib/dynamic-prompting'
import { parsePipelinePrompt, type PipelineResult } from '@/lib/pipeline-prompting'
import { getModelConfig, type ModelId } from '@/lib/post-production/model-config'

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
  hasNonPipelineImages?: boolean // NEW: Indicates if reference images are from non-pipeline sources
  userId?: string // Pass actual user ID from auth
}

export function Gen4PromptSettings({
  gen4Prompt,
  setGen4Prompt,
  gen4Settings,
  setGen4Settings,
  gen4Processing,
  onGenerate,
  canGenerate,
  referenceImagesCount,
  hasNonPipelineImages = false,
  userId
}: Gen4PromptSettingsProps) {
  const [gen4Prefix, setGen4Prefix] = useState('')
  const [gen4Suffix, setGen4Suffix] = useState('')
  const [showPrefixSuffix, setShowPrefixSuffix] = useState(false)
  const [editingPreset, setEditingPreset] = useState<{key: string, name: string, prompt: string} | null>(null)
  const [showEnhancedPresets, setShowEnhancedPresets] = useState(false)
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([])
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
  const { addToQueue, getQueuedCount, getProcessingCount, clearStuckProcessing, clearAll } = useGenerationQueueStore()
  
  // Clear stuck processing jobs on mount
  useEffect(() => {
    clearStuckProcessing()
  }, [clearStuckProcessing])
  
  // Preset templates for Shot Creator
  const [creatorPresets, setCreatorPresets] = useState<Record<string, string>>(() => {
    // Force update to new practical presets for film production
    const newPresets = {
      'character-consistency': 'Maintain this exact character appearance but place them in a different scene or outfit, preserve facial features and body proportions precisely',
      'scene-angle-change': 'Show this exact scene from a different camera angle - low angle, high angle, or side perspective while keeping all elements the same',
      'remove-background-clean': 'Remove the entire background, make it transparent with clean edges, preserve the main subject perfectly for compositing',
      'add-green-screen': 'Replace the background with a solid, even green screen for chroma keying, keep original subject and lighting intact',
      'pipeline-headshot': 'professional studio lighting | remove green screen background | add modern office background',
      'pipeline-product': 'enhance product lighting | remove background completely | add white studio background',
      'pipeline-character': 'improve character lighting | isolate character cleanly | place in [forest, city, beach] environment'
    }
    
    // Save the new presets immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('directors-palette-creator-presets', JSON.stringify(newPresets))
    }
    
    return newPresets
  })
  
  const applyPreset = (presetKey: string) => {
    const presetPrompt = creatorPresets[presetKey] || presetKey
    setGen4Prompt(presetPrompt)
  }

  const savePresets = (newPresets: Record<string, string>) => {
    setCreatorPresets(newPresets)
    if (typeof window !== 'undefined') {
      localStorage.setItem('directors-palette-creator-presets', JSON.stringify(newPresets))
    }
  }

  const handleEditPreset = (key: string, name: string, prompt: string) => {
    setEditingPreset({ key, name, prompt })
  }

  const handleSavePresetEdit = () => {
    if (editingPreset) {
      const newPresets = { ...creatorPresets }
      
      // If key changed, remove old key and add new one
      if (editingPreset.name !== editingPreset.key) {
        delete newPresets[editingPreset.key]
        newPresets[editingPreset.name] = editingPreset.prompt
      } else {
        newPresets[editingPreset.key] = editingPreset.prompt
      }
      
      savePresets(newPresets)
      setEditingPreset(null)
    }
  }

  const handleDeletePreset = () => {
    if (editingPreset) {
      const newPresets = { ...creatorPresets }
      delete newPresets[editingPreset.key]
      savePresets(newPresets)
      setEditingPreset(null)
    }
  }

  const handleExportPresets = () => {
    const presetData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      presets: creatorPresets
    }
    
    const dataStr = JSON.stringify(presetData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `shot-creator-presets-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(link.href)
  }

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)
        
        // Validate structure
        if (importedData.presets && typeof importedData.presets === 'object') {
          // Merge with existing presets (imported ones take precedence)
          const mergedPresets = { ...creatorPresets, ...importedData.presets }
          savePresets(mergedPresets)
          
          const importedCount = Object.keys(importedData.presets).length
          // Toast notification would go here if available
          console.log(`Successfully imported ${importedCount} presets`)
        } else {
          console.error('Invalid preset file format')
        }
      } catch (error) {
        console.error('Error importing presets:', error)
      }
    }
    
    reader.readAsText(file)
    // Clear the input so the same file can be imported again
    event.target.value = ''
  }

  const handleApplyEnhancedPreset = (preset: Preset) => {
    setGen4Prompt(preset.prompt)
  }

  // Determine if we're in editing mode based on selected model
  const isEditingMode = gen4Settings.model === 'qwen-image-edit'

  return (
    <div className="space-y-4">
      {/* Main Prompt Input - Always at top */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">
            {isEditingMode ? 'Editing Instructions' : 'Prompt & Instructions'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pipeline Prompt Input */}
          <div>
            <PipelinePromptInput
              prompt={gen4Prompt}
              onPromptChange={setGen4Prompt}
              onPipelineChange={setPipelineResult}
              creditsPerImage={calculateUserCredits(gen4Settings.model || 'nano-banana', 1)}
              placeholder={isEditingMode
                ? "Describe how to edit the image... e.g., 'Change the background to a sunset'"
                : hasNonPipelineImages
                  ? "Describe the image... Use [option1, option2] or _wildcard_ for variations"
                  : "Describe the image... Use [option1, option2], _wildcard_, or | for pipeline steps"
              }
              disabled={gen4Processing}
              disablePipeline={hasNonPipelineImages}
              userId={userId || 'anonymous'}
            />
          </div>
          
          {/* Quick Presets - Moved under prompt as requested */}
          {!isEditingMode && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white text-sm">Quick Presets</Label>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowEnhancedPresets(true)}
                    className="h-6 px-2 text-slate-400 hover:text-white border border-slate-600 hover:border-purple-500"
                    title="Enhanced Preset Library"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    <span className="text-xs">Library</span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportPresets}
                    className="hidden"
                    id="preset-import"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => document.getElementById('preset-import')?.click()}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    title="Import Presets"
                  >
                    <FileUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExportPresets}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    title="Export Presets"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
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
                      onClick={() => handleEditPreset(key, key, value)}
                      className="absolute right-0 top-0 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button - Immediately after prompt */}
          <div className="border-t border-slate-700 pt-4">
            <Button
              onClick={() => {
                if (canGenerate) {
                  onGenerate()
                }
              }}
              disabled={!canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg py-6 mb-4"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {gen4Processing ? (
                gen4Settings.model === 'seedream-4' && gen4Settings.maxImages && gen4Settings.maxImages > 1 
                  ? `Generating ${gen4Settings.maxImages} images...`
                  : isEditingMode
                    ? 'Editing image...'
                    : 'Generating...'
              ) : (
                <span className="flex items-center gap-2">
                  {(() => {
                    const promptResult = parseDynamicPrompt(gen4Prompt)
                    const isDynamic = promptResult.hasBrackets && promptResult.isValid
                    const imageCount = isDynamic ? promptResult.expandedPrompts.length : (gen4Settings.maxImages || 1)
                    const totalCredits = calculateUserCredits(gen4Settings.model || 'nano-banana', imageCount)
                    
                    if (isEditingMode) {
                      return (
                        <>
                          <span>Edit Image</span>
                          <span className="text-sm">(uses {totalCredits} credits)</span>
                        </>
                      )
                    } else if (isDynamic) {
                      return `Generate ${imageCount} Variations (Dynamic)`
                    } else if (gen4Settings.model === 'seedream-4' && gen4Settings.maxImages && gen4Settings.maxImages > 1) {
                      return `Generate ${gen4Settings.maxImages} Images`
                    } else {
                      return 'Generate'
                    }
                  })()}
                  {!isEditingMode && (
                    <span className="text-sm opacity-75">
                      (uses {(() => {
                        const promptResult = parseDynamicPrompt(gen4Prompt)
                        const isDynamic = promptResult.hasBrackets && promptResult.isValid
                        const imageCount = isDynamic ? promptResult.expandedPrompts.length : (gen4Settings.maxImages || 1)
                        return calculateUserCredits(gen4Settings.model || 'nano-banana', imageCount)
                      })()} credits)
                    </span>
                  )}
                </span>
              )}
            </Button>

            {/* Validation messages under generate button */}
            {!canGenerate && !gen4Processing && (
              <div className="text-center text-sm text-slate-400 mb-4 space-y-1">
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

          {/* Prefix/Suffix Section - After generate button */}
          <div className="border-t border-slate-700 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrefixSuffix(!showPrefixSuffix)}
              className="text-xs mb-3"
            >
              {showPrefixSuffix ? '👁️ Hide Prefix/Suffix' : '👁️ Show Prefix/Suffix'}
            </Button>
            
            <Collapsible open={showPrefixSuffix} onOpenChange={setShowPrefixSuffix}>
              <CollapsibleContent className="space-y-3">
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
                {showPrefixSuffix && (
                  <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
                    <strong>Final prompt:</strong> {gen4Prefix} {gen4Prompt} {gen4Suffix}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Model-Specific Generation Settings - Only for complex models */}
      {gen4Settings.model !== 'nano-banana' && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">
              {isEditingMode ? 'Editing Settings' : 'Generation Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Model parameters handled inline in main component */}
          </CardContent>
        </Card>
      )}

      {/* Preset Edit Dialog */}
      <Dialog open={!!editingPreset} onOpenChange={() => setEditingPreset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Preset</DialogTitle>
          </DialogHeader>
          
          {editingPreset && (
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm">Preset Name</Label>
                <Input
                  value={editingPreset.name}
                  onChange={(e) => setEditingPreset({
                    ...editingPreset,
                    name: e.target.value
                  })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., cinematic-portrait"
                />
              </div>
              
              <div>
                <Label className="text-white text-sm">Prompt Template</Label>
                <Textarea
                  value={editingPreset.prompt}
                  onChange={(e) => setEditingPreset({
                    ...editingPreset,
                    prompt: e.target.value
                  })}
                  className="bg-slate-800 border-slate-600 text-white min-h-20"
                  placeholder="Enter your prompt template..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePreset}
              className="mr-auto"
            >
              Delete Preset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingPreset(null)}
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSavePresetEdit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Preset Manager */}
      <EnhancedPresetManager
        isOpen={showEnhancedPresets}
        onOpenChange={setShowEnhancedPresets}
        onApplyPreset={handleApplyEnhancedPreset}
        currentTool="shot-creator"
      />
    </div>
  )
}