/**
 * Shot Animator Types and Interfaces
 * Type definitions for the rebuilt Shot Animator system
 */

export interface SeeeDanceModel {
  id: 'seedance-lite' | 'seedance-pro'
  name: string
  description: string
  icon: string
  maxResolution: string
  creditsPerSecond: number
  features: string[]
  apiProvider: 'replicate'
  endpoint: string
}

export interface VideoGeneration {
  id: string
  prompt: string
  model: string
  duration: number
  resolution: string
  aspectRatio: string
  inputImage?: string
  lastFrameImage?: string
  referenceImages?: string[]
  seed?: number
  videoUrl?: string
  status: 'generating' | 'completed' | 'failed'
  progress: number
  creditsUsed: number
  createdAt: string
  error?: string
}

export interface ImageUpload {
  id: string
  file: File
  preview: string
  type: 'start_frame' | 'final_frame' | 'reference'
  uploaded: Date
}

export interface BatchAnimationJob {
  id: string
  images: ImageUpload[]
  prompt: string
  settings: {
    duration: number
    resolution: string
    aspectRatio: string
    cameraFixed: boolean
    seed?: number
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  completedVideos: VideoGeneration[]
  totalCredits: number
  createdAt: string
}

// Export the constants
export const SEEDANCE_MODELS: SeeeDanceModel[] = [
  {
    id: 'seedance-lite',
    name: 'SeeeDance Lite',
    description: 'Fast video generation with 720p max output',
    icon: '⚡',
    maxResolution: '720p',
    creditsPerSecond: 15,
    features: ['Text-to-Video', 'Image-to-Video', 'Final Frame Control', '720p Max', '24 FPS', '3-12 seconds'],
    apiProvider: 'replicate',
    endpoint: 'bytedance/seedance-1-lite'
  }
]

export const DURATION_OPTIONS = [
  { value: 3, label: '3 seconds', credits: 45 },
  { value: 5, label: '5 seconds', credits: 75 },
  { value: 10, label: '10 seconds', credits: 150 },
  { value: 12, label: '12 seconds', credits: 180 }
]

export const RESOLUTION_OPTIONS = [
  { value: '480p', label: '480p (Fast)', description: 'Quick generation, lower quality' },
  { value: '720p', label: '720p (Standard)', description: 'Balanced quality and speed' }
]

export const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 Landscape', description: 'Standard widescreen' },
  { value: '9:16', label: '9:16 Portrait', description: 'Mobile/TikTok/Vertical' },
  { value: '1:1', label: '1:1 Square', description: 'Instagram/Social' },
  { value: '4:3', label: '4:3 Traditional', description: 'Classic TV' },
  { value: '3:4', label: '3:4 Portrait', description: 'Tall portrait' },
  { value: '21:9', label: '21:9 Cinematic', description: 'Ultra-wide cinema' },
  { value: '9:21', label: '9:21 Ultra Portrait', description: 'Extreme vertical' }
]