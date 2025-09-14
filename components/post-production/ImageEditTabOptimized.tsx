'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
  Edit,
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Download,
  Sparkles,
  Image as ImageIcon,
  Save,
  Copy,
  Wand2,
  Target,
  DollarSign,
  Clock,
  ZoomIn,
  ArrowRight,
  X,
  Film,
  Pencil,
  Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { editImageWithQwen } from '@/app/actions/image-edit'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/UnifiedImageGallery'
import { Gen4ReferenceLibrary } from '@/components/post-production/Gen4ReferenceLibrary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export interface ImageEditSession {
  id: string
  inputImage: string
  prompt: string
  outputImages: string[]
  timestamp: Date
  cost: number
  processingTime: number
}

interface ImageEditTabOptimizedProps {
  onSendToAIGenerator?: (imageUrl: string) => void
  libraryItems?: any[]
  libraryCategory?: string
  setLibraryCategory?: (category: string) => void
  libraryLoading?: boolean
  onFullscreenImage?: (image: any) => void
  onCategoryChange?: (itemId: string, newCategory: string) => void
}

export function ImageEditTabOptimized({ 
  onSendToAIGenerator,
  libraryItems = [],
  libraryCategory = 'all',
  setLibraryCategory = () => {},
  libraryLoading = false,
  onFullscreenImage = () => {},
  onCategoryChange = () => {}
}: ImageEditTabOptimizedProps) {
  const { toast } = useToast()
  const { addImage } = useUnifiedGalleryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Core state
  const [inputImage, setInputImage] = useState<string>('')
  const [editPrompt, setEditPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [editResults, setEditResults] = useState<ImageEditSession[]>([])
  const [editingPreset, setEditingPreset] = useState<string | null>(null)
  const [editPresetName, setEditPresetName] = useState('')
  const [editPresetPrompt, setEditPresetPrompt] = useState('')
  
  // Template management
  const [customTemplates, setCustomTemplates] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTemplates = localStorage.getItem('directors-palette-shot-templates')
        if (savedTemplates) {
          return JSON.parse(savedTemplates)
        }
      } catch {
        // Fall back to defaults
      }
    }
    return {
      'different-angle': 'Show this shot from a different camera angle',
      'five-seconds-later': 'Show this same scene 5 seconds later in time',
      'different-time': 'Show this shot at a different time of day',
      'brighter': 'Make this shot brighter and more vibrant',
      'darker': 'Make this shot darker and more moody',
      'remove-background': 'Remove the background from this shot',
      'golden-hour': 'Change the lighting to golden hour/sunset lighting',
      'remove-person': 'Remove any people from this shot'
    }
  })

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid Format",
        description: "Please upload a JPEG, PNG, GIF, or WebP image",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setInputImage(e.target.result as string)
        toast({
          title: "Image Loaded",
          description: `${file.name} ready for editing`
        })
      }
    }
    reader.readAsDataURL(file)
  }, [toast])

  // Handle paste from clipboard
  const handlePasteImage = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png')
          const file = new File([blob], 'pasted-image.png', { type: blob.type })
          
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              setInputImage(e.target.result as string)
              toast({
                title: "Image Pasted",
                description: "Image from clipboard ready for editing"
              })
            }
          }
          reader.readAsDataURL(file)
          return
        }
      }
      
      toast({
        title: "No Image Found",
        description: "No image found in clipboard",
        variant: "destructive"
      })
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard",
        variant: "destructive"
      })
    }
  }, [toast])

  // Apply template
  const applyTemplate = (template: string) => {
    setEditPrompt(customTemplates[template] || template)
  }

  // Process image edit
  const handleImageEdit = async () => {
    if (!inputImage || !editPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and enter edit instructions",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const replicateKey = localStorage.getItem('directors-palette-replicate-key')
      
      const result = await editImageWithQwen({
        imageData: inputImage,
        prompt: editPrompt,
        apiKey: replicateKey || undefined
      })
      
      if (result.success && result.imageUrl) {
        const session: ImageEditSession = {
          id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          inputImage,
          prompt: editPrompt,
          outputImages: [result.imageUrl],
          timestamp: new Date(),
          cost: 0.03,
          processingTime: 3000
        }
        
        setEditResults(prev => [session, ...prev])
        
        // Save to unified gallery
        session.outputImages.forEach((imageUrl) => {
          addImage({
            url: imageUrl,
            prompt: `Edit: ${editPrompt}`,
            source: 'shot-editor',
            timestamp: Date.now()
          })
        })
        
        toast({
          title: "Edit Complete",
          description: "Your image has been edited successfully!"
        })
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Image edit error:', error)
      toast({
        title: "Edit Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Check for transferred image on mount
  useEffect(() => {
    const transferredImage = localStorage.getItem('directors-palette-image-edit-input')
    if (transferredImage) {
      setInputImage(transferredImage)
      localStorage.removeItem('directors-palette-image-edit-input')
      toast({
        title: "Image Loaded",
        description: "Transferred image ready for editing"
      })
    }
  }, [toast])

  return (
    <div className="w-full space-y-4">
      {/* Compact Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-700 rounded-t-lg">
        <Edit className="w-5 h-5 text-orange-400" />
        <h2 className="text-xl font-semibold text-white">Shot Editor</h2>
      </div>

      {/* Responsive Layout with proper scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-4">
        
        {/* LEFT COLUMN - Edit Results & Generated Images */}
        <div className="space-y-6">
          
          {/* Edit Results Gallery */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50">
            <div className="p-3 border-b border-slate-700/50">
              <h3 className="text-sm font-medium text-white">Edit Results</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                {editResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm">No edits yet</p>
                    <p className="text-xs text-slate-500">Upload image and edit to see results</p>
                  </div>
                ) : (
                  editResults.map((session) => (
                    <div key={session.id} className="space-y-2">
                      <div className="text-xs text-slate-400">{session.prompt}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {session.outputImages.map((imageUrl, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Edit result ${idx + 1}`}
                              className="w-full h-20 object-cover rounded border border-slate-600 cursor-pointer hover:border-orange-400"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70"
                                onClick={() => onSendToAIGenerator?.(imageUrl)}
                              >
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Tabbed Gallery - Generated Images + Reference Library */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50">
            <Tabs defaultValue="generated" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated">Generated Images</TabsTrigger>
                <TabsTrigger value="library">Reference Library</TabsTrigger>
              </TabsList>
              <TabsContent value="generated">
                <UnifiedImageGallery
                  currentTab="shot-editor"
                  onSendToTab={(imageUrl, targetTab) => {
                    if (targetTab === 'shot-creator' && onSendToAIGenerator) {
                      onSendToAIGenerator(imageUrl)
                    }
                  }}
                  compact={true}
                />
              </TabsContent>
              <TabsContent value="library">
                <Gen4ReferenceLibrary
                  libraryItems={libraryItems}
                  libraryCategory={libraryCategory}
                  setLibraryCategory={setLibraryCategory}
                  libraryLoading={libraryLoading}
                  onFullscreenImage={onFullscreenImage}
                  onCategoryChange={onCategoryChange}
                  compact={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT COLUMN - Image Upload & Edit Controls */}
        <div className="space-y-6">
          
          {/* Image Upload */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Upload Image</h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2 text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePasteImage}
                  className="h-7 px-2 text-xs"
                >
                  <Clipboard className="w-3 h-3 mr-1" />
                  Paste
                </Button>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center h-64 flex flex-col items-center justify-center">
              {inputImage ? (
                <img 
                  src={inputImage} 
                  alt="Input preview" 
                  className="max-h-52 max-w-full object-contain rounded"
                />
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm text-slate-400">Click Upload or drag image here</p>
                  <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP</p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>

          {/* Edit Controls - Main area */}
          <div className="flex-1 min-h-0 bg-slate-900/30 rounded-lg border border-slate-700/50 p-3">
            <h3 className="text-sm font-medium text-white mb-3">Edit Instructions</h3>
            
            {/* Quick Templates - Compact */}
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {Object.entries(customTemplates).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => applyTemplate(key)}
                      className="h-7 w-full text-xs justify-start px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      {key.replace('-', ' ')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingPreset(key)
                        setEditPresetName(key.replace('-', ' '))
                        setEditPresetPrompt(value)
                      }}
                      className="absolute right-0 top-0 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe how you want to edit this image..."
                className="bg-slate-800 border-slate-600 text-white resize-none h-20"
              />
              
              {/* Edit Button */}
              <Button
                onClick={handleImageEdit}
                disabled={!inputImage || !editPrompt.trim() || isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Edit Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}