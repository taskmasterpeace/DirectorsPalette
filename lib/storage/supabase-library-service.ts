'use client'

import { supabase } from '@/lib/supabase'

interface LibraryImage {
  id: string
  user_id: string
  storage_path: string
  public_url: string
  metadata: {
    prompt: string
    model: string
    source: string
    settings: any
    tags: string[]
    originalUrl?: string
  }
  created_at: string
  updated_at: string
}

export class SupabaseLibraryService {
  private bucketName = 'user-generated-images'

  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName)
      
      if (!bucketExists) {
        // Create bucket with public access
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        })
        
        if (error) {
          console.error('Failed to create storage bucket:', error)
          return
        }
        
        console.log('✅ Created user-generated-images bucket')
      }
    } catch (error) {
      console.error('Bucket initialization failed:', error)
    }
  }

  async saveImageToLibrary(
    imageBlob: Blob,
    userId: string,
    metadata: LibraryImage['metadata']
  ): Promise<{ success: boolean; libraryImage?: LibraryImage; error?: string }> {
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fileName = `${imageId}.${this.getFileExtension(imageBlob.type)}`
      const filePath = `users/${userId}/${fileName}`
      
      // Upload blob to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, imageBlob, {
          contentType: imageBlob.type,
          upsert: false,
          cacheControl: '86400' // 24 hours cache
        })
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)
      
      // Save metadata to database
      const libraryImage: Omit<LibraryImage, 'created_at' | 'updated_at'> = {
        id: imageId,
        user_id: userId,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        metadata
      }
      
      const { data, error: dbError } = await supabase
        .from('user_image_library')
        .insert([libraryImage])
        .select()
        .single()
      
      if (dbError) {
        // Clean up uploaded file if database save fails
        await supabase.storage.from(this.bucketName).remove([filePath])
        throw new Error(`Database save failed: ${dbError.message}`)
      }
      
      console.log('✅ Image saved to permanent library:', {
        id: imageId,
        size: imageBlob.size,
        url: urlData.publicUrl
      })
      
      return { success: true, libraryImage: data }
      
    } catch (error) {
      console.error('❌ Failed to save to library:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getUserLibrary(userId: string): Promise<LibraryImage[]> {
    try {
      const { data, error } = await supabase
        .from('user_image_library')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw new Error(`Failed to fetch library: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch user library:', error)
      return []
    }
  }

  async deleteFromLibrary(userId: string, imageId: string): Promise<boolean> {
    try {
      // Get image details first
      const { data: image } = await supabase
        .from('user_image_library')
        .select('storage_path')
        .eq('id', imageId)
        .eq('user_id', userId)
        .single()
      
      if (!image) {
        throw new Error('Image not found')
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([image.storage_path])
      
      if (storageError) {
        console.warn('Storage deletion failed:', storageError)
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('user_image_library')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId)
      
      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`)
      }
      
      console.log('🗑️ Image deleted from library:', imageId)
      return true
      
    } catch (error) {
      console.error('❌ Failed to delete from library:', error)
      return false
    }
  }

  private getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg': return 'jpg'
      case 'image/png': return 'png'
      case 'image/webp': return 'webp'
      case 'image/gif': return 'gif'
      default: return 'jpg'
    }
  }

  async getStorageUsage(userId: string): Promise<{
    imageCount: number;
    totalSize: number;
    storageUsed: number;
  }> {
    try {
      const library = await this.getUserLibrary(userId)
      
      // Get storage usage for user folder
      const { data: files } = await supabase.storage
        .from(this.bucketName)
        .list(`users/${userId}`)
      
      const totalSize = files?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0
      
      return {
        imageCount: library.length,
        totalSize,
        storageUsed: totalSize
      }
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return { imageCount: 0, totalSize: 0, storageUsed: 0 }
    }
  }
}

// Singleton instance
export const libraryService = new SupabaseLibraryService()

// Auto-initialize bucket
if (typeof window !== 'undefined') {
  libraryService.initializeBucket()
}