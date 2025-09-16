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

      {/* Action buttons - Visible bar with icons and labels */}
      {showActions && (
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-6 pb-2 px-2">
            {onSendTo ? (
              // Full button bar with all options
              <div className="flex items-center justify-center gap-1">
                {/* Send to buttons group */}
                <button
                  onClick={() => onSendTo('shot-creator')}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-purple-600/30 text-white/90 hover:text-purple-300 transition-all min-w-[50px]"
                  title="Send to Shot Creator"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Creator</span>
                </button>

                <button
                  onClick={() => onSendTo('shot-animator')}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-orange-600/30 text-white/90 hover:text-orange-300 transition-all min-w-[50px]"
                  title="Send to Shot Animator"
                >
                  <Film className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Animate</span>
                </button>

                <button
                  onClick={() => onSendTo('layout-annotation')}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-green-600/30 text-white/90 hover:text-green-300 transition-all min-w-[50px]"
                  title="Send to Layout & Annotation"
                >
                  <Layout className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Layout</span>
                </button>

                {/* Separator */}
                <div className="w-px h-8 bg-slate-600/50" />

                {/* Utility buttons */}
                <button
                  onClick={onCopy}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-600/30 text-white/90 hover:text-slate-300 transition-all min-w-[40px]"
                  title="Copy prompt"
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Copy</span>
                </button>

                <button
                  onClick={onDownload}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-teal-600/30 text-white/90 hover:text-teal-300 transition-all min-w-[40px]"
                  title="Download image"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Save</span>
                </button>

                <button
                  onClick={onDelete}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-red-600/30 text-white/90 hover:text-red-300 transition-all min-w-[40px]"
                  title="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Delete</span>
                </button>
              </div>
            ) : (
              // Fallback horizontal layout for utility buttons only (when no sendTo function)
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={onCopy}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-600/30 text-white/90 hover:text-slate-300 transition-all min-w-[40px]"
                  title="Copy prompt"
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Copy</span>
                </button>

                <button
                  onClick={onDownload}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-teal-600/30 text-white/90 hover:text-teal-300 transition-all min-w-[40px]"
                  title="Download image"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Save</span>
                </button>

                <button
                  onClick={onDelete}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-red-600/30 text-white/90 hover:text-red-300 transition-all min-w-[40px]"
                  title="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}