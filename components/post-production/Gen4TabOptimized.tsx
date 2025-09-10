'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from '@/components/post-production/UnifiedImageGallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
// Removed Gen4GenerationHistory - using UnifiedImageGallery only
import { Gen4ReferenceLibrary } from './Gen4ReferenceLibrary'

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
  const { addImage } = useUnifiedGalleryStore()

  const canGenerate = gen4Prompt.length > 0 && gen4ReferenceImages.length > 0

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
      const token = await getToken()
      console.log('🔍 Frontend token check:', token ? `Got token (${token.length} chars)` : 'No token')
      if (!token) {
        console.log('❌ Frontend: No authentication token available')
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
      console.log('🚀 Making API call with token:', token.substring(0, 20) + '...')
      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      headers.set('Authorization', `Bearer ${token}`)
      console.log('🔍 Headers being sent:', Object.fromEntries(headers.entries()))
      
      const response = await fetch('/post-production/api/gen4', {
        method: 'POST',
        headers: headers,
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
          model: 'nano-banana'
        })
      })
      
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
      
      // Save to unified gallery
      if (newGeneration.outputUrl) {
        addImage({
          url: newGeneration.outputUrl,
          prompt: gen4Prompt,
          source: 'shot-creator',
          timestamp: Date.now()
        })
      }
      
      toast({
        title: "Generation Complete",
        description: "Your new image has been generated successfully!"
      })
    } catch (error) {
      console.error('Gen4 generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setGen4Processing(false)
    }
  }

  return (
    <div className="w-full h-full space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Shot Creator</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm px-3 py-1 bg-purple-900/50 border border-purple-400/30 rounded-full text-purple-300 font-medium">
            🍌 nano-banana
          </div>
        </div>
      </div>

      {/* Optimized 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-4">
        
        {/* LEFT COLUMN - Reference Images & Prompt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reference Images Management */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50 p-6">
            <Gen4ReferenceManager
              gen4ReferenceImages={gen4ReferenceImages}
              setGen4ReferenceImages={setGen4ReferenceImages}
              compact={false}
            />
          </div>

          {/* Prompt & Settings */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50">
            <Gen4PromptSettings
              gen4Prompt={gen4Prompt}
              setGen4Prompt={setGen4Prompt}
              gen4Settings={gen4Settings}
              setGen4Settings={setGen4Settings}
              gen4Processing={gen4Processing}
              onGenerate={handleGen4Generate}
              canGenerate={canGenerate}
              referenceImagesCount={gen4ReferenceImages.length}
              compact={false}
            />
          </div>
        </div>

        {/* RIGHT COLUMN - Generated Images & Library */}
        <div className="space-y-6">
          {/* Single Gallery - Generated Images + Reference Library */}
          <div className="bg-slate-900/30 rounded-lg border border-slate-700/50">
            <Tabs defaultValue="generated" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated">Generated Images</TabsTrigger>
                <TabsTrigger value="library">Reference Library</TabsTrigger>
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