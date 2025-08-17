'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Film, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { convertStoryShots, convertMusicVideoShots, storeShotsForTransfer } from '@/lib/post-production/transfer'
import type { ChapterBreakdown } from '@/lib/types'
import type { PostProductionShot } from '@/lib/post-production/types'

interface SendToPostProductionEnhancedProps {
  type: 'story' | 'music-video'
  data: ChapterBreakdown[] | any[]
  projectId?: string
  disabled?: boolean
}

export function SendToPostProductionEnhanced({ 
  type, 
  data, 
  projectId = `project_${Date.now()}`,
  disabled = false 
}: SendToPostProductionEnhancedProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  
  // Convert all shots for preview
  const allShots = type === 'story' 
    ? convertStoryShots(data as ChapterBreakdown[], projectId)
    : convertMusicVideoShots(data, projectId)
  
  // Group shots by chapter/section
  const groupedShots = allShots.reduce((acc, shot) => {
    const key = shot.sourceChapter || shot.sourceSection || 'ungrouped'
    if (!acc[key]) acc[key] = []
    acc[key].push(shot)
    return acc
  }, {} as Record<string, PostProductionShot[]>)
  
  const handleSelectAll = () => {
    if (selectedShots.size === allShots.length) {
      setSelectedShots(new Set())
    } else {
      setSelectedShots(new Set(allShots.map(s => s.id)))
    }
  }
  
  const handleSelectChapter = (chapterKey: string) => {
    const chapterShots = groupedShots[chapterKey] || []
    const chapterShotIds = chapterShots.map(s => s.id)
    const allSelected = chapterShotIds.every(id => selectedShots.has(id))
    
    const newSelection = new Set(selectedShots)
    if (allSelected) {
      chapterShotIds.forEach(id => newSelection.delete(id))
    } else {
      chapterShotIds.forEach(id => newSelection.add(id))
    }
    setSelectedShots(newSelection)
  }
  
  const handleToggleShot = (shotId: string) => {
    const newSelection = new Set(selectedShots)
    if (newSelection.has(shotId)) {
      newSelection.delete(shotId)
    } else {
      newSelection.add(shotId)
    }
    setSelectedShots(newSelection)
  }
  
  const handleSendSelected = () => {
    const shotsToSend = allShots.filter(shot => selectedShots.has(shot.id))
    
    if (shotsToSend.length === 0) {
      toast({
        title: "No Shots Selected",
        description: "Please select at least one shot to send",
        variant: "destructive"
      })
      return
    }
    
    // Store shots for transfer
    storeShotsForTransfer(shotsToSend)
    
    // Show success message
    toast({
      title: "Shots Transferred",
      description: `Sending ${shotsToSend.length} shots to Post Production...`,
    })
    
    // Close dialog and navigate
    setShowDialog(false)
    router.push('/post-production')
  }
  
  const handleQuickSend = () => {
    // Quick send all shots without dialog
    if (allShots.length === 0) {
      toast({
        title: "No Shots Available",
        description: "Generate shots first before sending to Post Production",
        variant: "destructive"
      })
      return
    }
    
    storeShotsForTransfer(allShots)
    toast({
      title: "All Shots Transferred",
      description: `Sending ${allShots.length} shots to Post Production...`,
    })
    router.push('/post-production')
  }
  
  const toggleChapterExpansion = (chapterKey: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterKey)) {
      newExpanded.delete(chapterKey)
    } else {
      newExpanded.add(chapterKey)
    }
    setExpandedChapters(newExpanded)
  }
  
  return (
    <>
      <div className="flex gap-2">
        {/* Quick Send All Button */}
        <Button
          onClick={handleQuickSend}
          disabled={disabled || allShots.length === 0}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Film className="w-4 h-4 mr-2" />
          Send All to Post Production
          {allShots.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {allShots.length}
            </span>
          )}
        </Button>
        
        {/* Select Shots Button */}
        <Button
          onClick={() => setShowDialog(true)}
          disabled={disabled || allShots.length === 0}
          variant="outline"
          className="text-white border-slate-600"
        >
          Select Shots
        </Button>
      </div>
      
      {/* Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Select Shots for Post Production</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose which shots to send for image generation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedShots.size === allShots.length}
                  onCheckedChange={handleSelectAll}
                />
                <span>Select All Shots</span>
              </div>
              <Badge variant="outline" className="text-slate-300">
                {selectedShots.size} / {allShots.length} selected
              </Badge>
            </div>
            
            {/* Shots by Chapter */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {Object.entries(groupedShots).map(([chapterKey, shots]) => {
                  const isExpanded = expandedChapters.has(chapterKey)
                  const chapterSelected = shots.every(s => selectedShots.has(s.id))
                  const chapterPartiallySelected = shots.some(s => selectedShots.has(s.id)) && !chapterSelected
                  
                  return (
                    <div key={chapterKey} className="border border-slate-700 rounded-lg overflow-hidden">
                      {/* Chapter Header */}
                      <div className="flex items-center justify-between p-3 bg-slate-800/50">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={chapterSelected}
                            indeterminate={chapterPartiallySelected}
                            onCheckedChange={() => handleSelectChapter(chapterKey)}
                          />
                          <button
                            onClick={() => toggleChapterExpansion(chapterKey)}
                            className="flex items-center gap-2 text-left"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            <span className="font-medium">
                              {chapterKey === 'ungrouped' ? 'Ungrouped Shots' : `Chapter: ${chapterKey}`}
                            </span>
                          </button>
                        </div>
                        <Badge variant="outline" className="text-slate-400">
                          {shots.length} shots
                        </Badge>
                      </div>
                      
                      {/* Chapter Shots */}
                      {isExpanded && (
                        <div className="p-3 space-y-2">
                          {shots.map((shot) => (
                            <div key={shot.id} className="flex items-start gap-2 p-2 rounded hover:bg-slate-800/30">
                              <Checkbox
                                checked={selectedShots.has(shot.id)}
                                onCheckedChange={() => handleToggleShot(shot.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-slate-500">Shot #{shot.shotNumber}</span>
                                </div>
                                <p className="text-sm text-slate-300 line-clamp-2">
                                  {shot.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="text-slate-300 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSelected}
              disabled={selectedShots.size === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send {selectedShots.size} {selectedShots.size === 1 ? 'Shot' : 'Shots'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}