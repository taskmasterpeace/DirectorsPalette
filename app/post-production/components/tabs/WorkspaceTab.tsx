'use client'

import { useState, useRef } from 'react'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/image-gallery'
import { Gen4ReferenceLibrary } from '@/components/post-production/Gen4ReferenceLibrary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  ImageIcon,
  Upload,
  FolderOpen,
  Plus,
  Check,
  Trash2,
  Copy,
  Search,
  Download,
  Play,
  Sparkles,
  Video,
  Clipboard,
  Target,
  X,
  ZoomIn
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { ImageData, PostProductionShot } from '@/lib/post-production/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface WorkspaceTabProps {
  images: ImageData[]
  setImages: (images: ImageData[]) => void
  libraryItems?: any[]
  libraryCategory?: string
  setLibraryCategory?: (category: string) => void
  libraryLoading?: boolean
  onFullscreenImage?: (image: any) => void
  onCategoryChange?: (itemId: string, newCategory: string) => void
}

export function WorkspaceTab({
  images,
  setImages,
  libraryItems = [],
  libraryCategory = 'all',
  setLibraryCategory = () => {},
  libraryLoading = false,
  onFullscreenImage = () => {},
  onCategoryChange = () => {}
}: WorkspaceTabProps) {
  const { toast } = useToast()
  const [finalFrameImage, setFinalFrameImage] = useState<string>('')
  const finalFrameInputRef = useRef<HTMLInputElement>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  // Handle final frame upload for specific image
  const handleImageFinalFrameUpload = (imageId: string, files: FileList | null) => {
    if (!files || !files[0]) return
    
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file)
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, finalFrame: preview, finalFrameFile: file, framesSwapped: false }
          : img
      ))
      
      toast({
        title: "Final Frame Attached",
        description: "Final frame added to image for animation"
      })
    }
  }

  // Add comparison view state
  const [comparisonMode, setComparisonMode] = useState<'overlay' | 'toggle' | 'split'>('overlay')

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
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
          mode: 'seedance',
          framesSwapped: false
        })
      }
    }
    setImages(prev => [...prev, ...newImages])
    
    if (newImages.length > 0) {
      toast({
        title: "Images Added",
        description: `Added ${newImages.length} images to workspace`
      })
    }
  }

  // Handle final frame upload
  const handleFinalFrameUpload = (files: FileList | null) => {
    if (!files) return
    
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file)
      setFinalFrameImage(preview)
      
      toast({
        title: "Final Frame Set",
        description: "Final frame image loaded for video ending"
      })
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-900/20 border-blue-600/30">
        <CardContent className="pt-4">
          <div className="text-center">
            <Video className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h2 className="text-lg font-bold text-blue-300 mb-1">🎬 Shot Animator</h2>
            <p className="text-sm text-slate-400">
              Upload images and generate videos with Seedance. For image editing, use the <strong>Image Edit</strong> tab.
              Manage shots in the <strong>Shot List</strong> tab.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Compact Frame Comparison Mode - Only when needed */}
      {images.some(img => img.finalFrame) && (
        <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded border border-slate-700">
          <span className="text-slate-300 text-xs font-medium">View Mode:</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={comparisonMode === 'overlay' ? 'default' : 'ghost'}
              onClick={() => setComparisonMode('overlay')}
              className="h-6 px-2 text-xs"
            >
              📺
            </Button>
            <Button
              size="sm"
              variant={comparisonMode === 'toggle' ? 'default' : 'ghost'}
              onClick={() => setComparisonMode('toggle')}
              className="h-6 px-2 text-xs"
            >
              🔄
            </Button>
            <Button
              size="sm"
              variant={comparisonMode === 'split' ? 'default' : 'ghost'}
              onClick={() => setComparisonMode('split')}
              className="h-6 px-2 text-xs"
            >
              ⚡
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area or Images Grid - FULL WIDTH */}
      {images.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              🎥 Shot Animator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Upload Images to Get Started
              </h3>
              <p className="text-slate-400 mb-4">
                Drag & drop images, paste from clipboard, or browse files
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Press Ctrl+V to paste images
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      handleFileUpload(files)
                    }
                    input.click()
                  }}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
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
                            break
                          }
                        }
                        if (foundImage) break
                      }
                      
                      if (!foundImage) {
                        toast({
                          title: "No Image Found",
                          description: "No image found in clipboard",
                          variant: "destructive"
                        })
                      }
                    } catch (err) {
                      toast({
                        title: "Clipboard Error",
                        description: "Could not access clipboard. Try using Ctrl+V instead.",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Clipboard className="w-4 h-4" />
                  Paste from Clipboard
                </Button>
              </div>
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
                  className="min-h-[44px]"
                >
                  {images.every(img => img.selected) ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('workspace-file-input')?.click()}
                  className="min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add More
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group border rounded-lg overflow-hidden bg-slate-800 ${
                    image.selected ? 'ring-2 ring-purple-500' : 'border-slate-700'
                  }`}
                >
                  {/* Image Preview - Smart Layout Based on Final Frame */}
                  <div className="relative aspect-video bg-slate-900">
                    {image.finalFrame && comparisonMode === 'split' ? (
                      // Split view - Side by side frames
                      <div className="flex h-full">
                        <div className="relative w-1/2 border-r border-slate-600">
                          <img
                            src={image.preview}
                            alt="Start frame"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-blue-600 px-1 py-0.5 rounded text-xs font-bold text-white">
                            START
                          </div>
                        </div>
                        <div className="relative w-1/2">
                          <img
                            src={image.finalFrame}
                            alt="Final frame"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-amber-500 px-1 py-0.5 rounded text-xs font-bold text-white">
                            END
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Standard view - Toggle or overlay mode
                      <>
                        <div className="relative group w-full h-full">
                          <img
                            src={image.framesSwapped && image.finalFrame ? image.finalFrame : image.preview}
                            alt={image.framesSwapped ? "Final frame (swapped to main)" : "Start frame"}
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                          
                          {/* Magnifying glass hover overlay */}
                          <div 
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                            onClick={() => setFullscreenImage(image.framesSwapped && image.finalFrame ? image.finalFrame : image.preview)}
                          >
                            <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        
                        {/* Frame indicator */}
                        {image.finalFrame && comparisonMode === 'toggle' && (
                          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold">
                            <span className={image.framesSwapped ? "text-amber-400" : "text-blue-400"}>
                              {image.framesSwapped ? "END FRAME" : "START FRAME"}
                            </span>
                          </div>
                        )}
                        
                        {/* Smart Frame Overlay - Shows opposite frame */}
                        {image.finalFrame && comparisonMode === 'overlay' && (
                          <div className="absolute bottom-2 right-2 w-1/3 aspect-video border-2 border-white/90 rounded overflow-hidden shadow-xl bg-slate-900">
                            <img
                              src={image.framesSwapped ? image.preview : image.finalFrame}
                              alt={image.framesSwapped ? "Start frame preview" : "Final frame preview"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-1">
                              <span className={image.framesSwapped ? "text-blue-400" : "text-amber-400"}>
                                {image.framesSwapped ? "START" : "END"}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
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
                            a.download = `${image.id}.mp4`
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
                  <div className="p-3 space-y-1">
                    <div className="relative">
                      <Textarea
                        placeholder="Enter video prompt..."
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
                              title: "Prompt Pasted",
                              description: "Clipboard content added to prompt"
                            })
                          } catch (err) {
                            toast({
                              title: "Clipboard Error",
                              description: "Could not read clipboard",
                              variant: "destructive"
                            })
                          }
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Compact Final Frame Controls */}
                    <div className="flex items-center gap-1 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            handleImageFinalFrameUpload(image.id, files)
                          }
                          input.click()
                        }}
                        className="text-xs h-7 px-2"
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {image.finalFrame ? 'Change End' : 'Add End'}
                      </Button>
                      
                      {image.finalFrame && (
                        <>
                          <Button
                            size="sm"
                            variant={image.framesSwapped ? "default" : "ghost"}
                            onClick={() => {
                              setImages(prev => prev.map(img => 
                                img.id === image.id 
                                  ? { ...img, framesSwapped: !img.framesSwapped }
                                  : img
                              ))
                            }}
                            className="h-7 px-2 text-xs"
                            title="Swap start and end frames"
                          >
                            🔄 {image.framesSwapped ? 'Swapped' : 'Normal'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setImages(prev => prev.map(img => 
                              img.id === image.id 
                                ? { ...img, finalFrame: undefined, finalFrameFile: undefined, framesSwapped: false }
                                : img
                            ))}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                            title="Remove final frame"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    
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
            {images.some(img => img.selected) && (
              <div className="mt-6 flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-300">
                  {images.filter(img => img.selected).length} image(s) selected for generation
                </div>
                <Button
                  onClick={async () => {
                    // Batch generation logic
                    const selectedImages = images.filter(img => img.selected)
                    selectedImages.forEach(img => {
                      setImages(prev =>
                        prev.map(i => 
                          i.id === img.id ? { ...i, status: 'processing' } : i
                        )
                      )
                    })
                    
                    toast({
                      title: "Generation Started",
                      description: `Processing ${selectedImages.length} videos`
                    })
                    
                    // Simulate batch processing
                    setTimeout(() => {
                      selectedImages.forEach(img => {
                        setImages(prev =>
                          prev.map(i => 
                            i.id === img.id ? { ...i, status: 'completed' } : i
                          )
                        )
                      })
                      
                      toast({
                        title: "Videos Generated",
                        description: `Successfully generated ${selectedImages.length} videos`
                      })
                    }, 5000)
                  }}
                  disabled={images.some(img => img.status === 'processing')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generate Videos
                </Button>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              id="workspace-file-input"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabbed Gallery - Generated Images + Reference Library */}
      <Card className="bg-slate-900/30 border-slate-700 mt-6">
        <Tabs defaultValue="generated" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generated">Generated Images</TabsTrigger>
            <TabsTrigger value="library">Reference Library</TabsTrigger>
          </TabsList>
          <TabsContent value="generated">
            <UnifiedImageGallery
              currentTab="shot-animator"
              onSendToTab={(imageUrl, targetTab) => {
                // TODO: Add send functionality to other tabs
                console.log('Send to', targetTab, imageUrl)
              }}
              onUseAsReference={(imageUrl) => {
                // TODO: Use image for animation
                console.log('Use for animation:', imageUrl)
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
      </Card>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="w-full h-full object-contain"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}