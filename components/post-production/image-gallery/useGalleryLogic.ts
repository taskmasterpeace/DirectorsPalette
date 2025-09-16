'use client'

import { useState, useMemo, useCallback } from 'react'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { useToast } from '@/components/ui/use-toast'
import { GalleryFilters, ViewMode } from './types'

export function useGalleryLogic(
  onSendToTab?: (imageUrl: string, targetTab: string) => void,
  onUseAsReference?: (imageUrl: string) => void,
  onSendToLibrary?: (imageUrl: string) => void,
  onImageSelect?: (imageUrl: string) => void
) {
  const { toast } = useToast()
  const {
    images,
    removeImage,
    setFullscreenImage,
    fullscreenImage,
    getTotalImages,
    getTotalCreditsUsed,
    getUniqueChains
  } = useUnifiedGalleryStore()

  // State
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [filters, setFilters] = useState<GalleryFilters>({
    searchQuery: '',
    currentPage: 1,
    viewMode: 'grid'
  })

  const IMAGES_PER_PAGE = 8

  // Get chain data
  const chains = useMemo(() => getUniqueChains(), [getUniqueChains])

  // Filter and pagination logic
  const { filteredImages, paginatedImages, totalPages, filteredChains } = useMemo(() => {
    if (filters.viewMode === 'chains') {
      // Chain view logic
      const filtered = filters.searchQuery.trim() === ''
        ? chains
        : chains.filter(chain =>
            chain.images.some(image =>
              image.prompt.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              image.chain?.stepPrompt.toLowerCase().includes(filters.searchQuery.toLowerCase())
            )
          )

      return {
        filteredImages: [],
        paginatedImages: [],
        totalPages: 1,
        filteredChains: filtered
      }
    } else {
      // Grid view logic
      const filtered = filters.searchQuery.trim() === ''
        ? images
        : images.filter(image =>
            image.prompt.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            image.model?.toLowerCase().includes(filters.searchQuery.toLowerCase())
          )

      const total = Math.ceil(filtered.length / IMAGES_PER_PAGE)
      const startIndex = (filters.currentPage - 1) * IMAGES_PER_PAGE
      const endIndex = startIndex + IMAGES_PER_PAGE
      const paginated = filtered.slice(startIndex, endIndex)

      return {
        filteredImages: filtered,
        paginatedImages: paginated,
        totalPages: total,
        filteredChains: []
      }
    }
  }, [images, chains, filters])

  // Handlers
  const handleImageSelect = useCallback((imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl)
    } else {
      setSelectedImages(prev =>
        prev.includes(imageUrl)
          ? prev.filter(url => url !== imageUrl)
          : [...prev, imageUrl]
      )
    }
  }, [onImageSelect])

  const handleClearSelection = () => {
    setSelectedImages([])
  }

  const handleDeleteSelected = () => {
    selectedImages.forEach(url => removeImage(url))
    setSelectedImages([])
    toast({
      title: "Images Deleted",
      description: `${selectedImages.length} images removed from gallery`
    })
  }

  const handleCopyImage = async (imageUrl: string) => {
    try {
      const image = images.find(img => img.url === imageUrl)
      if (image) {
        await navigator.clipboard.writeText(image.prompt)
        toast({
          title: "Prompt Copied",
          description: "Image prompt copied to clipboard"
        })
      }
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy prompt to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleDownloadImage = (imageUrl: string) => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `image_${Date.now()}.png`
    a.click()
  }

  const handleDeleteImage = (imageUrl: string) => {
    removeImage(imageUrl)
    setSelectedImages(prev => prev.filter(url => url !== imageUrl))
    toast({
      title: "Image Deleted",
      description: "Image removed from gallery"
    })
  }

  const handleSendTo = (imageUrl: string, target: string) => {
    if (onSendToTab) {
      onSendToTab(imageUrl, target)
    } else if (target === 'reference' && onUseAsReference) {
      onUseAsReference(imageUrl)
    } else if (target === 'library' && onSendToLibrary) {
      onSendToLibrary(imageUrl)
    }

    toast({
      title: "Image Sent",
      description: `Image sent to ${target}`
    })
  }

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query, currentPage: 1 }))
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setFilters(prev => ({ ...prev, viewMode: mode, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, currentPage: page }))
  }

  return {
    // Data
    images,
    filteredImages,
    paginatedImages,
    chains: filteredChains,
    totalPages,
    selectedImages,
    filters,
    fullscreenImage,

    // Stats
    totalImages: getTotalImages(),
    totalCredits: getTotalCreditsUsed(),

    // Handlers
    handleImageSelect,
    handleClearSelection,
    handleDeleteSelected,
    handleCopyImage,
    handleDownloadImage,
    handleDeleteImage,
    handleSendTo,
    handleSearchChange,
    handleViewModeChange,
    handlePageChange,
    setFullscreenImage
  }
}