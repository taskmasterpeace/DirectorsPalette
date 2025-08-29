// Mode-specific background images and color schemes
export interface ModeBackground {
  id: string
  name: string
  imagePath: string
  primaryColor: string
  secondaryColor: string
  overlayColor: string
  overlayOpacity: number
  textColor: string
  badgeColor: string
}

export const MODE_BACKGROUNDS: Record<string, ModeBackground> = {
  story: {
    id: 'story',
    name: 'Story Mode',
    imagePath: '/images/mode-backgrounds/story-mode.png',
    primaryColor: '#1e293b', // Slate-800
    secondaryColor: '#334155', // Slate-700  
    overlayColor: '#0f172a', // Slate-900
    overlayOpacity: 0.75,
    textColor: '#f1f5f9', // Slate-100
    badgeColor: '#3b82f6' // Blue-500
  },
  
  'music-video': {
    id: 'music-video', 
    name: 'Music Video Mode',
    imagePath: '/images/mode-backgrounds/music-video-mode.png',
    primaryColor: '#92400e', // Amber-800
    secondaryColor: '#d97706', // Amber-600
    overlayColor: '#451a03', // Amber-950
    overlayOpacity: 0.7,
    textColor: '#fef3c7', // Amber-100
    badgeColor: '#f59e0b' // Amber-500
  },

  commercial: {
    id: 'commercial',
    name: 'Commercial Mode', 
    imagePath: '/images/mode-backgrounds/commercial-mode.png',
    primaryColor: '#a16207', // Yellow-700
    secondaryColor: '#ca8a04', // Yellow-600
    overlayColor: '#713f12', // Yellow-800
    overlayOpacity: 0.65,
    textColor: '#fefce8', // Yellow-50
    badgeColor: '#eab308' // Yellow-500
  },

  'children-book': {
    id: 'children-book',
    name: 'Children\'s Book Mode',
    imagePath: '/images/mode-backgrounds/children-book-mode.png', 
    primaryColor: '#7c2d12', // Red-800
    secondaryColor: '#dc2626', // Red-600
    overlayColor: '#fef2f2', // Red-50
    overlayOpacity: 0.85,
    textColor: '#7f1d1d', // Red-900
    badgeColor: '#ef4444' // Red-500
  },

  'post-production': {
    id: 'post-production',
    name: 'Post Production',
    imagePath: '/images/mode-backgrounds/story-mode.png', // Reuse story image for now
    primaryColor: '#581c87', // Purple-800  
    secondaryColor: '#7c3aed', // Violet-600
    overlayColor: '#2e1065', // Purple-900
    overlayOpacity: 0.8,
    textColor: '#ede9fe', // Violet-100
    badgeColor: '#8b5cf6' // Violet-500
  }
}

export function getModeBackground(modeId: string): ModeBackground {
  return MODE_BACKGROUNDS[modeId] || MODE_BACKGROUNDS.story
}

// CSS variables for dynamic theming
export function getModeCSS(modeId: string): Record<string, string> {
  const background = getModeBackground(modeId)
  
  return {
    '--mode-primary': background.primaryColor,
    '--mode-secondary': background.secondaryColor, 
    '--mode-overlay': background.overlayColor,
    '--mode-text': background.textColor,
    '--mode-badge': background.badgeColor,
    '--mode-bg-image': `url('${background.imagePath}')`,
    '--mode-overlay-opacity': background.overlayOpacity.toString()
  }
}