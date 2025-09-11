// Comprehensive Preset System for Directors Palette
// Shared between Shot Creator and Shot Editor

export interface PresetCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface Preset {
  id: string
  name: string
  prompt: string
  category: string
  tags: string[]
  description?: string
  usedFor: ('shot-creator' | 'shot-editor' | 'both')[]
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'background-editing',
    name: 'Background Editing',
    description: 'Remove, replace, or modify backgrounds',
    icon: '🖼️',
    color: 'bg-green-600'
  },
  {
    id: 'character-consistency',
    name: 'Character Work',
    description: 'Maintain characters across scenes and angles',
    icon: '👤',
    color: 'bg-blue-600'
  },
  {
    id: 'lighting-effects',
    name: 'Lighting & Effects',
    description: 'Adjust lighting, shadows, and visual effects',
    icon: '💡',
    color: 'bg-yellow-600'
  },
  {
    id: 'camera-angles',
    name: 'Camera Angles',
    description: 'Change perspective and camera positioning',
    icon: '📷',
    color: 'bg-purple-600'
  },
  {
    id: 'post-production',
    name: 'Post Production',
    description: 'Professional editing and finishing touches',
    icon: '🎬',
    color: 'bg-red-600'
  },
  {
    id: 'style-transfer',
    name: 'Style & Aesthetic',
    description: 'Change art style, color grading, mood',
    icon: '🎨',
    color: 'bg-pink-600'
  }
]

export const COMPREHENSIVE_PRESETS: Preset[] = [
  // Background Editing Category
  {
    id: 'remove-background-transparent',
    name: 'Remove Background',
    prompt: 'Remove the entire background, make it transparent with clean edges, preserve the main subject perfectly for compositing',
    category: 'background-editing',
    tags: ['background', 'transparent', 'compositing'],
    description: 'Professional background removal for green screen work',
    usedFor: ['both']
  },
  {
    id: 'add-green-screen',
    name: 'Add Green Screen',
    prompt: 'Replace the background with a solid, even green screen for chroma keying, keep original subject and lighting intact',
    category: 'background-editing',
    tags: ['greenscreen', 'chroma-key', 'background'],
    description: 'Perfect for chroma key workflows',
    usedFor: ['both']
  },
  {
    id: 'studio-background',
    name: 'Studio Background',
    prompt: 'Replace background with professional photography studio setup, seamless white or grey backdrop, studio lighting',
    category: 'background-editing',
    tags: ['studio', 'professional', 'backdrop'],
    usedFor: ['both']
  },
  {
    id: 'outdoor-location',
    name: 'Outdoor Location',
    prompt: 'Place the subject in a natural outdoor environment while maintaining original lighting and subject appearance',
    category: 'background-editing',
    tags: ['outdoor', 'location', 'environment'],
    usedFor: ['both']
  },

  // Character Consistency Category
  {
    id: 'maintain-character',
    name: 'Character Consistency',
    prompt: 'Maintain this exact character appearance but place them in a different scene or outfit, preserve facial features and body proportions precisely',
    category: 'character-consistency',
    tags: ['character', 'consistency', 'features'],
    description: 'Essential for multi-shot character work',
    usedFor: ['both']
  },
  {
    id: 'character-outfit-change',
    name: 'Outfit Change',
    prompt: 'Change the character\'s clothing while maintaining exact facial features, body proportions, and overall character identity',
    category: 'character-consistency',
    tags: ['outfit', 'clothing', 'character'],
    usedFor: ['both']
  },
  {
    id: 'character-age-up',
    name: 'Age Character Up',
    prompt: 'Show this character aged up by 10-20 years, maintain facial structure and key features while adding realistic aging',
    category: 'character-consistency',
    tags: ['aging', 'character', 'time'],
    usedFor: ['both']
  },

  // Camera Angles Category
  {
    id: 'different-camera-angle',
    name: 'Different Angle',
    prompt: 'Show this exact scene from a different camera angle - low angle, high angle, or side perspective while keeping all elements the same',
    category: 'camera-angles',
    tags: ['angle', 'perspective', 'camera'],
    description: 'Essential for shot coverage',
    usedFor: ['both']
  },
  {
    id: 'close-up-shot',
    name: 'Close-up Shot',
    prompt: 'Create a close-up shot of the main subject, maintain lighting and mood while focusing on facial details and expressions',
    category: 'camera-angles',
    tags: ['close-up', 'portrait', 'detail'],
    usedFor: ['both']
  },
  {
    id: 'wide-establishing',
    name: 'Wide Establishing',
    prompt: 'Pull back to show a wide establishing shot of the entire scene, maintain all elements but show full environment context',
    category: 'camera-angles',
    tags: ['wide-shot', 'establishing', 'context'],
    usedFor: ['both']
  },

  // Lighting Effects Category  
  {
    id: 'dramatic-lighting',
    name: 'Dramatic Lighting',
    prompt: 'Add dramatic cinematic lighting with strong shadows and highlights, enhance mood while maintaining subject visibility',
    category: 'lighting-effects',
    tags: ['dramatic', 'cinematic', 'shadows'],
    usedFor: ['both']
  },
  {
    id: 'flat-shadowless',
    name: 'Flat Lighting',
    prompt: 'Convert to flat, shadowless lighting suitable for product photography or cutouts, even illumination across subject',
    category: 'lighting-effects',
    tags: ['flat', 'shadowless', 'product'],
    usedFor: ['both']
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    prompt: 'Adjust lighting to warm golden hour sunset lighting, soft warm glow, enhanced colors and romantic atmosphere',
    category: 'lighting-effects',
    tags: ['golden-hour', 'warm', 'sunset'],
    usedFor: ['both']
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    prompt: 'Convert to blue hour evening lighting with cool blue tones, twilight atmosphere, subtle artificial lighting',
    category: 'lighting-effects',
    tags: ['blue-hour', 'cool', 'twilight'],
    usedFor: ['both']
  },

  // Post Production Category
  {
    id: 'enhance-details',
    name: 'Enhance Details',
    prompt: 'Enhance fine details and textures while maintaining natural appearance, sharpen without over-processing',
    category: 'post-production',
    tags: ['enhance', 'details', 'sharpen'],
    usedFor: ['shot-editor']
  },
  {
    id: 'color-correction',
    name: 'Color Correction',
    prompt: 'Professional color correction with balanced exposure, natural skin tones, and proper white balance',
    category: 'post-production',
    tags: ['color', 'correction', 'balance'],
    usedFor: ['shot-editor']
  },
  {
    id: 'film-grain',
    name: 'Add Film Grain',
    prompt: 'Add subtle film grain texture for cinematic quality, maintain image sharpness while adding organic texture',
    category: 'post-production',
    tags: ['film-grain', 'texture', 'cinematic'],
    usedFor: ['shot-editor']
  },

  // Style Transfer Category
  {
    id: 'black-and-white',
    name: 'Black & White',
    prompt: 'Convert to professional black and white with enhanced contrast and tonal range, maintain emotional impact',
    category: 'style-transfer',
    tags: ['black-white', 'monochrome', 'contrast'],
    usedFor: ['both']
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film Look',
    prompt: 'Apply vintage film aesthetic with warm color grading, slight grain, and period-appropriate mood',
    category: 'style-transfer',
    tags: ['vintage', 'film', 'retro'],
    usedFor: ['both']
  },
  {
    id: 'comic-book-style',
    name: 'Comic Book Style',
    prompt: 'Transform into comic book illustration style with bold colors, clean lines, and graphic novel aesthetic',
    category: 'style-transfer',
    tags: ['comic', 'illustration', 'graphic'],
    usedFor: ['shot-creator']
  }
]

// Helper functions
export function getPresetsByCategory(categoryId: string): Preset[] {
  return COMPREHENSIVE_PRESETS.filter(preset => preset.category === categoryId)
}

export function getPresetsForTool(tool: 'shot-creator' | 'shot-editor'): Preset[] {
  return COMPREHENSIVE_PRESETS.filter(preset => 
    preset.usedFor.includes(tool) || preset.usedFor.includes('both')
  )
}

export function getCategoryById(categoryId: string): PresetCategory | undefined {
  return PRESET_CATEGORIES.find(cat => cat.id === categoryId)
}