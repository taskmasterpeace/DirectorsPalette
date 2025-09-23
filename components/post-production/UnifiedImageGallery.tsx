'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
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
  Layout,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Save,
  Check,
  Zap
} from 'lucide-react'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UnifiedImageGalleryProps {
  currentTab: 'shot-editor' | 'shot-creator' | 'shot-animator'
  onSendToTab?: (imageUrl: string, targetTab: string) => void
  onUseAsReference?: (imageUrl: string) => void
  onSendToLibrary?: (imageUrl: string) => void
  className?: string
}

export function UnifiedImageGallery({ 
  currentTab, 
  onSendToTab, 
  onUseAsReference,
  onSendToLibrary,
  className 
}: UnifiedImageGalleryProps) {
  const { toast } = useToast()
  const {
    images,
    removeImage,
    setFullscreenImage,
    fullscreenImage,
    getTotalImages,
    getTotalCreditsUsed,
    updateImageReference,
    getImageByReference,
    getAllReferences
  } = useUnifiedGalleryStore()
  
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingReference, setEditingReference] = useState<string | null>(null)
  const [referenceInput, setReferenceInput] = useState('')
  const [showReferenceDialog, setShowReferenceDialog] = useState(false)
  const [selectedImageForReference, setSelectedImageForReference] = useState<string | null>(null)
  const IMAGES_PER_PAGE = 8
  
  // Filter and pagination logic
  const { filteredImages, paginatedImages, totalPages } = useMemo(() => {
    // Grid view logic
    const filtered = searchQuery.trim() === ''
      ? images
      : images.filter(image => {
          const query = searchQuery.toLowerCase()
          // Check if searching by reference
          if (query.startsWith('@')) {
            return image.reference?.toLowerCase().includes(query)
          }
          // Regular search
          return image.prompt.toLowerCase().includes(query) ||
                 image.model?.toLowerCase().includes(query) ||
                 image.source.toLowerCase().includes(query) ||
                 image.reference?.toLowerCase().includes(query)
        })

    // Pagination
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE
    const endIndex = startIndex + IMAGES_PER_PAGE

    return {
      filteredImages: filtered,
      paginatedImages: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / IMAGES_PER_PAGE)
    }
  }, [images, currentPage, searchQuery])

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

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast({
        title: "Prompt Copied",
        description: "Image prompt copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy prompt",
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

  const handleUpdateReference = (imageId: string, reference: string) => {
    updateImageReference(imageId, reference)
    toast({
      title: "Reference Updated",
      description: `Reference set to ${reference}`
    })
    setEditingReference(null)
    setReferenceInput('')
    setShowReferenceDialog(false)
    setSelectedImageForReference(null)
  }

  const handleOpenReferenceDialog = (imageId: string, currentReference?: string) => {
    setSelectedImageForReference(imageId)
    setReferenceInput(currentReference?.replace('@', '') || '')
    setShowReferenceDialog(true)
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

  // Keyboard navigation for fullscreen modal
  const navigateToImage = useCallback((direction: 'next' | 'previous') => {
    if (!fullscreenImage || images.length <= 1) return
    
    const currentIndex = images.findIndex(img => img.id === fullscreenImage.id)
    if (currentIndex === -1) return
    
    let newIndex: number
    if (direction === 'next') {
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    }
    
    setFullscreenImage(images[newIndex])
  }, [fullscreenImage, images, setFullscreenImage])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!fullscreenImage) return
      
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          navigateToImage('next')
          break
        case 'ArrowLeft':
          event.preventDefault()
          navigateToImage('previous')
          break
        case 'Escape':
          event.preventDefault()
          setFullscreenImage(null)
          break
      }
    }

    if (fullscreenImage) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullscreenImage, navigateToImage, setFullscreenImage])

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

  const getModelIcon = (model?: string) => {
    switch (model) {
      case 'nano-banana': return '🍌'
      case 'seedream-4': return '🌱'
      case 'gen4-image': return '⚡'
      case 'gen4-image-turbo': return '💨'
      case 'qwen-image': return '🎨'
      case 'qwen-image-edit': return '✏️'
      default: return '🍌'
    }
  }

  const getModelColor = (model?: string) => {
    switch (model) {
      case 'nano-banana': return 'bg-yellow-600'
      case 'seedream-4': return 'bg-green-600'
      case 'gen4-image': return 'bg-blue-600'
      case 'gen4-image-turbo': return 'bg-purple-600'
      case 'qwen-image': return 'bg-orange-600'
      case 'qwen-image-edit': return 'bg-indigo-600'
      default: return 'bg-yellow-600'
    }
  }

  if (images.length === 0) {
    return (
      <Card className={cn("bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <ImageIcon className="w-6 h-6 text-purple-400" />
            Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">Your Image Gallery</p>
            <p className="text-purple-200 text-sm mb-4">
              All images generated in Shot Editor, Shot Creator, and Shot Animator appear here
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-purple-300">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>Shot Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Shot Creator</span>
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-orange-400" />
                <span>Shot Animator</span>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-green-400" />
                <span>Layout & Annotation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn("bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              Gallery ({getTotalImages()})
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3 h-3" />
                {getTotalCreditsUsed() || 0} credits used
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedImages([])}
                className="h-6 text-xs border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Clear Selection
              </Button>
            </div>
          </CardTitle>
          
          {/* Compact Legend - Icons Only */}
          <div className="flex items-center justify-center gap-3 text-xs text-purple-300 bg-slate-800/30 rounded-lg px-3 py-1">
            <Edit className="w-3 h-3 text-blue-400" title="Shot Editor" />
            <Sparkles className="w-3 h-3 text-purple-400" title="Shot Creator" />
            <Film className="w-3 h-3 text-orange-400" title="Shot Animator" />
            <Layout className="w-3 h-3 text-green-400" title="Layout & Annotation" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder="Search by prompt, @reference, model, or source..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10 bg-slate-800/50 border-purple-500/30 text-white placeholder-purple-300 focus:border-purple-400"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              {searchQuery.trim() && (
                <div className="text-sm text-purple-300">
                  Found {filteredImages.length} image{filteredImages.length === 1 ? '' : 's'} matching "{searchQuery}"
                </div>
              )}
              {getAllReferences().length > 0 && (
                <div className="text-xs text-purple-400 flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  <span>References: {getAllReferences().join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-purple-400 border-purple-600 hover:bg-purple-600"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 
                      ? "bg-purple-600 text-white" 
                      : "text-purple-400 border-purple-600 hover:bg-purple-600"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-purple-400 border-purple-600 hover:bg-purple-600"
              >
                Next
              </Button>
            </div>
          )}
          
          <ScrollArea className="h-[600px]">
            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {paginatedImages.map((image) => (
                <div key={image.id} className="space-y-2">
                  {/* Media - Image or Video */}
                  <div className="relative group">
                    {image.tags?.includes('generating') ? (
                      // Placeholder for generating images
                      <div className="w-full h-32 sm:h-40 md:h-48 rounded border border-slate-600 bg-slate-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <div className="text-slate-400 text-sm">
                            {image.tags?.includes('generating') ? 'Generating...' : 'Queued'}
                          </div>
                          {image.chain && (
                            <div className="text-xs text-purple-400 mt-1">
                              Step {image.chain.stepNumber}/{image.chain.totalSteps}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : image.metadata?.isVideo || image.url.includes('.mp4') || image.tags?.includes('video') ? (
                      <video
                        src={image.url}
                        className="w-full h-auto max-h-64 sm:max-h-72 md:max-h-96 object-cover rounded border border-slate-600 bg-slate-800 cursor-zoom-in"
                        onClick={() => setFullscreenImage(image)}
                        onMouseEnter={(e) => e.currentTarget.style.cursor = 'zoom-in'}
                        controls={false}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={image.url}
                        alt={image.prompt.slice(0, 50)}
                        className="w-full h-auto max-h-64 sm:max-h-72 md:max-h-96 object-cover rounded border border-slate-600 bg-slate-800 cursor-zoom-in"
                        onClick={() => setFullscreenImage(image)}
                        onMouseEnter={(e) => e.currentTarget.style.cursor = 'zoom-in'}
                      />
                    )}
                    
                    {/* Model icon - transparent background */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <div className="text-sm drop-shadow-lg" title={image.model?.replace('-', ' ') || 'nano-banana'}>
                        {getModelIcon(image.model)}
                      </div>

                      {/* Reference badge */}
                      {image.reference && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-900/90 text-green-300 border-green-500/50 px-1 py-0.5 cursor-pointer"
                          title="Click to edit reference"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenReferenceDialog(image.id, image.reference)
                          }}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {image.reference}
                        </Badge>
                      )}

                      {/* Chain indicator */}
                      {image.chain && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-900/90 text-purple-300 border-purple-500/50 px-1 py-0.5"
                          title={`Pipeline chain - Step ${image.chain.stepNumber}/${image.chain.totalSteps}`}
                        >
                          ⚡{image.chain.stepNumber}/{image.chain.totalSteps}
                        </Badge>
                      )}

                      {/* Persistence status indicator */}
                      {image.persistence?.isPermanent ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-900/90 text-green-300 border-green-500/50 px-1 py-0.5"
                          title="Permanently stored - will never expire"
                        >
                          ✅
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-900/90 text-red-300 border-red-500/50 px-1 py-0.5"
                          title={`Temporary - may expire soon${image.persistence?.error ? `: ${image.persistence.error}` : ''}`}
                        >
                          ⏰
                        </Badge>
                      )}
                    </div>
                    
                    {/* Prompt tooltip on hover */}
                    <div className="absolute bottom-full left-0 right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                        <p className="font-medium mb-1">Prompt:</p>
                        <p className="text-slate-300 break-words">{image.prompt.slice(0, 100)}...</p>
                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(image.metadata.createdAt).toLocaleDateString()}</span>
                          <Zap className="w-3 h-3" />
                          <span>{image.metadata.creditsUsed} credits</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons - Bottom bar outside image */}
                  <div className="bg-slate-800/80 rounded-lg p-2 space-y-2">
                    {/* Send-to buttons row */}
                    <div className="flex justify-center gap-1">
                      {currentTab !== 'shot-creator' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-creator')}
                          className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded"
                          title="Send to Shot Creator"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {currentTab !== 'shot-editor' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-editor')}
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded"
                          title="Send to Shot Editor"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {currentTab !== 'shot-animator' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToTab(image.url, 'shot-animator')}
                          className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700 text-white rounded"
                          title="Send to Shot Animator"
                        >
                          <Film className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => handleSendToTab(image.url, 'layout-annotation')}
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white rounded"
                        title="Send to Layout & Annotation"
                      >
                        <Layout className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => onSendToLibrary && onSendToLibrary(image.url)}
                        className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                        title="Save to Reference Library"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Utility buttons row */}
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleOpenReferenceDialog(image.id, image.reference)}
                        className="h-6 w-8 p-0 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        title="Set Reference"
                      >
                        <Tag className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCopyPrompt(image.prompt)}
                        className="h-6 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        title="Copy Prompt"
                      >
                        <FileText className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCopyImageUrl(image.url)}
                        className="h-6 w-8 p-0 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="h-6 w-8 p-0 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
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
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {fullscreenImage.metadata?.isVideo || fullscreenImage.url.includes('.mp4') || fullscreenImage.tags?.includes('video') ? (
              <video
                src={fullscreenImage.url}
                className="max-w-full max-h-full object-contain"
                style={{ width: 'auto', height: 'auto' }}
                controls
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.prompt}
                className="max-w-full max-h-full object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            )}

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                {/* Previous button */}
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToImage('previous')
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 border-0 text-white"
                  title="Previous image (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                {/* Next button */}
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToImage('next')
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 border-0 text-white"
                  title="Next image (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
            
            {/* Fullscreen controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-white", getSourceColor(fullscreenImage.source))}>
                  {getSourceIcon(fullscreenImage.source)}
                  <span className="ml-1 capitalize">{fullscreenImage.source.replace('-', ' ')}</span>
                </Badge>
                {fullscreenImage.reference && (
                  <Badge className="bg-green-600 text-white">
                    <Tag className="w-3 h-3 mr-1" />
                    {fullscreenImage.reference}
                  </Badge>
                )}
                <Badge className="bg-amber-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {fullscreenImage.metadata.creditsUsed} credits
                </Badge>
                {/* Position indicator */}
                {images.length > 1 && (
                  <Badge className="bg-slate-700 text-white">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {(() => {
                      const currentIndex = images.findIndex(img => img.id === fullscreenImage.id)
                      return `${currentIndex + 1} of ${images.length}`
                    })()}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {/* Send to buttons */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendToTab(fullscreenImage.url, 'shot-creator')
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  title="Send to Shot Creator"
                >
                  <Sparkles className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendToTab(fullscreenImage.url, 'shot-editor')
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Send to Shot Editor"
                >
                  <Edit className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendToTab(fullscreenImage.url, 'shot-animator')
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                  title="Send to Shot Animator"
                >
                  <Film className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendToTab(fullscreenImage.url, 'layout-annotation')
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  title="Send to Layout & Annotation"
                >
                  <Layout className="w-3 h-3" />
                </Button>

                {/* Reference button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenReferenceDialog(fullscreenImage.id, fullscreenImage.reference)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  title="Set Reference"
                >
                  <Tag className="w-3 h-3" />
                </Button>

                {/* Add to Library button */}
                {onSendToLibrary && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSendToLibrary(fullscreenImage.url)
                      toast({
                        title: "Added to Library",
                        description: "Image saved to reference library"
                      })
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    title="Add to Library"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                )}

                {/* Download button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement('a')
                    link.href = fullscreenImage.url
                    link.download = `generated-${fullscreenImage.id}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    toast({
                      title: "Download Started",
                      description: "Image download initiated"
                    })
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                  title="Download Image"
                >
                  <Download className="w-3 h-3" />
                </Button>

                {/* Copy buttons */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyImageUrl(fullscreenImage.url)
                  }}
                  className="bg-slate-600 hover:bg-slate-700"
                  title="Copy Image URL"
                >
                  <Copy className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyPrompt(fullscreenImage.prompt)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Copy Prompt"
                >
                  <FileText className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(fullscreenImage.id)
                    setFullscreenImage(null)
                  }}
                  variant="destructive"
                  title="Delete Image"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={() => setFullscreenImage(null)}
                  className="bg-slate-600 hover:bg-slate-700"
                  title="Close"
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
                {fullscreenImage.reference && (
                  <p className="text-green-400 text-sm mb-2">
                    <span className="font-medium">Reference:</span> {fullscreenImage.reference}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span>Model: {fullscreenImage.model || 'N/A'}</span>
                  <span>Resolution: {fullscreenImage.settings?.resolution || 'N/A'}</span>
                  <span>Aspect: {fullscreenImage.settings?.aspectRatio || 'N/A'}</span>
                  <span>Created: {fullscreenImage.metadata?.createdAt ? new Date(fullscreenImage.metadata.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {/* Navigation hint - only show if multiple images */}
                {images.length > 1 && (
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    Use ← → arrow keys or click arrows to navigate • Press ESC to close
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Dialog */}
      <Dialog open={showReferenceDialog} onOpenChange={setShowReferenceDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-purple-600">
          <DialogHeader>
            <DialogTitle className="text-white">Set Image Reference</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a reference tag to easily identify and use this image. References start with @.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="reference" className="text-right text-white">
                Reference
              </label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">@</span>
                <Input
                  id="reference"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value.replace(/^@/, '').replace(/\s/g, '_'))}
                  placeholder="e.g., hero, villain, background"
                  className="pl-8 bg-slate-800 border-purple-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && selectedImageForReference && referenceInput) {
                      handleUpdateReference(selectedImageForReference, referenceInput)
                    }
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Example references:
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-600"
                  onClick={() => setReferenceInput('hero')}
                >
                  @hero
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-600"
                  onClick={() => setReferenceInput('villain')}
                >
                  @villain
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-600"
                  onClick={() => setReferenceInput('background')}
                >
                  @background
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-600"
                  onClick={() => setReferenceInput('vehicle')}
                >
                  @vehicle
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReferenceDialog(false)
                setReferenceInput('')
                setSelectedImageForReference(null)
              }}
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedImageForReference && referenceInput) {
                  handleUpdateReference(selectedImageForReference, referenceInput)
                }
              }}
              disabled={!referenceInput}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Reference
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}