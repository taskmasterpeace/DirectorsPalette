'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Zap, Play } from 'lucide-react'
import { ModelSelector } from './ModelSelector'
import { VideoSettings } from './VideoSettings'
import { ReferenceImages } from './ReferenceImages'
import { VideoGenerationQueue } from './VideoGenerationQueue'
import { UnifiedImageGallery } from '../image-gallery'
import { Gen4ReferenceLibrary } from '../Gen4ReferenceLibrary'
import { CreditInsufficiencyModal } from '@/components/ui/CreditInsufficiencyModal'
import { useShotAnimator } from './useShotAnimator'
import { ShotAnimatorTabProps } from './types'
import { validateCreditsWithRedirect } from '@/lib/credits/credit-validation'
import type { AlternativeOption } from '@/lib/credits/credit-validation'

export function ShotAnimatorTabRefactored({
  className = '',
  galleryMode = 'minimal',
  onImageSelect,
  referenceImages,
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
    handleFileUpload,
    handlePasteFromClipboard,
    handleGenerate,
    handlePause,
    handleResume,
    handleRemove,
    handleDownload,
    handleImageSelect,
    handleRemoveImage,
    selectedModel
  } = useShotAnimator(referenceImages, onReferenceImagesChange, seed, onSeedChange, lastFrameImages)

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ModelSelector
                selectedModel={videoSettings.model}
                onModelSelect={(model) => setVideoSettings({ ...videoSettings, model })}
                creditsPerSecond={selectedModel.creditsPerSecond}
              />

              <VideoSettings
                settings={videoSettings}
                onSettingsChange={setVideoSettings}
                isProModel={videoSettings.model === 'seedance-pro'}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ReferenceImages
                selectedImages={selectedImages}
                lastFrameImages={lastFrameImages}
                onFileUpload={() => fileInputRef.current?.click()}
                onPasteFromClipboard={handlePasteFromClipboard}
                onRemoveImage={handleRemoveImage}
                onShowGallery={() => setShowGallery(true)}
                fileInputRef={fileInputRef}
                onFileChange={handleFileUpload}
              />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !videoSettings.prompt.trim()}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Generate Video ({totalCredits} credits)
              </Button>

              <VideoGenerationQueue
                generations={generations}
                isGenerating={isGenerating}
                onPause={handlePause}
                onResume={handleResume}
                onRemove={handleRemove}
                onDownload={handleDownload}
              />
            </div>
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