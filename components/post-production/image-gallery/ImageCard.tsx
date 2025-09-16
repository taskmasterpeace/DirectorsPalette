'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Copy,
  Download,
  Trash2,
  Film,
  Zap,
  Calendar,
  Sparkles,
  Layout
} from 'lucide-react'
import { format } from 'date-fns'
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
  // Get source icon based on where the image was generated
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'shot-creator':
        return <Sparkles className="w-3 h-3" />
      case 'shot-animator':
        return <Film className="w-3 h-3" />
      case 'layout-annotation':
        return <Layout className="w-3 h-3" />
      default:
        return <Sparkles className="w-3 h-3" />
    }
  }

  // Get source color for badge
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'shot-creator':
        return 'bg-purple-600'
      case 'shot-animator':
        return 'bg-orange-600'
      case 'layout-annotation':
        return 'bg-green-600'
      default:
        return 'bg-purple-600'
    }
  }

  return (
    <div className="relative group">
      {/* Image - Clean and unobstructed */}
      <img
        src={image.url}
        alt={image.prompt?.slice(0, 50) || 'Generated image'}
        className="w-full h-48 object-cover rounded border border-slate-600 bg-slate-800 cursor-zoom-in"
        onClick={onZoom}
      />

      {/* Source badge - Icon only in corner */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <Badge className={cn("text-white p-1", getSourceColor(image.source))} title={image.source.replace('-', ' ')}>
          {getSourceIcon(image.source)}
        </Badge>

        {/* Persistence status indicator */}
        {image.isPermanent ? (
          <Badge
            variant="outline"
            className="text-xs bg-green-900/90 text-green-300 border-green-500/50 px-1 py-0.5"
            title="Permanently stored - will never expire"
          >
            ✅
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs bg-red-900/90 text-red-300 border-red-500/50 px-1 py-0.5"
            title="Temporary - may expire soon"
          >
            ⏰
          </Badge>
        )}
      </div>

      {/* Prompt tooltip on hover - ABOVE IMAGE */}
      <div className="absolute bottom-full left-0 right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
          <p className="font-medium mb-1">Prompt:</p>
          <p className="text-slate-300">{image.prompt?.slice(0, 100)}...</p>
          <div className="flex items-center gap-2 mt-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(image.createdAt || Date.now()).toLocaleDateString()}</span>
            <Zap className="w-3 h-3" />
            <span>{image.creditsUsed || 0} credits</span>
          </div>
        </div>
      </div>

      {/* Action buttons - Subtle overlay on hover */}
      {showActions && (
        <div className="absolute bottom-2 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-center gap-1 px-2">
            {onSendTo && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSendTo('shot-creator')}
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-purple-600/80 text-white/80 hover:text-white rounded"
                  title="Send to Shot Creator"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSendTo('shot-animator')}
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-orange-600/80 text-white/80 hover:text-white rounded"
                  title="Send to Shot Animator"
                >
                  <Film className="w-3.5 h-3.5" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSendTo('layout-annotation')}
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-green-600/80 text-white/80 hover:text-white rounded"
                  title="Send to Layout & Annotation"
                >
                  <Layout className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onCopy}
              className="h-7 w-7 p-0 bg-black/50 hover:bg-slate-600/80 text-white/80 hover:text-white rounded"
              title="Copy prompt"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onDownload}
              className="h-7 w-7 p-0 bg-black/50 hover:bg-teal-600/80 text-white/80 hover:text-white rounded"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 w-7 p-0 bg-black/50 hover:bg-red-600/80 text-white/80 hover:text-white rounded"
              title="Delete image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}