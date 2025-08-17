'use client'

import { Button } from '@/components/ui/button'
import { Send, Film } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { convertStoryShots, convertMusicVideoShots, storeShotsForTransfer } from '@/lib/post-production/transfer'
import type { ChapterBreakdown } from '@/lib/types'

interface SendToPostProductionProps {
  type: 'story' | 'music-video'
  data: ChapterBreakdown[] | any[] // Update based on your music video types
  projectId?: string
  disabled?: boolean
}

export function SendToPostProduction({ 
  type, 
  data, 
  projectId = `project_${Date.now()}`,
  disabled = false 
}: SendToPostProductionProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const handleSendToPostProduction = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No Shots Available",
        description: "Generate shots first before sending to Post Production",
        variant: "destructive"
      })
      return
    }
    
    // Convert shots based on type
    const shots = type === 'story' 
      ? convertStoryShots(data as ChapterBreakdown[], projectId)
      : convertMusicVideoShots(data, projectId)
    
    if (shots.length === 0) {
      toast({
        title: "No Shots Found",
        description: "No shots were found to transfer",
        variant: "destructive"
      })
      return
    }
    
    // Store shots for transfer
    storeShotsForTransfer(shots)
    
    // Show success message
    toast({
      title: "Shots Transferred",
      description: `Sending ${shots.length} shots to Post Production...`,
    })
    
    // Navigate to Post Production
    router.push('/post-production')
  }
  
  // Count total shots
  const shotCount = data?.reduce((total, item) => {
    const shots = item.shots || []
    return total + shots.length
  }, 0) || 0
  
  return (
    <Button
      onClick={handleSendToPostProduction}
      disabled={disabled || shotCount === 0}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
    >
      <Film className="w-4 h-4 mr-2" />
      Send to Post Production
      {shotCount > 0 && (
        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
          {shotCount} shots
        </span>
      )}
    </Button>
  )
}