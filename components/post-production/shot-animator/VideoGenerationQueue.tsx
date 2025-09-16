'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, Download, Trash2, Film, AlertTriangle, CheckCircle } from 'lucide-react'
import { VideoGeneration } from './types'

interface VideoGenerationQueueProps {
  generations: VideoGeneration[]
  isGenerating: boolean
  onPause: () => void
  onResume: () => void
  onRemove: (id: string) => void
  onDownload: (videoUrl: string) => void
}

export function VideoGenerationQueue({
  generations,
  isGenerating,
  onPause,
  onResume,
  onRemove,
  onDownload
}: VideoGenerationQueueProps) {
  const getStatusBadge = (status: VideoGeneration['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-400">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-blue-400">Processing</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-400">Completed</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-400">Failed</Badge>
    }
  }

  const getStatusIcon = (status: VideoGeneration['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Film className="w-4 h-4 text-blue-400" />
    }
  }

  if (generations.length === 0) {
    return (
      <Card className="border-slate-700">
        <CardContent className="py-12 text-center">
          <Film className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No videos generated yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Film className="w-5 h-5 text-green-400" />
            Generation Queue
            <Badge variant="secondary">{generations.length}</Badge>
          </CardTitle>
          {isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="p-4 rounded-lg bg-slate-900/50 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(gen.status)}
                    <span className="font-medium text-sm">
                      {gen.model === 'seedance-lite' ? 'Lite' : 'Pro'} • {gen.duration}s • {gen.resolution}
                    </span>
                    {getStatusBadge(gen.status)}
                  </div>
                  <div className="flex gap-1">
                    {gen.videoUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(gen.videoUrl!)}
                        className="h-7 w-7"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(gen.id)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                  {gen.prompt}
                </p>

                {gen.status === 'processing' && (
                  <div className="space-y-1">
                    <Progress value={gen.progress} className="h-1" />
                    <p className="text-xs text-slate-500">{gen.progress}% complete</p>
                  </div>
                )}

                {gen.error && (
                  <p className="text-xs text-red-400 mt-2">{gen.error}</p>
                )}

                {gen.creditsUsed !== undefined && (
                  <p className="text-xs text-slate-500 mt-2">
                    Credits used: {gen.creditsUsed}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}