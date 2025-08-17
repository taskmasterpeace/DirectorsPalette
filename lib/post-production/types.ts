/**
 * Post Production Module Types
 * For integrating ImageMax image generation into Director's Palette
 */

export interface PostProductionShot {
  id: string
  projectId: string
  projectType: 'story' | 'music-video'
  shotNumber: number
  description: string // The complete shot description/prompt
  sourceChapter?: string // For stories
  sourceSection?: string // For music videos
  status: 'pending' | 'processing' | 'completed' | 'failed'
  generatedImages?: GeneratedImage[]
  metadata?: {
    directorStyle?: string
    timestamp?: string
    originalShotId?: string
  }
}

export interface GeneratedImage {
  id: string
  url: string
  model: string
  timestamp: Date
  downloadUrl?: string
  thumbnail?: string
}

export interface GenerationSettings {
  model: string // Replicate model ID
  numOutputs: number
  quality: 'draft' | 'standard' | 'high'
  aspectRatio?: string
  negativePrompt?: string
}

export interface PostProductionProject {
  id: string
  name: string
  shots: PostProductionShot[]
  createdAt: Date
  updatedAt: Date
}

export interface ReplicateJob {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
  logs?: string
  metrics?: {
    predict_time?: number
  }
}