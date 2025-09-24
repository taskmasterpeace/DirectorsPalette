'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Copy,
  Download,
  Trash2,
  Tag,
  Send,
  Library,
  FileText,
  Film,
  Layout,
  Sparkles
} from 'lucide-react'
import { GalleryImage } from './types'
import { useToast } from '@/components/ui/use-toast'

interface ImageCardProps {
  image: GalleryImage
  isSelected: boolean
  onSelect: () => void
  onZoom: () => void
  onCopy: () => void
  onDownload: () => void
  onDelete: () => void
  onSendTo?: (target: string) => void
  onSetReference?: () => void
  onAddToLibrary?: () => void
  showActions?: boolean
}

// Model icon and color mapping based on model-config.ts
function getModelIcon(model?: string): string {
  switch (model) {
    case 'nano-banana': return '🍌'
    case 'seedream-4': return '🌱'
    case 'gen4-image': return '⚡'
    case 'gen4-image-turbo': return '💨'
    case 'qwen-image': return '🎨'
    case 'qwen-image-edit': return '✏️'
    default: return '🍌' // Default to nano-banana icon
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
  onSetReference,
  onAddToLibrary,
  showActions = true
}: ImageCardProps) {
  const { toast } = useToast()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleCopyPrompt = () => {
    if (image.prompt) {
      navigator.clipboard.writeText(image.prompt)
      toast({
        title: "Prompt Copied",
        description: "The prompt has been copied to your clipboard"
      })
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.url)
    toast({
      title: "URL Copied",
      description: "Image URL has been copied to your clipboard"
    })
  }

  // Handle image click/touch with proper event management
  const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent any parent event handlers
    e.stopPropagation()
    // Call the zoom function
    onZoom()
  }

  // Handle dropdown button click/touch
  const handleDropdownClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop propagation to prevent image click
    e.stopPropagation()
    // The dropdown will handle its own state
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-800 border border-slate-700 transition-all hover:border-purple-600/50">
      {/* Main image - show in native aspect ratio */}
      <img
        src={image.url}
        alt={image.prompt?.slice(0, 50) || 'Generated image'}
        className="w-full h-auto cursor-zoom-in touch-manipulation"
        onClick={handleImageClick}
        onTouchEnd={handleImageClick}
      />

      {/* Model icon - transparent background */}
      <div className="absolute top-2 left-2 pointer-events-none text-sm drop-shadow-lg">
        {getModelIcon(image.model)}
      </div>

      {/* Reference badge if exists */}
      {image.reference && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {image.reference}
          </Badge>
        </div>
      )}

      {/* Action menu button - always visible in bottom right */}
      {showActions && (
        <div className="absolute bottom-2 right-2 z-10">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-11 w-11 p-0 bg-slate-700/95 hover:bg-slate-600 border-slate-600 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={handleDropdownClick}
                onTouchEnd={handleDropdownClick}
              >
                <MoreVertical className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white z-50" align="end">
              <DropdownMenuItem
                onClick={handleCopyPrompt}
                className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
              >
                <FileText className="mr-3 h-4 w-4" />
                Copy Prompt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyUrl}
                className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
              >
                <Copy className="mr-3 h-4 w-4" />
                Copy Image URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDownload}
                className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
              >
                <Download className="mr-3 h-4 w-4" />
                Download
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700" />

              {onSetReference && (
                <DropdownMenuItem
                  onClick={onSetReference}
                  className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
                >
                  <Tag className="mr-3 h-4 w-4" />
                  Set Reference
                </DropdownMenuItem>
              )}

              {onSendTo && (
                <>
                  <DropdownMenuItem
                    onClick={() => onSendTo('shot-creator')}
                    className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
                  >
                    <Sparkles className="mr-3 h-4 w-4" />
                    Send to Shot Creator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSendTo('shot-animator')}
                    className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
                  >
                    <Film className="mr-3 h-4 w-4" />
                    Send to Shot Animator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSendTo('layout-annotation')}
                    className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
                  >
                    <Layout className="mr-3 h-4 w-4" />
                    Send to Layout
                  </DropdownMenuItem>
                </>
              )}

              {onAddToLibrary && (
                <DropdownMenuItem
                  onClick={onAddToLibrary}
                  className="hover:bg-slate-700 cursor-pointer min-h-[44px] touch-manipulation flex items-center px-4 py-3"
                >
                  <Library className="mr-3 h-4 w-4" />
                  Add to Library
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem
                onClick={onDelete}
                className="hover:bg-red-700 cursor-pointer text-red-400 min-h-[44px] touch-manipulation flex items-center px-4 py-3"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Hover tooltip with prompt - improved for mobile */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity md:pointer-events-none">
        <p className="text-xs text-white line-clamp-2 break-words">
          {image.prompt || 'No prompt available'}
        </p>
      </div>
    </div>
  )
}