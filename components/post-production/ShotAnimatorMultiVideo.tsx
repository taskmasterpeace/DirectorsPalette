/**
 * Shot Animator Multi-Video
 * Each frame gets its own final frame, prompt, and video generation
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
  Video, Play, Upload, Film, X, Zap, ZoomIn, Plus, Expand
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { UnifiedImageGallery } from './UnifiedImageGallery'
import { validateCreditsWithRedirect, useRealTimeCostCalculator } from '@/lib/credits/credit-validation'
import { SEEDANCE_MODELS, DURATION_OPTIONS, ASPECT_RATIOS } from './ShotAnimatorTypes'

interface VideoProject {
  id: string
  startFrame: File | null
  finalFrame: File | null
  prompt: string
  duration: number
  cameraFixed: boolean
  selected: boolean
  showingFinalFrame: boolean
  status: 'ready' | 'generating' | 'completed' | 'failed'
  videoUrl?: string
  creditsUsed?: number
}

interface ShotAnimatorMultiVideoProps {
  onFullscreenImage?: (imageUrl: string) => void
}

export function ShotAnimatorMultiVideo({ onFullscreenImage }: ShotAnimatorMultiVideoProps) {
  const { toast } = useToast()
  const { user, getToken } = useAuth()
  const { addImage, setFullscreenImage } = useUnifiedGalleryStore()
  const router = useRouter()
  const pathname = usePathname()

  // Fullscreen handler for local images
  const handleFullscreenImage = useCallback((file: File) => {
    // Create a temporary GeneratedImage object for fullscreen display
    const tempImage = {
      id: `temp_${Date.now()}`,
      url: URL.createObjectURL(file),
      prompt: 'Uploaded frame',
      source: 'shot-animator' as const,
      model: 'user-upload',
      settings: { aspectRatio: 'native', resolution: 'original' },
      metadata: { createdAt: new Date().toISOString(), creditsUsed: 0 },
      tags: ['upload'],
      persistence: { isPermanent: false }
    }
    setFullscreenImage(tempImage)
  }, [setFullscreenImage])

  // Global settings
  const [selectedModel] = useState(SEEDANCE_MODELS[0])
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  // Video projects state
  const [projects, setProjects] = useState<VideoProject[]>([
    {
      id: 'project_1',
      startFrame: null,
      finalFrame: null,
      prompt: '',
      duration: 5,
      cameraFixed: false,
      selected: false,
      showingFinalFrame: false,
      status: 'ready'
    }
  ])

  const currentCost = useRealTimeCostCalculator({
    duration, resolution, model: selectedModel.id
  })

  const addNewProject = useCallback(() => {
    if (projects.length >= 9) return

    const newProject: VideoProject = {
      id: `project_${Date.now()}`,
      startFrame: null,
      finalFrame: null,
      prompt: '',
      duration: 5,
      cameraFixed: false,
      selected: false,
      showingFinalFrame: false,
      status: 'ready'
    }
    setProjects(prev => [...prev, newProject])
  }, [projects.length])

  const updateProject = useCallback((projectId: string, updates: Partial<VideoProject>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p))
  }, [])

  const removeProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }, [])

  const handleImageUpload = useCallback((
    projectId: string,
    file: File,
    type: 'start' | 'final'
  ) => {
    updateProject(projectId, {
      [type === 'start' ? 'startFrame' : 'finalFrame']: file
    })
  }, [updateProject])

  const generateVideo = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project || !project.startFrame || !project.prompt.trim() || !user) return

    // Credit validation
    const creditValidation = await validateCreditsWithRedirect(
      { operation: 'video generation', baseCredits: 15, duration, resolution, model: selectedModel.id },
      router, pathname
    )
    if (!creditValidation?.canProceed) return

    updateProject(projectId, { status: 'generating' })

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('prompt', project.prompt.trim())
      formData.append('model', selectedModel.id)
      formData.append('duration', project.duration.toString())
      formData.append('resolution', resolution)
      formData.append('aspect_ratio', aspectRatio)
      formData.append('camera_fixed', project.cameraFixed.toString())
      formData.append('input_image', project.startFrame)

      if (project.finalFrame) {
        formData.append('last_frame_image', project.finalFrame)
      }

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
        updateProject(projectId, {
          status: 'completed',
          videoUrl: result.videoUrl,
          creditsUsed: currentCost
        })

        addImage({
          url: result.videoUrl,
          prompt: project.prompt.trim(),
          source: 'shot-animator',
          model: selectedModel.id,
          settings: { aspectRatio, resolution },
          creditsUsed: currentCost,
          metadata: { duration, videoFormat: 'mp4', isVideo: true },
          tags: ['video', selectedModel.id, resolution, aspectRatio]
        })

        toast({ title: "Video Generated", description: `${duration}s video created` })
      }
    } catch (error) {
      updateProject(projectId, { status: 'failed' })
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }, [projects, user, duration, resolution, selectedModel, aspectRatio, getToken, addImage, toast, router, pathname, currentCost, updateProject])

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Main Content - 3/4 width */}
      <div className="col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Shot Animator</h2>
            <Badge variant="outline">SeeeDance Lite</Badge>
          </div>
          <div className="flex items-center gap-2">
            {projects.filter(p => p.selected && p.startFrame && p.prompt.trim()).length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const selectedProjects = projects.filter(p => p.selected && p.startFrame && p.prompt.trim())
                  selectedProjects.forEach(project => generateVideo(project.id))
                }}
                className="bg-orange-600 hover:bg-orange-700 text-xs"
              >
                Generate Selected ({projects.filter(p => p.selected).length})
              </Button>
            )}
            <Badge variant="outline" className="text-xs">Output: {aspectRatio}</Badge>
            <div className="flex gap-1">
              {DURATION_OPTIONS.map(opt => opt.value).includes(duration) && (
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.value}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-8 w-16 text-xs">
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
          </div>
        </div>

        {/* Video Projects Grid */}
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4 space-y-3">
                {/* Frame Display */}
                {project.startFrame ? (
                  <div className="relative group">
                    <div
                      className="w-full h-32 bg-slate-800 rounded border border-green-500/50 overflow-hidden cursor-zoom-in"
                      onClick={() => {
                        const frameToShow = project.showingFinalFrame && project.finalFrame
                          ? project.finalFrame
                          : project.startFrame
                        if (frameToShow) {
                          handleFullscreenImage(frameToShow)
                        }
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.cursor = 'zoom-in'}
                    >
                      <img
                        src={URL.createObjectURL(
                          project.showingFinalFrame && project.finalFrame
                            ? project.finalFrame
                            : project.startFrame
                        )}
                        alt={project.showingFinalFrame ? "Final frame" : "Start frame"}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Final Frame Corner Thumbnail - Larger with Native Aspect Ratio */}
                    {project.finalFrame && (
                      <div
                        className="absolute bottom-3 right-3 w-20 h-16 bg-slate-900 rounded border-2 border-purple-500 overflow-hidden cursor-zoom-in hover:scale-110 transition-transform shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFullscreenImage(project.finalFrame!)
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.cursor = 'zoom-in'}
                      >
                        <img
                          src={URL.createObjectURL(project.finalFrame)}
                          alt="Final frame"
                          className="w-full h-full object-contain" // Changed to object-contain for native aspect ratio
                        />
                        <Badge className="absolute -bottom-1 -right-1 text-xs bg-purple-600 text-white px-1 py-0">
                          END
                        </Badge>
                      </div>
                    )}

                    {/* Frame Swap Button - Swaps start and final frames */}
                    {project.startFrame && project.finalFrame && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-3 left-3 h-6 px-2 bg-black/70 hover:bg-black/90 text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Swap the start and final frames
                          updateProject(project.id, {
                            startFrame: project.finalFrame,
                            finalFrame: project.startFrame
                          })
                          toast({ title: "Frames Swapped", description: "Start and final frames switched" })
                        }}
                      >
                        ⇄ Swap Frames
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 h-5 w-5 p-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeProject(project.id)}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-32 border-2 border-dashed border-slate-600 rounded bg-slate-800/30">
                    <div className="h-3/4 flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400">Start Frame</span>
                    </div>
                    {/* Start Frame Upload Options */}
                    <div className="h-1/4 grid grid-cols-2 gap-1 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            if (files?.[0]) handleImageUpload(project.id, files[0], 'start')
                          }
                          input.click()
                        }}
                        className="h-6 text-xs"
                      >
                        📁 Upload
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const clipboardItems = await navigator.clipboard.read()
                            for (const clipboardItem of clipboardItems) {
                              for (const type of clipboardItem.types) {
                                if (type.startsWith('image/')) {
                                  const blob = await clipboardItem.getType(type)
                                  const file = new File([blob], `pasted-start-${Date.now()}.png`, { type })
                                  handleImageUpload(project.id, file, 'start')
                                  return
                                }
                              }
                            }
                            toast({ title: "No Image", description: "No image in clipboard", variant: "destructive" })
                          } catch (error) {
                            toast({ title: "Paste Failed", description: "Cannot access clipboard", variant: "destructive" })
                          }
                        }}
                        className="h-6 text-xs"
                      >
                        📋 Paste
                      </Button>
                    </div>
                  </div>
                )}

                {/* Final Frame Options - Only show after start frame is uploaded */}
                {project.startFrame && !project.finalFrame && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files?.[0]) handleImageUpload(project.id, files[0], 'final')
                        }
                        input.click()
                      }}
                      className="border-purple-500/30 hover:bg-purple-900/20 text-xs h-7"
                    >
                      <Film className="w-3 h-3 mr-1" />
                      📁 Final
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const clipboardItems = await navigator.clipboard.read()
                          for (const clipboardItem of clipboardItems) {
                            for (const type of clipboardItem.types) {
                              if (type.startsWith('image/')) {
                                const blob = await clipboardItem.getType(type)
                                const file = new File([blob], `pasted-final-${Date.now()}.png`, { type })
                                handleImageUpload(project.id, file, 'final')
                                return
                              }
                            }
                          }
                          toast({ title: "No Image", description: "No image in clipboard", variant: "destructive" })
                        } catch (error) {
                          toast({ title: "Paste Failed", description: "Cannot access clipboard", variant: "destructive" })
                        }
                      }}
                      className="border-purple-500/30 hover:bg-purple-900/20 text-xs h-7"
                    >
                      <Film className="w-3 h-3 mr-1" />
                      📋 Final
                    </Button>
                  </div>
                )}

                {/* Individual Settings */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={project.selected}
                      onChange={(e) => updateProject(project.id, { selected: e.target.checked })}
                      className="w-3 h-3 rounded border-slate-600 bg-slate-800"
                    />
                    <Label className="text-slate-300 text-xs">Select</Label>
                  </div>
                  <Select
                    value={project.duration.toString()}
                    onValueChange={(value) => updateProject(project.id, { duration: parseInt(value) })}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.value}s
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateProject(project.id, { cameraFixed: !project.cameraFixed })}
                  className="w-full h-6 text-xs"
                >
                  {project.cameraFixed ? '📹 Fixed Camera' : '🎥 Dynamic Camera'}
                </Button>

                {/* Prompt */}
                <Textarea
                  value={project.prompt}
                  onChange={(e) => updateProject(project.id, { prompt: e.target.value })}
                  placeholder="Describe this video..."
                  className="min-h-[60px] bg-slate-800 border-slate-600 text-white resize-none text-xs"
                  maxLength={200}
                />

                {/* Generate Button */}
                <Button
                  onClick={() => generateVideo(project.id)}
                  disabled={!project.startFrame || !project.prompt.trim() || project.status === 'generating'}
                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  {project.status === 'generating' ? 'Generating...' : `Generate (${currentCost}c)`}
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Project Button */}
          {projects.length < 9 && (
            <Card className="bg-slate-900/50 border-slate-700 border-dashed">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  onClick={addNewProject}
                  className="w-full h-full border-dashed border-slate-600 hover:border-blue-500/50"
                >
                  <Plus className="w-6 h-6 text-slate-500" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compact Gallery - 1/4 width */}
      <div className="space-y-2">
        <div className="text-sm text-slate-300 font-medium">Results</div>
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