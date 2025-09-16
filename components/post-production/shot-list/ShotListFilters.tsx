'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Users, MapPin, Package, Download, Copy, Settings } from 'lucide-react'
import { FilterState } from './types'

interface ShotListFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onCopySelected: () => void
  onExport: () => void
  onBulkEdit: () => void
}

export function ShotListFilters({
  filters,
  onFiltersChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onCopySelected,
  onExport,
  onBulkEdit
}: ShotListFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search shots by description..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.filterStatus}
          onValueChange={(value: any) => onFiltersChange({ ...filters, filterStatus: value })}
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shots</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.groupBy}
          onValueChange={(value: any) => onFiltersChange({ ...filters, groupBy: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Grouping</SelectItem>
            <SelectItem value="chapter">By Chapter</SelectItem>
            <SelectItem value="section">By Section</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Filters */}
      <div className="flex gap-2">
        <Button
          variant={filters.entityFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, entityFilter: 'all' })}
        >
          All Entities
        </Button>
        <Button
          variant={filters.entityFilter === 'characters' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, entityFilter: 'characters' })}
        >
          <Users className="w-4 h-4 mr-2" />
          Characters
        </Button>
        <Button
          variant={filters.entityFilter === 'places' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, entityFilter: 'places' })}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Places
        </Button>
        <Button
          variant={filters.entityFilter === 'props' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, entityFilter: 'props' })}
        >
          <Package className="w-4 h-4 mr-2" />
          Props
        </Button>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
          >
            {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} shots selected
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopySelected}
            disabled={selectedCount === 0}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkEdit}
            disabled={selectedCount === 0}
          >
            <Settings className="w-4 h-4 mr-2" />
            Bulk Edit
          </Button>
        </div>
      </div>
    </div>
  )
}