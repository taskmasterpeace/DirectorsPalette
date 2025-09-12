/**
 * Model Configuration System
 * Defines capabilities and parameters for each AI model in Shot Creator
 */

export type ModelType = 'generation' | 'editing'
export type ModelId = 'nano-banana' | 'seedream-4' | 'gen4-image' | 'gen4-image-turbo' | 'qwen-image-edit'

export interface ModelParameter {
  id: string
  label: string
  type: 'select' | 'number' | 'boolean' | 'slider'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  default?: any
  description?: string
}

export interface ModelConfig {
  id: ModelId
  name: string
  displayName: string
  type: ModelType
  icon: string
  description: string
  badge: string
  badgeColor: string
  textColor: string
  endpoint: string
  costPerImage: number
  supportedParameters: string[]
  parameters: Record<string, ModelParameter>
  maxReferenceImages?: number
  requiresInputImage?: boolean
}

export const MODEL_PARAMETERS: Record<string, ModelParameter> = {
  aspectRatio: {
    id: 'aspectRatio',
    label: 'Aspect Ratio',
    type: 'select',
    default: '16:9',
    options: [
      { value: '16:9', label: '16:9 Landscape' },
      { value: '9:16', label: '9:16 Portrait' },
      { value: '1:1', label: '1:1 Square' },
      { value: '4:3', label: '4:3 Classic' },
      { value: '3:4', label: '3:4 Portrait' },
      { value: '21:9', label: '21:9 Ultrawide' }
    ]
  },
  resolution: {
    id: 'resolution',
    label: 'Resolution',
    type: 'select',
    default: '1080p',
    options: [
      { value: '720p', label: '720p' },
      { value: '1080p', label: '1080p' }
    ]
  },
  seedreamResolution: {
    id: 'resolution',
    label: 'Resolution',
    type: 'select',
    default: '2K',
    options: [
      { value: '1K', label: '1K (1024px)' },
      { value: '2K', label: '2K (2048px) - Default quality' },
      { value: '4K', label: '4K (4096px) - High quality' },
      { value: 'custom', label: 'Custom dimensions' }
    ]
  },
  seed: {
    id: 'seed',
    label: 'Seed (Optional)',
    type: 'number',
    description: 'Set a seed for reproducible results'
  },
  maxImages: {
    id: 'maxImages',
    label: 'Number of Images',
    type: 'slider',
    min: 1,
    max: 15,
    default: 1,
    description: 'Generate multiple images (1-15)'
  },
  customWidth: {
    id: 'customWidth',
    label: 'Custom Width',
    type: 'number',
    min: 1024,
    max: 4096,
    default: 2048
  },
  customHeight: {
    id: 'customHeight',
    label: 'Custom Height',
    type: 'number',
    min: 1024,
    max: 4096,
    default: 2048
  },
  sequentialGeneration: {
    id: 'sequentialGeneration',
    label: 'Sequential Generation',
    type: 'boolean',
    default: false,
    description: 'Generate related image variations for storytelling'
  },
  outputFormat: {
    id: 'outputFormat',
    label: 'Output Format',
    type: 'select',
    default: 'webp',
    options: [
      { value: 'webp', label: 'WebP (Recommended)' },
      { value: 'jpg', label: 'JPG' },
      { value: 'png', label: 'PNG' }
    ]
  },
  outputQuality: {
    id: 'outputQuality',
    label: 'Output Quality',
    type: 'slider',
    min: 50,
    max: 100,
    default: 95,
    description: 'Image quality (50-100)'
  },
  goFast: {
    id: 'goFast',
    label: 'Fast Mode',
    type: 'boolean',
    default: true,
    description: 'Enable faster processing'
  }
}

export const MODEL_CONFIGS: Record<ModelId, ModelConfig> = {
  'nano-banana': {
    id: 'nano-banana',
    name: 'nano-banana',
    displayName: 'Nano Banana',
    type: 'generation',
    icon: '🍌',
    description: 'Fast generation, good for quick iterations. Limited parameter control.',
    badge: 'Fast',
    badgeColor: 'bg-yellow-600',
    textColor: 'text-yellow-300',
    endpoint: 'google/nano-banana',
    costPerImage: 0.039,
    supportedParameters: ['outputFormat'],
    parameters: {
      outputFormat: MODEL_PARAMETERS.outputFormat
    },
    maxReferenceImages: 10
  },
  'seedream-4': {
    id: 'seedream-4',
    name: 'seedream-4',
    displayName: 'Seedream-4',
    type: 'generation',
    icon: '🌱',
    description: 'High quality 2K/4K, supports multi-image generation (1-15)',
    badge: '2K/4K',
    badgeColor: 'bg-green-600',
    textColor: 'text-green-300',
    endpoint: 'bytedance/seedream-4',
    costPerImage: 0.09,
    supportedParameters: ['aspectRatio', 'seedreamResolution', 'maxImages', 'customWidth', 'customHeight', 'sequentialGeneration'],
    parameters: {
      aspectRatio: MODEL_PARAMETERS.aspectRatio,
      resolution: MODEL_PARAMETERS.seedreamResolution,
      maxImages: MODEL_PARAMETERS.maxImages,
      customWidth: MODEL_PARAMETERS.customWidth,
      customHeight: MODEL_PARAMETERS.customHeight,
      sequentialGeneration: MODEL_PARAMETERS.sequentialGeneration
    },
    maxReferenceImages: 10
  },
  'gen4-image': {
    id: 'gen4-image',
    name: 'gen4-image',
    displayName: 'Gen4 Image',
    type: 'generation',
    icon: '⚡',
    description: 'Balanced quality and speed with full parameter control',
    badge: 'Balanced',
    badgeColor: 'bg-blue-600',
    textColor: 'text-blue-300',
    endpoint: 'runwayml/gen4-image',
    costPerImage: 0.075,
    supportedParameters: ['aspectRatio', 'resolution', 'seed'],
    parameters: {
      aspectRatio: MODEL_PARAMETERS.aspectRatio,
      resolution: MODEL_PARAMETERS.resolution,
      seed: MODEL_PARAMETERS.seed
    },
    maxReferenceImages: 3
  },
  'gen4-image-turbo': {
    id: 'gen4-image-turbo',
    name: 'gen4-image-turbo',
    displayName: 'Gen4 Turbo',
    type: 'generation',
    icon: '💨',
    description: 'Fastest generation with good quality (2.5x faster than Gen4)',
    badge: 'Turbo',
    badgeColor: 'bg-purple-600',
    textColor: 'text-purple-300',
    endpoint: 'runwayml/gen4-image-turbo',
    costPerImage: 0.03,
    supportedParameters: ['aspectRatio', 'resolution', 'seed'],
    parameters: {
      aspectRatio: MODEL_PARAMETERS.aspectRatio,
      resolution: MODEL_PARAMETERS.resolution,
      seed: MODEL_PARAMETERS.seed
    },
    maxReferenceImages: 3
  },
  'qwen-image-edit': {
    id: 'qwen-image-edit',
    name: 'qwen-image-edit',
    displayName: 'Qwen Edit',
    type: 'editing',
    icon: '✏️',
    description: 'Precise image editing with text instructions (20B parameter model)',
    badge: 'Edit',
    badgeColor: 'bg-indigo-600',
    textColor: 'text-indigo-300',
    endpoint: 'qwen/qwen-image-edit',
    costPerImage: 0.03,
    supportedParameters: ['seed', 'aspectRatio', 'outputFormat', 'outputQuality', 'goFast'],
    parameters: {
      seed: MODEL_PARAMETERS.seed,
      aspectRatio: MODEL_PARAMETERS.aspectRatio,
      outputFormat: MODEL_PARAMETERS.outputFormat,
      outputQuality: MODEL_PARAMETERS.outputQuality,
      goFast: MODEL_PARAMETERS.goFast
    },
    maxReferenceImages: 1,
    requiresInputImage: true
  }
}

export function getModelConfig(modelId: ModelId): ModelConfig {
  return MODEL_CONFIGS[modelId]
}

export function getModelsByType(type: ModelType): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter(model => model.type === type)
}

export function isParameterSupported(modelId: ModelId, parameterId: string): boolean {
  const config = getModelConfig(modelId)
  return config.supportedParameters.includes(parameterId)
}

export function getAvailableModels(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS)
}