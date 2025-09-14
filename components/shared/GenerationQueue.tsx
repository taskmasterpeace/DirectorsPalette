'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useGenerationQueueStore } from '@/stores/generation-queue-store'
import { cn } from '@/lib/utils'

export function GenerationQueue() {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    requests,
    isProcessing,
    currentlyProcessing,
    getQueuedCount,
    getProcessingCount, 
    getCompletedCount,
    getFailedCount,
    removeFromQueue,
    clearCompleted
  } = useGenerationQueueStore()

  const queuedCount = getQueuedCount()
  const processingCount = getProcessingCount()
  const completedCount = getCompletedCount()
  const failedCount = getFailedCount()
  const totalActive = queuedCount + processingCount

  // Auto-expand when there are active requests
  useEffect(() => {
    if (totalActive > 0) {
      setIsExpanded(true)
    }
  }, [totalActive])

  if (requests.length === 0) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-3 h-3 text-yellow-400" />
      case 'processing': return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'failed': return <XCircle className="w-3 h-3 text-red-400" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-600'
      case 'processing': return 'bg-blue-600'
      case 'completed': return 'bg-green-600'
      case 'failed': return 'bg-red-600'
      default: return 'bg-slate-600'
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 fixed bottom-4 right-4 w-80 z-50">
      {/* Compact header */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Clock className="w-5 h-5 text-purple-400" />
              {totalActive > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{totalActive}</span>
                </div>
              )}
            </div>
            <span className="font-medium text-white">Generation Queue</span>
          </div>
          
          <div className="flex items-center gap-2">
            {queuedCount > 0 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                {queuedCount} queued
              </Badge>
            )}
            {processingCount > 0 && (
              <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                {processingCount} processing
              </Badge>
            )}
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        {isProcessing && (
          <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
      </div>

      {/* Expanded queue list */}
      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              {requests.length} total request{requests.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearCompleted}
                className="h-6 text-xs"
                disabled={completedCount === 0 && failedCount === 0}
              >
                Clear Done
              </Button>
            </div>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-2">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className={cn(
                    "p-3 rounded border text-sm",
                    request.id === currentlyProcessing 
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium text-white capitalize">
                        {request.type.replace('-', ' ')}
                      </span>
                      <Badge 
                        className={cn("text-white text-xs", getStatusColor(request.status))}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromQueue(request.id)}
                      className="h-5 w-5 p-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-slate-300 text-xs line-clamp-2">
                    {request.prompt.slice(0, 80)}...
                  </p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span>{request.createdAt.toLocaleTimeString()}</span>
                    {request.creditsUsed && (
                      <span className="text-amber-400">{request.creditsUsed} credits</span>
                    )}
                  </div>
                  
                  {request.status === 'failed' && request.error && (
                    <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
                      Error: {request.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}