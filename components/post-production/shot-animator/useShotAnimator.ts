'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useCreditValidation, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { VideoGeneration, VideoSettings } from './types'
import { SEEDANCE_MODELS, RESOLUTION_OPTIONS } from './constants'
import { supabase } from '@/lib/supabase'
import { dataURLtoBlob } from "@/lib/post-production/helpers"
import { dbManager } from "@/lib/post-production/indexeddb"
import { Gen4ReferenceImage } from "@/lib/post-production/enhanced-types"

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
  const [selectedImages, setSelectedImages] = useState<string[]>(referenceImages || []);
  const [showGallery, setShowGallery] = useState(false);
  const prevReferenceImages = useRef<string[]>(referenceImages || []);

  useEffect(() => {
    dbManager.getAnimatorReferences().then((refs) => {
      if (refs && refs.length > 0) {
        setSelectedImages(refs.map(r => r.preview))
      }
    })
  }, [])

  const persistReferences = async (images: string[]) => {
    // Get existing references to preserve their metadata
    const existingRefs = await dbManager.getAnimatorReferences();

    // Create a map of existing previews to their reference data
    const existingPreviews = new Map(
      existingRefs.map(ref => [ref.preview, ref])
    );

    // Create or update references
    const updatedRefs = images.map((img, i) => {
      const preview = Array.isArray(img) ? img[0] : img;
      const existingRef = existingPreviews.get(preview);

      if (existingRef) return existingRef;
      return {
        id: `ref-${i}-${Date.now()}`,
        file: null,
        preview,
        tags: [],
        detectedAspectRatio: '1:1',
      };
    });

    try {
      await dbManager.saveAnimatorReferences(updatedRefs);

      // Update local state
      setSelectedImages(images);
      if (onReferenceImagesChange) {
        onReferenceImagesChange(images);
      }
    } catch (error) {
      console.error('Error saving references:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const refs = await dbManager.getAnimatorReferences();
        // Convert any blob URLs to data URLs if needed
        const updatedRefs = await Promise.all(
          refs.map(async (ref) => {
            // Ensure preview is a string
            let preview = ref.preview;
            if (Array.isArray(preview)) {
              preview = preview[0] || '';
            }

            // Handle blob URLs
            if (typeof preview === 'string' && preview.startsWith('blob:')) {
              try {
                const response = await fetch(preview);
                const blob = await response.blob();
                preview = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
              } catch (e) {
                console.error('Failed to process image:', e);
                preview = '';
              }
            }

            return {
              ...ref,
              preview
            };
          })
        );

        // Filter out invalid references
        const validRefs = updatedRefs.filter(ref =>
          ref.preview &&
          (typeof ref.preview === 'string') &&
          (ref.preview.startsWith('data:image') || ref.preview.startsWith('blob:'))
        );

        // Save the fixed references back to the database if needed
        if (validRefs.length !== refs.length) {
          await dbManager.saveAnimatorReferences(validRefs);
        }

        // Update the UI with the valid previews
        const previews = validRefs.map(ref => ref.preview).filter(Boolean);
        setSelectedImages(previews);
      } catch (error) {
        console.error('Failed to load animator references:', error);
      }
    };

    loadReferences();
  }, []);

  // Credit calculation
  const selectedModel = SEEDANCE_MODELS.find(m => m.id === videoSettings.model)!
  const totalCredits = videoSettings.duration * selectedModel.creditsPerSecond

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    });

    Promise.all(newImages)
      .then(async (images) => {
        const validImages = images.filter(img => img)
        const existingImages = new Set(selectedImages);
        const newUniqueImages = validImages.filter(img => !existingImages.has(img));

        if (newUniqueImages.length === 0) return

        const updated = [...selectedImages, ...newUniqueImages];
        await persistReferences(updated);
      })
      .catch(error => {
        console.error('Error processing files:', error)
      })
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      const newImages = await Promise.all(
        clipboardItems.map(async (item) => {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type)
              return new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsDataURL(blob)
              })
            }
          }
          return null
        })
      )

      const valid = newImages.filter(Boolean) as string[]
      if (valid.length > 0) {
        const updated = [...selectedImages, ...valid]
        await persistReferences(updated)
        toast({ title: "Image Pasted", description: "Image from clipboard added" })
      }
    } catch {
      toast({
        title: "Paste Failed",
        description: "Unable to paste image",
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

  const handleRemoveImage = useCallback(async (previewToRemove: string) => {
    try {
      const existingRefs = await dbManager.getAnimatorReferences();
      const refToRemove = existingRefs.find(r => r.preview === previewToRemove);
      if (!refToRemove) return;
      const tx = dbManager.db!.transaction("animatorReferences", "readwrite");
      tx.objectStore("animatorReferences").delete(refToRemove.id);
      tx.oncomplete = () => console.log('[DB] Image deleted from IndexedDB');
      tx.onerror = () => console.error('[DB] Failed to delete image:', tx.error);

      const updatedRefs = existingRefs.filter(r => r.preview !== previewToRemove);
      setSelectedImages(updatedRefs.map(r => r.preview));
      if (onReferenceImagesChange) onReferenceImagesChange(updatedRefs.map(r => r.preview));
    } catch (error) {
      console.error('[UI] Failed to remove image:', error);
    }
  }, [onReferenceImagesChange]);

  return {
    // State
    videoSettings,
    setVideoSettings,
    generations,
    isGenerating,
    selectedImages,
    showGallery,
    setShowGallery,
    setSelectedImages,
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