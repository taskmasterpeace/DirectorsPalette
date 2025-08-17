'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Film, 
  Image as ImageIcon, 
  Layout,
  Settings,
  Sparkles,
  Upload,
  Clipboard,
  Play,
  Pause,
  Download,
  Trash2,
  Plus,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Users,
  MapPin,
  Package,
  Check,
  Video,
  DollarSign,
  Copy,
  Search,
  Tag,
  Maximize2
} from 'lucide-react'
import { usePostProductionStore } from '@/stores/post-production-store'
import { retrieveTransferredShots } from '@/lib/post-production/transfer'
import { useToast } from '@/components/ui/use-toast'
import ModeSelection from './components/workspace/ModeSelection'
import LayoutPlanner from './components/layout-planner/LayoutPlanner'
import type { 
  PostProductionShot,
  GenerationSettings 
} from '@/lib/post-production/types'
import type { 
  ImageData,
  Template,
  Gen4ReferenceImage,
  Gen4Generation,
  Gen4Settings,
  LibraryImageReference
} from '@/lib/post-production/enhanced-types'
import { referenceLibraryDB, saveImageToLibrary } from '@/lib/post-production/referenceLibrary'
import { 
  SEEDANCE_MODELS, 
  SEEDANCE_DURATIONS, 
  SEEDANCE_LITE_RESOLUTIONS, 
  SEEDANCE_PRO_RESOLUTIONS,
  GEN4_MODELS,
  GEN4_ASPECT_RATIOS,
  GEN4_RESOLUTIONS,
  defaultSettings 
} from '@/lib/post-production/settings-data'
import CategorySelectionDialog from './components/CategorySelectionDialog'
import FullscreenImageModal from './components/FullscreenImageModal'
import TemplateBuilder from './components/TemplateBuilder'
import InlineTagEditor from './components/InlineTagEditor'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function EnhancedPostProductionPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('workspace')
  const [mode, setMode] = useState<'seedance' | 'kontext'>('seedance')
  const [images, setImages] = useState<ImageData[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [settings, setSettings] = useState(defaultSettings)
  
  // Gen4 state
  const [gen4ReferenceImages, setGen4ReferenceImages] = useState<Gen4ReferenceImage[]>([])
  const [gen4Prompt, setGen4Prompt] = useState('')
  const [gen4Settings, setGen4Settings] = useState<Gen4Settings>({
    aspectRatio: '16:9',
    resolution: '1080p',
    seed: undefined
  })
  const [gen4Generations, setGen4Generations] = useState<Gen4Generation[]>([])
  const [gen4Processing, setGen4Processing] = useState(false)
  
  // Reference Library state
  const [libraryCategory, setLibraryCategory] = useState<'all' | 'people' | 'places' | 'props' | 'unorganized'>('all')
  const [libraryItems, setLibraryItems] = useState<LibraryImageReference[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [pendingGeneration, setPendingGeneration] = useState<{
    imageUrl: string
    prompt: string
    settings: any
    referenceTags?: string[]
  } | null>(null)
  
  // Fullscreen modal state
  const [fullscreenImage, setFullscreenImage] = useState<LibraryImageReference | null>(null)
  
  // Shot management
  const {
    shotQueue,
    processingShot,
    completedShots,
    failedShots,
    isGenerating,
    addShots,
    removeShot,
    clearQueue,
    setIsGenerating,
    setProcessingShot,
    markShotCompleted,
    markShotFailed,
    updateProgress
  } = usePostProductionStore()
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gen4FileInputRef = useRef<HTMLInputElement>(null)
  
  // Check for transferred shots and load library on mount
  useEffect(() => {
    const transferredShots = retrieveTransferredShots()
    if (transferredShots && transferredShots.length > 0) {
      addShots(transferredShots)
      toast({
        title: "Shots Imported",
        description: `Successfully imported ${transferredShots.length} shots from Director's Palette`,
      })
    }
    
    // Load reference library
    loadLibraryItems()
  }, [])
  
  // Load library items from IndexedDB
  const loadLibraryItems = async () => {
    setLibraryLoading(true)
    try {
      await referenceLibraryDB.init()
      const items = await referenceLibraryDB.getAllReferences()
      setLibraryItems(items as LibraryImageReference[])
    } catch (error) {
      console.error('Failed to load library:', error)
      toast({
        title: "Library Error",
        description: "Failed to load reference library",
        variant: "destructive"
      })
    } finally {
      setLibraryLoading(false)
    }
  }
  
  // Gen4 image upload handler - must be defined before handleFileUpload
  const handleGen4ImageUpload = async (file: File | Blob, referenceTag?: string) => {
    const id = Date.now().toString()
    const preview = URL.createObjectURL(file)
    const fileObj = file instanceof File ? file : new File([file], `ref_${id}.png`, { type: 'image/png' })
    
    // Detect aspect ratio
    const { getImageDimensions } = await import('@/lib/post-production/helpers')
    const dimensions = await getImageDimensions(fileObj)
    
    setGen4ReferenceImages(prev => {
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
        tags: referenceTag ? [referenceTag] : [],
        detectedAspectRatio: dimensions.aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
        persistentTag: referenceTag
      }]
    })
    
    // Auto-update Gen4 settings aspect ratio if first image
    if (gen4ReferenceImages.length === 0 && settings.gen4?.autoDetectAspectRatio) {
      setGen4Settings(prev => ({
        ...prev,
        aspectRatio: dimensions.aspectRatio
      }))
    }
  }
  
  // File upload handler - defined before handlePaste to avoid initialization error
  const handleFileUpload = (files: FileList | null, isGen4 = false) => {
    if (!files) return
    
    if (isGen4) {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          handleGen4ImageUpload(file)
        }
      }
    } else {
      // Handle workspace file upload
      const newImages: ImageData[] = []
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          const preview = URL.createObjectURL(file)
          newImages.push({
            id,
            file,
            preview,
            prompt: '',
            selected: false,
            status: 'idle',
            mode
          })
        }
      }
      setImages(prev => [...prev, ...newImages])
    }
  }
  
  // Handle paste event for shots and images
  const handlePaste = useCallback((e: ClipboardEvent) => {
    // Handle image paste first (works for both workspace and gen4)
    const items = e.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile()
          if (blob) {
            if (activeTab === 'gen4') {
              handleGen4ImageUpload(blob)
            } else if (activeTab === 'workspace') {
              // Handle image paste in workspace
              handleFileUpload([blob as File])
              toast({
                title: "Image Pasted",
                description: "Image added to workspace",
              })
              return // Exit after handling image
            }
          }
        }
      }
    }
    
    // Handle text paste
    const text = e.clipboardData?.getData('text')
    if (text && activeTab === 'workspace') {
      // Try to parse as Director's Palette shot
      try {
        const shots = JSON.parse(text)
        if (Array.isArray(shots)) {
          addShots(shots)
          toast({
            title: "Shots Pasted",
            description: `Added ${shots.length} shots to queue`,
          })
        }
      } catch {
        // Not JSON, treat as single prompt
        const newShot: PostProductionShot = {
          id: `manual_${Date.now()}`,
          projectId: 'manual',
          projectType: 'story',
          shotNumber: shotQueue.length + 1,
          description: text,
          status: 'pending'
        }
        addShots([newShot])
        toast({
          title: "Shot Added",
          description: "Added prompt to queue",
        })
      }
    }
  }, [activeTab, shotQueue, addShots, handleFileUpload])
  
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])
  
  // Handle file upload
  const sendGenerationToWorkspace = async (imageUrl: string) => {
    try {
      if (!imageUrl) return

      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `gen4_${Date.now()}.png`, { type: 'image/png' })
      
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)

      const newImage: ImageData = {
        id,
        file,
        preview,
        prompt: '',
        selected: false,
        status: 'idle',
        mode: mode,
      }

      setImages(prev => [...prev, newImage])

      toast({
        title: 'Added to Workspace',
        description: 'Image has been added to your workspace.',
      })
    } catch (error) {
      console.error('Error sending to workspace:', error)
      toast({
        title: 'Error',
        description: 'Failed to add image to workspace.',
        variant: 'destructive',
      })
    }
  }
  
  // Handle category selection and save to library
  const handleCategorySave = async (category: string, tags: string[]) => {
    if (pendingGeneration) {
      // Get the first reference tag if available
      const referenceTag = pendingGeneration.referenceTags?.[0]
      
      await saveImageToLibrary(
        pendingGeneration.imageUrl,
        tags,
        pendingGeneration.prompt,
        'generated',
        pendingGeneration.settings,
        category as any,
        referenceTag
      )
      setPendingGeneration(null)
      loadLibraryItems() // Refresh library
      toast({
        title: "Saved to Library",
        description: `Image saved to ${category} with ${tags.length} tags`
      })
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
    
    // Optional: Warn if tags exist but aren't used
    const unusedTags = gen4ReferenceImages.filter(img => 
      img.tags[0] && !gen4Prompt.includes(`@${img.tags[0]}`)
    )
    if (unusedTags.length > 0) {
      console.log(`Note: Some tags not used in prompt: ${unusedTags.map(img => `@${img.tags[0]}`).join(', ')}`)
    }
    
    setGen4Processing(true)
    
    try {
      // Upload reference images first
      const referenceUrls = await Promise.all(
        gen4ReferenceImages.map(async (img) => {
          const formData = new FormData()
          formData.append('file', img.file)
          const uploadRes = await fetch('api/upload-media', {
            method: 'POST',
            body: formData
          })
          if (!uploadRes.ok) {
            const errorText = await uploadRes.text()
            console.error('Upload failed:', uploadRes.status, errorText)
            throw new Error(`Failed to upload reference image: ${uploadRes.status} - ${errorText}`)
          }
          const { url } = await uploadRes.json()
          return url
        })
      )
      
      // Use detected aspect ratio from first image if available
      const aspectRatio = gen4ReferenceImages[0]?.detectedAspectRatio || gen4Settings.aspectRatio
      
      // Generate with Gen4
      const response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: gen4Prompt,
          aspect_ratio: aspectRatio,
          resolution: gen4Settings.resolution,
          seed: gen4Settings.seed,
          reference_images: referenceUrls,
          reference_tags: gen4ReferenceImages.map((img) => 
            img.tags.length > 0 ? img.tags[0] : 'reference'
          ),
          model: settings.gen4?.model || 'gen4-image'
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gen4 generation failed:', response.status, errorText)
        throw new Error(`Generation failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      
      const newGeneration: Gen4Generation = {
        id: Date.now().toString(),
        prompt: gen4Prompt,
        referenceImages: [...gen4ReferenceImages],
        settings: { ...gen4Settings },
        status: 'completed',
        outputUrl: result.images?.[0] || result.imageUrl,
        timestamp: Date.now()
      }
      
      setGen4Generations(prev => [newGeneration, ...prev])
      
      // Auto-save to library with default settings (no popup)
      if (result.images?.[0] || result.imageUrl) {
        try {
          await saveImageToLibrary(
            result.images?.[0] || result.imageUrl,
            ['generated'], // Default tags
            gen4Prompt,
            'generated', // Default source
            gen4Settings,
            'unorganized', // Default category
            undefined // No reference tag for auto-save
          )
          
          // Trigger library refresh
          window.dispatchEvent(new CustomEvent('libraryUpdated'))
          loadLibraryItems()
          
          console.log('✅ Auto-saved generation to library')
        } catch (error) {
          console.error('❌ Failed to auto-save to library:', error)
          // Still show success toast even if library save fails
        }
      }
      
      toast({
        title: "Generation Complete",
        description: "Image generated successfully",
      })
    } catch (error) {
      // Handle content moderation errors specially
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes('E005') || errorMessage.includes('flagged as sensitive')) {
        toast({
          title: "Content Moderation Notice",
          description: "The content was flagged by the safety system. Try adjusting your prompt or using different reference images.",
          variant: "destructive"
        })
      } else if (errorMessage.includes('rate limit')) {
        toast({
          title: "Rate Limit Reached",
          description: "Please wait a moment before generating again.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
      
      console.error('Gen4 generation error:', error)
    } finally {
      setGen4Processing(false)
    }
  }
  
  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Film className="w-8 h-8 text-purple-500" />
              Post Production Studio
            </h1>
            <p className="text-slate-400 mt-1">
              Advanced image generation with Director's Palette integration
            </p>
          </div>
        </div>
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="gen4" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Gen4
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout Planner
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Shot Queue Sidebar */}
              <div className="col-span-3">
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center justify-between">
                      Shot Queue
                      <Badge variant="outline" className="text-slate-400">
                        {shotQueue.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {shotQueue.length === 0 ? (
                          <div className="text-center py-8">
                            <Clipboard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">
                              Paste shots or enter prompts
                            </p>
                          </div>
                        ) : (
                          shotQueue.map(shot => (
                            <div key={shot.id} className="p-2 bg-slate-800 rounded text-sm">
                              <div className="flex items-start justify-between">
                                <span className="text-white line-clamp-2">
                                  {shot.description}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeShot(shot.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Apply shots to images */}
                    {shotQueue.length > 0 && images.length > 0 && (
                      <div className="mt-4 mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            // Apply shot descriptions to selected images
                            const selectedImages = images.filter(img => img.selected)
                            if (selectedImages.length === 0) {
                              toast({
                                title: "No Images Selected",
                                description: "Please select images to apply shots to",
                                variant: "destructive"
                              })
                              return
                            }
                            
                            // Apply shots cyclically to selected images
                            setImages(prev => prev.map((img, index) => {
                              if (!img.selected) return img
                              const selectedIndex = selectedImages.findIndex(s => s.id === img.id)
                              const shot = shotQueue[selectedIndex % shotQueue.length]
                              return shot ? { ...img, prompt: shot.description } : img
                            }))
                            
                            toast({
                              title: "Shots Applied",
                              description: `Applied ${Math.min(shotQueue.length, selectedImages.length)} shots to ${selectedImages.length} selected images`
                            })
                          }}
                        >
                          Apply Shots to Selected Images
                        </Button>
                      </div>
                    )}
                    
                    {/* Manual Input */}
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Enter a prompt or paste shots..."
                        className="bg-slate-800 border-slate-600 text-white"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            const value = e.currentTarget.value.trim()
                            if (value) {
                              const newShot: PostProductionShot = {
                                id: `manual_${Date.now()}`,
                                projectId: 'manual',
                                projectType: 'story',
                                shotNumber: shotQueue.length + 1,
                                description: value,
                                status: 'pending'
                              }
                              addShots([newShot])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500">
                        Ctrl+Enter to add shot
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Workspace */}
              <div className="col-span-9 space-y-4">
                {/* Mode Selection */}
                <ModeSelection mode={mode} setMode={setMode} />
                
                {/* Template Builder for Seedance mode */}
                {mode === 'seedance' && images.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Card className="bg-slate-900 border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Template Builder - Click Elements to Build Prompts
                            </CardTitle>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <TemplateBuilder
                        selectedCount={images.filter(img => img.selected).length}
                        onApplyPrompt={(prompt) => {
                          // Apply prompt to all selected images
                          setImages(prev =>
                            prev.map(img => 
                              img.selected 
                                ? { ...img, prompt: prompt }
                                : img
                            )
                          )
                          toast({
                            title: "Template Applied",
                            description: `Prompt applied to ${images.filter(img => img.selected).length} selected images`
                          })
                        }}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Upload Area or Images Grid */}
                {images.length === 0 ? (
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {mode === 'seedance' ? 'Video Generation' : 'Image Editing'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">
                          Drag & drop images, paste from clipboard, or use the shot queue
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Press Ctrl+V to paste images or text
                        </p>
                        <div className="flex gap-4 justify-center mt-4">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Browse Files
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={async () => {
                              try {
                                const items = await navigator.clipboard.read()
                                let foundImage = false
                                
                                for (const item of items) {
                                  for (const type of item.types) {
                                    if (type.startsWith('image/')) {
                                      const blob = await item.getType(type)
                                      const file = new File([blob], `pasted-${Date.now()}.${type.split('/')[1]}`, { type })
                                      handleFileUpload([file])
                                      foundImage = true
                                      toast({
                                        title: "Image Pasted",
                                        description: "Image added to workspace"
                                      })
                                      break
                                    }
                                  }
                                  if (foundImage) break
                                }
                                
                                if (!foundImage) {
                                  // Try text
                                  const text = await navigator.clipboard.readText()
                                  if (text) {
                                    const newShot: PostProductionShot = {
                                      id: `manual_${Date.now()}`,
                                      projectId: 'manual',
                                      projectType: 'story',
                                      shotNumber: shotQueue.length + 1,
                                      description: text,
                                      status: 'pending'
                                    }
                                    addShots([newShot])
                                    toast({
                                      title: "Text Pasted",
                                      description: "Added to shot queue"
                                    })
                                  } else {
                                    toast({
                                      title: "Nothing to Paste",
                                      description: "No images or text found in clipboard",
                                      variant: "destructive"
                                    })
                                  }
                                }
                              } catch (err) {
                                console.error('Clipboard error:', err)
                                toast({
                                  title: "Clipboard Error",
                                  description: "Could not access clipboard. Try using Ctrl+V instead.",
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            <Clipboard className="w-4 h-4 mr-2" />
                            Paste from Clipboard
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          Images ({images.length})
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImages(prev => 
                              prev.map(img => ({ ...img, selected: !images.every(i => i.selected) }))
                            )}
                          >
                            {images.every(img => img.selected) ? 'Deselect All' : 'Select All'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add More
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className={`relative group border rounded-lg overflow-hidden bg-slate-800 ${
                              image.selected ? 'ring-2 ring-purple-500' : 'border-slate-700'
                            }`}
                          >
                            {/* Image Preview */}
                            <div className="relative aspect-video bg-slate-900">
                              <img
                                src={image.preview}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Selection checkbox */}
                              <Button
                                size="sm"
                                variant={image.selected ? 'default' : 'secondary'}
                                className="absolute top-2 left-2 h-8 w-8 p-0"
                                onClick={() => setImages(prev =>
                                  prev.map(img => 
                                    img.id === image.id ? { ...img, selected: !img.selected } : img
                                  )
                                )}
                              >
                                {image.selected ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                              
                              {/* Delete button */}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setImages(prev => prev.filter(img => img.id !== image.id))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              
                              {/* Action buttons */}
                              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {image.outputUrl && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      const a = document.createElement('a')
                                      a.href = image.outputUrl!
                                      a.download = `${image.id}.${mode === 'seedance' ? 'mp4' : 'png'}`
                                      a.click()
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    // Open fullscreen preview
                                  }}
                                >
                                  <Search className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {/* Status badge */}
                              {image.status !== 'idle' && (
                                <Badge
                                  className="absolute bottom-2 left-2"
                                  variant={
                                    image.status === 'completed' ? 'default' :
                                    image.status === 'processing' ? 'secondary' :
                                    image.status === 'failed' ? 'destructive' : 'outline'
                                  }
                                >
                                  {image.status}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Prompt area */}
                            <div className="p-3 space-y-2">
                              <div className="relative">
                                <Textarea
                                  placeholder={mode === 'seedance' ? 'Enter video prompt...' : 'Enter edit prompt...'}
                                  value={image.prompt}
                                  onChange={(e) => setImages(prev =>
                                    prev.map(img => 
                                      img.id === image.id ? { ...img, prompt: e.target.value } : img
                                    )
                                  )}
                                  className="bg-slate-700 border-slate-600 text-white pr-10 min-h-[80px]"
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute top-1 right-1 h-7 w-7 p-0"
                                  onClick={async () => {
                                    try {
                                      const text = await navigator.clipboard.readText()
                                      setImages(prev =>
                                        prev.map(img => 
                                          img.id === image.id ? { ...img, prompt: text } : img
                                        )
                                      )
                                      toast({
                                        title: "Prompt pasted",
                                        description: "Clipboard content added to prompt"
                                      })
                                    } catch (err) {
                                      toast({
                                        title: "Clipboard error",
                                        description: "Could not read clipboard",
                                        variant: "destructive"
                                      })
                                    }
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {/* Individual generate button for Kontext mode */}
                              {mode === 'kontext' && image.prompt && (
                                <Button
                                  size="sm"
                                  className="w-full"
                                  disabled={image.status === 'processing'}
                                  onClick={async () => {
                                    // Start individual generation
                                    setImages(prev =>
                                      prev.map(img => 
                                        img.id === image.id ? { ...img, status: 'processing' } : img
                                      )
                                    )
                                    
                                    try {
                                      const response = await fetch('/post-production/api/generate-media', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          fileUrl: image.preview,
                                          prompt: image.prompt,
                                          mode: 'kontext',
                                          filename: image.id,
                                          seedanceModel: '',
                                          resolution: '1080p',
                                          duration: 0,
                                          camera_fixed: false
                                        })
                                      })
                                      
                                      if (!response.ok) throw new Error('Generation failed')
                                      
                                      const result = await response.json()
                                      
                                      setImages(prev =>
                                        prev.map(img => 
                                          img.id === image.id 
                                            ? { ...img, status: 'completed', outputUrl: result.generatedResponse?.outputUrl } 
                                            : img
                                        )
                                      )
                                      
                                      toast({
                                        title: "Edit Complete",
                                        description: "Image edited successfully"
                                      })
                                    } catch (error) {
                                      setImages(prev =>
                                        prev.map(img => 
                                          img.id === image.id ? { ...img, status: 'failed' } : img
                                        )
                                      )
                                      toast({
                                        title: "Edit Failed",
                                        description: error instanceof Error ? error.message : "Unknown error",
                                        variant: "destructive"
                                      })
                                    }
                                  }}
                                >
                                  {image.status === 'processing' ? 'Editing...' : 'Edit with Kontext'}
                                </Button>
                              )}
                            </div>
                            
                            {/* Generated output preview */}
                            {image.outputUrl && (
                              <div className="p-3 pt-0">
                                <div className="rounded overflow-hidden bg-slate-900">
                                  {mode === 'seedance' ? (
                                    <video
                                      src={image.outputUrl}
                                      controls
                                      className="w-full"
                                    />
                                  ) : (
                                    <img
                                      src={image.outputUrl}
                                      alt="Edited"
                                      className="w-full"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Batch generation controls */}
                      {mode === 'seedance' && images.some(img => img.selected) && (
                        <div className="mt-6 flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                          <div className="text-sm text-slate-300">
                            {images.filter(img => img.selected).length} image(s) selected for generation
                          </div>
                          <Button
                            onClick={async () => {
                              // Start batch generation
                              const selectedImages = images.filter(img => img.selected)
                              selectedImages.forEach(img => {
                                setImages(prev =>
                                  prev.map(i => 
                                    i.id === img.id ? { ...i, status: 'processing' } : i
                                  )
                                )
                              })
                              
                              try {
                                // Process all selected images
                                const results = await Promise.all(
                                  selectedImages.map(async (image) => {
                                    // First upload the image if it's a data URL
                                    let imageUrl = image.preview
                                    
                                    if (image.preview.startsWith('data:') || image.preview.startsWith('blob:')) {
                                      // Need to upload the file first
                                      const formData = new FormData()
                                      formData.append('file', image.file)
                                      
                                      const uploadResponse = await fetch('api/upload-media', {
                                        method: 'POST',
                                        body: formData
                                      })
                                      
                                      if (!uploadResponse.ok) {
                                        throw new Error(`Failed to upload image for ${image.id}`)
                                      }
                                      
                                      const uploadResult = await uploadResponse.json()
                                      imageUrl = uploadResult.url
                                    }
                                    
                                    const response = await fetch('/post-production/api/generate-media', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        fileUrl: imageUrl,
                                        prompt: image.prompt || 'Generate a cinematic video',
                                        mode: 'seedance',
                                        seedanceModel: settings.seedance.model,
                                        resolution: settings.seedance.resolution,
                                        duration: settings.seedance.duration,
                                        camera_fixed: settings.seedance.cameraFixed,
                                        filename: image.id
                                      })
                                    })
                                    
                                    if (!response.ok) throw new Error(`Failed for ${image.id}`)
                                    
                                    const result = await response.json()
                                    return { id: image.id, result }
                                  })
                                )
                                
                                // Update all images with results
                                setImages(prev =>
                                  prev.map(img => {
                                    const result = results.find(r => r.id === img.id)
                                    if (result) {
                                      return {
                                        ...img,
                                        status: 'completed',
                                        outputUrl: result.result.generatedResponse?.outputUrl
                                      }
                                    }
                                    return img
                                  })
                                )
                                
                                toast({
                                  title: "Videos Generated",
                                  description: `Successfully generated ${results.length} videos`,
                                })
                              } catch (error) {
                                // Mark failed images
                                selectedImages.forEach(img => {
                                  setImages(prev =>
                                    prev.map(i => 
                                      i.id === img.id ? { ...i, status: 'failed' } : i
                                    )
                                  )
                                })
                                
                                toast({
                                  title: "Generation Failed",
                                  description: error instanceof Error ? error.message : "Unknown error",
                                  variant: "destructive"
                                })
                              }
                            }}
                            disabled={images.some(img => img.status === 'processing')}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Generate Videos
                          </Button>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Gen4 Tab */}
          <TabsContent value="gen4" className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Reference Images */}
              <div className="col-span-8">
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Gen4 Image Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Reference Images */}
                    <div>
                      <Label className="text-white mb-2 block">
                        Reference Images (Max 3)
                      </Label>
                      <div className="grid grid-cols-3 gap-4">
                        {[0, 1, 2].map((slot) => {
                          const ref = gen4ReferenceImages[slot]
                          return (
                            <div
                              key={slot}
                              className="aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                              onClick={() => gen4FileInputRef.current?.click()}
                            >
                              {ref ? (
                                <div className="relative w-full h-full group">
                                  <img
                                    src={ref.preview}
                                    alt={`Reference ${slot + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  {/* Display aspect ratio */}
                                  {ref.detectedAspectRatio && (
                                    <Badge className="absolute top-2 left-2 text-xs bg-black/70">
                                      {ref.detectedAspectRatio}
                                    </Badge>
                                  )}
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
                                  <p className="text-xs text-slate-500">
                                    Click or paste
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <input
                        ref={gen4FileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, true)}
                      />
                    </div>
                    
                    {/* Prompt */}
                    <div>
                      <Label className="text-white mb-2 block">Prompt</Label>
                      <Textarea
                        value={gen4Prompt}
                        onChange={(e) => setGen4Prompt(e.target.value)}
                        placeholder={
                          gen4ReferenceImages.length > 0
                            ? `Use @${gen4ReferenceImages[0]?.tags[0] || 'tag1'} ${gen4ReferenceImages[1]?.tags[0] ? `@${gen4ReferenceImages[1].tags[0]}` : ''} in your prompt. Example: "a portrait of @woman and @man in a car"`
                            : "Describe the image you want to generate..."
                        }
                        className="bg-slate-800 border-slate-600 text-white"
                        rows={4}
                      />
                      {/* Helper text for tags */}
                      {gen4ReferenceImages.length > 0 && (
                        <div className="mt-2 p-2 bg-slate-800 rounded">
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
                          {gen4ReferenceImages.some(ref => !ref.tags[0]) && (
                            <p className="text-xs text-yellow-400 mt-2">
                              ⚠️ Add tags to all reference images for best results
                            </p>
                          )}
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
                            <SelectItem value="16:9">16:9</SelectItem>
                            <SelectItem value="9:16">9:16</SelectItem>
                            <SelectItem value="1:1">1:1</SelectItem>
                            <SelectItem value="4:3">4:3</SelectItem>
                            <SelectItem value="3:4">3:4</SelectItem>
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
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {gen4Processing ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with Gen4
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Reference Library */}
              <div className="col-span-4">
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
                    </div>
                    
                    {/* Library Grid */}
                    <ScrollArea className="h-[400px]">
                      <div className="grid grid-cols-2 gap-2">
                        {libraryLoading ? (
                          <div className="col-span-2 text-center py-8">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-slate-400">
                              Loading library...
                            </p>
                          </div>
                        ) : libraryItems.filter(item => 
                          libraryCategory === 'all' || item.category === libraryCategory
                        ).length === 0 ? (
                          <div className="col-span-2 text-center py-8">
                            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">
                              Library is empty
                            </p>
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
                                    // Use the saved reference tag if available
                                    handleGen4ImageUpload(file, item.referenceTag)
                                    toast({
                                      title: "Reference Added",
                                      description: item.referenceTag 
                                        ? `Added with tag @${item.referenceTag}`
                                        : "Added to Gen4 references"
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
                              {/* Tag display/editor at the bottom */}
                              <div className="absolute bottom-1 left-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
                                <InlineTagEditor
                                  value={item.referenceTag || ''}
                                  onSave={async (newTag) => {
                                    try {
                                      const updatedRef = { ...item, referenceTag: newTag || undefined }
                                      await referenceLibraryDB.saveReference(updatedRef)
                                      loadLibraryItems()
                                      toast({
                                        title: "Tag Updated",
                                        description: newTag ? `Tag set to @${newTag}` : "Tag removed"
                                      })
                                    } catch (error) {
                                      toast({
                                        title: "Update Failed",
                                        description: "Could not update tag",
                                        variant: "destructive"
                                      })
                                    }
                                  }}
                                  placeholder="Add tag..."
                                  className="bg-black/60 text-white text-xs backdrop-blur-sm"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                <Plus className="w-6 h-6 text-white" />
                              </div>
                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                {/* Fullscreen button */}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFullscreenImage(item)
                                  }}
                                  title="View fullscreen"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </Button>
                                {/* Delete button */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await referenceLibraryDB.deleteReference(item.id)
                                      loadLibraryItems()
                                      toast({
                                        title: "Deleted",
                                        description: "Reference removed from library"
                                      })
                                    } catch (error) {
                                      toast({
                                        title: "Delete Failed",
                                        description: "Could not remove reference",
                                        variant: "destructive"
                                      })
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
            
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
                        <div className="aspect-square bg-slate-800 rounded overflow-hidden relative group">
                          {gen.outputUrl ? (
                            <>
                              <img
                                src={gen.outputUrl}
                                alt={gen.prompt}
                                className="w-full h-full object-cover"
                              />
                              {/* Tag display for history items */}
                              <div className="absolute bottom-1 left-1 flex gap-1">
                                {gen.referenceImages?.map((ref, i) => (
                                  ref.tags[0] && (
                                    <Badge 
                                      key={i}
                                      variant="secondary" 
                                      className="text-xs bg-purple-600/80 text-white"
                                    >
                                      @{ref.tags[0]}
                                    </Badge>
                                  )
                                ))}
                              </div>
                              {/* Action buttons */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    // Create a LibraryImageReference-like object for fullscreen viewing
                                    const fullscreenItem: LibraryImageReference = {
                                      id: gen.id,
                                      imageData: gen.outputUrl!,
                                      preview: gen.outputUrl!,
                                      tags: gen.referenceImages?.flatMap(ref => ref.tags) || [],
                                      referenceTag: gen.referenceImages?.[0]?.tags[0],
                                      prompt: gen.prompt,
                                      category: 'unorganized',
                                      source: 'generated',
                                      timestamp: gen.timestamp,
                                      settings: gen.settings
                                    }
                                    setFullscreenImage(fullscreenItem)
                                  }}
                                  title="View Fullscreen"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={() => sendGenerationToWorkspace(gen.outputUrl!)}
                                  title="Send to Workspace"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setPendingGeneration({
                                      imageUrl: gen.outputUrl!,
                                      prompt: gen.prompt,
                                      settings: gen.settings,
                                      referenceTags: gen.referenceImages?.map(ref => ref.tags[0]).filter(Boolean)
                                    })
                                    setCategoryDialogOpen(true)
                                  }}
                                  title="Save to Library"
                                >
                                  <FolderOpen className="w-3 h-3" />
                                </Button>
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
          </TabsContent>
          
          {/* Layout Planner Tab */}
          <TabsContent value="layout">
            <LayoutPlanner />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seedance Settings */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Seedance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Model</Label>
                    <Select
                      value={settings.seedance.model}
                      onValueChange={(value: string) =>
                        setSettings(prev => ({
                          ...prev,
                          seedance: { ...prev.seedance, model: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEEDANCE_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Resolution</Label>
                    <Select
                      value={settings.seedance.resolution}
                      onValueChange={(value: string) =>
                        setSettings(prev => ({
                          ...prev,
                          seedance: { ...prev.seedance, resolution: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings?.seedance?.model === SEEDANCE_MODELS[0].value
                          ? SEEDANCE_LITE_RESOLUTIONS.map((resolution) => (
                              <SelectItem
                                key={resolution.value}
                                value={resolution.value}
                              >
                                {resolution.name}
                              </SelectItem>
                            ))
                          : SEEDANCE_PRO_RESOLUTIONS.map((resolution) => (
                              <SelectItem
                                key={resolution.value}
                                value={resolution.value}
                              >
                                {resolution.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Duration: {settings.seedance.duration}s
                    </Label>
                    <Select
                      value={settings.seedance.duration.toString()}
                      onValueChange={(value: string) =>
                        setSettings(prev => ({
                          ...prev,
                          seedance: {
                            ...prev.seedance,
                            duration: Number(value),
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEEDANCE_DURATIONS.map((duration) => (
                          <SelectItem
                            key={duration.value}
                            value={duration.value.toString()}
                          >
                            {duration.name} seconds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="camera-fixed"
                      checked={settings.seedance.cameraFixed}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({
                          ...prev,
                          seedance: { ...prev.seedance, cameraFixed: checked },
                        }))
                      }
                    />
                    <Label htmlFor="camera-fixed" className="text-slate-300">Fixed Camera</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Kontext Settings */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Kontext Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Model</Label>
                    <Select
                      value={settings.kontext.model}
                      onValueChange={(value: "dev" | "max") =>
                        setSettings(prev => ({
                          ...prev,
                          kontext: { ...prev.kontext, model: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev">Dev (Fast & Affordable)</SelectItem>
                        <SelectItem value="max">Max (Premium Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Model Comparison</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Dev Model:</span>
                        <span className="text-green-400">~30s, $0.003/image</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Max Model:</span>
                        <span className="text-blue-400">~60s, $0.055/image</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gen4 Settings */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Gen4 Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Model</Label>
                    <Select
                      value={settings.gen4?.model || 'gen4-image'}
                      onValueChange={(value: string) =>
                        setSettings(prev => ({
                          ...prev,
                          gen4: { ...prev.gen4, model: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GEN4_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-detect-ratio"
                      checked={settings.gen4?.autoDetectAspectRatio ?? true}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          gen4: { ...prev.gen4, autoDetectAspectRatio: checked },
                        }))
                      }
                    />
                    <Label htmlFor="auto-detect-ratio" className="text-slate-300">
                      Auto-detect aspect ratio from reference images
                    </Label>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Model Comparison</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Gen4 Image:</span>
                        <span className="text-blue-400">High quality, ~30s</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Gen4 Turbo:</span>
                        <span className="text-green-400">Faster, ~10s</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Settings */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-save"
                      checked={settings.general.autoSave}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, autoSave: checked },
                        }))
                      }
                    />
                    <Label htmlFor="auto-save" className="text-slate-300">Auto-save to IndexedDB</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-costs"
                      checked={settings.general.showCostEstimates}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({
                          ...prev,
                          general: {
                            ...prev.general,
                            showCostEstimates: checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="show-costs" className="text-slate-300">Show cost estimates</Label>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Max Concurrent Jobs: {settings.general.maxConcurrentJobs}
                    </Label>
                    <Slider
                      value={[settings.general.maxConcurrentJobs]}
                      onValueChange={([value]: [number]) =>
                        setSettings(prev => ({
                          ...prev,
                          general: {
                            ...prev.general,
                            maxConcurrentJobs: value,
                          },
                        }))
                      }
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost Estimation */}
              {settings.general.showCostEstimates && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Cost Estimation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-300">
                          Seedance Videos
                        </p>
                        <p className="text-lg font-bold text-blue-100">
                          ${(images.filter(img => img.selected && img.mode === 'seedance').length * 0.12).toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-400">
                          {images.filter(img => img.selected && img.mode === 'seedance').length} selected × $0.12
                        </p>
                      </div>
                      <div className="p-3 bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-green-300">
                          Kontext Edits
                        </p>
                        <p className="text-lg font-bold text-green-100">
                          $
                          {(
                            images.filter(img => img.selected && img.mode === 'kontext').length *
                            (settings.kontext.model === "dev" ? 0.003 : 0.055)
                          ).toFixed(3)}
                        </p>
                        <p className="text-xs text-green-400">
                          {images.filter(img => img.selected && img.mode === 'kontext').length} selected × $
                          {settings.kontext.model === "dev" ? "0.003" : "0.055"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleCategorySave}
        initialTags={['gen4', 'generated']}
        imageUrl={pendingGeneration?.imageUrl}
      />
      
      {/* Fullscreen Image Modal */}
      <FullscreenImageModal
        image={fullscreenImage}
        open={!!fullscreenImage}
        onOpenChange={(open) => {
          if (!open) setFullscreenImage(null)
        }}
        onDelete={async (id) => {
          try {
            await referenceLibraryDB.deleteReference(id)
            loadLibraryItems()
            setFullscreenImage(null)
            toast({
              title: "Deleted",
              description: "Reference removed from library"
            })
          } catch (error) {
            toast({
              title: "Delete Failed",
              description: "Could not remove reference",
              variant: "destructive"
            })
          }
        }}
        onTagEdit={async (id, newTag) => {
          try {
            // Update the referenceTag in the database
            const ref = await referenceLibraryDB.getReference(id)
            if (ref) {
              const updatedRef = { ...ref, referenceTag: newTag || undefined }
              await referenceLibraryDB.saveReference(updatedRef)
              loadLibraryItems()
              toast({
                title: "Tag Updated",
                description: newTag ? `Reference tag set to @${newTag}` : "Reference tag removed"
              })
            }
          } catch (error) {
            toast({
              title: "Update Failed",
              description: "Could not update reference tag",
              variant: "destructive"
            })
          }
        }}
      />
    </div>
  )
}