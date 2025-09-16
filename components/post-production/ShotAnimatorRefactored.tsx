/**
 * Shot Animator (Refactored)
 * Main orchestrator for video generation with final frame control and batch animation
 * Follows ultra-thin architecture (< 200 lines)
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Video, Play, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'

// Import refactored components
import { ShotAnimatorImageManager } from './ShotAnimatorImageManager'
import { ShotAnimatorPromptEditor } from './ShotAnimatorPromptEditor'
import { ShotAnimatorBatchProcessor } from './ShotAnimatorBatchProcessor'
import { UnifiedImageGallery } from './UnifiedImageGallery'
import { Gen4ReferenceLibrary } from './Gen4ReferenceLibrary'

// Import types and constants
import type {
  SeeeDanceModel,
  VideoGeneration,
  ImageUpload,
  BatchAnimationJob
} from './ShotAnimatorTypes'
import {
  SEEDANCE_MODELS,
  DURATION_OPTIONS,
  RESOLUTION_OPTIONS,
  ASPECT_RATIOS
} from './ShotAnimatorTypes'

// Import credit validation
import { validateCreditsWithRedirect, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'

interface ShotAnimatorRefactoredProps {
  onFullscreenImage?: (imageUrl: string) => void
  libraryItems?: any[]
  libraryCategory?: string
  setLibraryCategory?: (category: string) => void
  libraryLoading?: boolean
}

export function ShotAnimatorRefactored({
  onFullscreenImage,
  libraryItems = [],
  libraryCategory = 'all',
  setLibraryCategory,
  libraryLoading = false
}: ShotAnimatorRefactoredProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()
  const router = useRouter()
  const pathname = usePathname()

  // Model and settings state
  const [selectedModel, setSelectedModel] = useState<SeeeDanceModel>(SEEDANCE_MODELS[0])
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [cameraFixed, setCameraFixed] = useState(false)
  const [seed, setSeed] = useState<number | undefined>(undefined)

  // Prompt state
  const [prompt, setPrompt] = useState('')

  // Image state
  const [startFrameImages, setStartFrameImages] = useState<ImageUpload[]>([])
  const [finalFrameImages, setFinalFrameImages] = useState<ImageUpload[]>([])
  const [referenceImages, setReferenceImages] = useState<ImageUpload[]>([])

  // Generation state
  const [generations, setGenerations] = useState<VideoGeneration[]>([])
  const [batchJobs, setBatchJobs] = useState<BatchAnimationJob[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Real-time cost calculation
  const currentCost = useRealTimeCostCalculator({
    duration,
    resolution,
    model: selectedModel.id
  })

  // Image management
  const handleAddImage = useCallback((file: File, type: 'start_frame' | 'final_frame' | 'reference') => {
    const imageUpload: ImageUpload = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      type,
      uploaded: new Date()
    }

    switch (type) {
      case 'start_frame':
        setStartFrameImages(prev => [...prev, imageUpload])
        break
      case 'final_frame':
        setFinalFrameImages(prev => [...prev, imageUpload])
        break
      case 'reference':
        setReferenceImages(prev => [...prev, imageUpload])
        break
    }

    toast({
      title: `${type.replace('_', ' ')} Added`,
      description: `${file.name} uploaded successfully`
    })
  }, [toast])

  const handleRemoveImage = useCallback((imageId: string, type: 'start_frame' | 'final_frame' | 'reference') => {
    switch (type) {
      case 'start_frame':
        setStartFrameImages(prev => prev.filter(img => img.id !== imageId))
        break
      case 'final_frame':
        setFinalFrameImages(prev => prev.filter(img => img.id !== imageId))
        break
      case 'reference':
        setReferenceImages(prev => prev.filter(img => img.id !== imageId))
        break
    }
  }, [])

  // Single video generation
  const generateSingleVideo = useCallback(async () => {
    if (!prompt.trim() || !user) return

    // Credit validation with automatic redirect
    const creditValidation = await validateCreditsWithRedirect(
      {
        operation: 'video generation',
        baseCredits: 15,
        duration,
        resolution,
        model: selectedModel.id
      },
      router,
      pathname
    )

    if (!creditValidation?.canProceed) return

    setIsGenerating(true)

    try {
      // Create form data with all parameters
      const token = await getToken()
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('model', selectedModel.id)
      formData.append('duration', duration.toString())
      formData.append('resolution', resolution)
      formData.append('aspect_ratio', aspectRatio)
      formData.append('camera_fixed', cameraFixed.toString())

      // Add images
      if (startFrameImages.length > 0) {
        formData.append('input_image', startFrameImages[0].file)
      }
      if (finalFrameImages.length > 0) {
        formData.append('last_frame_image', finalFrameImages[0].file)
      }
      referenceImages.slice(0, 4).forEach((image, index) => {
        formData.append(`reference_image_${index}`, image.file)
      })
      if (seed !== undefined) {
        formData.append('seed', seed.toString())
      }

      const response = await fetch('/api/video/seedance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.NEXT_PUBLIC_DIRECTORS_PALETTE_API_KEY || 'dp_beta_2025_machineking_secure_api_key_v1'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.videoUrl) {
        // Add to gallery
        addImage({
          url: result.videoUrl,
          prompt: prompt.trim(),
          source: 'shot-animator',
          model: selectedModel.id,
          settings: {
            aspectRatio,
            resolution,
            seed: seed
          },
          creditsUsed: currentCost,
          metadata: {
            duration: duration,
            videoFormat: 'mp4',
            isVideo: true,
            hasStartFrame: startFrameImages.length > 0,
            hasFinalFrame: finalFrameImages.length > 0,
            referenceCount: referenceImages.length
          },
          tags: ['video', selectedModel.id, resolution, aspectRatio]
        })

        toast({
          title: "Video Generated Successfully",
          description: `${duration}s video created with ${selectedModel.name}`
        })

        // Clear inputs
        setPrompt('')
        setStartFrameImages([])
        setFinalFrameImages([])
        setReferenceImages([])
        setSeed(undefined)
      } else {
        throw new Error(result.error || 'Generation failed')
      }
    } catch (error) {
      console.error('❌ Video generation failed:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    prompt, user, duration, resolution, selectedModel, aspectRatio, cameraFixed, seed,
    startFrameImages, finalFrameImages, referenceImages, getToken, addImage, toast,
    router, pathname, currentCost
  ])

  // Check if generation is possible
  const canGenerate = prompt.trim().length > 0 && !isGenerating

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 px-2 lg:px-4 py-3 bg-slate-900/50 border-b border-slate-700 lg:rounded-t-lg">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg lg:text-xl font-semibold text-white">🎬 Shot Animator</h2>
          <Badge variant="outline" className="text-xs">SeeeDance AI</Badge>
        </div>
        <div className="w-full lg:w-auto">
          <Select value={selectedModel.id} onValueChange={(value) => {
            const model = SEEDANCE_MODELS.find(m => m.id === value)
            if (model) setSelectedModel(model)
          }}>
            <SelectTrigger className="w-full lg:w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEEDANCE_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {model.maxResolution} • {model.creditsPerSecond}c/sec
                        </Badge>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Controls */}
        <div className="space-y-6">
          {/* Image Manager */}
          <ShotAnimatorImageManager
            startFrameImages={startFrameImages}
            finalFrameImages={finalFrameImages}
            referenceImages={referenceImages}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />

          {/* Prompt Editor */}
          <ShotAnimatorPromptEditor
            prompt={prompt}
            onPromptChange={setPrompt}
            seed={seed}
            onSeedChange={setSeed}
            creditsEstimate={currentCost}
          />

          {/* Generation Button */}
          <Button
            onClick={generateSingleVideo}
            disabled={!canGenerate}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Video ({currentCost} credits)
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Gallery and Library */}
        <div className="space-y-6">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos">📹 Videos</TabsTrigger>
              <TabsTrigger value="library">📚 Library</TabsTrigger>
            </TabsList>
            <TabsContent value="videos">
              <UnifiedImageGallery
                currentTab="shot-animator"
                onSendToLibrary={(url) => {
                  toast({
                    title: "Sent to Library",
                    description: "Video added to reference library"
                  })
                }}
              />
            </TabsContent>
            <TabsContent value="library">
              <Gen4ReferenceLibrary
                libraryItems={libraryItems}
                libraryCategory={libraryCategory}
                setLibraryCategory={setLibraryCategory}
                libraryLoading={libraryLoading}
                onFullscreenImage={onFullscreenImage}
                compact={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}