'use client'

interface CachedImage {
  id: string
  blob: Blob
  originalUrl: string
  localUrl: string
  metadata: {
    prompt: string
    model: string
    source: 'shot-editor' | 'shot-creator' | 'shot-animator'
    settings: any
    creditsUsed: number
    tags: string[]
  }
  cachedAt: Date
  expiresAt: Date
  accessed: Date
}

class ImageCacheService {
  private dbName = 'directors-palette-image-cache'
  private storeName = 'cached_images'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('originalUrl', 'originalUrl', { unique: true })
          store.createIndex('source', 'metadata.source')
          store.createIndex('cachedAt', 'cachedAt')
        }
      }
    })
  }

  async downloadAndCacheImage(
    replicateUrl: string, 
    metadata: CachedImage['metadata']
  ): Promise<string> {
    try {
      // Download image from Replicate
      const response = await fetch(replicateUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // Create blob URL for immediate use
      const localUrl = URL.createObjectURL(blob)
      
      // Cache in IndexedDB
      const cachedImage: CachedImage = {
        id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        blob,
        originalUrl: replicateUrl,
        localUrl,
        metadata,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        accessed: new Date()
      }
      
      await this.store(cachedImage)
      
      console.log('✅ Image cached successfully:', {
        id: cachedImage.id,
        size: blob.size,
        type: blob.type,
        source: metadata.source
      })
      
      return localUrl
    } catch (error) {
      console.error('❌ Failed to cache image:', error)
      // Fallback to original URL if caching fails
      return replicateUrl
    }
  }

  private async store(image: CachedImage): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const request = store.put(image)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getCachedImage(originalUrl: string): Promise<CachedImage | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('originalUrl')
      
      const request = index.get(originalUrl)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          // Update access time
          result.accessed = new Date()
          this.store(result) // Update in background
        }
        resolve(result || null)
      }
    })
  }

  async getAllCachedImages(): Promise<CachedImage[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async deleteExpiredImages(): Promise<number> {
    if (!this.db) await this.init()
    
    const allImages = await this.getAllCachedImages()
    const now = new Date()
    let deletedCount = 0
    
    for (const image of allImages) {
      if (image.expiresAt < now) {
        // Revoke blob URL to free memory
        URL.revokeObjectURL(image.localUrl)
        await this.delete(image.id)
        deletedCount++
      }
    }
    
    console.log(`🧹 Cleaned up ${deletedCount} expired images`)
    return deletedCount
  }

  private async delete(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const request = store.delete(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getStorageUsage(): Promise<{ used: number; available: number }> {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      }
    } catch {
      return { used: 0, available: 0 }
    }
  }

  async monitorStorage(): Promise<{ 
    totalImages: number; 
    totalSize: number; 
    usage: { used: number; available: number } 
  }> {
    const images = await this.getAllCachedImages()
    const totalSize = images.reduce((sum, img) => sum + img.blob.size, 0)
    const usage = await this.getStorageUsage()
    
    return {
      totalImages: images.length,
      totalSize,
      usage
    }
  }

  // Automatic cleanup on startup
  async performMaintenance(): Promise<void> {
    console.log('🔧 Starting IndexedDB maintenance...')
    
    // Delete expired images
    await this.deleteExpiredImages()
    
    // Log storage status
    const status = await this.monitorStorage()
    console.log('📊 Storage Status:', {
      images: status.totalImages,
      size: `${(status.totalSize / 1024 / 1024).toFixed(2)} MB`,
      used: `${(status.usage.used / 1024 / 1024).toFixed(2)} MB`,
      available: `${(status.usage.available / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// Singleton instance
export const imageCacheService = new ImageCacheService()

// Auto-initialize and perform maintenance on import
if (typeof window !== 'undefined') {
  imageCacheService.performMaintenance()
}