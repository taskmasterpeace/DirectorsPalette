'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ZoomIn, 
  Trash2, 
  Copy, 
  Download, 
  Sparkles, 
  Film, 
  Edit, 
  X,
  ImageIcon,
  Calendar,
  Zap
} from 'lucide-react'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface UnifiedImageGalleryProps {
  currentTab: 'shot-editor' | 'shot-creator' | 'shot-animator'
  onSendToTab?: (imageUrl: string, targetTab: string) => void
  onUseAsReference?: (imageUrl: string) => void
  className?: string
}

export function UnifiedImageGallery({ 
  currentTab, 
  onSendToTab, 
  onUseAsReference,
  className 
}: UnifiedImageGalleryProps) {
  const { toast } = useToast()
  const { 
    images, 
    removeImage, 
    setFullscreenImage, 
    fullscreenImage,
    getTotalImages,
    getTotalCreditsUsed 
  } = useUnifiedGalleryStore()
  
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleCopyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      toast({
        title: "Copied to Clipboard",
        description: "Image URL copied successfully"
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy image URL",
        variant: "destructive"
      })
    }
  }

  const handleDeleteImage = (imageId: string) => {
    removeImage(imageId)
    toast({
      title: "Image Deleted",
      description: "Image removed from gallery"
    })
  }

  const handleSendToTab = (imageUrl: string, targetTab: string) => {
    if (onSendToTab) {
      onSendToTab(imageUrl, targetTab)
    }
    toast({
      title: `Sent to ${targetTab}`,
      description: "Image ready for use"
    })
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'shot-editor': return <Edit className="w-3 h-3" />
      case 'shot-creator': return <Sparkles className="w-3 h-3" />
      case 'shot-animator': return <Film className="w-3 h-3" />
      default: return <ImageIcon className="w-3 h-3" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shot-editor': return 'bg-blue-600'
      case 'shot-creator': return 'bg-purple-600'
      case 'shot-animator': return 'bg-orange-600'
      default: return 'bg-slate-600'
    }
  }

  if (images.length === 0) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            Generated Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No images generated yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Images from Shot Editor, Shot Creator, and Shot Animator will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Generated Images ({getTotalImages()})
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3 h-3" />
                {getTotalCreditsUsed()} credits used
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedImages([])}
                className="h-6 text-xs"
              >
                Clear Selection
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.prompt.slice(0, 50)}
                      className="w-full h-24 object-cover rounded border border-slate-600 bg-slate-800"
                    />
                    
                    {/* Source badge */}
                    <div className="absolute top-1 left-1">
                      <Badge className={cn("text-white text-xs px-1.5 py-0.5", getSourceColor(image.source))}>
                        {getSourceIcon(image.source)}
                        <span className="ml-1 capitalize">{image.source.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                    
                    {/* Hover overlay with magnifying glass */}
                    <div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                      onClick={() => setFullscreenImage(image)}
                    >
                      <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1">
                    <div className="flex gap-1">
                      {currentTab !== 'shot-creator' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-creator')}
                          className="h-5 w-5 p-0 bg-purple-600 hover:bg-purple-700 text-white"
                          title="Send to Shot Creator"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                        </Button>
                      )}
                      
                      {currentTab !== 'shot-editor' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-editor')}
                          className="h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                          title="Send to Shot Editor"
                        >
                          <Edit className="w-2.5 h-2.5" />
                        </Button>
                      )}
                      
                      {currentTab !== 'shot-animator' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-animator')}
                          className="h-5 w-5 p-0 bg-orange-600 hover:bg-orange-700 text-white"
                          title="Send to Shot Animator"
                        >
                          <Film className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleCopyImageUrl(image.url)}
                        className="h-5 w-5 p-0 bg-slate-600 hover:bg-slate-700 text-white"
                        title="Copy URL"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="h-5 w-5 p-0 bg-red-600 hover:bg-red-700 text-white"
                        title="Delete"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Prompt tooltip on hover */}
                  <div className="absolute bottom-full left-0 right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                      <p className="font-medium mb-1">Prompt:</p>
                      <p className="text-slate-300">{image.prompt.slice(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(image.metadata.createdAt).toLocaleDateString()}</span>
                        <Zap className="w-3 h-3" />
                        <span>{image.metadata.creditsUsed} credits</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Bulk actions */}
          {selectedImages.length > 0 && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-slate-700/50 rounded">
              <span className="text-sm text-white">{selectedImages.length} selected</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  selectedImages.forEach(handleDeleteImage)
                  setSelectedImages([])
                }}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.prompt}
              className="w-full h-full object-contain"
            />
            
            {/* Fullscreen controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-white", getSourceColor(fullscreenImage.source))}>
                  {getSourceIcon(fullscreenImage.source)}
                  <span className="ml-1 capitalize">{fullscreenImage.source.replace('-', ' ')}</span>
                </Badge>
                <Badge className="bg-amber-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {fullscreenImage.metadata.creditsUsed} credits
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyImageUrl(fullscreenImage.url)
                  }}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(fullscreenImage.id)
                    setFullscreenImage(null)
                  }}
                  variant="destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => setFullscreenImage(null)}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Image info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/80 p-4 rounded-lg">
                <p className="text-white text-sm mb-2">
                  <span className="font-medium">Prompt:</span> {fullscreenImage.prompt}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span>Model: {fullscreenImage.model}</span>
                  <span>Resolution: {fullscreenImage.settings.resolution}</span>
                  <span>Aspect: {fullscreenImage.settings.aspectRatio}</span>
                  <span>Created: {new Date(fullscreenImage.metadata.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}