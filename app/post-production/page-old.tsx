'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Film, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Trash2,
  Play,
  Pause,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { usePostProductionStore } from '@/stores/post-production-store'
import { retrieveTransferredShots } from '@/lib/post-production/transfer'
import { useToast } from '@/components/ui/use-toast'
import type { PostProductionShot } from '@/lib/post-production/types'

export default function PostProductionPage() {
  const { toast } = useToast()
  const {
    shotQueue,
    processingShot,
    completedShots,
    failedShots,
    isGenerating,
    currentProgress,
    totalProgress,
    addShots,
    removeShot,
    clearQueue,
    setIsGenerating,
    setProcessingShot,
    markShotCompleted,
    markShotFailed,
    updateProgress
  } = usePostProductionStore()
  
  // Check for transferred shots on mount
  useEffect(() => {
    const transferredShots = retrieveTransferredShots()
    if (transferredShots && transferredShots.length > 0) {
      addShots(transferredShots)
      toast({
        title: "Shots Imported",
        description: `Successfully imported ${transferredShots.length} shots from Director's Palette`,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const allShots = [...shotQueue, ...(processingShot ? [processingShot] : []), ...completedShots, ...failedShots]
  const pendingCount = shotQueue.length
  const completedCount = completedShots.length
  const failedCount = failedShots.length
  
  const handleGenerateAll = async () => {
    if (shotQueue.length === 0) {
      toast({
        title: "No Shots to Generate",
        description: "Add shots to the queue first",
        variant: "destructive"
      })
      return
    }
    
    setIsGenerating(true)
    const total = shotQueue.length
    let current = 0
    
    toast({
      title: "Generation Started",
      description: `Processing ${total} shots with Replicate...`,
    })
    
    for (const shot of shotQueue) {
      current++
      updateProgress(current, total)
      setProcessingShot(shot)
      
      try {
        // Call our API endpoint
        const response = await fetch('/post-production/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: shot.description,
            shotId: shot.id 
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Generation failed')
        }
        
        const result = await response.json()
        
        // Mark shot as completed with generated images
        markShotCompleted(shot.id, result.images.map((url: string, idx: number) => ({
          id: `${shot.id}_img_${idx}`,
          url,
          model: 'stable-diffusion',
          timestamp: new Date()
        })))
        
      } catch (error) {
        console.error(`Failed to generate shot ${shot.id}:`, error)
        markShotFailed(shot.id, error instanceof Error ? error.message : 'Unknown error')
        
        toast({
          title: "Generation Failed",
          description: `Shot #${shot.shotNumber} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        })
      }
    }
    
    setIsGenerating(false)
    setProcessingShot(null)
    updateProgress(0, 0)
    
    toast({
      title: "Generation Complete",
      description: `Successfully generated ${completedShots.length} shots`,
    })
  }
  
  const ShotCard = ({ shot }: { shot: PostProductionShot }) => {
    const getStatusIcon = () => {
      switch (shot.status) {
        case 'pending':
          return <Clock className="w-4 h-4 text-slate-400" />
        case 'processing':
          return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        case 'completed':
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'failed':
          return <XCircle className="w-4 h-4 text-red-500" />
      }
    }
    
    const getStatusColor = () => {
      switch (shot.status) {
        case 'pending': return 'bg-slate-600'
        case 'processing': return 'bg-blue-600'
        case 'completed': return 'bg-green-600'
        case 'failed': return 'bg-red-600'
      }
    }
    
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>
                {shot.status}
              </Badge>
              <span className="text-xs text-slate-400">
                Shot #{shot.shotNumber}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeShot(shot.id)}
              className="text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-white mb-2 line-clamp-3">
            {shot.description}
          </p>
          
          {shot.sourceChapter && (
            <span className="text-xs text-slate-500">
              Chapter: {shot.sourceChapter}
            </span>
          )}
          {shot.sourceSection && (
            <span className="text-xs text-slate-500">
              Section: {shot.sourceSection}
            </span>
          )}
          
          {shot.generatedImages && shot.generatedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {shot.generatedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square bg-slate-700 rounded overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={`Generated image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <ImageIcon className="hidden w-full h-full p-4 text-slate-600" />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = img.url
                      link.download = `shot_${shot.shotNumber}_${idx + 1}.png`
                      link.click()
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Film className="w-8 h-8 text-purple-500" />
              Post Production
            </h1>
            <p className="text-slate-400 mt-1">
              Generate images from your Director's Palette shots
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearQueue}
              disabled={allShots.length === 0}
              className="text-slate-300 border-slate-600"
            >
              Clear All
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={pendingCount === 0 || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate All
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{allShots.length}</div>
              <div className="text-sm text-slate-400">Total Shots</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
              <div className="text-sm text-slate-400">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{completedCount}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">{failedCount}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Shot Queue */}
          <div className="col-span-4">
            <Card className="bg-slate-900 border-slate-700 h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Shot Queue</CardTitle>
              </CardHeader>
              <Separator className="bg-slate-700" />
              <CardContent className="p-0">
                <ScrollArea className="h-[520px]">
                  <div className="p-4 space-y-3">
                    {allShots.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No shots in queue</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Generate shots in Story or Music Video mode
                        </p>
                      </div>
                    ) : (
                      allShots.map(shot => (
                        <ShotCard key={shot.id} shot={shot} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Generation Settings & Results */}
          <div className="col-span-8">
            <Card className="bg-slate-900 border-slate-700 h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  <span>Generation Results</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardTitle>
              </CardHeader>
              <Separator className="bg-slate-700" />
              <CardContent className="p-4">
                {completedShots.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No images generated yet</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Click "Generate All" to start creating images
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {completedShots.map(shot => (
                      shot.generatedImages?.map((img, idx) => (
                        <div key={`${shot.id}-${idx}`} className="relative group">
                          <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden">
                            <img 
                              src={img.url} 
                              alt={`Generated for shot ${shot.shotNumber}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                            <ImageIcon className="hidden w-full h-full p-8 text-slate-700" />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                            <p className="text-white text-xs px-2 text-center line-clamp-2">
                              Shot #{shot.shotNumber}
                            </p>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = img.url
                                link.download = `shot_${shot.shotNumber}_${idx + 1}.png`
                                link.click()
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isGenerating && totalProgress > 0 && (
          <div className="fixed bottom-4 left-4 right-4 bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">
                Generating images... {currentProgress} / {totalProgress}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsGenerating(false)}
                className="text-slate-400"
              >
                <Pause className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentProgress / totalProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}