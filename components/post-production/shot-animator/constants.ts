// Shot Animator Constants
import { SeeeDanceModel } from './types'

export const SEEDANCE_MODELS: SeeeDanceModel[] = [
  {
    id: 'seedance-lite',
    name: 'SeeeDance Lite',
    description: 'Fast video generation - 480p/720p output',
    icon: '⚡',
    maxResolution: '720p',
    creditsPerSecond: 15,
    features: ['Text-to-Video', 'Image-to-Video', '720p Max', '24 FPS', '3-12 seconds'],
    apiProvider: 'replicate',
    endpoint: 'bytedance/seedance-1-lite'
  },
  {
    id: 'seedance-pro',
    name: 'SeeeDance Pro',
    description: 'Professional quality - 1080p cinematic output',
    icon: '🎬',
    maxResolution: '1080p',
    creditsPerSecond: 35,
    features: ['Text-to-Video', 'Image-to-Video', '1080p Max', 'Reference Images', 'Professional Quality'],
    apiProvider: 'replicate',
    endpoint: 'bytedance/seedance-1-pro'
  }
]

export const RESOLUTION_OPTIONS = [
  { value: '480p', label: '480p (Fast)', width: 720, height: 480, description: 'Quick generation' },
  { value: '720p', label: '720p (Standard)', width: 1280, height: 720, description: 'Balanced quality' },
  { value: '1080p', label: '1080p (Pro Only)', width: 1920, height: 1080, description: 'Professional quality' }
]

export const DURATION_OPTIONS = [
  { value: 3, label: '3 seconds', credits: 3 },
  { value: 5, label: '5 seconds', credits: 5 },
  { value: 10, label: '10 seconds', credits: 10 },
  { value: 12, label: '12 seconds', credits: 12 }
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