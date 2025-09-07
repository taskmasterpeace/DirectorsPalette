'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  List,
  Download,
  Trash2,
  Settings
} from 'lucide-react'

interface ShotListHeaderProps {
  totalShots: number
  selectedCount: number
  onExportConfig: () => void
  onClearAll: () => void
  onShowSettings: () => void
  canClearAll: boolean
}

export function ShotListHeader({
  totalShots,
  selectedCount,
  onExportConfig,
  onClearAll,
  onShowSettings,
  canClearAll
}: ShotListHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <List className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Shot List Manager</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{totalShots} total shots</span>
            {selectedCount > 0 && (
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {selectedCount} selected
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onShowSettings}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300"
        >
          <Settings className="w-3 h-3 mr-1" />
          Settings
        </Button>
        
        <Button
          onClick={onClearAll}
          disabled={!canClearAll}
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400 hover:bg-red-600 hover:text-white"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All
        </Button>
        
        <Button
          onClick={onExportConfig}
          variant="outline"
          size="sm"
          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
        >
          <Download className="w-3 h-3 mr-1" />
          Export Config
        </Button>
      </div>
    </div>
  )
}