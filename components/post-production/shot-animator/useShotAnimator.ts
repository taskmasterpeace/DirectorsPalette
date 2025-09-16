'use client'

import { useState, useRef, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useCreditValidation, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { VideoGeneration, VideoSettings } from './types'
import { SEEDANCE_MODELS, RESOLUTION_OPTIONS } from './constants'

export function useShotAnimator(
  referenceImages?: string[],
  onReferenceImagesChange?: (images: string[]) => void,
  seed?: number,
  onSeedChange?: (seed: number) => void,
  lastFrameImages?: string[]
) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { recentImages } = useUnifiedGalleryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    prompt: '',
    model: 'seedance-lite',
    resolution: '720p',
    duration: 5,
    aspectRatio: '16:9',
    seed: seed || Math.floor(Math.random() * 1000000),
    motionIntensity: 50
  })

  const [generations, setGenerations] = useState<VideoGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>(referenceImages || [])
  const [showGallery, setShowGallery] = useState(false)

  // Credit calculation
  const selectedModel = SEEDANCE_MODELS.find(m => m.id === videoSettings.model)!
  const totalCredits = videoSettings.duration * selectedModel.creditsPerSecond

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImages(prev => [...prev, result])
        if (onReferenceImagesChange) {
          onReferenceImagesChange([...selectedImages, result])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              setSelectedImages(prev => [...prev, result])
              if (onReferenceImagesChange) {
                onReferenceImagesChange([...selectedImages, result])
              }
            }
            reader.readAsDataURL(blob)
          }
        }
      }
      toast({
        title: "Image Pasted",
        description: "Image from clipboard added to references"
      })
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Unable to paste image from clipboard",
        variant: "destructive"
      })
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!videoSettings.prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a video prompt",
        variant: "destructive"
      })
      return
    }

    // Create generation entry
    const generation: VideoGeneration = {
      id: Date.now().toString(),
      prompt: videoSettings.prompt,
      model: videoSettings.model,
      resolution: videoSettings.resolution,
      duration: videoSettings.duration,
      aspectRatio: videoSettings.aspectRatio,
      status: 'pending',
      progress: 0,
      referenceImages: selectedImages,
      seed: videoSettings.seed,
      startTime: new Date()
    }

    setGenerations(prev => [...prev, generation])
    setIsGenerating(true)

    // Simulate generation (replace with actual API call)
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setGenerations(prev => prev.map(g =>
          g.id === generation.id
            ? { ...g, status: 'processing', progress: i }
            : g
        ))
      }

      // Mark as completed
      setGenerations(prev => prev.map(g =>
        g.id === generation.id
          ? {
              ...g,
              status: 'completed',
              videoUrl: 'https://example.com/video.mp4',
              endTime: new Date(),
              creditsUsed: totalCredits
            }
          : g
      ))

      toast({
        title: "Video Generated",
        description: "Your video has been successfully generated"
      })
    } catch (error) {
      setGenerations(prev => prev.map(g =>
        g.id === generation.id
          ? { ...g, status: 'failed', error: 'Generation failed' }
          : g
      ))
      toast({
        title: "Generation Failed",
        description: "Failed to generate video",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [videoSettings, selectedImages, totalCredits, toast])

  const handlePause = () => {
    setIsGenerating(false)
  }

  const handleResume = () => {
    setIsGenerating(true)
  }

  const handleRemove = (id: string) => {
    setGenerations(prev => prev.filter(g => g.id !== id))
  }

  const handleDownload = (videoUrl: string) => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `video_${Date.now()}.mp4`
    a.click()
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newImages = prev.includes(imageUrl)
        ? prev.filter(img => img !== imageUrl)
        : [...prev, imageUrl]

      if (onReferenceImagesChange) {
        onReferenceImagesChange(newImages)
      }
      return newImages
    })
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      if (onReferenceImagesChange) {
        onReferenceImagesChange(newImages)
      }
      return newImages
    })
  }

  return {
    // State
    videoSettings,
    setVideoSettings,
    generations,
    isGenerating,
    selectedImages,
    showGallery,
    setShowGallery,
    fileInputRef,
    totalCredits,

    // Handlers
    handleFileUpload,
    handlePasteFromClipboard,
    handleGenerate,
    handlePause,
    handleResume,
    handleRemove,
    handleDownload,
    handleImageSelect,
    handleRemoveImage,

    // Data
    selectedModel,
    recentImages
  }
}