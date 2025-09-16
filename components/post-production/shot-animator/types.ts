// Shot Animator Types and Constants

export interface SeeeDanceModel {
  id: 'seedance-lite' | 'seedance-pro'
  name: string
  description: string
  icon: string
  maxResolution: string
  creditsPerSecond: number
  features: string[]
  apiProvider: 'replicate' | 'aiml'
  endpoint: string
}

export interface VideoGeneration {
  id: string
  prompt: string
  model: 'seedance-lite' | 'seedance-pro'
  resolution: string
  duration: number
  aspectRatio: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
  startTime?: Date
  endTime?: Date
  creditsUsed?: number
  referenceImages?: string[]
  seed?: number
}

export interface ShotAnimatorTabProps {
  className?: string
  galleryMode?: 'minimal' | 'full'
  onImageSelect?: (imageUrl: string) => void
  referenceImages?: string[]
  onReferenceImagesChange?: (images: string[]) => void
  seed?: number
  onSeedChange?: (seed: number) => void
  lastFrameImages?: string[]
}

export interface VideoSettings {
  prompt: string
  model: 'seedance-lite' | 'seedance-pro'
  resolution: string
  duration: number
  aspectRatio: string
  seed: number
  motionIntensity: number
}