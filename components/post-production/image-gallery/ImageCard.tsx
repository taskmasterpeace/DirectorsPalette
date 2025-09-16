'use client'

import { Badge } from '@/components/ui/badge'
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

      {/* Prompt tooltip on hover - ABOVE IMAGE, hidden when hovering buttons */}
      <div className="absolute bottom-full left-0 right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 group-hover:[&:has(~*:hover)]:opacity-0">
        <div className="bg-slate-900/95 backdrop-blur text-white text-xs p-2 rounded shadow-lg border border-slate-700/50">
          <p className="font-medium mb-1 text-slate-200">Prompt:</p>
          <p className="text-slate-300 line-clamp-2">{image.prompt}</p>
          <div className="flex items-center gap-3 mt-2 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(image.createdAt || Date.now()).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              {image.creditsUsed || 0} credits
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons - Clean floating bar */}
      {showActions && (
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-1.5 flex items-center justify-center gap-1">
            {onSendTo && (
              <>
                {/* Send to buttons group */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSendTo('shot-creator')}
                    className="p-1.5 rounded hover:bg-purple-600/40 text-purple-400 hover:text-purple-300 transition-all"
                    title="Send to Shot Creator"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSendTo('shot-animator')}
                    className="p-1.5 rounded hover:bg-orange-600/40 text-orange-400 hover:text-orange-300 transition-all"
                    title="Send to Shot Animator"
                  >
                    <Film className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSendTo('layout-annotation')}
                    className="p-1.5 rounded hover:bg-green-600/40 text-green-400 hover:text-green-300 transition-all"
                    title="Send to Layout & Annotation"
                  >
                    <Layout className="w-4 h-4" />
                  </button>
                </div>

                {/* Separator */}
                <div className="w-px h-5 bg-slate-600/50" />
              </>
            )}

            {/* Utility buttons group */}
            <div className="flex items-center gap-1">
              <button
                onClick={onCopy}
                className="p-1.5 rounded hover:bg-slate-600/40 text-slate-400 hover:text-slate-300 transition-all"
                title="Copy prompt"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={onDownload}
                className="p-1.5 rounded hover:bg-teal-600/40 text-teal-400 hover:text-teal-300 transition-all"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-all"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}