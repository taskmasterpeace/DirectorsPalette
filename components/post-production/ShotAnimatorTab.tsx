'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Video,
  Upload,
  Clipboard,
  Play,
  Pause,
  Download,
  Trash2,
  Settings,
  Sparkles,
  Clock,
  Zap,
  Camera,
  Film,
  Monitor,
  Maximize2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from './UnifiedImageGallery'
import { Gen4ReferenceLibrary } from './Gen4ReferenceLibrary'

// SeeeDance Model Configuration
interface SeeeDanceModel {
  id: 'seedance-lite' | 'seedance-pro'
  name: string
  description: string
  icon: string
  maxResolution: string
  creditsPerSecond: number
  features: string[]
  apiProvider: 'replicate' | 'aiml'
  endpoint: string
}

const SEEDANCE_MODELS: SeeeDanceModel[] = [
  {
    id: 'seedance-lite',
    name: 'SeeeDance Lite',
    description: 'Fast video generation - 480p/720p output',
    icon: '⚡',
    maxResolution: '720p',
    creditsPerSecond: 15, // More accurate based on research
    features: ['Text-to-Video', 'Image-to-Video', '720p Max', '24 FPS', '3-12 seconds'],
    apiProvider: 'replicate',
    endpoint: 'bytedance/seedance-1-lite'
  },
  {
    id: 'seedance-pro',
    name: 'SeeeDance Pro',
    description: 'Professional quality - 1080p cinematic output',
    icon: '🎬',
    maxResolution: '1080p',
    creditsPerSecond: 35, // More accurate based on research
    features: ['Text-to-Video', 'Image-to-Video', '1080p Max', 'Reference Images', 'Professional Quality'],
    apiProvider: 'replicate', // Available on Replicate
    endpoint: 'bytedance/seedance-1-pro'
  }
]

const RESOLUTION_OPTIONS = [
  { value: '480p', label: '480p (Fast)', width: 720, height: 480, description: 'Quick generation' },
  { value: '720p', label: '720p (Standard)', width: 1280, height: 720, description: 'Balanced quality' },
  { value: '1080p', label: '1080p (Pro Only)', width: 1920, height: 1080, description: 'Professional quality' }
]

const DURATION_OPTIONS = [
  { value: 3, label: '3 seconds', credits: 3 },
  { value: 5, label: '5 seconds', credits: 5 },
  { value: 8, label: '8 seconds', credits: 8 },
  { value: 10, label: '10 seconds', credits: 10 },
  { value: 12, label: '12 seconds', credits: 12 }
]

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 Landscape', description: 'Standard widescreen' },
  { value: '9:16', label: '9:16 Portrait', description: 'Mobile/TikTok' },
  { value: '1:1', label: '1:1 Square', description: 'Instagram/Social' },
  { value: '4:3', label: '4:3 Traditional', description: 'Classic TV' },
  { value: '21:9', label: '21:9 Cinematic', description: 'Ultra-wide' }
]

interface VideoGeneration {
  id: string
  prompt: string
  model: string
  duration: number
  resolution: string
  aspectRatio: string
  inputImage?: string
  videoUrl?: string
  status: 'generating' | 'completed' | 'failed'
  progress: number
  creditsUsed: number
  createdAt: string
}

interface ShotAnimatorTabProps {
  onSendToLibrary?: (videoUrl: string) => void
  onSendToImageEdit?: (imageUrl: string) => void
  libraryItems?: any[]
  libraryCategory?: string
  setLibraryCategory?: (category: string) => void
  libraryLoading?: boolean
  onFullscreenImage?: (image: any) => void
}

export function ShotAnimatorTab({
  onSendToLibrary,
  onSendToImageEdit,
  libraryItems = [],
  libraryCategory = 'all',
  setLibraryCategory = () => {},
  libraryLoading = false,
  onFullscreenImage = () => {}
}: ShotAnimatorTabProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage } = useUnifiedGalleryStore()

  // Core state
  const [selectedModel, setSelectedModel] = useState<SeeeDanceModel>(SEEDANCE_MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [inputImages, setInputImages] = useState<File[]>([])
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [cameraFixed, setCameraFixed] = useState(false)
  const [generations, setGenerations] = useState<VideoGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload for input images
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          setInputImages(prev => [...prev, file])
          toast({
            title: "Image Added",
            description: `${file.name} added as input image`
          })
        } else {
          toast({
            title: "File Too Large",
            description: "Images must be under 10MB",
            variant: "destructive"
          })
        }
      }
    })
  }, [toast])

  // Handle paste from clipboard
  const handlePasteImage = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType('image/png')
          const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: 'image/png' })
          setInputImages(prev => [...prev, file])
          toast({
            title: "Image Pasted",
            description: "Image from clipboard added successfully"
          })
          break
        }
      }
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "No image found in clipboard",
        variant: "destructive"
      })
    }
  }, [toast])

  // Remove input image
  const removeInputImage = useCallback((index: number) => {
    setInputImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Generate video with SeeeDance
  const generateVideo = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your video",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate videos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)

      // Declare newGeneration outside try block for error handling access
      let newGeneration: VideoGeneration

      newGeneration = {
        id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt: prompt.trim(),
        model: selectedModel.id,
        duration: duration,
        resolution,
        aspectRatio,
        inputImage: inputImages.length > 0 ? URL.createObjectURL(inputImages[0]) : undefined,
        status: 'generating',
        progress: 0,
        creditsUsed: selectedModel.creditsPerSecond * duration[0],
        createdAt: new Date().toISOString()
      }

      setGenerations(prev => [newGeneration, ...prev])

      // Prepare API call
      const token = await getToken()
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('model', selectedModel.id)
      formData.append('duration', duration.toString())
      formData.append('resolution', resolution)
      formData.append('aspect_ratio', aspectRatio)
      formData.append('camera_fixed', cameraFixed.toString())

      if (inputImages.length > 0) {
        formData.append('input_image', inputImages[0])
      }

      console.log('🎬 Starting SeeeDance video generation...', {
        model: selectedModel.id,
        duration: duration,
        resolution,
        aspectRatio,
        hasInputImage: inputImages.length > 0
      })

      const response = await fetch('/api/video/seedance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.videoUrl) {
        // Update generation with completed video
        setGenerations(prev => prev.map(gen =>
          gen.id === newGeneration.id
            ? { ...gen, status: 'completed', progress: 100, videoUrl: result.videoUrl }
            : gen
        ))

        // Add to unified gallery as video
        addImage({
          url: result.videoUrl,
          prompt: prompt.trim(),
          source: 'shot-animator',
          model: selectedModel.id,
          settings: {
            aspectRatio,
            resolution,
            seed: result.seed
          },
          creditsUsed: newGeneration.creditsUsed,
          metadata: {
            duration: duration,
            videoFormat: 'mp4',
            isVideo: true
          },
          tags: ['video', selectedModel.id, resolution]
        })

        toast({
          title: "Video Generated Successfully",
          description: `${duration[0]}s video created with ${selectedModel.name}`
        })

        // Clear inputs for next generation
        setPrompt('')
        setInputImages([])

      } else {
        throw new Error(result.error || 'Generation failed')
      }

    } catch (error) {
      console.error('❌ Video generation failed:', error)

      // Update generation status to failed
      setGenerations(prev => prev.map(gen =>
        gen.id === newGeneration?.id
          ? { ...gen, status: 'failed', progress: 0 }
          : gen
      ))

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, selectedModel, duration, resolution, aspectRatio, cameraFixed, inputImages, user, getToken, addImage, toast])

  // Calculate total credits for current settings
  const resolutionMultiplier = resolution === '1080p' ? 2 : resolution === '720p' ? 1.5 : 1
  const totalCredits = Math.ceil(selectedModel.creditsPerSecond * duration * resolutionMultiplier)

  // Check if generation is possible
  const canGenerate = prompt.trim().length > 0 && !isGenerating

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 px-2 lg:px-4 py-3 bg-slate-900/50 border-b border-slate-700 lg:rounded-t-lg">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg lg:text-xl font-semibold text-white">🎬 Shot Animator</h2>
          <Badge variant="outline" className="text-xs">SeeeDance AI</Badge>
        </div>
        <div className="w-full lg:w-auto">
          <Select value={selectedModel.id} onValueChange={(value) => {
            const model = SEEDANCE_MODELS.find(m => m.id === value)
            if (model) setSelectedModel(model)
          }}>
            <SelectTrigger className="w-full lg:w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEEDANCE_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.icon}</span>
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-slate-400">{model.maxResolution} • {model.creditsPerSecond}c/sec</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-4 lg:space-y-0 pb-4">

        {/* LEFT COLUMN - Input & Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Input Images Section */}
          <Card className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Input Images {inputImages.length > 0 && `(${inputImages.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Input ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-600"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeInputImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="text-xs bg-black/70 text-white">
                        {Math.round(file.size / 1024)}KB
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Add Image Area */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">Upload Image</p>
                  <p className="text-xs text-slate-500">or drag & drop</p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 sm:h-9"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 sm:h-9"
                  onClick={handlePasteImage}
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste Image
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </CardContent>
          </Card>

          {/* Prompt & Generation Section */}
          <Card className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Video Prompt & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label className="text-white">Describe your video</Label>
                <Textarea
                  placeholder="Describe the video you want to create... (e.g., 'a cinematic shot of a detective walking through an abandoned warehouse')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] bg-slate-800 border-slate-600 text-white resize-none"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{prompt.length}/3000 characters</span>
                  <span>{totalCredits} credits for {duration[0]}s video</span>
                </div>
              </div>

              {/* Generation Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Duration</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {Math.ceil(selectedModel.creditsPerSecond * option.value)} credits
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTION_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.value === '1080p' && selectedModel.id === 'seedance-lite'}
                        >
                          <div className="flex items-center gap-2">
                            <span>{option.label}</span>
                            {option.value === '1080p' && selectedModel.id === 'seedance-lite' && (
                              <Badge variant="outline" className="text-xs">Pro Only</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Aspect Ratio</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={setAspectRatio}
                    disabled={inputImages.length > 0}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          <div>
                            <div className="font-medium">{ratio.label}</div>
                            <div className="text-xs text-slate-400">{ratio.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {inputImages.length > 0 && (
                    <p className="text-xs text-amber-400">
                      ⚠️ Aspect ratio determined by input image
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Camera Movement</Label>
                  <Select value={cameraFixed ? 'fixed' : 'dynamic'} onValueChange={(value) => setCameraFixed(value === 'fixed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dynamic">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span>Dynamic Camera</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <span>Fixed Camera</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedModel.icon}</span>
                  <span className="font-medium text-white">{selectedModel.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedModel.maxResolution} Max
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-3">{selectedModel.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedModel.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Generation Info */}
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Video Duration:</span>
                    <span className="text-white">{duration} seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span className="text-white">{resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Credits:</span>
                    <span className="text-amber-400">{totalCredits} credits</span>
                  </div>
                  {inputImages.length > 0 && (
                    <div className="text-blue-400 mt-2">
                      📷 Image-to-Video mode active
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateVideo}
                disabled={!canGenerate}
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Video ({totalCredits} credits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Gallery & Generated Videos */}
        <div className="space-y-6">
          {/* Generated Videos Section */}
          {generations.length > 0 && (
            <Card className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-green-400" />
                  Generated Videos ({generations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generations.map((generation) => (
                  <div key={generation.id} className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          generation.status === 'completed' ? 'bg-green-600' :
                          generation.status === 'generating' ? 'bg-blue-600' :
                          'bg-red-600'
                        }>
                          {generation.status === 'completed' ? '✅ Ready' :
                           generation.status === 'generating' ? '⏳ Generating' :
                           '❌ Failed'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {generation.duration}s • {generation.resolution} • {generation.creditsUsed}c
                        </span>
                      </div>
                      {generation.status === 'completed' && generation.videoUrl && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {generation.status === 'generating' && (
                      <Progress value={generation.progress} className="w-full" />
                    )}

                    {generation.videoUrl && (
                      <video
                        controls
                        className="w-full rounded border border-slate-600"
                        poster={generation.inputImage}
                      >
                        <source src={generation.videoUrl} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {generation.prompt}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Gallery Integration */}
          <div className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
            <Tabs defaultValue="generated" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated" className="text-xs lg:text-sm">📹 Videos</TabsTrigger>
                <TabsTrigger value="library" className="text-xs lg:text-sm">📚 Library</TabsTrigger>
              </TabsList>
              <TabsContent value="generated">
                <UnifiedImageGallery
                  currentTab="shot-animator"
                  onSendToTab={(videoUrl, targetTab) => {
                    if (targetTab === 'shot-editor' && onSendToImageEdit) {
                      onSendToImageEdit(videoUrl)
                    }
                  }}
                  onSendToLibrary={onSendToLibrary}
                />
              </TabsContent>
              <TabsContent value="library">
                <Gen4ReferenceLibrary
                  libraryItems={libraryItems}
                  libraryCategory={libraryCategory}
                  setLibraryCategory={setLibraryCategory}
                  libraryLoading={libraryLoading}
                  onFullscreenImage={onFullscreenImage}
                  compact={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}