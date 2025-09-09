'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Copy,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Film,
  Camera,
  Download
} from 'lucide-react'
import type { PostProductionShot } from '@/lib/post-production/types'

interface ShotListGridProps {
  shots: PostProductionShot[]
  selectedShots: Set<string>
  onShotSelect: (shotId: string) => void
  onSelectAll: () => void
  onShotEdit: (shot: PostProductionShot) => void
  onShotDelete: (shotId: string) => void
  onShotCopy: (shot: PostProductionShot) => void
  groupBy: 'chapter' | 'section' | 'none'
}

export function ShotListGrid({
  shots,
  selectedShots,
  onShotSelect,
  onSelectAll,
  onShotEdit,
  onShotDelete,
  onShotCopy,
  groupBy
}: ShotListGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'pending': return <Clock className="w-3 h-3 text-yellow-400" />
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-400" />
      default: return <Clock className="w-3 h-3 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10'
      case 'pending': return 'border-yellow-500 bg-yellow-500/10'
      case 'failed': return 'border-red-500 bg-red-500/10'
      default: return 'border-slate-600 bg-slate-800/50'
    }
  }

  // Group shots if needed
  const groupedShots = groupBy === 'none' ? { 'All Shots': shots } : shots.reduce((groups, shot) => {
    const key = groupBy === 'chapter' ? shot.sourceChapter || 'No Chapter' : shot.sourceSection || 'No Section'
    if (!groups[key]) groups[key] = []
    groups[key].push(shot)
    return groups
  }, {} as Record<string, PostProductionShot[]>)

  if (shots.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
        <Film className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No shots yet</h3>
        <p className="text-slate-400">Generate shots in Story or Music Video mode</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={shots.length > 0 && selectedShots.size === shots.length}
            onCheckedChange={onSelectAll}
            className="border-slate-500"
          />
          <span className="text-sm text-slate-300">{selectedShots.size} shots</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <Camera className="w-3 h-3 mr-1" />
            Group by Chapter
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            <Download className="w-3 h-3 mr-1" />
            Export with Metadata
          </Button>
        </div>
      </div>

      {/* Shot Groups */}
      <ScrollArea className="h-96">
        <div className="space-y-6">
          {Object.entries(groupedShots).map(([groupName, groupShots]) => (
            <div key={groupName} className="space-y-3">
              {groupBy !== 'none' && (
                <h4 className="font-medium text-white text-sm border-b border-slate-700 pb-2">
                  {groupName} ({groupShots.length} shots)
                </h4>
              )}
              
              <div className="grid gap-3">
                {groupShots.map((shot) => (
                  <div
                    key={shot.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${getStatusColor(shot.status)} ${
                      selectedShots.has(shot.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => onShotSelect(shot.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedShots.has(shot.id)}
                          onCheckedChange={() => onShotSelect(shot.id)}
                          className="border-slate-500"
                        />
                        {getStatusIcon(shot.status)}
                        <span className="text-xs text-slate-400">
                          {shot.sourceChapter || 'Ch. 1'} • {shot.sourceSection || 'Scene'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShotCopy(shot)
                          }}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShotEdit(shot)
                          }}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShotDelete(shot.id)
                          }}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {shot.description}
                    </p>
                    
                    {shot.metadata && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {shot.metadata.characters?.slice(0, 3).map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-blue-400 border-blue-400">
                            {char}
                          </Badge>
                        ))}
                        {shot.metadata.locations?.slice(0, 2).map((loc, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-400">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}