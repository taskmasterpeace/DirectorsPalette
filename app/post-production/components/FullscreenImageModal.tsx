'use client'

import { useState } from 'react'
import { X, Tag, Download, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import InlineTagEditor from './InlineTagEditor'
import type { LibraryImageReference } from '@/lib/post-production/enhanced-types'

interface FullscreenImageModalProps {
  image: LibraryImageReference | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (id: string) => void
  onTagEdit?: (id: string, tag: string) => void
}

export default function FullscreenImageModal({
  image,
  open,
  onOpenChange,
  onDelete,
  onTagEdit
}: FullscreenImageModalProps) {
  if (!image) return null

  const handleDownload = async () => {
    const link = document.createElement('a')
    link.href = image.imageData
    link.download = `reference_${image.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(image.imageData)
        return
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = image.imageData
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
      // Show user feedback
      alert('Could not copy to clipboard. Please manually copy the image URL.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-0">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Image */}
          <img
            src={image.preview || image.imageData}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Tags - Unified display */}
                <div className="flex gap-2 items-center flex-wrap">
                  {/* Show reference tag with @ prefix if it exists */}
                  {image.referenceTag && (
                    <Badge variant="secondary" className="bg-blue-600/80 text-white">
                      @{image.referenceTag}
                    </Badge>
                  )}
                  {/* Show regular tags, excluding reference tag to avoid duplication */}
                  {image.tags && image.tags
                    .filter(tag => tag !== image.referenceTag)
                    .map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-purple-600/80 text-white">
                      {tag}
                    </Badge>
                  ))}
                  {/* Show placeholder if no tags */}
                  {(!image.tags || image.tags.length === 0) && !image.referenceTag && (
                    <Badge variant="outline" className="text-white/50 border-white/30">
                      No tags
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <Badge variant="outline" className="text-white border-white/50">
                  {image.category}
                </Badge>

                {/* Source */}
                <Badge variant="outline" className="text-white border-white/50">
                  {image.source}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {onTagEdit && (
                  <InlineTagEditor
                    value={image.referenceTag}
                    onSave={(newTag) => onTagEdit(image.id, newTag)}
                    placeholder="Add reference tag..."
                    className="bg-white/10 hover:bg-white/20 text-white"
                  />
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyUrl}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Delete this image from library?')) {
                        onDelete(image.id)
                        onOpenChange(false)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Prompt if available */}
            {image.prompt && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-sm text-white/80">
                  <span className="font-medium">Prompt:</span> {image.prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}