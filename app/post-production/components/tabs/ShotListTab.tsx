'use client'

import { ShotListManager } from '@/components/post-production/ShotListManager'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { List, Film, Music } from 'lucide-react'
import { usePostProductionStore } from '@/stores/post-production-store'

export function ShotListTab() {
  const { shotQueue, completedShots, failedShots } = usePostProductionStore()
  
  // Calculate statistics
  const totalShots = shotQueue.length + completedShots.length + failedShots.length
  const storyShots = [...shotQueue, ...completedShots, ...failedShots]
    .filter(shot => shot.projectType === 'story').length
  const musicVideoShots = [...shotQueue, ...completedShots, ...failedShots]
    .filter(shot => shot.projectType === 'music-video').length

  return (
    <div className="w-full space-y-4">
      {/* Compact Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-blue-500" />
            Shot List Manager
          </h2>
          {totalShots > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {totalShots} Total
              </Badge>
              {storyShots > 0 && (
                <Badge variant="outline" className="text-xs border-green-600/30 text-green-400">
                  {storyShots} Story
                </Badge>
              )}
              {musicVideoShots > 0 && (
                <Badge variant="outline" className="text-xs border-purple-600/30 text-purple-400">
                  {musicVideoShots} Music Video
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Quick feature hints - only show when needed */}
        {totalShots > 0 && (
          <div className="text-xs text-slate-400 hidden lg:block">
            Organize • Filter • Export • Edit
          </div>
        )}
      </div>

      {/* Enhanced Shot List Manager */}
      <ShotListManager />
    </div>
  )
}