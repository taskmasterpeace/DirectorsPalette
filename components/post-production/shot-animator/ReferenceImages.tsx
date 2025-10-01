'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Clipboard, Image as ImageIcon, Trash2, Maximize2, Search, ChevronLeft, ChevronRight, Copy, Check, Plus, X, SortAsc, SortDesc, Download } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"
// import { useShotAnimator } from "./useShotAnimator" // Removed - now using props from parent
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { JobStatus } from "./useShotAnimator"
import { ImageData, VideoGeneration } from "./types"
import { Input } from "@/components/ui/input"
import { dbManager } from "@/lib/post-production/indexeddb"
import { VideoCarousel } from "./VideoCarousel"

interface ReferenceImagesProps {
  lastFrameImages?: string[]
  onFileUpload: () => void
  onShowGallery: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  // State and handlers from parent
  selectedImages: ImageData[]
  setSelectedImages: React.Dispatch<React.SetStateAction<ImageData[]>>
  generatedVideos: VideoGeneration[]
  jobStatus: JobStatus | null
  handleRemove: (id: string) => void
  handlePasteFromClipboard: () => void
  handleFileUpload: (files: FileList | null) => void
  handleDownload: (id: string) => void
  filteredImages: ImageData[]
  setFilteredImages: (images: ImageData[]) => void
  searchQuery: string
  sortOrder: "asc" | "desc"
  sortBy: "name" | "date" | "status"
  selectAllImages: () => void
  toggleImageSelection: (id: string) => void
  setSortOrder: (order: "asc" | "desc") => void
  setSortBy: (sortBy: "name" | "date" | "status") => void
  showOnlySelected: boolean
  setShowOnlySelected: (show: boolean) => void
  setSearchQuery: (query: string) => void
  mode: "seedance" | "kontext"
}

export function ReferenceImages({
  lastFrameImages = [],
  onFileUpload,
  onShowGallery,
  fileInputRef,
  // State and handlers from parent
  setSearchQuery,
  selectedImages,
  setSelectedImages,
  generatedVideos,
  jobStatus,
  handleRemove,
  handlePasteFromClipboard,
  handleFileUpload,
  filteredImages,
  selectAllImages,
  setFilteredImages,
  searchQuery,
  sortOrder,
  setSortOrder,
  handleDownload,
  toggleImageSelection,
  sortBy,
  setSortBy,
  showOnlySelected,
  setShowOnlySelected,
  mode,
}: ReferenceImagesProps) {
  const { toast } = useToast()
  const [carouselIndex, setCarouselIndex] = useState<{ [key: string]: number }>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);

  const openFullscreenImage = (src: string, mode: string) => {
    mode === "seedance" && setFullscreenImage(src);
  };

  const closeFullscreenImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFullscreenImage(null);
    setFullscreenVideo(null);
  };

  const handleRemoveReferenceImage = async (imageId: string) => {
    const currentIndex = carouselIndex[imageId] ?? 0;
    const image = selectedImages.find(img => img.id === imageId);
    if (!image) return;

    const newReferenceImages = image.referenceImages?.filter((_, idx) => idx !== currentIndex) || [];

    setSelectedImages(prev =>
      prev.map(img =>
        img.id === imageId ? { ...img, referenceImages: newReferenceImages } : img
      )
    );

    try {
      // Only try to save if we have a file
      if (image.file) {
        await dbManager.saveImage(
          image.id,
          image.file,
          image.fileUrl || '',
          image.preview || '',
          image.prompt || '',
          image.selected || false,
          image.status || 'idle',
          image.videos || [],
          image.mode || 'seedance',
          newReferenceImages,
          image.lastFramePreview || ''
        );
      } else {
        // If no file, just update the reference images in the database
        const existingImage = await dbManager.getImage(image.id);
        if (existingImage) {
          await dbManager.saveImage(
            image.id,
            existingImage.file,
            existingImage.fileUrl,
            existingImage.preview,
            existingImage.prompt,
            existingImage.selected,
            existingImage.status,
            existingImage.videos || [],
            existingImage.mode || 'seedance',
            newReferenceImages,
            existingImage.lastFramePreview || ''
          );
        }
      }

      setCarouselIndex(prev => ({
        ...prev,
        [imageId]: newReferenceImages.length > 0 ? Math.min(currentIndex, newReferenceImages.length - 1) : 0,
      }));
    } catch (error) {
      console.error('Error updating reference images in database:', error);
      toast({
        title: "Error",
        description: "Failed to update reference images",
        variant: "destructive",
      });
    }
  };

  const handleReferenceImageChange = async (e: React.ChangeEvent<HTMLInputElement>, image: ImageData) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const currentCount = image.referenceImages?.length || 0;
    const maxImages = 4;
    const availableSlots = maxImages - currentCount;

    if (files.length > availableSlots) {
      toast({
        title: "Too many images",
        description: `You can only add ${availableSlots} more image(s). Maximum ${maxImages} reference images allowed.`,
        variant: "destructive",
      });
      return;
    }

    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    );

    setSelectedImages((prev) =>
      prev.map((img) =>
        img.id === image.id
          ? { ...img, referenceImages: [...(img.referenceImages || []), ...previews] }
          : img
      )
    );

    // Save each reference image to IndexedDB
    for (let i = 0; i < previews.length; i++) {
      await dbManager.saveImage(
        image.id,
        files[i],
        '', // fileUrl empty if not uploaded to server
        image.preview || '', // original preview
        image.prompt || '',
        image.selected || false,
        image.status || 'idle',
        image.videos || [],
        image.mode || 'seedance',
        [...(image.referenceImages || []), previews[i]],
        image.lastFramePreview || ''
      );
    }
  };

  const handleLastFrameUpload = async (file: File, imageId: string) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const preview = ev.target?.result as string;

      setSelectedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, lastFramePreview: preview, lastFrameFile: file }
            : img
        )
      );

      // Save to IndexedDB
      await dbManager.saveImage(
        imageId,
        file,
        '', // fileUrl empty if not uploaded to server
        preview,
        '', // prompt
        false, // selected
        'idle', // status
        [], // videos
        'seedance',
        [], // referenceImages
        preview // lastFramePreview
      );
    };
    reader.readAsDataURL(file);
  };

  const removeLastFrame = async (imageId: string) => {
    setSelectedImages(prev =>
      prev.map(img =>
        img.id === imageId ? { ...img, lastFramePreview: null, lastFrameFile: undefined } : img
      )
    );

    const image = await dbManager.getImage(imageId);
    if (image) {
      await dbManager.saveImage(
        image.id,
        image.file!,
        image.fileUrl,
        image.preview,
        image.prompt,
        image.selected,
        image.status,
        image.videos || [],
        image.mode || 'seedance',
        image.referenceImages || [],
        ''
      );
    }
  };

  return (
    <Card className="border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-400" />
            Reference Images
            {selectedImages.length > 0 && (
              <Badge variant="secondary">{selectedImages.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowGallery}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Gallery
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileUpload()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="flex-1"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste
            </Button>
          </div>

          {/* Image Grid */}
          {selectedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Images ({selectedImages.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48"
                      />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllImages}
                    >
                      {selectedImages.every((img) => img.selected)
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="show-selected"
                        checked={showOnlySelected}
                        onCheckedChange={() => setShowOnlySelected(!showOnlySelected)}
                      />
                      <Label htmlFor="show-selected">
                        Show only selected
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div
                  className={
                    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  }
                >
                  {filteredImages
                    .reverse()
                    .filter((image) => image.mode === mode)
                    .map((image) => {
                      return (
                        <div
                          key={image.id}
                          className={`m-1 relative group border rounded-lg overflow-hidden ${image.selected ? "ring-2 ring-purple-500" : ""
                            }`}
                        >
                          <div
                            className={`relative`}
                          >
                            <img
                              src={image.preview || image.fileUrl || '/placeholder.svg'}
                              alt={image.file?.name || `Image ${image.id.substring(0, 6)}`}
                              className="w-full h-full object-contain bg-black/10"
                              onError={(e) => {
                                if (image.fileUrl && e.currentTarget.src !== image.fileUrl) {
                                  e.currentTarget.src = image.fileUrl;
                                } else {
                                  e.currentTarget.src = '/placeholder.svg';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    toggleImageSelection(image.id)
                                  }
                                >
                                  {image.selected ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemove(image.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    openFullscreenImage(
                                      image.preview || "/placeholder.svg",
                                      "seedance"
                                    )
                                  }
                                >
                                  <Search className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {(image.status && image.status !== "idle") && (
                              <div className="absolute top-2 right-2">
                                <Badge
                                  variant={
                                    image.status === "completed"
                                      ? "default"
                                      : image.status === "processing"
                                        ? "secondary"
                                        : image.status === "failed"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {image.status}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div
                            className="pt-3"
                          >
                            <div className="px-3 mb-3">
                              <p className="font-medium text-sm truncate mb-2">
                                {image?.file?.name}
                              </p>
                              <div className="relative">
                                <textarea
                                  placeholder={
                                    mode === "seedance"
                                      ? "Enter video prompt..."
                                      : "Enter edit prompt..."
                                  }
                                  value={image.prompt || ""}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setSelectedImages((prev) =>
                                      prev.map((img) =>
                                        img.id === image.id ? { ...img, prompt: newValue } : img
                                      )
                                    );
                                  }}
                                  rows={2}
                                  className="resize-none border rounded-md p-2 w-full text-sm pr-8"
                                  onFocus={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute top-0 right-0"
                                  onClick={async () => {
                                    try {
                                      const text = await navigator.clipboard.readText();
                                      if (text) {
                                        setSelectedImages((prev) =>
                                          prev.map((img) =>
                                            img.id === image.id ? { ...img, prompt: text } : img
                                          )
                                        );
                                      }
                                    } catch (err) {
                                      console.error("Clipboard read failed", err);
                                      toast({ title: "Clipboard read failed", variant: "destructive" });
                                    }
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Final frame uploader / preview */}
                              <div className="flex justify-between items-start gap-2 mt-2">
                                <div className="flex-1 flex items-center">
                                  {(!image.lastFramePreview) ? (
                                    <div className="text-xs">
                                      <label className="cursor-pointer text-purple-600 hover:underline inline-flex items-center gap-1">
                                        <ImageIcon className="w-4 h-4" />
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleLastFrameUpload(file, image.id);
                                          }}
                                        />
                                        Add final frame
                                      </label>
                                    </div>
                                  ) : (
                                    <div className="relative group">
                                      <img
                                        src={image.lastFramePreview}
                                        alt="Final frame preview"
                                        className="w-full h-auto object-contain rounded border"
                                      />
                                      {/* Final Frame Label */}
                                      <Badge variant="outline" className="absolute backdrop-blur-sm bg-black/50 top-2 left-1 pointer-events-none text-xs drop-shadow-lg">
                                        Final Frame
                                      </Badge>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
                                        onClick={() => removeLastFrame(image.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 flex items-center">
                                  {(!image.referenceImages || image.referenceImages.length === 0) ? (
                                    <label className="cursor-pointer text-purple-600 hover:underline inline-flex items-center gap-1 text-xs">
                                      <ImageIcon className="w-4 h-4" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden min-h-32 max-h-40 object-cover"
                                        onChange={(e) => handleReferenceImageChange(e, image)}
                                      />
                                      Add ref images
                                    </label>
                                  ) : (
                                    <div className="relative group">
                                      {/* slider / single preview */}
                                      <img
                                        src={image.referenceImages[carouselIndex[image.id] ?? 0]}
                                        alt="Reference"
                                        className="w-full h-auto object-contain rounded border"
                                      />
                                      {/* Reference Label */}
                                      <Badge variant="outline" className="absolute backdrop-blur-sm bg-black/50 top-2 left-1 pointer-events-none text-xs drop-shadow-lg">
                                        Ref images
                                      </Badge>
                                      <Badge variant="outline" className="absolute backdrop-blur-sm bg-black/50 bottom-2 right-1 pointer-events-none text-xs drop-shadow-lg">
                                        {image.referenceImages?.length > 1 ? `${(carouselIndex[image.id] ?? 0) + 1}/${image.referenceImages.length}` : ''}
                                      </Badge>
                                      {/* remove button */}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
                                        onClick={() => handleRemoveReferenceImage(image.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      {/* slider arrows */}
                                      {image.referenceImages?.length > 1 && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                            onClick={() =>
                                              setCarouselIndex((prev) => ({
                                                ...prev,
                                                [image.id]:
                                                  ((prev[image.id] ?? 0) - 1 + (image.referenceImages?.length ?? 0)) %
                                                  (image.referenceImages?.length ?? 1),
                                              }))
                                            }
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                            onClick={() =>
                                              setCarouselIndex((prev) => ({
                                                ...prev,
                                                [image.id]:
                                                  ((prev[image.id] ?? 0) + 1) % (image.referenceImages?.length ?? 1),
                                              }))
                                            }
                                          >
                                            <ChevronRight className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {image.error && (
                              <p className="text-red-500 text-xs mt-2">
                                {image.error}
                              </p>
                            )}

                            {/* Generated Videos Section */}
                            {(image.videos && image.videos.length > 0) || image.status === 'processing' || image.status === 'completed' ? (
                              <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="text-sm px-2 font-medium text-gray-700">Generated Videos</div>
                                  {image.videos && image.videos.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {image.videos.length}
                                    </Badge>
                                  )}
                                </div>

                                {/* Processing State */}
                                {image.status === 'processing' && (
                                  <div className="border rounded-lg p-3 bg-transparent mx-2 my-2">
                                    <div className="flex justify-center items-center gap-3">
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                      <div className="text-sm text-blue-700">
                                        Generating video...
                                        {jobStatus?.progress && (
                                          <span className="ml-2 text-blue-600">{jobStatus.progress}%</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Generated Videos Grid */}
                                {image.videos && image.videos.length > 0 && (
                                  <div className="relative">
                                    {(() => (
                                      <VideoCarousel
                                        videos={image.videos}
                                        imageId={image.id}
                                        onFullscreen={(url: string) => setFullscreenVideo(url)}
                                        onDownload={(url: string) => handleDownload(url)}
                                      />
                                    ))()}
                                  </div>
                                )}

                                {/* Failed State */}
                                {image.status === 'failed' && (
                                  <div className="border rounded-lg p-4 bg-red-50">
                                    <div className="flex items-center gap-3">
                                      <X className="h-5 w-5 text-red-600" />
                                      <div className="text-sm text-red-700">
                                        Video generation failed
                                        {image.error && (
                                          <div className="text-xs text-red-600 mt-1">{image.error}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
          {(fullscreenImage || fullscreenVideo) && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={closeFullscreenImage}
            >
              <div className="relative max-w-full max-h-full">
                {fullscreenVideo ? (
                  <video
                    src={fullscreenVideo}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    src={fullscreenImage || "/placeholder.svg"}
                    alt="Fullscreen preview"
                    className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
                    onClick={closeFullscreenImage}
                  />
                )}
                {/* Close button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-4 right-4 h-8 w-8 p-0 bg-opacity-20 hover:bg-opacity-30"
                  onClick={closeFullscreenImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}