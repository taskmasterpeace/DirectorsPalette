'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useImageReferenceStore, type SavedImageReference, type ImageReferenceCategory } from '@/stores/image-reference-store'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { supabase } from '@/lib/supabase'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  Hash,
  Images,
  Upload,
  X,
  Check,
  Download,
  Send,
  Eye,
  Copy
} from 'lucide-react'

interface ImageReferenceLibraryProps {
  onSelectImage?: (imageUrl: string) => void
  onSendToShotCreator?: (imageUrl: string) => void
  showQuickAccess?: boolean
  showUpload?: boolean
  className?: string
}

export function ImageReferenceLibrary({
  onSelectImage,
  onSendToShotCreator,
  showQuickAccess = true,
  showUpload = true,
  className
}: ImageReferenceLibraryProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAddImageOpen, setIsAddImageOpen] = useState(false)
  const [isEditImageOpen, setIsEditImageOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<SavedImageReference | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<SavedImageReference | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [newImage, setNewImage] = useState({
    name: '',
    categoryId: 'custom',
    tags: '',
    isQuickAccess: false,
    reference: ''
  })

  const {
    images,
    categories,
    quickImages,
    searchQuery,
    selectedCategory,
    selectedImage,
    isLoading,
    error,
    uploadProgress,
    addImage,
    updateImage,
    deleteImage,
    toggleQuickAccess,
    uploadImage,
    addCategory,
    updateCategory,
    deleteCategory,
    setSearchQuery,
    setSelectedCategory,
    loadUserImages,
    getFilteredImages,
    getImagesByCategory
  } = useImageReferenceStore()

  const { addImage: addToGallery } = useUnifiedGalleryStore()

  // Load user images on mount
  useEffect(() => {
    const loadImages = async () => {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await loadUserImages(user.id)
        }
      }
    }
    loadImages()
  }, [loadUserImages])

  const filteredImages = useMemo(() => getFilteredImages(), [searchQuery, selectedCategory, images, getFilteredImages])

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    // Auto-populate name from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    setNewImage(prev => ({
      ...prev,
      name: prev.name || nameWithoutExt
    }))

    setIsAddImageOpen(true)
  }

  const handleUpload = async () => {
    const files = fileInputRef.current?.files
    if (!files?.length || !newImage.name) {
      toast({
        title: 'Error',
        description: 'Please select a file and provide a name',
        variant: 'destructive'
      })
      return
    }

    await uploadImage(files[0], {
      name: newImage.name,
      categoryId: newImage.categoryId,
      tags: newImage.tags.split(',').map(t => t.trim()).filter(t => t),
      isQuickAccess: newImage.isQuickAccess,
      reference: newImage.reference || `@${newImage.name.toLowerCase().replace(/\s+/g, '_')}`
    })

    toast({
      title: 'Success',
      description: 'Image uploaded to reference library'
    })

    setIsAddImageOpen(false)
    setNewImage({
      name: '',
      categoryId: 'custom',
      tags: '',
      isQuickAccess: false,
      reference: ''
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpdateImage = async () => {
    if (!editingImage) return

    await updateImage(editingImage.id, editingImage)

    toast({
      title: 'Success',
      description: 'Image reference updated successfully'
    })

    setIsEditImageOpen(false)
    setEditingImage(null)
  }

  const handleDeleteImage = async (imageId: string) => {
    await deleteImage(imageId)

    toast({
      title: 'Success',
      description: 'Image reference removed from library'
    })
  }

  const handleSendToShotCreator = (image: SavedImageReference) => {
    // If onSelectImage is provided (from dialog mode), use that instead
    if (onSelectImage) {
      onSelectImage(image.url)
      toast({
        title: "Image Selected",
        description: `${image.name} added to reference slots`
      })
      return
    }

    if (onSendToShotCreator) {
      onSendToShotCreator(image.url)
    }

    // Also add to unified gallery for reference
    addToGallery({
      url: image.url,
      prompt: `Reference image: ${image.name}`,
      source: 'shot-creator',
      model: 'reference',
      reference: image.reference,
      settings: {
        aspectRatio: '1:1',
        resolution: 'reference'
      },
      tags: ['reference', ...image.tags],
      creditsUsed: 0,
      isPermanent: true
    })

    toast({
      title: 'Sent to Shot Creator',
      description: `"${image.name}" has been sent to Shot Creator and added to gallery`
    })
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copied',
      description: 'Image URL copied to clipboard'
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const renderImageCard = (image: SavedImageReference) => (
    <Card key={image.id} className="bg-slate-900/50 border-purple-500/30 hover:border-purple-500/60 transition-all">
      <CardContent className="p-3">
        {/* Image Thumbnail */}
        <div className="relative mb-3 group">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-32 object-cover rounded-md cursor-pointer"
            onClick={() => setFullscreenImage(image)}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Image Info */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white mb-1 truncate">{image.name}</h4>
            {image.reference && (
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 mb-2">
                {image.reference}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleQuickAccess(image.id)}
              className="h-7 w-7 p-0"
            >
              {image.isQuickAccess ? (
                <Star className="w-3 h-3 text-yellow-500" />
              ) : (
                <StarOff className="w-3 h-3 text-gray-400" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingImage(image)
                setIsEditImageOpen(true)
              }}
              className="h-7 w-7 p-0"
            >
              <Edit className="w-3 h-3 text-gray-400" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteImage(image.id)}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {image.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                <Hash className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {image.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-600/30 text-gray-400">
                +{image.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleSendToShotCreator(image)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            <Send className="w-3 h-3 mr-1" />
            Send
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopyUrl(image.url)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20 text-xs"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        {/* Metadata */}
        <div className="mt-2 text-xs text-gray-500">
          {image.metadata.dimensions && (
            <span>{image.metadata.dimensions.width}×{image.metadata.dimensions.height}</span>
          )}
          {image.metadata.fileSize && (
            <span className="ml-2">{(image.metadata.fileSize / 1024 / 1024).toFixed(1)}MB</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Card className="bg-slate-900/90 border-purple-500/30 flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-purple-400" />
              Image Reference Library
            </div>
            {showUpload && !onSelectImage && (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Upload Progress */}
          {uploadProgress !== null && !onSelectImage && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Uploading image...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search images by name, tags, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-purple-500/30 text-white placeholder-gray-400"
            />
          </div>

          {/* Drag & Drop Zone - Only show when not in selection mode */}
          {showUpload && !onSelectImage && (
            <div
              className={`relative mb-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-purple-500/30 bg-slate-800/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Drag & drop images here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  browse files
                </button>
              </p>
            </div>
          )}

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="bg-slate-800 border-purple-500/30">
              <TabsTrigger value="all">All Images</TabsTrigger>
              {showQuickAccess && <TabsTrigger value="quick">Quick Access</TabsTrigger>}
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-4">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-2 gap-3">
                  {filteredImages.map(renderImageCard)}
                </div>
                {filteredImages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images found. Upload your first reference image!</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {showQuickAccess && (
              <TabsContent value="quick" className="flex-1 mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-2 gap-3">
                    {quickImages.map(renderImageCard)}
                  </div>
                  {quickImages.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No quick access images yet. Star your favorites!</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            )}

            <TabsContent value="categories" className="flex-1 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => {
                  const imageCount = getImagesByCategory(category.id).length
                  return (
                    <Card
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                      className={`bg-slate-900/50 border-purple-500/30 cursor-pointer transition-all ${
                        selectedCategory === category.id ? 'border-purple-500 bg-purple-900/20' : 'hover:border-purple-500/60'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <h4 className="font-medium text-white">{category.name}</h4>
                              <p className="text-sm text-gray-400">{imageCount} images</p>
                            </div>
                          </div>
                          {selectedCategory === category.id && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Upload Image Dialog */}
      <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
        <DialogContent className="bg-slate-900 border-purple-500/30 text-white" aria-describedby="upload-image-description">
          <DialogHeader>
            <DialogTitle>Upload Reference Image</DialogTitle>
            <DialogDescription id="upload-image-description" className="text-gray-400">
              Add a new image to your reference library
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newImage.name}
                onChange={(e) => setNewImage({ ...newImage, name: e.target.value })}
                className="bg-slate-800 border-purple-500/30"
                placeholder="e.g., Hero Portrait, Forest Location"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference">Reference Tag (optional)</Label>
              <Input
                id="reference"
                value={newImage.reference}
                onChange={(e) => setNewImage({ ...newImage, reference: e.target.value })}
                className="bg-slate-800 border-purple-500/30"
                placeholder="e.g., @hero, @forest_bg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newImage.categoryId}
                onValueChange={(value) => setNewImage({ ...newImage, categoryId: value })}
              >
                <SelectTrigger className="bg-slate-800 border-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-purple-600/30">
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newImage.tags}
                onChange={(e) => setNewImage({ ...newImage, tags: e.target.value })}
                placeholder="e.g., character, male, fantasy, sword"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quickAccess"
                checked={newImage.isQuickAccess}
                onChange={(e) => setNewImage({ ...newImage, isQuickAccess: e.target.checked })}
                className="rounded border-purple-500/30"
              />
              <Label htmlFor="quickAccess">Add to Quick Access</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddImageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageOpen} onOpenChange={setIsEditImageOpen}>
        <DialogContent className="bg-slate-900 border-purple-500/30 text-white" aria-describedby="edit-image-description">
          <DialogHeader>
            <DialogTitle>Edit Reference Image</DialogTitle>
            <DialogDescription id="edit-image-description" className="text-gray-400">
              Update image reference details
            </DialogDescription>
          </DialogHeader>

          {editingImage && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingImage.name}
                  onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
                  className="bg-slate-800 border-purple-500/30"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-reference">Reference Tag</Label>
                <Input
                  id="edit-reference"
                  value={editingImage.reference || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, reference: e.target.value })}
                  className="bg-slate-800 border-purple-500/30"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingImage.categoryId}
                  onValueChange={(value) => setEditingImage({ ...editingImage, categoryId: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-purple-600/30">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={editingImage.tags.join(', ')}
                  onChange={(e) => setEditingImage({
                    ...editingImage,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  className="bg-slate-800 border-purple-500/30"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditImageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateImage} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-4xl" aria-describedby="fullscreen-image-description">
          <DialogHeader>
            <DialogTitle>{fullscreenImage?.name || 'Image Preview'}</DialogTitle>
            <DialogDescription id="fullscreen-image-description" className="text-purple-300">
              {fullscreenImage?.reference || 'View and manage your reference image'}
            </DialogDescription>
          </DialogHeader>

          {fullscreenImage && (
            <div className="space-y-4">
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.name}
                className="w-full max-h-96 object-contain rounded-md"
              />

              {fullscreenImage.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fullscreenImage.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-purple-900/30 text-purple-300">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSendToShotCreator(fullscreenImage)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Shot Creator
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyUrl(fullscreenImage.url)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}