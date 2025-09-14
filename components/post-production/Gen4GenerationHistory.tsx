'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Maximize2,
  Download,
  Copy,
  Trash2,
  ArrowRight,
  Share
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Gen4Generation, LibraryImageReference } from '@/lib/post-production/enhanced-types'

interface Gen4GenerationHistoryProps {
  gen4Generations: Gen4Generation[]
  setGen4Generations: (generations: Gen4Generation[]) => void
  onFullscreenImage: (image: LibraryImageReference) => void
  onSendToWorkspace?: (imageUrl: string) => void
  onSendToImageEdit?: (imageUrl: string) => void
  generatedShotIds?: Set<string>
  onShotGenerated?: (shotId: string, imageUrl: string) => void
  shotList?: any[]
}

export function Gen4GenerationHistory({
  gen4Generations,
  setGen4Generations,
  onFullscreenImage,
  onSendToWorkspace,
  onSendToImageEdit,
  generatedShotIds = new Set(),
  onShotGenerated,
  shotList = []
}: Gen4GenerationHistoryProps) {
  const { toast } = useToast()
  const [pendingImageSave, setPendingImageSave] = useState<{
    imageUrl: string
    prompt: string
    settings: any
  } | null>(null)

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to Clipboard",
        description: "Image URL copied successfully"
      })
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleDeleteGeneration = (generationId: string) => {
    setGen4Generations(gen4Generations.filter(gen => gen.id !== generationId))
    toast({
      title: "Generation Deleted",
      description: "Generation removed from history"
    })
  }

  if (gen4Generations.length === 0) {
    return null
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Generation History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[32rem]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gen4Generations.map(gen => (
              <div key={gen.id} className="space-y-2">
                <div className="bg-slate-800 rounded overflow-hidden relative group">
                  {gen.outputUrl ? (
                    <>
                      <div className="w-full bg-slate-800 rounded overflow-hidden">
                        <img
                          src={gen.outputUrl}
                          alt={gen.prompt}
                          className="w-full max-h-48 object-contain"
                        />
                      </div>
                      
                      {/* Magnifying glass hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-white hover:bg-white/20"
                          onClick={() => {
                            // Create fullscreen data object
                            const fullscreenData = {
                              id: gen.id,
                              imageData: gen.outputUrl!,
                              preview: gen.outputUrl!,
                              tags: ['generated'],
                              prompt: gen.prompt,
                              category: 'generated',
                              metadata: gen.settings,
                              uploadedAt: new Date(gen.timestamp).toISOString()
                            }
                            onFullscreenImage(fullscreenData)
                          }}
                          title="View Fullscreen"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                        <div className="flex gap-1">
                          {onSendToImageEdit && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={() => onSendToImageEdit(gen.outputUrl!)}
                              title="Send to Image Edit"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-48 bg-slate-700 rounded flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Processing...</span>
                    </div>
                  )}
                </div>
                
                {/* Generation Info */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {gen.prompt.slice(0, 60)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(gen.timestamp).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-slate-400 hover:text-white"
                        onClick={() => handleCopyToClipboard(gen.outputUrl || '')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost" 
                        className="h-5 w-5 p-0 text-slate-400 hover:text-red-400"
                        onClick={() => handleDeleteGeneration(gen.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}