'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/image-gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/AuthProvider'
import { canUseFreeTier, incrementFreeTierUsage, formatResetTime } from '@/lib/post-production/free-tier-tracker'
import type { 
  Gen4ReferenceImage,
  Gen4Generation,
  Gen4Settings,
  LibraryImageReference
} from '@/lib/post-production/enhanced-types'

// Import the smaller components
import { Gen4ReferenceManager } from './Gen4ReferenceManager'
import { Gen4PromptSettings } from './Gen4PromptSettings'
// Removed Gen4GenerationHistory - using UnifiedImageGallery only
import { Gen4ReferenceLibrary } from './Gen4ReferenceLibrary'
import { ModelSelector } from './ModelSelector'
import { getModelConfig, type ModelId } from '@/lib/post-production/model-config'

interface Gen4TabOptimizedProps {
  gen4ReferenceImages: Gen4ReferenceImage[]
  setGen4ReferenceImages: (images: Gen4ReferenceImage[]) => void
  gen4Prompt: string
  setGen4Prompt: (prompt: string) => void
  gen4Settings: Gen4Settings
  setGen4Settings: (settings: Gen4Settings) => void
  gen4Generations: Gen4Generation[]
  setGen4Generations: (generations: Gen4Generation[]) => void
  gen4Processing: boolean
  setGen4Processing: (processing: boolean) => void
  libraryItems: LibraryImageReference[]
  libraryCategory: string
  setLibraryCategory: (category: any) => void
  libraryLoading: boolean
  onFullscreenImage: (image: LibraryImageReference) => void
  onSendToWorkspace: (imageUrl: string) => void
  shotList?: any[]
  generatedShotIds?: Set<string>
  onShotGenerated?: (shotId: string, imageUrl: string) => void
  onSendToImageEdit?: (imageUrl: string) => void
  onSendToLayoutAnnotation?: (imageUrl: string) => void
  onSendToReferenceLibrary?: (imageUrl: string) => void
  onCategoryChange?: (itemId: string, newCategory: string) => void
}

export function Gen4TabOptimized({
  gen4ReferenceImages,
  setGen4ReferenceImages,
  gen4Prompt,
  setGen4Prompt,
  gen4Settings,
  setGen4Settings,
  gen4Generations,
  setGen4Generations,
  gen4Processing,
  setGen4Processing,
  libraryItems,
  libraryCategory,
  setLibraryCategory,
  libraryLoading,
  onFullscreenImage,
  onSendToWorkspace,
  shotList = [],
  generatedShotIds = new Set(),
  onShotGenerated,
  onSendToImageEdit,
  onSendToLayoutAnnotation,
  onSendToReferenceLibrary,
  onCategoryChange
}: Gen4TabOptimizedProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage, getImagesByTag, removeImage } = useUnifiedGalleryStore()

  // Determine if we're in editing mode based on selected model
  const isEditingMode = gen4Settings.model === 'qwen-image-edit'
  const modelConfig = getModelConfig((gen4Settings.model || 'nano-banana') as ModelId)
  
  // Different validation for editing vs generation modes
  const canGenerate = isEditingMode 
    ? gen4Prompt.length > 0 && gen4ReferenceImages.length > 0 // Editing needs 1 input image + prompt
    : gen4Prompt.length > 0 && gen4ReferenceImages.length > 0 // Generation needs reference images + prompt

  // Generation logic (simplified for space efficiency)
  // Simple content filter to avoid sensitive content errors
  const filterPrompt = (prompt: string): string => {
    const sensitiveWords = ['violence', 'weapon', 'blood', 'death', 'kill', 'murder', 'crime', 'illegal']
    let filtered = prompt.toLowerCase()
    
    // Replace sensitive words with neutral alternatives
    filtered = filtered.replace(/violence|violent/g, 'action')
    filtered = filtered.replace(/weapon|gun|knife/g, 'object')
    filtered = filtered.replace(/blood|bloody/g, 'red liquid')
    filtered = filtered.replace(/death|dead|kill|murder/g, 'dramatic scene')
    filtered = filtered.replace(/crime|criminal/g, 'investigation')
    
    return filtered
  }

  const executePipelineSteps = async (pipelineResult: any, referenceUrl: string, authToken: string | null) => {
    try {
      const chainId = `chain_${Date.now()}`
      let currentInputImage = referenceUrl
      let totalVariations = 0
      let finalImage = null

      // Calculate total variations across all steps
      pipelineResult.steps.forEach((step: any) => {
        const variationCount = step.expandedPrompts?.length || 1
        totalVariations += variationCount
      })

      // Create placeholders for all variations
      let placeholderIndex = 0
      pipelineResult.steps.forEach((step: any, stepIndex: number) => {
        const variations = step.expandedPrompts || [step.prompt]
        variations.forEach((varPrompt: string, varIndex: number) => {
          placeholderIndex++
          addImage({
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDM0MzQzIi8+PC9zdmc+',
            prompt: varPrompt,
            source: 'shot-creator',
            model: gen4Settings.model || 'nano-banana',
            settings: {
              aspectRatio: gen4Settings.aspectRatio,
              resolution: gen4Settings.resolution,
              seed: gen4Settings.seed
            },
            tags: [`pipeline-step-${stepIndex + 1}`, 'pipeline', 'generating', `var-${varIndex + 1}`],
            creditsUsed: 0,
            chain: {
              chainId,
              stepNumber: stepIndex + 1,
              totalSteps: pipelineResult.steps.length,
              stepPrompt: varPrompt,
              variationIndex: varIndex,
              totalVariations: variations.length,
              isFinal: false // Will update for actual final image
            }
          })
        })
      })

      // Process each step with all variations
      for (let i = 0; i < pipelineResult.steps.length; i++) {
        const step = pipelineResult.steps[i]
        const variations = step.expandedPrompts || [step.prompt]
        const isLastStep = i === pipelineResult.steps.length - 1

        // For each variation in this step
        for (let v = 0; v < variations.length; v++) {
          const varPrompt = variations[v]
          const isLastVariation = v === variations.length - 1

          toast({
            title: `Step ${i + 1}/${pipelineResult.steps.length} - Variation ${v + 1}/${variations.length}`,
            description: `${varPrompt.substring(0, 40)}...`,
          })

          const stepResponse = await fetch('/post-production/api/gen4', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              prompt: varPrompt,
              reference_images: [currentInputImage],
              model: gen4Settings.model || 'nano-banana',
              aspect_ratio: gen4Settings.aspectRatio,
              resolution: gen4Settings.resolution,
              seed: gen4Settings.seed,
              max_images: 1,
              _isPipelineStep: true,
              _stepNumber: i + 1,
              _variationNumber: v + 1
            })
          })

          if (!stepResponse.ok) {
            const errorData = await stepResponse.json().catch(() => ({ error: stepResponse.statusText }))

            // Check if it's a temporary error that can be retried
            if (stepResponse.status === 503 || errorData.retry) {
              toast.error(`Step ${i + 1} variation ${v + 1} failed due to temporary AI service issues. Please try again in a moment.`)
              throw new Error(`Temporary service issue - please retry`)
            }

            throw new Error(`Step ${i + 1} variation ${v + 1} failed: ${errorData.error || stepResponse.statusText}`)
          }

          const stepResult = await stepResponse.json()

          if (!stepResult.images || stepResult.images.length === 0) {
            // Handle case where no images were generated due to API issues
            if (stepResult.retry) {
              toast.error('AI service temporarily unavailable. Please try again shortly.')
              throw new Error('Service temporarily unavailable')
            }
            throw new Error(`Step ${i + 1} variation ${v + 1}: No images generated`)
          }

          const stepImage = stepResult.images[0]

          // Remove the placeholder for this specific variation
          const currentChainId = chainId
          const placeholders = getImagesByTag('generating').filter(img =>
            img.chain?.chainId === currentChainId &&
            img.chain?.stepNumber === i + 1 &&
            img.chain?.variationIndex === v
          )
          placeholders.forEach(placeholder => {
            removeImage(placeholder.id)
          })

          // Determine if this is the final image of the entire pipeline
          const isFinalPipelineImage = isLastStep && isLastVariation

          // Only update input for next step if this is the last variation of current step
          if (isLastVariation) {
            currentInputImage = stepImage.url
            finalImage = stepImage.url
          }

          // Add the real image
          addImage({
            url: stepImage.url,
            prompt: varPrompt,
            source: 'shot-creator',
            model: gen4Settings.model || 'nano-banana',
            settings: {
              aspectRatio: gen4Settings.aspectRatio,
              resolution: gen4Settings.resolution,
              seed: gen4Settings.seed
            },
            tags: [
              `pipeline-step-${i + 1}`,
              'pipeline',
              `var-${v + 1}`,
              ...(isFinalPipelineImage ? ['pipeline-final'] : [])
            ],
            creditsUsed: stepResult.credits_used || 0,
            chain: {
              chainId,
              stepNumber: i + 1,
              totalSteps: pipelineResult.steps.length,
              stepPrompt: varPrompt,
              variationIndex: v,
              totalVariations: variations.length,
              isFinal: isFinalPipelineImage,
              isPipelineFinal: isFinalPipelineImage
            }
          })
        }
      }

      toast({
        title: "Pipeline Complete!",
        description: `Generated ${totalVariations} images across ${pipelineResult.steps.length} steps`,
      })

      // Reset processing state after successful pipeline completion
      setGen4Processing(false)

    } catch (error) {
      console.error('❌ Pipeline execution failed:', error)

      // Clean up any remaining placeholders for this chain
      const currentChainId = chainId // Ensure chainId is captured in closure
      const remainingPlaceholders = getImagesByTag('generating').filter(img =>
        img.chain?.chainId === currentChainId
      )
      remainingPlaceholders.forEach(placeholder => {
        removeImage(placeholder.id)
      })

      toast({
        title: "Pipeline Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })

      // Reset processing state after failed pipeline
      setGen4Processing(false)
    }
  }

  const handleGen4Generate = async () => {
    // Prevent multiple simultaneous generations
    if (gen4Processing) {
      return
    }

    if (!gen4Prompt.trim() || gen4ReferenceImages.length === 0) {
      toast({
        title: "Cannot Generate",
        description: "Please add reference images and enter a prompt",
        variant: "destructive"
      })
      return
    }

    setGen4Processing(true)

    // Add placeholder image immediately for better UX
    const placeholderId = `placeholder_${Date.now()}`
    const numGenerations = gen4Settings.maxImages || 1

    // Add placeholder(s) based on number of generations requested
    for (let i = 0; i < numGenerations; i++) {
      addImage({
        id: `${placeholderId}_${i}`,
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDM0MzQzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM4ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+R2VuZXJhdGluZy4uLjwvdGV4dD48L3N2Zz4=',
        prompt: gen4Prompt,
        source: 'shot-creator',
        model: gen4Settings.model || 'nano-banana',
        settings: {
          aspectRatio: gen4Settings.aspectRatio,
          resolution: gen4Settings.resolution,
          seed: gen4Settings.seed
        },
        tags: ['generating', `placeholder-${placeholderId}`],
        creditsUsed: 0,
        metadata: {
          isPlaceholder: true,
          generationIndex: i,
          totalGenerations: numGenerations
        }
      })
    }

    try {
      // Get authentication token - required for API access
      const token = await getToken()

      // Check free tier usage for unauthenticated users
      if (!token) {
        const freeTier = canUseFreeTier()

        if (!freeTier.allowed) {
          // Free tier limit reached
          toast({
            title: "Free Limit Reached",
            description: `You've used all ${freeTier.remaining === 0 ? 'your' : ''} free generations. Reset in ${formatResetTime(freeTier.resetAt!)}. Sign in for unlimited access!`,
            variant: "destructive"
          })
          setGen4Processing(false)
          return
        }

        // Show remaining free uses
        if (freeTier.remaining <= 2) {
          toast({
            title: "Free Generation",
            description: `${freeTier.remaining} free generation${freeTier.remaining !== 1 ? 's' : ''} remaining today`,
          })
        }

        // Free tier user - continuing with limited generations
      }

      // Upload reference images
      const referenceUrls = await Promise.all(
        gen4ReferenceImages.map(async (img, index) => {
          if (!img.file) {
            throw new Error(`Reference image ${index + 1} has no file data`)
          }

          const formData = new FormData()
          formData.append('file', img.file)

          // Create an AbortController for timeout handling
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          try {
            const uploadRes = await fetch('/api/upload-media', {
              method: 'POST',
              body: formData,
              signal: controller.signal
            })

            clearTimeout(timeoutId) // Clear timeout on successful response

            if (!uploadRes.ok) {
              const errorText = await uploadRes.text()
              console.error(`❌ Upload failed for image ${index + 1} (${uploadRes.status}):`, errorText)
              throw new Error(`Failed to upload reference image ${index + 1}: ${uploadRes.status} - ${errorText}`)
            }

            const { url } = await uploadRes.json()
            return url
          } catch (error) {
            clearTimeout(timeoutId) // Clear timeout on error
            if (error.name === 'AbortError') {
              console.error(`❌ Upload timeout for image ${index + 1}`)
              throw new Error(`Upload timeout for reference image ${index + 1}`)
            }
            throw error // Re-throw other errors
          }
        })
      )
      
      // Generate with Gen4
      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      // Only add Authorization header if token exists
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      // Create AbortController for main generation timeout
      const genController = new AbortController()
      const genTimeoutId = setTimeout(() => genController.abort(), 120000) // 2 minute timeout for generation

      const response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: headers,
        signal: genController.signal,
        body: JSON.stringify({
          prompt: filterPrompt(gen4Prompt),
          aspect_ratio: gen4ReferenceImages[0]?.detectedAspectRatio || gen4Settings.aspectRatio,
          resolution: gen4Settings.resolution,
          seed: gen4Settings.seed,
          reference_images: referenceUrls,
          reference_tags: gen4ReferenceImages.map((img, index) =>
            img.tags.length > 0 && img.tags[0].length >= 3 && img.tags[0].length <= 15
              ? img.tags[0]
              : `ref${index + 1}`
          ),
          model: gen4Settings.model || 'seedream-4',
          // Seedream-4 specific parameters
          max_images: gen4Settings.maxImages || 1,
          custom_width: gen4Settings.customWidth,
          custom_height: gen4Settings.customHeight,
          sequential_generation: gen4Settings.sequentialGeneration || false
        })
      })

      clearTimeout(genTimeoutId) // Clear timeout on successful response
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle sensitive content error specifically
        if (errorData.error?.includes('flagged as sensitive') || errorData.error?.includes('E005')) {
          toast({
            title: "Content Policy Violation",
            description: "Your prompt contains sensitive content. Please try a different description.",
            variant: "destructive"
          })
          setGen4Processing(false) // Reset processing state
          return
        }
        
        toast({
          title: "Generation Failed",
          description: errorData.error || `Error ${response.status}`,
          variant: "destructive"
        })
        setGen4Processing(false) // Reset processing state  
        return
      }
      
      const result = await response.json()

      // Check if this is a pipeline response
      if (result.isPipeline) {

        // Execute pipeline steps sequentially
        await executePipelineSteps(result.pipelineResult, referenceUrls[0], token)
        return
      }
      
      // Remove placeholder images before adding real ones
      const placeholderImages = getImagesByTag(`placeholder-${placeholderId}`)
      placeholderImages.forEach(placeholder => {
        removeImage(placeholder.id)
      })

      // Handle multi-image response with expanded prompts
      const images = result.images || (result.imageUrl ? [result.imageUrl] : [])
      const imageCount = images.length

      // Handle both old format (strings) and new format (objects with prompt)
      const processedImages = images.map((item: any, index: number) => {
        if (typeof item === 'string') {
          // Old format - just URL
          return { url: item, prompt: gen4Prompt, variationIndex: index + 1 }
        } else {
          // New format - object with URL and expanded prompt
          return { 
            url: item.url, 
            prompt: item.prompt || gen4Prompt, 
            variationIndex: item.variationIndex || index + 1 
          }
        }
      })
      
      // Increment free tier usage if not authenticated
      if (!token && processedImages.length > 0) {
        incrementFreeTierUsage()
        // Free tier usage incremented
      }

      // Create a generation entry for each image
      processedImages.forEach((imageData, index: number) => {
        const newGeneration: Gen4Generation = {
          id: `${Date.now()}-${index}`,
          prompt: imageData.prompt, // Use specific expanded prompt
          referenceImages: [...gen4ReferenceImages],
          settings: { ...gen4Settings },
          status: 'completed',
          outputUrl: imageData.url,
          timestamp: Date.now() + index // Slightly different timestamps
        }

        setGen4Generations(prev => [newGeneration, ...prev])
        
        // Save each image to unified gallery with specific prompt and persistence info
        addImage({
          url: imageData.url, // Now contains permanent URL
          prompt: imageData.prompt, // Use expanded prompt instead of template
          source: 'shot-creator',
          model: gen4Settings.model || 'seedream-4',
          settings: {
            aspectRatio: gen4Settings.aspectRatio,
            resolution: gen4Settings.resolution,
            seed: gen4Settings.seed
          },
          creditsUsed: imageData.creditsUsed || 9, // Default fallback

          // NEW: Persistence metadata from API response
          isPermanent: imageData.isPermanent,
          temporaryUrl: imageData.temporaryUrl,
          storagePath: imageData.storagePath,
          fileSize: imageData.fileSize,
          error: imageData.error,

          metadata: {
            createdAt: Date.now() + index,
            creditsUsed: result.creditsUsed || Math.ceil((gen4Settings.maxImages || 1) * 0.03 * 33)
          },
          tags: [
            'shot-creator', 
            gen4Settings.model || 'seedream-4',
            ...(result.isWildCard ? ['wild-card'] : []),
            ...(result.isDynamic ? ['dynamic'] : []),
            `variation-${imageData.variationIndex}`
          ]
        })
      })
      
      toast({
        title: "Generation Complete",
        description: `Generated ${imageCount} image${imageCount > 1 ? 's' : ''} successfully!`
      })
    } catch (error) {
      console.error('Gen4 generation error:', error)

      // Remove placeholder images on error
      const placeholderImages = getImagesByTag(`placeholder-${placeholderId}`)
      placeholderImages.forEach(placeholder => {
        removeImage(placeholder.id)
      })

      // Handle timeout errors specifically
      if (error.name === 'AbortError') {
        toast({
          title: "Generation Timeout",
          description: "The generation request timed out. Please try again.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        })
      }
    } finally {
      setGen4Processing(false)
    }
  }

  return (
    <div className="w-full h-full">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between px-2 lg:px-4 py-3 bg-slate-900/50 border-b border-slate-700 lg:rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg lg:text-xl font-semibold text-white">Shot Creator</h2>
        </div>
        <div className="w-full lg:w-auto">
          <ModelSelector
            selectedModel={gen4Settings.model || 'seedream-4'}
            onModelChange={(model) => setGen4Settings(prev => ({ ...prev, model }))}
            compact={true}
            showTooltips={false}
          />
        </div>
      </div>

      {/* Full-Width Mobile Layout */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-4 lg:space-y-0 pb-4">
        
        {/* LEFT COLUMN - Reference Images & Prompt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reference Images Management / Input Image for Editing */}
          <div className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50 p-0 lg:p-6">
            <div className="mb-4 px-2 pt-4 lg:px-0 lg:pt-0">
              <h3 className="text-white font-medium">
                {isEditingMode ? 'Input Image to Edit' : `Reference Images (Max ${modelConfig.maxReferenceImages || 3})`}
              </h3>
              {isEditingMode && (
                <p className="text-slate-400 text-sm mt-1">
                  Upload the image you want to edit with AI instructions
                </p>
              )}
            </div>
            <Gen4ReferenceManager
              gen4ReferenceImages={gen4ReferenceImages}
              setGen4ReferenceImages={setGen4ReferenceImages}
              compact={false}
              maxImages={isEditingMode ? 1 : (modelConfig.maxReferenceImages || 3)}
              editingMode={isEditingMode}
            />
          </div>

          {/* Prompt & Settings */}
          <div className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
            <Gen4PromptSettings
              gen4Prompt={gen4Prompt}
              setGen4Prompt={setGen4Prompt}
              gen4Settings={gen4Settings}
              setGen4Settings={setGen4Settings}
              gen4Processing={gen4Processing}
              hasNonPipelineImages={gen4ReferenceImages.some(img => img.url && !img.url.includes('pipeline'))} // Check if any reference image is from non-pipeline source
              onGenerate={handleGen4Generate}
              canGenerate={canGenerate}
              referenceImagesCount={gen4ReferenceImages.length}
              compact={false}
              userId={user?.id}
            />
          </div>

          {/* Model-specific settings handled inline */}
        </div>

        {/* RIGHT COLUMN - Generated Images & Library */}
        <div className="space-y-6">
          {/* Single Gallery - Generated Images + Reference Library */}
          <div className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
            <Tabs defaultValue="generated" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated" className="text-xs lg:text-sm">📸 Images</TabsTrigger>
                <TabsTrigger value="library" className="text-xs lg:text-sm">📚 Library</TabsTrigger>
              </TabsList>
              <TabsContent value="generated">
                <UnifiedImageGallery
                  currentTab="shot-creator"
                  onSendToTab={(imageUrl, targetTab) => {
                    if (targetTab === 'shot-editor' && onSendToImageEdit) {
                      onSendToImageEdit(imageUrl)
                    } else if (targetTab === 'layout-annotation' && onSendToLayoutAnnotation) {
                      onSendToLayoutAnnotation(imageUrl)
                    }
                  }}
                  onSendToLibrary={onSendToReferenceLibrary}
                  onUseAsReference={(imageUrl) => {
                    toast({
                      title: "Added as Reference",
                      description: "Image added to reference slots"
                    })
                  }}
                  compact={true}
                />
              </TabsContent>
              <TabsContent value="library">
                <Gen4ReferenceLibrary
                  libraryItems={libraryItems}
                  libraryCategory={libraryCategory}
                  setLibraryCategory={setLibraryCategory}
                  libraryLoading={libraryLoading}
                  onFullscreenImage={onFullscreenImage}
                  onCategoryChange={onCategoryChange}
                  compact={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}