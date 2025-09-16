'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Clipboard, Trash2, Search } from "lucide-react"
import { ImageReference } from "./types"
import Image from 'next/image'

interface ReferenceImagesSectionProps {
  referenceImages: ImageReference[]
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileUpload: (files: FileList | null, isGen4?: boolean) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onRemoveImage: (id: string) => void
  onSwapReference?: (libraryReferenceId: string, targetIndex: number) => void
  onPasteToSlot: (slotIndex: number) => void
  onBrowseLibrary?: () => void
}

export function ReferenceImagesSection({
  referenceImages,
  fileInputRef,
  onFileUpload,
  onDrop,
  onDragOver,
  onRemoveImage,
  onSwapReference,
  onPasteToSlot,
  onBrowseLibrary
}: ReferenceImagesSectionProps) {
  const handlePaste = (slotIndex: number) => {
    navigator.clipboard.read().then(items => {
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            item.getType(type).then(blob => {
              const files = new DataTransfer()
              const fileName = `pasted-ref-${slotIndex}-${Date.now()}.${type.split('/')[1]}`
              files.items.add(new File([blob], fileName, { type }))
              onFileUpload(files.files, true)
            })
          }
        }
      }
    }).catch(err => {
      console.error("Error accessing clipboard:", err)
      alert("Unable to paste. Try Ctrl+V instead.")
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Reference Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop images here or click to upload
          </p>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {onBrowseLibrary && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBrowseLibrary()
                }}
              >
                <Search className="w-3 h-3 mr-1" />
                Browse Library
              </Button>
            )}

            {[1, 2, 3].map((slot) => (
              <Button
                key={slot}
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePaste(slot)
                }}
                title={`Paste to reference slot ${slot}`}
              >
                <Clipboard className="w-3 h-3 mr-1" />
                Slot {slot}
              </Button>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileUpload(e.target.files, true)}
        />

        {/* Reference Images Grid */}
        {referenceImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {referenceImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group border rounded-lg overflow-hidden"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('border-purple-400', 'bg-purple-50')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')
                }}
                onDrop={async (e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')

                  try {
                    const data = JSON.parse(e.dataTransfer.getData('application/json'))
                    if (data.type === 'library-reference' && onSwapReference) {
                      await onSwapReference(data.referenceId, index)
                    }
                  } catch (error) {
                    console.error('Drop error:', error)
                  }
                }}
              >
                <div className="aspect-square">
                  <img
                    src={image.url}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => onRemoveImage(image.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Ref {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}