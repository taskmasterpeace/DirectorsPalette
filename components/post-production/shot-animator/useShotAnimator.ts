'use client'

import { useState, useRef, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useCreditValidation, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { VideoGeneration, VideoSettings } from './types'
import { SEEDANCE_MODELS, RESOLUTION_OPTIONS } from './constants'
import { supabase } from '@/lib/supabase'
import { dataURLtoBlob } from "@/lib/post-production/helpers"

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

    // Create FormData for API call
    const formData = new FormData()
    formData.append('prompt', videoSettings.prompt)
    formData.append('model', videoSettings.model)
    formData.append('duration', videoSettings.duration.toString())
    formData.append('resolution', videoSettings.resolution)
    formData.append('aspect_ratio', videoSettings.aspectRatio)
    formData.append('camera_fixed', 'false') // Default for now

    // Add reference images
    selectedImages.forEach((img, index) => {
      if (img.startsWith('data:image')) {
        const blob = dataURLtoBlob(img)
        formData.append(`reference_image_${index}`, blob, `ref_${index}.png`)
      }
    })

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

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        throw new Error(error?.message || "User not authenticated")
      }
      const accessToken = data.session.access_token

      const response = await fetch('/api/video/seedance', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
        }
      })

      const result = await response.json()
      if (result.success) {
        setGenerations(prev => prev.map(g =>
          g.id === generation.id
            ? {
              ...g,
              status: 'completed',
              videoUrl: result.videoUrl,
              endTime: new Date(),
              creditsUsed: totalCredits
            }
            : g
        ))

        toast({
          title: "Video Generated",
          description: "Your video has been successfully generated"
        })
      } else {
        setGenerations(prev => prev.map(g =>
          g.id === generation.id
            ? { ...g, status: 'failed', error: result.error }
            : g
        ))
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate video",
          variant: "destructive"
        })
      }
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