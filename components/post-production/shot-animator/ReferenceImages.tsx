'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Clipboard, Image as ImageIcon, Trash2, Maximize2 } from 'lucide-react'

interface ReferenceImagesProps {
  selectedImages: string[]
  lastFrameImages?: string[]
  onFileUpload: () => void
  onPasteFromClipboard: () => void
  onRemoveImage: (index: number) => void
  onShowGallery: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ReferenceImages({
  selectedImages,
  lastFrameImages,
  onFileUpload,
  onPasteFromClipboard,
  onRemoveImage,
  onShowGallery,
  fileInputRef,
  onFileChange
}: ReferenceImagesProps) {
  const allImages = [...selectedImages, ...(lastFrameImages || [])]

  return (
    <Card className="border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-400" />
            Reference Images
            {allImages.length > 0 && (
              <Badge variant="secondary">{allImages.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowGallery}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Gallery
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onFileUpload}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPasteFromClipboard}
              className="flex-1"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste
            </Button>
          </div>

          {/* Image Grid */}
          {allImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {allImages.map((img, idx) => (
                <div key={idx} className="relative group aspect-square">
                  <img
                    src={img}
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                  />
                  {idx < selectedImages.length && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveImage(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  {idx >= selectedImages.length && (
                    <Badge className="absolute top-1 left-1 text-xs bg-blue-600/80">
                      Last Frame
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-400">
                Add reference images for better results
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}