/**
 * Image Persistence Utility
 * Downloads temporary URLs and saves to permanent Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ImageDownloadResult {
  success: boolean
  permanentUrl?: string
  storagePath?: string
  fileSize?: number
  error?: string
}

export interface ImageMetadata {
  prompt: string
  model: string
  source: 'shot-creator' | 'shot-editor' | 'shot-animator'
  settings: {
    aspectRatio: string
    resolution: string
    seed?: number
  }
  creditsUsed: number
  originalPrompt?: string
  variationIndex?: number
}

/**
 * Download image from URL and convert to blob
 */
export async function downloadImageAsBlob(imageUrl: string): Promise<{
  success: boolean
  blob?: Blob
  error?: string
}> {
  try {
    console.log('📥 Downloading image from:', imageUrl)

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Directors-Palette/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Validate it's actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error(`Invalid content type: ${blob.type}`)
    }

    console.log('✅ Image downloaded:', {
      size: blob.size,
      type: blob.type
    })

    return { success: true, blob }

  } catch (error) {
    console.error('❌ Image download failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    }
  }
}

/**
 * Save downloaded image to Supabase Storage
 */
export async function saveImageToStorage(
  imageBlob: Blob,
  userId: string,
  metadata: ImageMetadata
): Promise<ImageDownloadResult> {
  try {
    const bucketName = 'user-gallery-images'
    const imageId = crypto.randomUUID() // Generate proper PostgreSQL UUID
    const fileExtension = getFileExtension(imageBlob.type)
    const fileName = `${imageId}.${fileExtension}`
    const filePath = `users/${userId}/gallery/${fileName}`

    // Ensure bucket exists
    await ensureBucketExists(bucketName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type,
        upsert: false,
        cacheControl: '31536000' // 1 year cache
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Get permanent public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    // Save metadata to gallery database
    const { error: dbError } = await supabase
      .from('user_gallery_images')
      .insert([{
        id: imageId,
        user_id: userId,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        file_size: imageBlob.size,
        mime_type: imageBlob.type,
        metadata: {
          prompt: metadata.prompt,
          model: metadata.model,
          source: metadata.source,
          settings: metadata.settings,
          creditsUsed: metadata.creditsUsed,
          originalPrompt: metadata.originalPrompt,
          variationIndex: metadata.variationIndex,
          createdAt: new Date().toISOString()
        }
      }])

    if (dbError) {
      // Clean up uploaded file if database save fails
      await supabase.storage.from(bucketName).remove([filePath])
      throw new Error(`Database save failed: ${dbError.message}`)
    }

    console.log('✅ Image permanently saved:', {
      id: imageId,
      size: imageBlob.size,
      permanentUrl: urlData.publicUrl
    })

    return {
      success: true,
      permanentUrl: urlData.publicUrl,
      storagePath: filePath,
      fileSize: imageBlob.size
    }

  } catch (error) {
    console.error('❌ Failed to save image permanently:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Save failed'
    }
  }
}

/**
 * Download Replicate image and save to permanent storage
 */
export async function downloadAndSaveImage(
  replicateUrl: string,
  userId: string,
  metadata: ImageMetadata
): Promise<ImageDownloadResult> {
  try {
    // Step 1: Download from Replicate
    const downloadResult = await downloadImageAsBlob(replicateUrl)
    if (!downloadResult.success || !downloadResult.blob) {
      return {
        success: false,
        error: downloadResult.error || 'Download failed'
      }
    }

    // Step 2: Save to permanent storage
    const saveResult = await saveImageToStorage(downloadResult.blob, userId, metadata)
    return saveResult

  } catch (error) {
    console.error('❌ Download and save process failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Process failed'
    }
  }
}

/**
 * Ensure storage bucket exists
 */
async function ensureBucketExists(bucketName: string): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
      })

      if (error && !error.message.includes('already exists')) {
        throw error
      }

      console.log(`✅ Storage bucket '${bucketName}' ready`)
    }
  } catch (error) {
    console.error(`❌ Bucket setup failed for '${bucketName}':`, error)
    throw error
  }
}

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  }
  return extensions[mimeType] || 'jpg'
}

/**
 * Batch download and save multiple images
 */
export async function downloadAndSaveImages(
  images: Array<{ url: string; metadata: ImageMetadata }>,
  userId: string
): Promise<Array<ImageDownloadResult & { originalUrl: string }>> {
  console.log(`📥 Batch downloading ${images.length} images for user ${userId}`)

  const results = await Promise.allSettled(
    images.map(async (image) => {
      const result = await downloadAndSaveImage(image.url, userId, image.metadata)
      return { ...result, originalUrl: image.url }
    })
  )

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`❌ Failed to process image ${index}:`, result.reason)
      return {
        success: false,
        error: result.reason?.message || 'Unknown error',
        originalUrl: images[index].url
      }
    }
  })

  const successCount = processedResults.filter(r => r.success).length
  console.log(`✅ Batch download complete: ${successCount}/${images.length} images saved permanently`)

  return processedResults
}

/**
 * Clean up expired temporary URLs from gallery store
 */
export async function cleanupExpiredImages(userId: string): Promise<void> {
  try {
    // This would check for any remaining temporary URLs in the gallery
    // and attempt to replace them with permanent storage if possible
    console.log('🧹 Cleaning up expired gallery images for user:', userId)

    // Implementation would go here to migrate any remaining temporary URLs

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}