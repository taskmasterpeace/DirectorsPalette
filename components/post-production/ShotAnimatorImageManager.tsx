/**
 * Shot Animator Image Manager
 * Handles start frame, final frame, and reference image uploads with shadcn/ui
 */

'use client'

import { useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Upload,
  Film,
  Clipboard,
  X,
  Play,
  Square,
  Image as ImageIcon,
  Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { ImageUpload } from './ShotAnimatorTypes'

interface ShotAnimatorImageManagerProps {
  startFrameImages: ImageUpload[]
  finalFrameImages: ImageUpload[]
  referenceImages: ImageUpload[]
  onAddImage: (file: File, type: 'start_frame' | 'final_frame' | 'reference') => void
  onRemoveImage: (imageId: string, type: 'start_frame' | 'final_frame' | 'reference') => void
  maxStartFrames?: number
  maxFinalFrames?: number
  maxReferenceImages?: number
}

export function ShotAnimatorImageManager({
  startFrameImages,
  finalFrameImages,
  referenceImages,
  onAddImage,
  onRemoveImage,
  maxStartFrames = 1,
  maxFinalFrames = 1,
  maxReferenceImages = 4
}: ShotAnimatorImageManagerProps) {
  const { toast } = useToast()
  const startFrameInputRef = useRef<HTMLInputElement>(null)
  const finalFrameInputRef = useRef<HTMLInputElement>(null)
  const referenceInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((
    files: FileList | null,
    type: 'start_frame' | 'final_frame' | 'reference'
  ) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          onAddImage(file, type)
        } else {
          toast({
            title: "File Too Large",
            description: "Images must be under 10MB",
            variant: "destructive"
          })
        }
      }
    })
  }, [onAddImage, toast])

  const handlePasteImage = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type })
            onAddImage(file, 'start_frame') // Default to start frame
            toast({
              title: "Image Pasted",
              description: "Image added as start frame"
            })
            return
          }
        }
      }
      toast({
        title: "No Image Found",
        description: "No image in clipboard",
        variant: "destructive"
      })
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Unable to paste image from clipboard",
        variant: "destructive"
      })
    }
  }, [onAddImage, toast])

  return (
    <Card className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          Video Frame Control
          <Badge variant="outline" className="text-xs">
            SeeeDance Lite
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Start Frame Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-400" />
            <Label className="text-slate-300 font-medium">Start Frame (Optional)</Label>
            {startFrameImages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {startFrameImages.length} uploaded
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startFrameInputRef.current?.click()}
              disabled={startFrameImages.length >= maxStartFrames}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Start Frame
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasteImage}
              className="flex-1"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste Image
            </Button>
          </div>

          {/* Start Frame Preview */}
          {startFrameImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {startFrameImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Start frame"
                    className="w-full h-20 object-cover rounded border border-green-500/50"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveImage(image.id, 'start_frame')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1">
                    <Badge className="text-xs bg-black/70 text-green-400">
                      Start
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Frame Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Square className="w-4 h-4 text-purple-400" />
            <Label className="text-slate-300 font-medium">Final Frame (Optional)</Label>
            {finalFrameImages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {finalFrameImages.length} uploaded
              </Badge>
            )}
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
            <p className="text-purple-300 text-sm mb-3">
              🎬 Set the ending frame for your video animation
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => finalFrameInputRef.current?.click()}
              disabled={finalFrameImages.length >= maxFinalFrames || startFrameImages.length === 0}
              className="w-full bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/40"
            >
              <Film className="w-4 h-4 mr-2" />
              Upload Final Frame
            </Button>
            {startFrameImages.length === 0 && (
              <p className="text-slate-500 text-xs mt-2">
                Add a start frame first to enable final frame
              </p>
            )}
          </div>

          {/* Final Frame Preview */}
          {finalFrameImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {finalFrameImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Final frame"
                    className="w-full h-20 object-cover rounded border border-purple-500/50"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveImage(image.id, 'final_frame')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1">
                    <Badge className="text-xs bg-black/70 text-purple-400">
                      Final
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reference Images Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <Label className="text-slate-300 font-medium">Reference Images (Optional)</Label>
            {referenceImages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {referenceImages.length}/{maxReferenceImages}
              </Badge>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm mb-3">
              📎 Add 1-4 reference images to guide video style
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => referenceInputRef.current?.click()}
              disabled={referenceImages.length >= maxReferenceImages}
              className="w-full bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/40"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reference Image ({referenceImages.length}/{maxReferenceImages})
            </Button>
          </div>

          {/* Reference Images Preview */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {referenceImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Reference"
                    className="w-full h-16 object-cover rounded border border-blue-500/50"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveImage(image.id, 'reference')}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                  <div className="absolute bottom-0.5 left-0.5">
                    <Badge className="text-xs bg-black/70 text-blue-400 px-1 py-0">
                      {referenceImages.indexOf(image) + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Frame + Start Frame Preview */}
        {(startFrameImages.length > 0 || finalFrameImages.length > 0) && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-4 h-4 text-cyan-400" />
              <Label className="text-slate-300 font-medium">Animation Preview</Label>
            </div>
            <div className="flex gap-4 items-center">
              {startFrameImages.length > 0 && (
                <div className="text-center">
                  <img
                    src={startFrameImages[0].preview}
                    alt="Start frame"
                    className="w-24 h-16 object-cover rounded border border-green-500/50"
                  />
                  <p className="text-xs text-green-400 mt-1">Start Frame</p>
                </div>
              )}

              {startFrameImages.length > 0 && finalFrameImages.length > 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                    <p className="text-xs text-cyan-400 ml-2">Animation Flow</p>
                  </div>
                </div>
              )}

              {finalFrameImages.length > 0 && (
                <div className="text-center">
                  <img
                    src={finalFrameImages[0].preview}
                    alt="Final frame"
                    className="w-24 h-16 object-cover rounded border border-purple-500/50"
                  />
                  <p className="text-xs text-purple-400 mt-1">Final Frame</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={startFrameInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files, 'start_frame')}
        />
        <input
          ref={finalFrameInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files, 'final_frame')}
        />
        <input
          ref={referenceInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files, 'reference')}
        />
      </CardContent>
    </Card>
  )
}