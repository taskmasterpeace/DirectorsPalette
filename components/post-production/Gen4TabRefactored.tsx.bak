'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/UnifiedImageGallery'
import { useAuth } from '@/components/auth/AuthProvider'
import type { 
  Gen4ReferenceImage,
  Gen4Generation,
  Gen4Settings,
  LibraryImageReference
} from '@/lib/post-production/enhanced-types'

// Import the smaller components
import { Gen4ReferenceManager } from './Gen4ReferenceManager'
import { Gen4PromptSettings } from './Gen4PromptSettings' 
import { Gen4GenerationHistory } from './Gen4GenerationHistory'
import { Gen4ReferenceLibrary } from './Gen4ReferenceLibrary'

interface Gen4TabRefactoredProps {
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
}

export function Gen4TabRefactored({
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
  onSendToImageEdit
}: Gen4TabRefactoredProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()

  // Generation logic (extracted from the massive original file)
  const handleGen4Generate = async () => {
    if (!gen4Prompt.trim() || gen4ReferenceImages.length === 0) {
      toast({
        title: "Cannot Generate",
        description: "Please add reference images and enter a prompt",
        variant: "destructive"
      })
      return
    }

    setGen4Processing(true)
    
    try {
      // Get authentication token
      const token = await getToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      // Upload reference images
      const referenceUrls = await Promise.all(
        gen4ReferenceImages.map(async (img) => {
          const formData = new FormData()
          formData.append('file', img.file)
          const uploadRes = await fetch('/api/upload-media', {
            method: 'POST',
            body: formData
          })
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload reference image`)
          }
          const { url } = await uploadRes.json()
          return url
        })
      )
      
      // Generate with Gen4
      const response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: gen4Prompt,
          aspect_ratio: gen4ReferenceImages[0]?.detectedAspectRatio || gen4Settings.aspectRatio,
          resolution: gen4Settings.resolution,
          seed: gen4Settings.seed,
          reference_images: referenceUrls,
          reference_tags: gen4ReferenceImages.map((img, index) => 
            img.tags.length > 0 && img.tags[0].length >= 3 && img.tags[0].length <= 15 
              ? img.tags[0] 
              : `ref${index + 1}`
          ),
          model: 'nano-banana'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Generation failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      const newGeneration: Gen4Generation = {
        id: Date.now().toString(),
        prompt: gen4Prompt,
        referenceImages: [...gen4ReferenceImages],
        settings: { ...gen4Settings },
        status: 'completed',
        outputUrl: result.images?.[0] || result.imageUrl,
        timestamp: Date.now()
      }
      
      setGen4Generations(prev => [newGeneration, ...prev])
      
      // Save to unified gallery for cross-tab persistence
      if (newGeneration.outputUrl) {
        addImage({
          url: newGeneration.outputUrl,
          prompt: gen4Prompt,
          source: 'shot-creator',
          model: 'nano-banana',
          settings: {
            aspectRatio: gen4Settings.aspectRatio,
            resolution: gen4Settings.resolution,
            seed: gen4Settings.seed
          },
          creditsUsed: 15, // Updated cost for nano-banana
          tags: ['generated', 'gen4', 'nano-banana']
        })
      }
      
      const creditsMessage = result.creditsUsed 
        ? `Used ${result.creditsUsed} credits. ${result.remainingCredits || 'Credits'} remaining.`
        : "Image generated successfully"
        
      toast({
        title: "Generation Complete",
        description: creditsMessage
      })
      
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Generation failed",
        variant: "destructive"
      })
    } finally {
      setGen4Processing(false)
    }
  }

  const canGenerate = !gen4Processing && gen4Prompt.trim() && gen4ReferenceImages.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Shot Creator
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Reference Images Management */}
      <Gen4ReferenceManager
        gen4ReferenceImages={gen4ReferenceImages}
        setGen4ReferenceImages={setGen4ReferenceImages}
      />

      {/* Prompt and Settings */}
      <Gen4PromptSettings
        gen4Prompt={gen4Prompt}
        setGen4Prompt={setGen4Prompt}
        gen4Settings={gen4Settings}
        setGen4Settings={setGen4Settings}
        gen4Processing={gen4Processing}
        onGenerate={handleGen4Generate}
        canGenerate={canGenerate}
        referenceImagesCount={gen4ReferenceImages.length}
      />

      {/* Reference Library */}
      <Gen4ReferenceLibrary
        libraryItems={libraryItems}
        libraryCategory={libraryCategory}
        setLibraryCategory={setLibraryCategory}
        libraryLoading={libraryLoading}
        onFullscreenImage={onFullscreenImage}
      />

      {/* Generation History */}
      <Gen4GenerationHistory
        gen4Generations={gen4Generations}
        setGen4Generations={setGen4Generations}
        onFullscreenImage={onFullscreenImage}
        onSendToWorkspace={onSendToWorkspace}
        onSendToImageEdit={onSendToImageEdit}
        generatedShotIds={generatedShotIds}
        onShotGenerated={onShotGenerated}
        shotList={shotList}
      />

      {/* Unified Image Gallery */}
      <UnifiedImageGallery
        currentTab="shot-creator"
        onSendToTab={(imageUrl, targetTab) => {
          if (targetTab === 'shot-editor' && onSendToImageEdit) {
            onSendToImageEdit(imageUrl)
          }
        }}
        onUseAsReference={(imageUrl) => {
          toast({
            title: "Added as Reference",
            description: "Image added to reference slots"
          })
        }}
        className="mt-6"
      />
    </div>
  )
}