// Image Gallery Types

export interface UnifiedImageGalleryProps {
  currentTab?: 'shot-creator' | 'shot-animator' | 'layout-annotation'
  mode?: 'minimal' | 'full'
  onSendToTab?: (imageUrl: string, targetTab: string) => void
  onUseAsReference?: (imageUrl: string) => void
  onSendToLibrary?: (imageUrl: string) => void
  onImageSelect?: (imageUrl: string) => void
  className?: string
}

export interface GalleryImage {
  url: string
  prompt: string
  timestamp: number
  model?: string
  creditsUsed?: number
  source?: string
  chain?: {
    chainId: string
    stepNumber: number
    stepPrompt: string
  }
}

export interface ImageChain {
  chainId: string
  images: GalleryImage[]
  totalCredits: number
  startTime: number
  endTime: number
}

export type ViewMode = 'grid' | 'chains'

export interface GalleryFilters {
  searchQuery: string
  currentPage: number
  viewMode: ViewMode
}