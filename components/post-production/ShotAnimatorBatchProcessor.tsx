/**
 * Shot Animator Batch Processor
 * Handle multiple image animation with queue management
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  Square,
  Film,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react'
import type { BatchAnimationJob, ImageUpload, VideoGeneration } from './ShotAnimatorTypes'

interface ShotAnimatorBatchProcessorProps {
  selectedImages: ImageUpload[]
  prompt: string
  settings: {
    duration: number
    resolution: string
    aspectRatio: string
    cameraFixed: boolean
    seed?: number
  }
  creditsPerVideo: number
  onStartBatch: (job: BatchAnimationJob) => void
  onPauseBatch: (jobId: string) => void
  onCancelBatch: (jobId: string) => void
  currentJobs: BatchAnimationJob[]
}

export function ShotAnimatorBatchProcessor({
  selectedImages,
  prompt,
  settings,
  creditsPerVideo,
  onStartBatch,
  onPauseBatch,
  onCancelBatch,
  currentJobs
}: ShotAnimatorBatchProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const totalCredits = selectedImages.length * creditsPerVideo

  const handleStartBatch = useCallback(() => {
    if (selectedImages.length === 0 || !prompt.trim()) return

    const newJob: BatchAnimationJob = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      images: selectedImages,
      prompt: prompt.trim(),
      settings,
      status: 'pending',
      progress: 0,
      completedVideos: [],
      totalCredits,
      createdAt: new Date().toISOString()
    }

    onStartBatch(newJob)
    setIsProcessing(true)
  }, [selectedImages, prompt, settings, totalCredits, onStartBatch])

  const activeJob = currentJobs.find(job => job.status === 'processing')
  const completedJobs = currentJobs.filter(job => job.status === 'completed')
  const failedJobs = currentJobs.filter(job => job.status === 'failed')

  return (
    <Card className="bg-slate-900/30 lg:rounded-lg lg:border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-orange-400" />
          Batch Animation
          {selectedImages.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {selectedImages.length} images
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Configuration */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Images to animate:</span>
              <span className="text-white ml-2 font-semibold">{selectedImages.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Credits per video:</span>
              <span className="text-amber-400 ml-2 font-semibold">{creditsPerVideo}</span>
            </div>
            <div>
              <span className="text-slate-400">Total credits needed:</span>
              <span className="text-amber-400 ml-2 font-semibold">{totalCredits}</span>
            </div>
            <div>
              <span className="text-slate-400">Estimated time:</span>
              <span className="text-slate-300 ml-2">{selectedImages.length * 2} min</span>
            </div>
          </div>
        </div>

        {/* Batch Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleStartBatch}
            disabled={selectedImages.length === 0 || !prompt.trim() || isProcessing}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Animate All Images ({totalCredits} credits)
          </Button>

          {activeJob && (
            <Button
              variant="outline"
              onClick={() => onPauseBatch(activeJob.id)}
              className="px-3"
            >
              <Pause className="w-4 h-4" />
            </Button>
          )}

          {activeJob && (
            <Button
              variant="destructive"
              onClick={() => onCancelBatch(activeJob.id)}
              className="px-3"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Active Job Progress */}
        {activeJob && (
          <div className="space-y-3 p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-orange-300 font-medium">Processing Batch</span>
              </div>
              <Badge className="bg-orange-600">
                {activeJob.completedVideos.length}/{activeJob.images.length}
              </Badge>
            </div>

            <Progress
              value={activeJob.progress}
              className="w-full h-2"
            />

            <div className="text-sm text-orange-200">
              {activeJob.completedVideos.length > 0 && (
                <p>✅ {activeJob.completedVideos.length} videos completed</p>
              )}
              {activeJob.images.length - activeJob.completedVideos.length > 0 && (
                <p>⏳ {activeJob.images.length - activeJob.completedVideos.length} videos remaining</p>
              )}
            </div>
          </div>
        )}

        {/* Job History */}
        {(completedJobs.length > 0 || failedJobs.length > 0) && (
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Recent Batches</Label>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {[...completedJobs, ...failedJobs].slice(-5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-white">
                        {job.images.length} images
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Zap className="w-3 h-3" />
                      {job.totalCredits} credits
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Preview Selected Images */}
        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">
              Selected Images ({selectedImages.length})
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {selectedImages.slice(0, 12).map((image, index) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.preview}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-12 object-cover rounded border border-orange-500/50"
                  />
                  <div className="absolute -top-1 -right-1">
                    <Badge className="text-xs bg-orange-600 text-white w-4 h-4 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
              {selectedImages.length > 12 && (
                <div className="w-full h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                  <span className="text-xs text-slate-400">
                    +{selectedImages.length - 12}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}