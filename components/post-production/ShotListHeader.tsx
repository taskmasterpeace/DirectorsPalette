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
      {/* Mobile-Optimized Header */}
      <div className="space-y-3 lg:flex lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <List className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-white">Shot List Manager</h2>
            <p className="text-slate-400 text-sm">{totalShots} total shots</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center lg:gap-2">
          <Button
            onClick={onClearAll}
            disabled={!canClearAll}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400 hover:bg-red-600 hover:text-white h-12 lg:h-9 text-sm lg:text-xs"
          >
            <Trash2 className="w-4 h-4 lg:w-3 lg:h-3 mr-2 lg:mr-1" />
            Clear All
          </Button>
          <Button
            onClick={onExportConfig}
            variant="outline"
            size="sm"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white h-12 lg:h-9 text-sm lg:text-xs"
          >
            <Download className="w-4 h-4 lg:w-3 lg:h-3 mr-2 lg:mr-1" />
            Export
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