'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search,
  Filter,
  Users,
  MapPin,
  Package,
  List
} from 'lucide-react'

interface ShotListFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterBy: 'all' | 'pending' | 'completed' | 'failed'
  setFilterBy: (filter: 'all' | 'pending' | 'completed' | 'failed') => void
  groupBy: 'chapter' | 'section' | 'none'
  setGroupBy: (group: 'chapter' | 'section' | 'none') => void
  filterByEntity: 'all' | 'people' | 'places' | 'props'
  setFilterByEntity: (filter: 'all' | 'people' | 'places' | 'props') => void
  statusCounts: {
    all: number
    pending: number  
    completed: number
    failed: number
  }
}

export function ShotListFilters({
  searchTerm,
  setSearchTerm,
  filterBy,
  setFilterBy,
  groupBy,
  setGroupBy,
  filterByEntity,
  setFilterByEntity,
  statusCounts
}: ShotListFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <Input
          placeholder="Search shots, chapters, sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-600 text-white"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Grouping */}
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-slate-400" />
          <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chapter">📚 Chapter</SelectItem>
              <SelectItem value="section">📄 Section</SelectItem>
              <SelectItem value="none">📋 None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filtering */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={filterBy === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterBy('all')}
            className={filterBy === 'all' ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            size="sm"
            variant={filterBy === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterBy('pending')}
            className={filterBy === 'pending' ? 'bg-yellow-600' : 'border-slate-600 text-slate-300'}
          >
            Pending ({statusCounts.pending})
          </Button>
          <Button
            size="sm"
            variant={filterBy === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterBy('completed')}
            className={filterBy === 'completed' ? 'bg-green-600' : 'border-slate-600 text-slate-300'}
          >
            <span className="hidden sm:inline">Done</span> ({statusCounts.completed})
          </Button>
        </div>

        {/* Entity Filtering */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={filterByEntity === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterByEntity('all')}
            className={filterByEntity === 'all' ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
          >
            All
          </Button>
          <Button
            size="sm" 
            variant={filterByEntity === 'people' ? 'default' : 'outline'}
            onClick={() => setFilterByEntity('people')}
            className={filterByEntity === 'people' ? 'bg-blue-600' : 'border-slate-600 text-slate-300'}
          >
            <Users className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">👤</span>
          </Button>
          <Button
            size="sm"
            variant={filterByEntity === 'places' ? 'default' : 'outline'}
            onClick={() => setFilterByEntity('places')}
            className={filterByEntity === 'places' ? 'bg-green-600' : 'border-slate-600 text-slate-300'}
          >
            <MapPin className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">📍</span>
          </Button>
          <Button
            size="sm"
            variant={filterByEntity === 'props' ? 'default' : 'outline'}
            onClick={() => setFilterByEntity('props')}
            className={filterByEntity === 'props' ? 'bg-orange-600' : 'border-slate-600 text-slate-300'}
          >
            <Package className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">🎯</span>
          </Button>
        </div>
      </div>
    </div>
  )
}