'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Edit
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Gen4ReferenceImage } from '@/lib/post-production/enhanced-types'
import { getImageDimensions } from '@/lib/post-production/helpers'
import InlineTagEditor from '@/app/post-production/components/InlineTagEditor'

interface Gen4ReferenceManagerProps {
  gen4ReferenceImages: Gen4ReferenceImage[]
  setGen4ReferenceImages: (images: Gen4ReferenceImage[]) => void
  compact?: boolean
}

export function Gen4ReferenceManager({
  gen4ReferenceImages,
  setGen4ReferenceImages,
  compact = false
}: Gen4ReferenceManagerProps) {
  const { toast } = useToast()
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)

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
          <Label className="text-white text-sm">Reference Images ({gen4ReferenceImages.length}/3)</Label>
        </div>
        {/* Horizontal compact layout */}
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => {
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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Reference Images (Max 3)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reference Image Slots */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => {
            const image = gen4ReferenceImages[index]
            const isEmpty = !image
            
            return (
              <div key={index} className="space-y-2">
                <div 
                  className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
                    isEmpty 
                      ? 'min-h-[120px] aspect-square border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-750 cursor-pointer transition-colors' 
                      : 'border-purple-500 bg-purple-900/20'
                  }`}
                >
                  {image ? (
                    <>
                      <img
                        src={image.preview}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-auto object-contain"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeGen4Image(image.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Reference {index + 1}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Upload buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={async () => {
                      try {
                        const clipboardItems = await navigator.clipboard.read()
                        for (const item of clipboardItems) {
                          if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                            const blob = await item.getType('image/png')
                            const file = new File([blob], `reference-${index + 1}.png`, { type: 'image/png' })
                            handleGen4ImageUpload(file)
                            break
                          }
                        }
                      } catch (error) {
                        toast({
                          title: "Paste Failed",
                          description: "No image found in clipboard",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    <Clipboard className="h-3 w-3 mr-1" />
                    Paste
                  </Button>
                  <Button
                    size="sm"
                    variant="outline" 
                    className="flex-1 text-xs"
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
                    <Upload className="h-3 w-3 mr-1" />
                    Browse
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
        
        <p className="text-xs text-slate-400">
          Each reference slot has its own "Browse" and "Paste" buttons for targeted uploads
        </p>
      </CardContent>
    </Card>
  )
}