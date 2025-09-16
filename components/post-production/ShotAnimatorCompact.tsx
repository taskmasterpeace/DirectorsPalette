/**
 * Shot Animator Compact
 * Streamlined video generation with final frame control - no wasted space
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Video, Play, Upload, Film, X, Zap, Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from './UnifiedImageGallery'
import { validateCreditsWithRedirect, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { SEEDANCE_MODELS, DURATION_OPTIONS, ASPECT_RATIOS } from './ShotAnimatorTypes'

interface ShotAnimatorCompactProps {
  onFullscreenImage?: (imageUrl: string) => void
}

export function ShotAnimatorCompact({ onFullscreenImage }: ShotAnimatorCompactProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()
  const router = useRouter()
  const pathname = usePathname()

  // Essential state only
  const [selectedModel] = useState(SEEDANCE_MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [startFrame, setStartFrame] = useState<File | null>(null)
  const [finalFrame, setFinalFrame] = useState<File | null>(null)
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)

  const startFrameRef = useRef<HTMLInputElement>(null)
  const finalFrameRef = useRef<HTMLInputElement>(null)

  const currentCost = useRealTimeCostCalculator({
    duration, resolution, model: selectedModel.id
  })

  // Calculate aspect ratio for preview boxes
  const aspectRatioStyle = {
    '16:9': 'aspect-video', // 16:9
    '9:16': 'aspect-[9/16]', // 9:16 vertical
    '1:1': 'aspect-square', // 1:1 square
    '4:3': 'aspect-[4/3]', // 4:3 traditional
    '3:4': 'aspect-[3/4]', // 3:4 portrait
    '21:9': 'aspect-[21/9]', // 21:9 cinematic
    '9:21': 'aspect-[9/21]' // 9:21 ultra vertical
  }[aspectRatio] || 'aspect-video'

  const handleImageUpload = useCallback((file: File, type: 'start' | 'final') => {
    if (type === 'start') {
      setStartFrame(file)
    } else {
      setFinalFrame(file)
    }
  }, [])

  const generateVideo = useCallback(async () => {
    if (!prompt.trim() || !user) return

    const creditValidation = await validateCreditsWithRedirect(
      { operation: 'video generation', baseCredits: 15, duration, resolution, model: selectedModel.id },
      router, pathname
    )
    if (!creditValidation?.canProceed) return

    setIsGenerating(true)

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('model', selectedModel.id)
      formData.append('duration', duration.toString())
      formData.append('resolution', resolution)
      formData.append('aspect_ratio', aspectRatio)
      formData.append('camera_fixed', 'false')

      if (startFrame) formData.append('input_image', startFrame)
      if (finalFrame) formData.append('last_frame_image', finalFrame)

      const response = await fetch('/api/video/seedance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': process.env.NEXT_PUBLIC_DIRECTORS_PALETTE_API_KEY || 'dp_beta_2025_machineking_secure_api_key_v1'
        },
        body: formData
      })

      if (!response.ok) throw new Error(`Generation failed: ${response.statusText}`)

      const result = await response.json()
      if (result.success && result.videoUrl) {
        addImage({
          url: result.videoUrl,
          prompt: prompt.trim(),
          source: 'shot-animator',
          model: selectedModel.id,
          settings: { aspectRatio, resolution },
          creditsUsed: currentCost,
          metadata: { duration, videoFormat: 'mp4', isVideo: true },
          tags: ['video', selectedModel.id, resolution, aspectRatio]
        })

        toast({ title: "Video Generated", description: `${duration}s video created` })

        // Clear inputs
        setPrompt('')
        setStartFrame(null)
        setFinalFrame(null)
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, user, duration, resolution, selectedModel, aspectRatio, startFrame, finalFrame, getToken, addImage, toast, router, pathname, currentCost])

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Main Control Panel - 2/3 width */}
      <div className="col-span-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Shot Animator</h2>
            <Badge variant="outline">SeeeDance Lite</Badge>
          </div>
        </div>

        {/* Frame Control - Compact */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Video Frame Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Frame Control - Start frame with final frame as corner thumbnail */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 text-sm">Video Frames</Label>
                <Badge variant="outline" className="text-xs">Output: {aspectRatio}</Badge>
              </div>
              {startFrame ? (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => onFullscreenImage?.(URL.createObjectURL(startFrame))}
                >
                  {/* Start Frame - Native Aspect Ratio */}
                  <div className="w-full h-48 bg-slate-800 rounded border border-green-500/50 overflow-hidden">
                    <img
                      src={URL.createObjectURL(startFrame)}
                      alt="Start Frame"
                      className="w-full h-full object-contain" // object-contain preserves native aspect ratio
                    />
                  </div>

                  {/* Final Frame Thumbnail - Bottom Right Corner */}
                  {finalFrame && (
                    <div
                      className="absolute bottom-3 right-3 w-20 h-14 bg-slate-900 rounded border-2 border-purple-500/70 overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFullscreenImage?.(URL.createObjectURL(finalFrame))
                      }}
                    >
                      <img
                        src={URL.createObjectURL(finalFrame)}
                        alt="Final Frame"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-purple-500/20"></div>
                      <Badge className="absolute -bottom-1 -right-1 text-xs bg-purple-600 text-white px-1 py-0">
                        END
                      </Badge>
                    </div>
                  )}
                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStartFrame(null)
                      setFinalFrame(null) // Clear both when removing start frame
                    }}
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>

                  <div className="absolute bottom-2 left-2">
                    <Badge className="text-xs bg-green-600 text-white">START</Badge>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-48 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors bg-slate-800/30"
                  onClick={() => startFrameRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">Upload Start Frame</span>
                  <span className="text-xs text-slate-500">Native aspect ratio preserved</span>
                </div>
              )}

              {/* Final Frame Upload Button - Only show if no final frame yet */}
              {startFrame && !finalFrame && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => finalFrameRef.current?.click()}
                  className="w-full border-purple-500/30 hover:bg-purple-900/20"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Add Final Frame (Optional)
                </Button>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Prompt - Compact */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video animation..."
              className="min-h-[80px] bg-slate-800 border-slate-600 text-white resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-slate-400">{prompt.length}/500</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {currentCost} credits
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Settings - Minimal */}
        <div className="grid grid-cols-3 gap-2">
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
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateVideo}
          disabled={!prompt.trim() || isGenerating}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? 'Generating...' : `Generate Video (${currentCost} credits)`}
        </Button>

        {/* Hidden Inputs */}
        <input
          ref={startFrameRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'start')}
        />
        <input
          ref={finalFrameRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'final')}
        />
      </div>

      {/* Gallery - 1/3 width, compact */}
      <div className="space-y-2">
        <div className="text-sm text-slate-300 font-medium">Gallery</div>
        <div className="h-[600px]">
          <UnifiedImageGallery
            currentTab="shot-animator"
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}