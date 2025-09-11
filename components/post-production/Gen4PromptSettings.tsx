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
  const [editingPreset, setEditingPreset] = useState<{key: string, name: string, prompt: string} | null>(null)
  const [showEnhancedPresets, setShowEnhancedPresets] = useState(false)
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
      'add-green-screen': 'Replace the background with a solid, even green screen for chroma keying, keep original subject and lighting intact'
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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white text-xs">Quick Presets</Label>
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
                  // Direct generation only - no queue
                  onGenerate()
                }
              }}
              disabled={!canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {gen4Processing ? (
                gen4Settings.model === 'seedream-4' && gen4Settings.maxImages && gen4Settings.maxImages > 1 
                  ? `Generating ${gen4Settings.maxImages} images...`
                  : 'Generating...'
              ) : (
                <span className="flex items-center gap-2">
                  {gen4Settings.model === 'seedream-4' && gen4Settings.maxImages && gen4Settings.maxImages > 1 
                    ? `Generate ${gen4Settings.maxImages} Images`
                    : 'Generate'
                  }
                  {gen4Settings.model === 'seedream-4' && (
                    <span className="text-sm opacity-75">
                      (~${((gen4Settings.maxImages || 1) * 0.03).toFixed(2)})
                    </span>
                  )}
                </span>
              )}
            </Button>

            {/* Clear Queue Button */}
            {(getQueuedCount() > 0 || getProcessingCount() > 0) && (
              <Button
                onClick={() => clearAll()}
                variant="outline"
                size="sm"
                className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                Clear Queue ({getQueuedCount() + getProcessingCount()} items)
              </Button>
            )}

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