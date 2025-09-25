import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GeneratedImage {
  id: string
  url: string // Now stores permanent Supabase Storage URL
  prompt: string
  source: 'shot-creator' | 'shot-animator' | 'layout-annotation'
  originalImage?: string // For edited images, store the original
  editInstructions?: string // For edited images, store the instructions used
  model: string
  reference?: string // NEW: @reference tag for easier referencing (e.g. "@hero", "@villain")
  settings: {
    aspectRatio: string
    resolution: string
    seed?: number
  }
  metadata: {
    createdAt: string
    creditsUsed: number
    processingTime?: number
  }
  tags: string[]

  // NEW: Chain metadata for pipeline generation
  chain?: {
    chainId: string
    stepNumber: number
    totalSteps: number
    stepPrompt: string
    isFinal: boolean
  }

  // NEW: Persistence metadata
  persistence: {
    isPermanent: boolean // True if stored in Supabase Storage
    temporaryUrl?: string // Original Replicate URL for reference
    storagePath?: string // Supabase Storage path
    fileSize?: number // File size in bytes
    downloadedAt?: string // When image was downloaded and saved
    error?: string // Any persistence errors
  }
}

interface UnifiedGalleryState {
  images: GeneratedImage[]
  recentImages: GeneratedImage[]
  selectedImage: string | null
  fullscreenImage: GeneratedImage | null

  // Actions
  addImage: (image: Omit<GeneratedImage, 'id' | 'metadata'> & {
    creditsUsed: number
    isPermanent?: boolean
    temporaryUrl?: string
    storagePath?: string
    fileSize?: number
    error?: string
  }) => void
  removeImage: (imageIdOrUrl: string) => void
  setSelectedImage: (imageId: string | null) => void
  setFullscreenImage: (image: GeneratedImage | null) => void
  clearAllImages: () => void
  updateImageReference: (imageId: string, reference: string) => void

  // Filtering
  getImagesBySource: (source: GeneratedImage['source']) => GeneratedImage[]
  getImagesByTag: (tag: string) => GeneratedImage[]
  getChainImages: (chainId: string) => GeneratedImage[]
  getUniqueChains: () => Array<{chainId: string; totalSteps: number; images: GeneratedImage[]}>
  getImageByReference: (reference: string) => GeneratedImage | undefined
  getAllReferences: () => string[]

  // Utilities
  getTotalImages: () => number
  getTotalCreditsUsed: () => number
}

export const useUnifiedGalleryStore = create<UnifiedGalleryState>()(
  persist(
    (set, get) => ({
      images: [],
      recentImages: [],
      selectedImage: null,
      fullscreenImage: null,
      
      addImage: (imageData) => {
        const newImage: GeneratedImage = {
          ...imageData,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            createdAt: new Date().toISOString(),
            creditsUsed: imageData.creditsUsed,
            processingTime: (imageData as any).processingTime
          },
          persistence: {
            isPermanent: imageData.isPermanent ?? false,
            temporaryUrl: imageData.temporaryUrl,
            storagePath: imageData.storagePath,
            fileSize: imageData.fileSize,
            downloadedAt: imageData.isPermanent ? new Date().toISOString() : undefined,
            error: imageData.error
          }
        }

        set((state) => ({
          images: [newImage, ...state.images],
          recentImages: [newImage, ...state.recentImages.slice(0, 9)]
        }))

        // Log persistence status for monitoring
        if (newImage.persistence.isPermanent) {
          console.log('✅ Gallery: Added permanently stored image', {
            id: newImage.id,
            url: newImage.url,
            size: newImage.persistence.fileSize
          });
        } else {
          console.warn('⚠️ Gallery: Added temporary image (will expire)', {
            id: newImage.id,
            temporaryUrl: newImage.url,
            error: newImage.persistence.error
          });
        }
      },
      
      removeImage: (imageIdOrUrl) => {
        set((state) => ({
          images: state.images.filter(img =>
            img.id !== imageIdOrUrl && img.url !== imageIdOrUrl
          ),
          selectedImage: state.selectedImage === imageIdOrUrl ? null : state.selectedImage,
          fullscreenImage: (state.fullscreenImage?.id === imageIdOrUrl || state.fullscreenImage?.url === imageIdOrUrl) ? null : state.fullscreenImage,
          recentImages: state.recentImages.filter(img => img.id !== imageIdOrUrl && img.url !== imageIdOrUrl)
        }))
      },
      
      setSelectedImage: (imageId) => {
        set({ selectedImage: imageId })
      },
      
      setFullscreenImage: (image) => {
        set({ fullscreenImage: image })
      },
      
      clearAllImages: () => {
        set({ images: [], selectedImage: null, fullscreenImage: null, recentImages: [] })
      },

      updateImageReference: (imageId, reference) => {
        set((state) => ({
          images: state.images.map(img =>
            img.id === imageId
              ? { ...img, reference: reference.startsWith('@') ? reference : `@${reference}` }
              : img
          )
        }))
      },

      getImagesBySource: (source) => {
        return get().images.filter(img => img.source === source)
      },

      getImagesByTag: (tag) => {
        return get().images.filter(img => img.tags.includes(tag))
      },

      getChainImages: (chainId) => {
        return get().images
          .filter(img => img.chain?.chainId === chainId)
          .sort((a, b) => (a.chain?.stepNumber || 0) - (b.chain?.stepNumber || 0))
      },

      getUniqueChains: () => {
        const chains = new Map<string, {chainId: string; totalSteps: number; images: GeneratedImage[]}>()

        get().images.forEach(img => {
          if (img.chain) {
            if (!chains.has(img.chain.chainId)) {
              chains.set(img.chain.chainId, {
                chainId: img.chain.chainId,
                totalSteps: img.chain.totalSteps,
                images: []
              })
            }
            chains.get(img.chain.chainId)!.images.push(img)
          }
        })

        // Sort images within each chain by step number
        chains.forEach(chain => {
          chain.images.sort((a, b) => (a.chain?.stepNumber || 0) - (b.chain?.stepNumber || 0))
        })

        return Array.from(chains.values()).sort((a, b) => {
          // Sort chains by the creation time of their first image
          const aFirstImage = a.images[0]
          const bFirstImage = b.images[0]
          return new Date(bFirstImage.metadata.createdAt).getTime() - new Date(aFirstImage.metadata.createdAt).getTime()
        })
      },

      getImageByReference: (reference) => {
        const searchRef = reference.startsWith('@') ? reference : `@${reference}`
        return get().images.find(img => img.reference === searchRef)
      },

      getAllReferences: () => {
        const refs = get().images
          .filter(img => img.reference)
          .map(img => img.reference!)
        return [...new Set(refs)] // Return unique references
      },

      getTotalImages: () => {
        return get().images.length
      },

      getTotalCreditsUsed: () => {
        return get().images.reduce((total, img) => total + img.metadata.creditsUsed, 0)
      }
    }),
    {
      name: 'unified-gallery-storage',
      version: 1
    }
  )
)