/**
 * Shot Animator Grid
 * Efficient multi-frame animation with proper space usage
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Video, Play, Upload, Film, X, Zap, ZoomIn, Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from './UnifiedImageGallery'
import { validateCreditsWithRedirect, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { SEEDANCE_MODELS, DURATION_OPTIONS, ASPECT_RATIOS } from './ShotAnimatorTypes'

interface FrameUpload {
  id: string
  file: File
  preview: string
  type: 'start' | 'final'
  order: number
}

interface ShotAnimatorGridProps {
  onFullscreenImage?: (imageUrl: string) => void
}

export function ShotAnimatorGrid({ onFullscreenImage }: ShotAnimatorGridProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()
  const router = useRouter()
  const pathname = usePathname()

  // Essential state
  const [selectedModel] = useState(SEEDANCE_MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [frames, setFrames] = useState<FrameUpload[]>([])
  const [finalFrame, setFinalFrame] = useState<FrameUpload | null>(null)
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const finalFrameInputRef = useRef<HTMLInputElement>(null)

  const currentCost = useRealTimeCostCalculator({
    duration, resolution, model: selectedModel.id
  })

  const handleAddFrame = useCallback((files: FileList | null) => {
    if (!files) return

    Array.from(files).slice(0, 9 - frames.length).forEach((file, index) => {
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        const newFrame: FrameUpload = {
          id: `frame_${Date.now()}_${index}`,
          file,
          preview: URL.createObjectURL(file),
          type: 'start',
          order: frames.length + index
        }
        setFrames(prev => [...prev, newFrame])
      }
    })

    toast({
      title: "Frames Added",
      description: `${Math.min(files.length, 9 - frames.length)} frames uploaded`
    })
  }, [frames.length, toast])

  const handleAddFinalFrame = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return

    const file = files[0]
    if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
      const newFinalFrame: FrameUpload = {
        id: `final_${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        type: 'final',
        order: 999
      }
      setFinalFrame(newFinalFrame)
      toast({
        title: "Final Frame Set",
        description: "Final frame image uploaded"
      })
    }
  }, [toast])

  const removeFrame = useCallback((frameId: string) => {
    setFrames(prev => prev.filter(f => f.id !== frameId))
  }, [])

  const totalCredits = frames.length * currentCost

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Shot Animator</h2>
          <Badge variant="outline">SeeeDance Lite</Badge>
        </div>
        <Badge variant="outline" className="text-xs">Output: {aspectRatio}</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Left Column: Frame Grid (3/4 width) */}
        <div className="col-span-3 space-y-4">
          {/* Frame Grid */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                Animation Frames
                <Badge variant="secondary" className="text-xs">
                  {frames.length}/9 frames
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {/* Existing Frames */}
                {frames.map((frame, index) => (
                  <div key={frame.id} className="relative group">
                    <div
                      className="w-full h-24 bg-slate-800 rounded border border-green-500/50 overflow-hidden cursor-zoom-in"
                      onClick={() => onFullscreenImage?.(frame.preview)}
                      style={{ cursor: 'zoom-in' }}
                    >
                      <img
                        src={frame.preview}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Final Frame Corner Thumbnail */}
                    {finalFrame && index === 0 && (
                      <div
                        className="absolute bottom-1 right-1 w-6 h-4 bg-slate-900 rounded border border-purple-500 overflow-hidden cursor-zoom-in hover:scale-125 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFullscreenImage?.(finalFrame.preview)
                        }}
                        style={{ cursor: 'zoom-in' }}
                      >
                        <img
                          src={finalFrame.preview}
                          alt="Final"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 h-4 w-4 p-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFrame(frame.id)}
                    >
                      <X className="h-2 w-2 text-white" />
                    </Button>

                    <Badge className="absolute bottom-1 left-1 text-xs bg-green-600 text-white px-1 py-0">
                      {index + 1}
                    </Badge>
                  </div>
                ))}

                {/* Add Frame Button - Only show next empty slot */}
                {frames.length < 9 && (
                  <div
                    className="w-full h-24 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors bg-slate-800/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="w-4 h-4 text-slate-500 mb-1" />
                    <span className="text-xs text-slate-400">Add Frame</span>
                  </div>
                )}
              </div>

              {/* Final Frame Control - Only show if we have start frames */}
              {frames.length > 0 && !finalFrame && (
                <div className="mt-4 pt-3 border-t border-slate-600">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => finalFrameInputRef.current?.click()}
                    className="w-full border-purple-500/30 hover:bg-purple-900/20"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Set Final Frame (Optional)
                  </Button>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Final frame will appear as thumbnail on first frame
                  </p>
                </div>
              )}

              {finalFrame && (
                <div className="mt-4 pt-3 border-t border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-300">Final Frame Set</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFinalFrame(null)}
                      className="h-6 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video animation..."
                className="min-h-[60px] bg-slate-800 border-slate-600 text-white resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-400">{prompt.length}/500</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {totalCredits} credits total
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Settings + Generate */}
          <div className="flex gap-2">
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
              </SelectContent>
            </Select>

            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {/* TODO: Implement batch generation */}}
              disabled={frames.length === 0 || !prompt.trim() || isGenerating}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              {isGenerating ? 'Generating...' : `Animate All (${totalCredits} credits)`}
            </Button>
          </div>
        </div>

        {/* Right Column: Compact Gallery (1/4 width) */}
        <div className="space-y-2">
          <div className="text-sm text-slate-300 font-medium">Gallery</div>
          <div className="h-[400px]">
            <UnifiedImageGallery
              currentTab="shot-animator"
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleAddFrame(e.target.files)}
      />
      <input
        ref={finalFrameInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleAddFinalFrame(e.target.files)}
      />
    </div>
  )
}