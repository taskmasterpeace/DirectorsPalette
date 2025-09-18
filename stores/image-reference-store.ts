import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface ImageReferenceCategory {
  id: string
  name: string
  icon: string
  color: string
  order: number
  isEditable: boolean
}

export interface SavedImageReference {
  id: string
  userId: string
  name: string
  url: string
  categoryId: string
  tags: string[]
  isQuickAccess: boolean
  reference?: string // @reference tag for easy access
  usage: {
    count: number
    lastUsed: string
  }
  metadata: {
    fileSize?: number
    dimensions?: {
      width: number
      height: number
    }
    format?: string
    source?: string
    createdAt: string
    updatedAt: string
  }
}

interface ImageReferenceState {
  // Data
  images: SavedImageReference[]
  categories: ImageReferenceCategory[]
  quickImages: SavedImageReference[]
  searchQuery: string
  selectedCategory: string | null
  selectedImage: SavedImageReference | null
  isLoading: boolean
  error: string | null
  uploadProgress: number | null

  // Actions - Categories
  addCategory: (category: Omit<ImageReferenceCategory, 'id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<ImageReferenceCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Actions - Images
  addImage: (image: Omit<SavedImageReference, 'id' | 'userId' | 'usage' | 'metadata'>) => Promise<void>
  updateImage: (id: string, updates: Partial<SavedImageReference>) => Promise<void>
  deleteImage: (id: string) => Promise<void>
  toggleQuickAccess: (id: string) => Promise<void>
  uploadImage: (file: File, imageData: Omit<SavedImageReference, 'id' | 'userId' | 'url' | 'usage' | 'metadata'>) => Promise<void>

  // Actions - Search & Filter
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedImage: (image: SavedImageReference | null) => void

  // Actions - Data Management
  loadUserImages: (userId: string) => Promise<void>
  saveToSupabase: (userId: string) => Promise<void>

  // Computed
  getFilteredImages: () => SavedImageReference[]
  getImagesByCategory: (categoryId: string) => SavedImageReference[]
  getImageByReference: (reference: string) => SavedImageReference | undefined
  getAllReferences: () => string[]
}

// Default categories for image references
const DEFAULT_CATEGORIES: ImageReferenceCategory[] = [
  { id: 'characters', name: 'Characters', icon: '👤', color: 'purple', order: 1, isEditable: false },
  { id: 'locations', name: 'Locations', icon: '🏞️', color: 'blue', order: 2, isEditable: false },
  { id: 'props', name: 'Props', icon: '🎭', color: 'green', order: 3, isEditable: false },
  { id: 'costumes', name: 'Costumes', icon: '👕', color: 'pink', order: 4, isEditable: false },
  { id: 'lighting', name: 'Lighting', icon: '💡', color: 'yellow', order: 5, isEditable: false },
  { id: 'mood', name: 'Mood/Atmosphere', icon: '🌙', color: 'indigo', order: 6, isEditable: false },
  { id: 'custom', name: 'Custom', icon: '📁', color: 'gray', order: 99, isEditable: false }
]

export const useImageReferenceStore = create<ImageReferenceState>()(
  persist(
    (set, get) => ({
      images: [],
      categories: DEFAULT_CATEGORIES,
      quickImages: [],
      searchQuery: '',
      selectedCategory: null,
      selectedImage: null,
      isLoading: false,
      error: null,
      uploadProgress: null,

      // Categories
      addCategory: async (category) => {
        const newCategory: ImageReferenceCategory = {
          ...category,
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isEditable: true
        }

        set(state => ({
          categories: [...state.categories, newCategory]
        }))

        await get().saveToSupabase(await getCurrentUserId())
      },

      updateCategory: async (id, updates) => {
        set(state => ({
          categories: state.categories.map(cat =>
            cat.id === id && cat.isEditable ? { ...cat, ...updates } : cat
          )
        }))

        await get().saveToSupabase(await getCurrentUserId())
      },

      deleteCategory: async (id) => {
        const category = get().categories.find(c => c.id === id)
        if (!category?.isEditable) return

        // Move images to 'custom' category
        set(state => ({
          categories: state.categories.filter(cat => cat.id !== id),
          images: state.images.map(image =>
            image.categoryId === id ? { ...image, categoryId: 'custom' } : image
          )
        }))

        await get().saveToSupabase(await getCurrentUserId())
      },

      // Images
      addImage: async (imageData) => {
        const userId = await getCurrentUserId()
        if (!userId) {
          set({ error: 'User not authenticated' })
          return
        }

        const newImage: SavedImageReference = {
          ...imageData,
          id: `img_ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          reference: imageData.reference || `@img_${Date.now()}`,
          usage: {
            count: 0,
            lastUsed: new Date().toISOString()
          },
          metadata: {
            ...imageData.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }

        set(state => {
          const updatedImages = [...state.images, newImage]
          const quickImages = newImage.isQuickAccess
            ? [...state.quickImages, newImage]
            : state.quickImages

          return {
            images: updatedImages,
            quickImages
          }
        })

        await get().saveToSupabase(userId)
      },

      updateImage: async (id, updates) => {
        set(state => {
          const updatedImages = state.images.map(image =>
            image.id === id
              ? {
                  ...image,
                  ...updates,
                  metadata: {
                    ...image.metadata,
                    updatedAt: new Date().toISOString()
                  }
                }
              : image
          )

          const quickImages = updatedImages.filter(img => img.isQuickAccess)

          return {
            images: updatedImages,
            quickImages
          }
        })

        await get().saveToSupabase(await getCurrentUserId())
      },

      deleteImage: async (id) => {
        const imageToDelete = get().images.find(img => img.id === id)

        // Delete from Supabase Storage if it exists
        if (imageToDelete && supabase) {
          try {
            // Extract storage path from URL if it's a Supabase storage URL
            const urlParts = imageToDelete.url.split('/')
            if (urlParts.includes('storage') && urlParts.includes('v1')) {
              const pathIndex = urlParts.findIndex(part => part === 'object') + 2
              const storagePath = urlParts.slice(pathIndex).join('/')

              await supabase.storage
                .from('image-references')
                .remove([storagePath])
            }
          } catch (error) {
            console.error('Failed to delete image from storage:', error)
          }
        }

        set(state => ({
          images: state.images.filter(image => image.id !== id),
          quickImages: state.quickImages.filter(image => image.id !== id)
        }))

        await get().saveToSupabase(await getCurrentUserId())
      },

      toggleQuickAccess: async (id) => {
        set(state => {
          const updatedImages = state.images.map(image =>
            image.id === id
              ? { ...image, isQuickAccess: !image.isQuickAccess }
              : image
          )

          const quickImages = updatedImages.filter(img => img.isQuickAccess)

          return {
            images: updatedImages,
            quickImages
          }
        })

        await get().saveToSupabase(await getCurrentUserId())
      },

      uploadImage: async (file, imageData) => {
        const userId = await getCurrentUserId()
        if (!userId || !supabase) {
          set({ error: 'User not authenticated or Supabase not available' })
          return
        }

        set({ uploadProgress: 0, error: null })

        try {
          // Create unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('image-references')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) throw uploadError

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('image-references')
            .getPublicUrl(fileName)

          set({ uploadProgress: 80 })

          // Get image dimensions
          const dimensions = await getImageDimensions(file)

          // Add image to store
          await get().addImage({
            ...imageData,
            url: urlData.publicUrl,
            metadata: {
              fileSize: file.size,
              dimensions,
              format: file.type,
              source: 'user_upload'
            }
          })

          set({ uploadProgress: 100 })

          // Clear progress after a delay
          setTimeout(() => set({ uploadProgress: null }), 1000)

        } catch (error) {
          console.error('Upload failed:', error)
          set({
            error: error instanceof Error ? error.message : 'Upload failed',
            uploadProgress: null
          })
        }
      },

      // Search & Filter
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
      setSelectedImage: (image) => set({ selectedImage: image }),

      // Data Management
      loadUserImages: async (userId) => {
        set({ isLoading: true, error: null })

        try {
          if (!supabase) {
            set({ isLoading: false })
            return
          }

          // Load images from Supabase
          const { data: imagesData, error: imagesError } = await supabase
            .from('user_image_references')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (imagesError) throw imagesError

          // Load custom categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('user_image_reference_categories')
            .select('*')
            .eq('user_id', userId)
            .order('order', { ascending: true })

          if (categoriesError) throw categoriesError

          const images = imagesData || []
          const quickImages = images.filter(img => img.is_quick_access)
          const customCategories = categoriesData || []

          set({
            images: images.map(img => ({
              id: img.id,
              userId: img.user_id,
              name: img.name,
              url: img.url,
              categoryId: img.category_id,
              tags: img.tags || [],
              isQuickAccess: img.is_quick_access,
              reference: img.reference,
              usage: {
                count: img.usage_count || 0,
                lastUsed: img.last_used || img.created_at
              },
              metadata: {
                fileSize: img.file_size,
                dimensions: img.dimensions,
                format: img.format,
                source: img.source,
                createdAt: img.created_at,
                updatedAt: img.updated_at
              }
            })),
            quickImages: quickImages.map(img => ({
              id: img.id,
              userId: img.user_id,
              name: img.name,
              url: img.url,
              categoryId: img.category_id,
              tags: img.tags || [],
              isQuickAccess: img.is_quick_access,
              reference: img.reference,
              usage: {
                count: img.usage_count || 0,
                lastUsed: img.last_used || img.created_at
              },
              metadata: {
                fileSize: img.file_size,
                dimensions: img.dimensions,
                format: img.format,
                source: img.source,
                createdAt: img.created_at,
                updatedAt: img.updated_at
              }
            })),
            categories: [
              ...DEFAULT_CATEGORIES,
              ...customCategories.map(c => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                color: c.color,
                order: c.order,
                isEditable: true
              }))
            ],
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to load image references:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load image references',
            isLoading: false
          })
        }
      },

      saveToSupabase: async (userId) => {
        if (!supabase || !userId) return

        try {
          const state = get()

          // Save images
          const imagesToSave = state.images.map(img => ({
            id: img.id,
            user_id: userId,
            name: img.name,
            url: img.url,
            category_id: img.categoryId,
            tags: img.tags,
            is_quick_access: img.isQuickAccess,
            reference: img.reference,
            usage_count: img.usage.count,
            last_used: img.usage.lastUsed,
            file_size: img.metadata.fileSize,
            dimensions: img.metadata.dimensions,
            format: img.metadata.format,
            source: img.metadata.source,
            created_at: img.metadata.createdAt,
            updated_at: img.metadata.updatedAt
          }))

          const { error: imagesError } = await supabase
            .from('user_image_references')
            .upsert(imagesToSave, { onConflict: 'id' })

          if (imagesError) throw imagesError

          // Save custom categories
          const customCategories = state.categories.filter(c => c.isEditable)
          if (customCategories.length > 0) {
            const categoriesToSave = customCategories.map(c => ({
              id: c.id,
              user_id: userId,
              name: c.name,
              icon: c.icon,
              color: c.color,
              order: c.order
            }))

            const { error: categoriesError } = await supabase
              .from('user_image_reference_categories')
              .upsert(categoriesToSave, { onConflict: 'id' })

            if (categoriesError) throw categoriesError
          }
        } catch (error) {
          console.error('Failed to save to Supabase:', error)
        }
      },

      // Computed
      getFilteredImages: () => {
        const state = get()
        let filtered = state.images

        // Filter by category
        if (state.selectedCategory) {
          filtered = filtered.filter(img => img.categoryId === state.selectedCategory)
        }

        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(img =>
            img.name.toLowerCase().includes(query) ||
            img.tags.some(tag => tag.toLowerCase().includes(query)) ||
            img.reference?.toLowerCase().includes(query)
          )
        }

        return filtered
      },

      getImagesByCategory: (categoryId) => {
        return get().images.filter(img => img.categoryId === categoryId)
      },

      getImageByReference: (reference) => {
        return get().images.find(img => img.reference === reference)
      },

      getAllReferences: () => {
        return get().images
          .map(img => img.reference)
          .filter((ref): ref is string => ref !== undefined)
      }
    }),
    {
      name: 'image-reference-storage',
      partialize: (state) => ({
        images: state.images,
        categories: state.categories,
        quickImages: state.quickImages
      })
    }
  )
)

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  if (!supabase) return ''
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || ''
}

// Helper to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
}