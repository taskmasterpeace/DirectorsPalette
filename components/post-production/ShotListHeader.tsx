'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  List,
  Search,
  Settings,
  Download,
  Trash2
} from 'lucide-react'

interface ShotListHeaderProps {
  totalShots: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  onExportConfig: () => void
  onClearAll: () => void
  canClearAll: boolean
}

export function ShotListHeader({
  totalShots,
  searchTerm,
  setSearchTerm,
  onExportConfig,
  onClearAll,
  canClearAll
}: ShotListHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <List className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Shot List Manager</h2>
            <p className="text-slate-400 text-sm">{totalShots} total shots</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            placeholder="Search shots, chapters, sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  )
}