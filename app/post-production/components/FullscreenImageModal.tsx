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
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] p-0 bg-slate-900 border-slate-600 overflow-hidden">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="flex flex-col h-full">
          {/* Image container - takes up most space */}
          <div className="flex-1 flex items-center justify-center bg-black/20 p-2 min-h-0 overflow-hidden">
            <img
              src={image.preview || image.imageData}
              alt=""
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>

          {/* Information panel - minimal height */}
          <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-600">
            <div className="p-3 space-y-3">
              
              {/* Tags section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Tags</span>
                </div>
                <div className="flex gap-2 flex-wrap ml-6">
                  {image.tags && image.tags.length > 0 ? (
                    image.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-blue-600/80 hover:bg-blue-600 text-white transition-colors">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">No tags assigned</span>
                  )}
                </div>
              </div>

              {/* Metadata and Reference Tag section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
                
                {/* Category and Source */}
                <div className="lg:col-span-2 space-y-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300">Category:</span>
                      <Badge variant="outline" className="text-slate-200 border-slate-500 bg-slate-700/50">
                        {image.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300">Source:</span>
                      <Badge variant="outline" className="text-slate-200 border-slate-500 bg-slate-700/50">
                        {image.source}
                      </Badge>
                    </div>
                  </div>

                  {/* Reference Tag Editor */}
                  {onTagEdit && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300">Reference:</span>
                      <InlineTagEditor
                        value={image.referenceTag}
                        onSave={(newTag) => onTagEdit(image.id, newTag)}
                        placeholder="Add reference tag..."
                        className="bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600 rounded px-3 py-1 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="lg:col-span-1 flex flex-wrap gap-2 lg:justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownload}
                    className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyUrl}
                    className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
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
                      className="hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Prompt section */}
              {image.prompt && (
                <div className="border-t border-slate-600 pt-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-300">Generation Prompt</span>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                      {image.prompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}