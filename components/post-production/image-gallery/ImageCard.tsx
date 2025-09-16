'use client'

import { Badge } from '@/components/ui/badge'
import { GalleryImage } from './types'

interface ImageCardProps {
  image: GalleryImage
  isSelected: boolean
  onSelect: () => void
  onZoom: () => void
  onCopy: () => void
  onDownload: () => void
  onDelete: () => void
  onSendTo?: (target: string) => void
  showActions?: boolean
}

// Model icon and color mapping based on model-config.ts
function getModelIcon(model?: string): string {
  switch (model) {
    case 'nano-banana': return '✨'
    case 'seedream-4': return '🌱'
    case 'gen4-image': return '⚡'
    case 'gen4-image-turbo': return '💨'
    case 'qwen-image': return '🎨'
    case 'qwen-image-edit': return '✏️'
    default: return '✨' // Default to nano-banana icon
  }
}

function getModelBadgeColor(model?: string): string {
  switch (model) {
    case 'nano-banana': return 'bg-yellow-600'
    case 'seedream-4': return 'bg-green-600'
    case 'gen4-image': return 'bg-blue-600'
    case 'gen4-image-turbo': return 'bg-purple-600'
    case 'qwen-image': return 'bg-orange-600'
    case 'qwen-image-edit': return 'bg-indigo-600'
    default: return 'bg-yellow-600' // Default to nano-banana color
  }
}

export function ImageCard({
  image,
  isSelected,
  onSelect,
  onZoom,
  onCopy,
  onDownload,
  onDelete,
  onSendTo,
  showActions = true
}: ImageCardProps) {

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-800 border border-slate-600">
      {/* Main image */}
      <img
        src={image.url}
        alt={image.prompt?.slice(0, 50) || 'Generated image'}
        className="w-full h-48 object-cover bg-slate-900 cursor-zoom-in"
        onClick={onZoom}
      />

      {/* Model badge */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <Badge className={`${getModelBadgeColor(image.model)}/80 text-white p-1 opacity-90`} title={image.model || 'nano-banana'}>
          <span className="text-xs">{getModelIcon(image.model)}</span>
        </Badge>
      </div>

      {/* Clean minimal interface - no hover buttons */}
    </div>
  )
}