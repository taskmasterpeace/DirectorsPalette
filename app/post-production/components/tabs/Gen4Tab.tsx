'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Sparkles,
  Upload,
  Clipboard,
  Trash2,
  Plus,
  FolderOpen,
  Users,
  MapPin,
  Package,
  Layout,
  Maximize2,
  Eye,
  Download,
  Settings,
  Edit
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/UnifiedImageGallery'
import { useAuth } from '@/components/auth/AuthProvider'
import type { 
  Gen4ReferenceImage,
  Gen4Generation,
  Gen4Settings,
  LibraryImageReference
} from '@/lib/post-production/enhanced-types'
import { saveImageToLibrary } from '@/lib/post-production/referenceLibrary'
import InlineTagEditor from '../InlineTagEditor'
import CategorySelectionDialog from '../CategorySelectionDialog'
import { ChapterCyclingInterface } from '@/components/post-production/ChapterCyclingInterface'
import { getImageDimensions } from '@/lib/post-production/helpers'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Gen4TabProps {
  gen4ReferenceImages: Gen4ReferenceImage[]
  setGen4ReferenceImages: (images: Gen4ReferenceImage[]) => void
  gen4Prompt: string
  setGen4Prompt: (prompt: string) => void
  gen4Settings: Gen4Settings
  setGen4Settings: (settings: Gen4Settings) => void
  gen4Generations: Gen4Generation[]
  setGen4Generations: (generations: Gen4Generation[]) => void
  gen4Processing: boolean
  setGen4Processing: (processing: boolean) => void
  libraryItems: LibraryImageReference[]
  libraryCategory: string
  setLibraryCategory: (category: any) => void
  libraryLoading: boolean
  onFullscreenImage: (image: LibraryImageReference) => void
  onSendToWorkspace: (imageUrl: string) => void
  shotList?: any[]
  generatedShotIds?: Set<string>
  onShotGenerated?: (shotId: string, imageUrl: string) => void
  onSendToImageEdit?: (imageUrl: string) => void
}

export function Gen4Tab({
  gen4ReferenceImages,
  setGen4ReferenceImages,
  gen4Prompt,
  setGen4Prompt,
  gen4Settings,
  setGen4Settings,
  gen4Generations,
  setGen4Generations,
  gen4Processing,
  setGen4Processing,
  libraryItems,
  libraryCategory,
  setLibraryCategory,
  libraryLoading,
  onFullscreenImage,
  onSendToWorkspace,
  shotList = [],
  generatedShotIds = new Set(),
  onShotGenerated,
  onSendToImageEdit
}: Gen4TabProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()
  
  // Gen4 Prefix/Suffix System
  const [gen4Prefix, setGen4Prefix] = useState('')
  const [gen4Suffix, setGen4Suffix] = useState(', professional photography, high quality')
  const [showPrefixSuffix, setShowPrefixSuffix] = useState(false)
  
  // Customizable Presets System
  const [customPresets, setCustomPresets] = useState([
    { name: 'Portrait', prefix: 'Professional portrait of', suffix: ', studio lighting, professional photography' },
    { name: 'Cinematic', prefix: 'Cinematic shot of', suffix: ', dramatic lighting, film quality' },
    { name: 'Commercial', prefix: 'Commercial photography of', suffix: ', clean background, professional lighting' }
  ])
  const [editingPreset, setEditingPreset] = useState<{name: string, prefix: string, suffix: string} | null>(null)
  const [showPresetEditor, setShowPresetEditor] = useState(false)
  
  // Category Selection System
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [pendingImageSave, setPendingImageSave] = useState<{
    imageUrl: string
    prompt: string
    settings: any
  } | null>(null)

  // Check if clipboard paste is available
  const canUsePaste = typeof navigator !== 'undefined' && 
                     navigator.clipboard && 
                     window.isSecureContext

  // Handle image upload to specific reference slot
  const handlePasteToSlot = async (slotIndex: number) => {
    console.log('🔴 PASTE BUTTON CLICKED - Slot', slotIndex + 1)
    console.log('🔍 Current reference images count:', gen4ReferenceImages.length)
    
    // Check clipboard API availability
    if (!canUsePaste) {
      console.log('❌ Clipboard not available, opening file browser')
      toast({
        title: "Choose Reference Image",
        description: `Select an image file for Reference ${slotIndex + 1}`,
      })
      // Create targeted file input for this specific slot
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files && files[0]) {
          handleGen4ImageUpload(files[0], slotIndex)
        }
      }
      input.click()
      return
    }
    
    try {
      console.log('🔍 Attempting to read clipboard...')
      const items = await navigator.clipboard.read()
      console.log('🔍 Clipboard items found:', items.length)
      
      for (const item of items) {
        console.log('🔍 Item types:', item.types)
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            console.log('✅ Found image type:', type)
            const blob = await item.getType(type)
            console.log('🔍 Blob size:', blob.size, 'bytes')
            
            await handleGen4ImageUpload(blob, slotIndex)
            console.log('✅ Image upload successful to slot', slotIndex + 1)
            
            toast({
              title: "Image Pasted!",
              description: `Pasted to reference slot ${slotIndex + 1}`
            })
            return
          }
        }
      }
      
      console.log('❌ No image found in clipboard')
      toast({
        title: "No Image Found",
        description: "No image found in clipboard",
        variant: "destructive"
      })
    } catch (err) {
      console.error('❌ Paste failed:', err)
      toast({
        title: "Paste Failed", 
        description: "Using file upload instead",
        variant: "destructive"
      })
      // Fallback to file upload
      document.getElementById('gen4-file-input')?.click()
    }
  }

  // Gen4 image upload handler
  const handleGen4ImageUpload = async (file: File | Blob, targetSlot?: number) => {
    const id = Date.now().toString()
    const preview = URL.createObjectURL(file)
    const fileObj = file instanceof File ? file : new File([file], `ref_${id}.png`, { type: 'image/png' })
    
    // Detect aspect ratio
    const dimensions = await getImageDimensions(fileObj)
    
    setGen4ReferenceImages(prev => {
      // If targeting specific slot and it's occupied, replace it
      if (targetSlot !== undefined && prev[targetSlot]) {
        const newImages = [...prev]
        newImages[targetSlot] = { 
          id, 
          file: fileObj, 
          preview, 
          tags: [],
          detectedAspectRatio: dimensions.aspectRatio,
          width: dimensions.width,
          height: dimensions.height
        }
        return newImages
      }
      
      // Otherwise, add to first available slot
      if (prev.length >= 3) {
        toast({
          title: "Reference Limit",
          description: "Maximum 3 reference images allowed",
          variant: "destructive"
        })
        return prev
      }
      
      return [...prev, { 
        id, 
        file: fileObj, 
        preview, 
        tags: [],
        detectedAspectRatio: dimensions.aspectRatio,
        width: dimensions.width,
        height: dimensions.height
      }]
    })
    
    // Auto-update Gen4 settings aspect ratio if first image
    if (gen4ReferenceImages.length === 0) {
      setGen4Settings(prev => ({
        ...prev,
        aspectRatio: dimensions.aspectRatio
      }))
    }
  }

  // Handle file input upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        handleGen4ImageUpload(file)
      }
    }
  }

  // Generate with Gen4
  const handleGen4Generate = async () => {
    if (!gen4Prompt.trim()) {
      toast({
        title: "No Prompt",
        description: "Please enter a prompt for generation",
        variant: "destructive"
      })
      return
    }
    
    if (gen4ReferenceImages.length === 0) {
      toast({
        title: "No Reference Images",
        description: "Please add at least one reference image for Gen4 generation",
        variant: "destructive"
      })
      return
    }
    
    // Apply prefix/suffix to create final prompt
    const finalPrompt = `${gen4Prefix.trim()} ${gen4Prompt.trim()} ${gen4Suffix.trim()}`
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim()
    
    console.log('🔍 Original prompt:', gen4Prompt)
    console.log('🔍 Prefix:', gen4Prefix)
    console.log('🔍 Suffix:', gen4Suffix)
    console.log('🔍 Final enhanced prompt:', finalPrompt)
    
    setGen4Processing(true)
    
    try {
      // Upload reference images first
      const referenceUrls = await Promise.all(
        gen4ReferenceImages.map(async (img) => {
          const formData = new FormData()
          formData.append('file', img.file)
          const uploadRes = await fetch('/api/upload-media', {
            method: 'POST',
            body: formData
          })
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload reference image`)
          }
          const { url } = await uploadRes.json()
          return url
        })
      )
      
      // Get auth token for API call
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required. Please sign in.')
      }

      // Generate with Gen4
      const response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspect_ratio: gen4ReferenceImages[0]?.detectedAspectRatio || gen4Settings.aspectRatio,
          resolution: gen4Settings.resolution,
          seed: gen4Settings.seed,
          reference_images: referenceUrls,
          reference_tags: gen4ReferenceImages.map((img, index) => 
            img.tags.length > 0 && img.tags[0].length >= 3 && img.tags[0].length <= 15 
              ? img.tags[0] 
              : `ref${index + 1}`
          ),
          model: 'nano-banana'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        // Handle specific error cases
        if (response.status === 402) {
          // Insufficient credits
          toast({
            title: "Insufficient Credits",
            description: `Need ${errorData.required || 'more'} credits. You have ${errorData.available || 0}. Shortfall: ${errorData.shortfall || 'unknown'} credits.`,
            variant: "destructive",
            duration: 8000
          })
          return
        } else if (response.status === 401) {
          // Authentication error
          toast({
            title: "Authentication Error",
            description: "Please sign in to generate images.",
            variant: "destructive"
          })
          return
        }
        
        throw new Error(errorData.error || `Generation failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      const newGeneration: Gen4Generation = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        referenceImages: [...gen4ReferenceImages],
        settings: { ...gen4Settings },
        status: 'completed',
        outputUrl: result.images?.[0] || result.imageUrl,
        timestamp: Date.now()
      }
      
      setGen4Generations(prev => [newGeneration, ...prev])
      
      // Save to unified gallery for cross-tab persistence
      if (newGeneration.outputUrl) {
        addImage({
          url: newGeneration.outputUrl,
          prompt: finalPrompt,
          source: 'shot-creator',
          model: 'nano-banana',
          settings: {
            aspectRatio: gen4Settings.aspectRatio,
            resolution: gen4Settings.resolution,
            seed: gen4Settings.seed
          },
          creditsUsed: 25, // Base cost for nano-banana
          tags: ['generated', 'gen4', 'nano-banana']
        })
      }
      
      // Auto-save to library
      if (result.images?.[0] || result.imageUrl) {
        try {
          await saveImageToLibrary(
            result.images?.[0] || result.imageUrl,
            ['generated'],
            gen4Prompt,
            'generated',
            gen4Settings,
            'unorganized'
          )
        } catch (error) {
          console.error('Failed to auto-save to library:', error)
        }
      }
      
      // Show success message with credits info
      const creditsMessage = result.creditsUsed 
        ? `Used ${result.creditsUsed} credits. ${result.remainingCredits || 'Credits'} remaining.`
        : "Image generated successfully"
        
      toast({
        title: "Generation Complete",
        description: creditsMessage
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setGen4Processing(false)
    }
  }

  // Category save handler
  const handleCategorySave = async (category: string, tags: string[]) => {
    if (!pendingImageSave) return
    
    try {
      await saveImageToLibrary(
        pendingImageSave.imageUrl,
        tags,
        pendingImageSave.prompt,
        'generated',
        pendingImageSave.settings,
        category as any
      )
      
      console.log('✅ Image saved with category:', category)
      
      // Force library refresh
      window.dispatchEvent(new CustomEvent('libraryUpdated'))
      
      toast({
        title: "Saved to Library",
        description: `Image saved to ${category} category`
      })
      
      setPendingImageSave(null)
    } catch (error) {
      console.error('❌ Category save failed:', error)
      toast({
        title: "Save Failed",
        description: "Could not save to library",
        variant: "destructive"
      })
    }
  }

  // Preset management functions
  const handleSavePreset = () => {
    if (!editingPreset?.name.trim()) {
      toast({
        title: "Invalid Preset",
        description: "Please enter a preset name",
        variant: "destructive"
      })
      return
    }
    
    let newPresets
    const isEditing = customPresets.some(p => p.name === editingPreset.name)
    
    if (isEditing) {
      // Update existing preset
      newPresets = customPresets.map(p => 
        p.name === editingPreset.name ? editingPreset : p
      )
    } else {
      // Add new preset
      newPresets = [...customPresets, editingPreset]
    }
    
    setCustomPresets(newPresets)
    
    // Save to localStorage
    try {
      localStorage.setItem('gen4-custom-presets', JSON.stringify(newPresets))
      console.log('✅ Presets saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save presets:', error)
    }
    
    setEditingPreset(null)
    setShowPresetEditor(false)
    
    toast({
      title: "Preset Saved",
      description: `"${editingPreset.name}" preset ${isEditing ? 'updated' : 'created'} successfully`
    })
  }

  const handleDeletePreset = (presetName: string) => {
    const newPresets = customPresets.filter(p => p.name !== presetName)
    setCustomPresets(newPresets)
    
    try {
      localStorage.setItem('gen4-custom-presets', JSON.stringify(newPresets))
    } catch (error) {
      console.error('❌ Failed to save presets:', error)
    }
    
    toast({
      title: "Preset Deleted",
      description: `"${presetName}" preset removed`
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Reference Images Section - FULL WIDTH */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Shot Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reference Images Grid */}
          <div>
            <Label className="text-white mb-4 block text-base font-medium">
              Reference Images (Max 3)
            </Label>
            <div className="grid grid-cols-3 gap-6">
              {[0, 1, 2].map((slot) => {
                const ref = gen4ReferenceImages[slot]
                return (
                  <div key={slot} className="space-y-3">
                    <div 
                      className="bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg min-h-[120px] flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                      onClick={() => {
                        if (!ref) {
                          // Create file input for this specific slot
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            if (files && files[0]) {
                              handleGen4ImageUpload(files[0], slot)
                            }
                          }
                          input.click()
                        }
                      }}
                    >
                      {ref ? (
                        <div className="relative w-full group">
                          <img
                            src={ref.preview}
                            alt={`Reference ${slot + 1}`}
                            className="w-full h-auto max-h-[200px] object-contain rounded-lg"
                            style={{ aspectRatio: 'auto' }}
                          />
                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setGen4ReferenceImages(prev => 
                                prev.filter((_, i) => i !== slot)
                              )
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          {/* Tag editor */}
                          <div className="absolute bottom-1 left-1">
                            <InlineTagEditor
                              value={ref.tags[0] || ''}
                              onSave={(newTag) => {
                                setGen4ReferenceImages(prev =>
                                  prev.map((r, i) =>
                                    i === slot ? { ...r, tags: newTag ? [newTag] : [] } : r
                                  )
                                )
                              }}
                              placeholder="Add tag..."
                              className="bg-black/60 text-white text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 mb-2">
                            Reference {slot + 1}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* IMPROVED REFERENCE SLOT ACTIONS */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePasteToSlot(slot)}
                        disabled={!canUsePaste}
                        className="text-xs"
                      >
                        <Clipboard className="w-3 h-3 mr-1" />
                        Paste
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create targeted file input for this specific slot
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            if (files && files[0]) {
                              handleGen4ImageUpload(files[0], slot)
                            }
                          }
                          input.click()
                        }}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Browse
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* File input for manual upload */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Each reference slot has its own "Browse" and "Paste" buttons for targeted uploads
              </p>
            </div>
          </div>

          {/* Chapter Cycling System */}
          {shotList.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Card className="bg-slate-900 border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <CardHeader className="py-3">
                    <CardTitle className="text-white text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        📸 Cycle Through Shots
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{shotList.length} shots</Badge>
                        <Badge variant="outline">{generatedShotIds.size} generated</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4">
                  <ChapterCyclingInterface
                    shots={shotList}
                    onGenerateShot={(shot) => {
                      console.log('🔴 SHOT SELECTED FOR GENERATION:', shot.id)
                      console.log('🔍 Shot description:', shot.description)
                      
                      // Auto-populate Gen4 prompt with shot description
                      setGen4Prompt(shot.description)
                      
                      // Scroll to prompt area for user attention
                      setTimeout(() => {
                        document.querySelector('[data-gen4-prompt]')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'center'
                        })
                      }, 100)
                      
                      toast({
                        title: "Shot Loaded",
                        description: `"${shot.description.substring(0, 50)}..." loaded into Gen4 prompt`
                      })
                    }}
                    generatedShots={generatedShotIds}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Gen4 Prefix/Suffix System */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm">Prompt Enhancement</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPrefixSuffix(!showPrefixSuffix)}
              >
                <Settings className="w-3 h-3 mr-1" />
                {showPrefixSuffix ? 'Hide' : 'Show'} Prefix/Suffix
              </Button>
            </div>
            
            {showPrefixSuffix && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800 rounded border border-slate-600">
                <div>
                  <Label className="text-xs text-slate-300">Prefix (added to start)</Label>
                  <Input
                    placeholder="e.g., Professional portrait of"
                    value={gen4Prefix}
                    onChange={(e) => setGen4Prefix(e.target.value)}
                    className="text-sm bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Suffix (added to end)</Label>
                  <Input
                    placeholder="e.g., , studio lighting, 4K"
                    value={gen4Suffix}
                    onChange={(e) => setGen4Suffix(e.target.value)}
                    className="text-sm bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                {/* Customizable Quick Presets */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-300">Quick Presets</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-5"
                      onClick={() => {
                        setEditingPreset({ name: '', prefix: '', suffix: '' })
                        setShowPresetEditor(true)
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Custom
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {customPresets.map((preset) => (
                      <div key={preset.name} className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                          onClick={() => {
                            setGen4Prefix(preset.prefix)
                            setGen4Suffix(preset.suffix)
                            toast({
                              title: "Preset Applied",
                              description: `Applied "${preset.name}" preset`
                            })
                          }}
                        >
                          {preset.name}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-6 w-6 p-0"
                          onClick={() => setEditingPreset(preset)}
                          title="Edit preset"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => {
                        setGen4Prefix('')
                        setGen4Suffix('')
                        toast({
                          title: "Cleared",
                          description: "Prefix and suffix cleared"
                        })
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Section */}
          <div>
            <Label className="text-white mb-2 block text-base font-medium">
              Prompt {gen4Prefix || gen4Suffix ? '(Enhanced with Prefix/Suffix)' : ''}
            </Label>
            <Textarea
              value={gen4Prompt}
              onChange={(e) => setGen4Prompt(e.target.value)}
              placeholder={
                gen4ReferenceImages.length > 0
                  ? `Use @${gen4ReferenceImages[0]?.tags[0] || 'tag1'} in your prompt. Example: "a portrait of @woman in urban setting"`
                  : "Describe the image you want to generate... (Ctrl+Enter to generate)"
              }
              className="bg-slate-800 border-slate-600 text-white"
              rows={4}
              data-gen4-prompt="true"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleGen4Generate()
                }
              }}
            />
            
            {/* Helper text for tags */}
            {gen4ReferenceImages.length > 0 && (
              <div className="mt-2 p-3 bg-slate-800 rounded">
                <p className="text-xs text-slate-400 mb-2">
                  Click to insert tags into prompt:
                </p>
                <div className="flex gap-2">
                  {gen4ReferenceImages.map((ref, i) => (
                    ref.tags[0] && (
                      <Button
                        key={i}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const tag = `@${ref.tags[0]}`
                          if (!gen4Prompt.includes(tag)) {
                            setGen4Prompt(prev => prev + (prev ? ' ' : '') + tag)
                          }
                        }}
                      >
                        @{ref.tags[0]}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white mb-2 block">Aspect Ratio</Label>
              <Select
                value={gen4Settings.aspectRatio}
                onValueChange={(value) => 
                  setGen4Settings(prev => ({ ...prev, aspectRatio: value }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="4:3">4:3 Standard</SelectItem>
                  <SelectItem value="3:4">3:4 Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white mb-2 block">Resolution</Label>
              <Select
                value={gen4Settings.resolution}
                onValueChange={(value) => 
                  setGen4Settings(prev => ({ ...prev, resolution: value }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-white mb-2 block">Seed (Optional)</Label>
              <Input
                type="number"
                value={gen4Settings.seed || ''}
                onChange={(e) => 
                  setGen4Settings(prev => ({ 
                    ...prev, 
                    seed: e.target.value ? parseInt(e.target.value) : undefined 
                  }))
                }
                placeholder="Random"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGen4Generate}
            disabled={gen4Processing || !gen4Prompt.trim() || gen4ReferenceImages.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-lg py-6"
          >
            {gen4Processing ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate with Gen4
              </>
            )}
          </Button>
          
          {/* Help text for disabled state */}
          {(gen4ReferenceImages.length === 0 || !gen4Prompt.trim()) && !gen4Processing && (
            <div className="text-center text-sm text-slate-400 mt-2">
              {gen4ReferenceImages.length === 0 && (
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Add at least 1 reference image to generate</span>
                </div>
              )}
              {!gen4Prompt.trim() && (
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Edit className="w-4 h-4" />
                  <span>Enter a prompt to describe what you want</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reference Library */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Reference Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filters */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={libraryCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setLibraryCategory('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={libraryCategory === 'people' ? 'default' : 'outline'}
              onClick={() => setLibraryCategory('people')}
            >
              <Users className="w-3 h-3 mr-1" />
              People
            </Button>
            <Button
              size="sm"
              variant={libraryCategory === 'places' ? 'default' : 'outline'}
              onClick={() => setLibraryCategory('places')}
            >
              <MapPin className="w-3 h-3 mr-1" />
              Places
            </Button>
            <Button
              size="sm"
              variant={libraryCategory === 'props' ? 'default' : 'outline'}
              onClick={() => setLibraryCategory('props')}
            >
              <Package className="w-3 h-3 mr-1" />
              Props
            </Button>
            <Button
              size="sm"
              variant={libraryCategory === 'layouts' ? 'default' : 'outline'}
              onClick={() => setLibraryCategory('layouts')}
            >
              <Layout className="w-3 h-3 mr-1" />
              Layouts
            </Button>
          </div>
          
          {/* Library Grid */}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-4 gap-3">
              {libraryLoading ? (
                <div className="col-span-4 text-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Loading library...</p>
                </div>
              ) : libraryItems.filter(item => 
                libraryCategory === 'all' || item.category === libraryCategory
              ).length === 0 ? (
                <div className="col-span-4 text-center py-8">
                  <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Library is empty</p>
                </div>
              ) : (
                libraryItems
                  .filter(item => libraryCategory === 'all' || item.category === libraryCategory)
                  .map(item => (
                  <div
                    key={item.id}
                    className="aspect-square bg-slate-800 rounded cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all relative group"
                  >
                    <img
                      src={item.preview || item.imageData}
                      alt=""
                      className="w-full h-full object-cover rounded"
                      onClick={() => {
                        // Add to Gen4 reference images
                        if (gen4ReferenceImages.length < 3) {
                          const file = new File([item.imageData], `ref_${item.id}.png`, { type: 'image/png' })
                          handleGen4ImageUpload(file)
                          toast({
                            title: "Reference Added",
                            description: "Added to Gen4 references"
                          })
                        } else {
                          toast({
                            title: "Reference Limit",
                            description: "Maximum 3 reference images allowed",
                            variant: "destructive"
                          })
                        }
                      }}
                    />
                    
                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFullscreenImage(item)
                        }}
                        title="View fullscreen"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Generation History */}
      {gen4Generations.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {gen4Generations.map(gen => (
                <div key={gen.id} className="space-y-2">
                  <div className="bg-slate-800 rounded overflow-hidden relative group">
                    {gen.outputUrl ? (
                      <>
                        <div className="w-full h-48 bg-slate-800 rounded overflow-hidden">
                          <img
                            src={gen.outputUrl}
                            alt={gen.prompt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                          <div className="flex gap-1">
                          {onSendToImageEdit && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSendToImageEdit(gen.outputUrl!)
                              }}
                              title="Send to Image Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              console.log('🔴 FULLSCREEN CLICKED')
                              // Create fullscreen data object
                              const fullscreenData = {
                                id: gen.id,
                                imageData: gen.outputUrl!,
                                preview: gen.outputUrl!,
                                tags: ['generated'],
                                prompt: gen.prompt,
                                category: 'unorganized',
                                source: 'generated',
                                timestamp: gen.timestamp,
                                settings: gen.settings
                              }
                              onFullscreenImage(fullscreenData)
                            }}
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              console.log('🔴 SAVE TO LIBRARY CLICKED - Opening category dialog')
                              setPendingImageSave({
                                imageUrl: gen.outputUrl!,
                                prompt: gen.prompt,
                                settings: gen.settings
                              })
                              setCategoryDialogOpen(true)
                            }}
                            title="Save to Reference Library"
                          >
                            <FolderOpen className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              console.log('🔴 DOWNLOAD CLICKED')
                              const a = document.createElement('a')
                              a.href = gen.outputUrl!
                              a.download = `gen4-${gen.id}-${Date.now()}.png`
                              a.click()
                              toast({
                                title: "Download Started",
                                description: "Image download initiated"
                              })
                            }}
                            title="Download Image"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          </div>
                          
                          {/* Quick Library Actions Row */}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async () => {
                                try {
                                  await saveImageToLibrary({
                                    imageData: gen.outputUrl!,
                                    preview: gen.outputUrl!,
                                    tags: ['generated'],
                                    prompt: gen.prompt,
                                    category: 'unorganized',
                                    source: 'generated'
                                  })
                                  toast({
                                    title: "Saved to Unorganized",
                                    description: "Image saved to reference library"
                                  })
                                } catch (error) {
                                  toast({
                                    title: "Save Failed",
                                    description: "Could not save to library",
                                    variant: "destructive"
                                  })
                                }
                              }}
                              title="Quick save to unorganized library"
                            >
                              📁 Unorganized
                            </Button>
                          </div>
                          
                          {/* Reference Slot Actions Row */}
                          <div className="flex gap-1">
                            {[1, 2, 3].map(slot => (
                              <Button
                                key={slot}
                                size="sm"
                                variant="outline"
                                className="h-6 px-1 text-xs bg-green-600/80 hover:bg-green-700 text-white border-green-500"
                                onClick={async () => {
                                  try {
                                    // Convert data URL to blob, then to File
                                    const response = await fetch(gen.outputUrl!)
                                    const blob = await response.blob()
                                    const file = new File([blob], `ref_${gen.id}.png`, { type: 'image/png' })
                                    
                                    await handleGen4ImageUpload(file, slot - 1)
                                    toast({
                                      title: `Added to Ref ${slot}`,
                                      description: `Image set as reference ${slot}`
                                    })
                                  } catch (error) {
                                    console.error('Failed to add to reference:', error)
                                    toast({
                                      title: "Failed to Add Reference",
                                      description: "Could not add image to reference slot",
                                      variant: "destructive"
                                    })
                                  }
                                }}
                                title={`Send to Reference ${slot}`}
                              >
                                R{slot}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {gen.prompt}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Image Gallery - Persistent Across All Tabs */}
      <UnifiedImageGallery
        currentTab="shot-creator"
        onSendToTab={(imageUrl, targetTab) => {
          if (targetTab === 'shot-editor' && onSendToImageEdit) {
            onSendToImageEdit(imageUrl)
          }
          // TODO: Add send to shot-animator functionality
        }}
        onUseAsReference={(imageUrl) => {
          // Add image as reference to Gen4
          console.log('Using as reference:', imageUrl)
          toast({
            title: "Added as Reference",
            description: "Image added to reference slots"
          })
        }}
        className="mt-6"
      />

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleCategorySave}
        initialTags={['generated']}
        imageUrl={pendingImageSave?.imageUrl}
      />
    </div>
  )
}