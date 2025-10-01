'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Zap, Play, Settings, Loader } from 'lucide-react'
import { VideoSettings } from './VideoSettings'
import { ReferenceImages } from './ReferenceImages'
import { UnifiedImageGallery } from '../image-gallery'
import { Gen4ReferenceLibrary } from '../Gen4ReferenceLibrary'
import { useShotAnimator } from './useShotAnimator'
import { ShotAnimatorTabProps } from './types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLoading } from "@/hooks"

export function ShotAnimatorTabRefactored({
  className = '',
  galleryMode = 'minimal',
  onImageSelect,
  referenceImages = [],
  onReferenceImagesChange,
  seed,
  onSeedChange,
  lastFrameImages
}: ShotAnimatorTabProps) {

  const {
    videoSettings,
    setVideoSettings,
    generations,
    isGenerating,
    selectedImages,
    showGallery,
    setShowGallery,
    fileInputRef,
    totalCredits,
    startGeneration,
    handleRemove,
    selectedCount,
    handleDownload,
    handleImageSelect,
    // Additional state for ReferenceImages
    setSortOrder,
    toggleImageSelection,
    jobStatus,
    handlePasteFromClipboard,
    handleFileUpload,
    filteredImages,
    setFilteredImages,
    searchQuery,
    selectAllImages,
    sortOrder,
    sortBy,
    setSortBy,
    showOnlySelected,
    setShowOnlySelected,
    setSearchQuery,
    setSelectedImages,
    mode,
  } = useShotAnimator(referenceImages, onReferenceImagesChange, seed, onSeedChange, lastFrameImages)
  
  const { onSubmit: startSeedanceGeneration, processing: seedanceProcessing } =
    useLoading(() => startGeneration("seedance", selectedImages));

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Shot Animator</h2>
          <Badge variant="outline" className="text-xs">
            AI Video Generation
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-sm hover:text-blue-300">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Settings</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Video Settings</DialogTitle>
              </DialogHeader>
              <VideoSettings
                settings={videoSettings}
                onSettingsChange={setVideoSettings}
                isProModel={videoSettings.model === 'seedance-pro'}
              />
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Estimated: {totalCredits} credits</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="library">Reference Library</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ReferenceImages
              lastFrameImages={lastFrameImages || []}
              onFileUpload={() => fileInputRef.current?.click()}
              onShowGallery={() => setShowGallery(true)}
              fileInputRef={fileInputRef}
              // State and handlers from parent
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              generatedVideos={generations}
              jobStatus={jobStatus}
              handleRemove={handleRemove}
              handlePasteFromClipboard={handlePasteFromClipboard}
              handleFileUpload={handleFileUpload}
              handleDownload={handleDownload}
              filteredImages={filteredImages}
              setFilteredImages={setFilteredImages}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              sortBy={sortBy}
              setSortOrder={setSortOrder}
              setSearchQuery={setSearchQuery}
              toggleImageSelection={toggleImageSelection}
              setSortBy={setSortBy}
              showOnlySelected={showOnlySelected}
              setShowOnlySelected={setShowOnlySelected}
              selectAllImages={selectAllImages}
              mode={mode}
            />

            {/* Generate Button */}
            <Button
              onClick={() => startSeedanceGeneration()}
              disabled={seedanceProcessing || selectedCount === 0 || isGenerating}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Generate Video ({totalCredits} credits)
                </>
              )}
            </Button>

          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <UnifiedImageGallery
            mode={galleryMode}
            onImageSelect={onImageSelect || handleImageSelect}
          />
        </TabsContent>

        <TabsContent value="library">
          <Gen4ReferenceLibrary
            onImageSelect={handleImageSelect}
            selectedImages={selectedImages}
          />
        </TabsContent>
      </Tabs>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Reference Images</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowGallery(false)}
                >
                  Close
                </Button>
              </div>
              <UnifiedImageGallery
                mode="full"
                onImageSelect={handleImageSelect}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}