'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Edit,
  X,
  Expand
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Gen4ReferenceImage } from '@/lib/post-production/enhanced-types'
import { getImageDimensions } from '@/lib/post-production/helpers'
import InlineTagEditor from '@/app/post-production/components/InlineTagEditor'

interface Gen4ReferenceManagerProps {
  gen4ReferenceImages: Gen4ReferenceImage[]
  setGen4ReferenceImages: (images: Gen4ReferenceImage[]) => void
  compact?: boolean
  maxImages?: number
  editingMode?: boolean
}

export function Gen4ReferenceManager({
  gen4ReferenceImages,
  setGen4ReferenceImages,
  compact = false,
  maxImages = 3,
  editingMode = false
}: Gen4ReferenceManagerProps) {
  const { toast } = useToast()
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<Gen4ReferenceImage | null>(null)

  // Progressive disclosure: Start with 3, expand to 6, then 9, then max
  const getVisibleSlots = () => {
    const filledSlots = gen4ReferenceImages.length
    if (filledSlots >= 9 && maxImages > 9) return maxImages // Show all when 9+ filled
    if (filledSlots >= 6) return Math.min(9, maxImages) // Show 9 when 6+ filled  
    if (filledSlots >= 3) return Math.min(6, maxImages) // Show 6 when 3+ filled
    return Math.min(3, maxImages) // Always start with 3
  }
  
  const visibleSlots = getVisibleSlots()

  // Handle file upload for reference images
  const handleGen4ImageUpload = async (file: File) => {
    try {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        if (!e.target?.result) return
        
        const imageUrl = e.target.result as string
        const dimensions = await getImageDimensions(file)
        
        const newImage: Gen4ReferenceImage = {
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: imageUrl,
          tags: [],
          detectedAspectRatio: dimensions.aspectRatio
        }
        
        setGen4ReferenceImages([...gen4ReferenceImages, newImage])
        
        toast({
          title: "Reference Image Added",
          description: `Added ${file.name} (${dimensions.aspectRatio})`
        })
        
        // Auto-update Gen4 settings aspect ratio if first image
        if (gen4ReferenceImages.length === 0) {
          // This would need to be passed as a prop or context if needed
        }
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading reference image:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload reference image",
        variant: "destructive"
      })
    }
  }

  // Handle paste from clipboard
  const handlePasteImage = async (event?: React.MouseEvent) => {
    // Prevent event bubbling if called from button click
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    try {
      // Try to read images first
      try {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
          const imageType = item.types.find(type => type.startsWith('image/'))
          if (imageType) {
            const blob = await item.getType(imageType)
            const file = new File([blob], `pasted-image.${imageType.split('/')[1]}`, { type: imageType })
            await handleGen4ImageUpload(file)
            return
          }
        }
      } catch (readError) {
        // Could not read clipboard items, trying text fallback
      }

      // Try text clipboard for image URL
      const text = await navigator.clipboard.readText()
      if (text && (text.startsWith('http') || text.startsWith('data:image'))) {
        // Handle URL or data URL
        const newImage: Gen4ReferenceImage = {
          id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: text,
          preview: text,
          tags: [],
          detectedAspectRatio: '16:9', // Default, will be updated when loaded
          file: undefined // Explicitly set file as undefined for URL-based images
        }
        setGen4ReferenceImages([...gen4ReferenceImages, newImage])
        toast({
          title: "Image Pasted",
          description: "Image URL pasted from clipboard"
        })
      } else {
        toast({
          title: "No Image Found",
          description: "No image found in clipboard",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Paste error:', error)
      toast({
        title: "Paste Failed",
        description: "Unable to paste image from clipboard. Try copying an image first.",
        variant: "destructive"
      })
    }
  }

  // Handle removing reference image
  const removeGen4Image = (imageId: string) => {
    setGen4ReferenceImages(gen4ReferenceImages.filter(img => img.id !== imageId))
    toast({
      title: "Reference Removed",
      description: "Reference image removed"
    })
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white text-sm">
            {editingMode ? 'Input Image' : 'Reference Images'} ({gen4ReferenceImages.length}/{maxImages})
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handlePasteImage(e)}
            className="h-7 px-2 border-slate-600 hover:border-slate-500"
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Paste
          </Button>
        </div>
        {/* Horizontal compact layout */}
        <div className="flex gap-2">
          {Array.from({ length: visibleSlots }, (_, index) => index).map((index) => {
            const image = gen4ReferenceImages[index]
            const isEmpty = !image
            
            return (
              <div key={index} className="flex-1">
                <div 
                  className={`relative aspect-square border border-dashed rounded-md overflow-hidden ${
                    isEmpty 
                      ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500 cursor-pointer' 
                      : 'border-purple-400 bg-purple-900/20'
                  }`}
                >
                  {image ? (
                    <>
                      <img
                        src={image.preview}
                        alt={`Ref ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-0.5 right-0.5 h-4 w-4 p-0"
                        onClick={() => removeGen4Image(image.id)}
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </>
                  ) : (
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files?.[0]) {
                            handleGen4ImageUpload(files[0])
                          }
                        }
                        input.click()
                      }}
                    >
                      <Plus className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Mobile-First Reference Image Layout */}
        <div className="space-y-8 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
          {Array.from({ length: visibleSlots }, (_, index) => index).map((index) => {
            const image = gen4ReferenceImages[index]
            const isEmpty = !image

            return (
              <div key={index} className="space-y-3">
                {/* Mobile: Full-width image area, Desktop: Constrained */}
                <div
                  className={`relative rounded-xl overflow-hidden transition-all ${
                    isEmpty
                      ? 'min-h-[240px] md:min-h-[160px] md:aspect-square bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 cursor-pointer touch-manipulation'
                      : 'border-2 border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/20'
                  }`}
                  onClick={isEmpty ? () => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files?.[0]) {
                        handleGen4ImageUpload(files[0])
                      }
                    }
                    input.click()
                  } : undefined}
                >
                  {image ? (
                    <>
                      <img
                        src={image.preview}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full object-cover md:object-contain cursor-pointer"
                        onClick={() => setFullscreenImage(image)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-2 left-2 h-8 w-8 p-0 md:h-6 md:w-6 bg-black/50 hover:bg-black/70"
                        onClick={() => setFullscreenImage(image)}
                      >
                        <Expand className="h-4 w-4 md:h-3 md:w-3 text-white" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 p-0 md:h-6 md:w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeGen4Image(image.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <Upload className="h-12 w-12 md:h-8 md:w-8 text-slate-500 mx-auto mb-3 md:mb-2" />
                        <p className="text-sm md:text-xs text-slate-400 font-medium">Tap to add Reference {index + 1}</p>
                        <p className="text-xs text-slate-500 mt-1 md:hidden">or use buttons below</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clean icon-based action buttons */}
                <div className="grid grid-cols-2 gap-4 md:flex md:flex-row md:gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16 md:h-8 md:flex-1 border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center"
                    onClick={(e) => handlePasteImage(e)}
                  >
                    <Clipboard className="h-6 w-6 md:h-4 md:w-4" />
                    <span className="ml-2 md:ml-1 text-sm md:text-xs">Paste</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16 md:h-8 md:flex-1 border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files
                        if (files?.[0]) {
                          handleGen4ImageUpload(files[0])
                        }
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-6 w-6 md:h-4 md:w-4" />
                    <span className="ml-2 md:ml-1 text-sm md:text-xs">Browse</span>
                  </Button>
                </div>
                
                {/* Tag editing */}
                {image && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Tags</Label>
                    {editingTagsId === image.id ? (
                      <InlineTagEditor
                        initialTags={image.tags}
                        onSave={(newTags) => {
                          const updatedImages = gen4ReferenceImages.map(img =>
                            img.id === image.id ? { ...img, tags: newTags } : img
                          )
                          setGen4ReferenceImages(updatedImages)
                          setEditingTagsId(null)
                        }}
                        onCancel={() => setEditingTagsId(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex-1">
                          {image.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {image.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No tags</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={() => setEditingTagsId(image.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progressive Disclosure Indicator */}
        {visibleSlots < maxImages && gen4ReferenceImages.length >= visibleSlots - 1 && (
          <div className="text-center py-3 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              <Plus className="w-4 h-4 mx-auto mb-1" />
              <span className="font-medium">
                {maxImages - visibleSlots} more slots available
              </span>
              <br />
              <span className="text-xs">
                Fill current slots to expand automatically
              </span>
            </div>
          </div>
        )}
        

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4">
              {/* Close button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 z-10"
                onClick={() => setFullscreenImage(null)}
              >
                <X className="h-6 w-6 text-white" />
              </Button>

              {/* Image */}
              <img
                src={fullscreenImage.preview}
                alt="Reference image fullscreen"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Image info overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      Reference Image
                    </p>
                    {fullscreenImage.detectedAspectRatio && (
                      <p className="text-slate-300 text-xs mt-1">
                        Aspect Ratio: {fullscreenImage.detectedAspectRatio}
                      </p>
                    )}
                    {fullscreenImage.tags && fullscreenImage.tags.length > 0 && (
                      <p className="text-slate-300 text-xs mt-1">
                        Tags: {fullscreenImage.tags.join(', ')}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeGen4Image(fullscreenImage.id)
                      setFullscreenImage(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}