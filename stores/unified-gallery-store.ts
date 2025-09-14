import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  source: 'shot-editor' | 'shot-creator' | 'shot-animator'
  originalImage?: string // For edited images, store the original
  editInstructions?: string // For edited images, store the instructions used
  model: string
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
}

interface UnifiedGalleryState {
  images: GeneratedImage[]
  selectedImage: string | null
  fullscreenImage: GeneratedImage | null
  
  // Actions
  addImage: (image: Omit<GeneratedImage, 'id' | 'metadata'> & { creditsUsed: number }) => void
  removeImage: (imageId: string) => void
  setSelectedImage: (imageId: string | null) => void
  setFullscreenImage: (image: GeneratedImage | null) => void
  clearAllImages: () => void
  
  // Filtering
  getImagesBySource: (source: GeneratedImage['source']) => GeneratedImage[]
  getImagesByTag: (tag: string) => GeneratedImage[]
  
  // Utilities
  getTotalImages: () => number
  getTotalCreditsUsed: () => number
}

export const useUnifiedGalleryStore = create<UnifiedGalleryState>()(
  persist(
    (set, get) => ({
      images: [],
      selectedImage: null,
      fullscreenImage: null,
      
      addImage: (imageData) => {
        const newImage: GeneratedImage = {
          ...imageData,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            createdAt: new Date().toISOString(),
            creditsUsed: imageData.creditsUsed,
            processingTime: imageData.metadata?.processingTime
          }
        }
        
        set((state) => ({
          images: [newImage, ...state.images] // Add to beginning for newest first
        }))
      },
      
      removeImage: (imageId) => {
        set((state) => ({
          images: state.images.filter(img => img.id !== imageId),
          selectedImage: state.selectedImage === imageId ? null : state.selectedImage,
          fullscreenImage: state.fullscreenImage?.id === imageId ? null : state.fullscreenImage
        }))
      },
      
      setSelectedImage: (imageId) => {
        set({ selectedImage: imageId })
      },
      
      setFullscreenImage: (image) => {
        set({ fullscreenImage: image })
      },
      
      clearAllImages: () => {
        set({ images: [], selectedImage: null, fullscreenImage: null })
      },
      
      getImagesBySource: (source) => {
        return get().images.filter(img => img.source === source)
      },
      
      getImagesByTag: (tag) => {
        return get().images.filter(img => img.tags.includes(tag))
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