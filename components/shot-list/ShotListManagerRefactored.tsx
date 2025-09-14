'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { usePostProductionStore } from '@/stores/post-production-store'
import { validateAndNormalizeShotArray } from '@/lib/validation/data-validators'
import type { PostProductionShot } from '@/lib/post-production/types'

// Import ultra-focused components
import { ShotListHeader } from './ShotListHeader'
import { ShotListFilters } from './ShotListFilters'
import { ShotListGrid } from './ShotListGrid'

interface ShotListManagerRefactoredProps {
  className?: string
}

export function ShotListManagerRefactored({ className = '' }: ShotListManagerRefactoredProps) {
  const { toast } = useToast()
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [groupBy, setGroupBy] = useState<'chapter' | 'section' | 'none'>('chapter')
  const [filterByEntity, setFilterByEntity] = useState<'all' | 'people' | 'places' | 'props'>('all')
  const [showSettings, setShowSettings] = useState(false)

  const {
    shotQueue,
    completedShots,
    failedShots,
    removeShot,
    clearQueue
  } = usePostProductionStore()

  // Combine and validate all shots
  const rawShots = [...shotQueue, ...completedShots, ...failedShots]
  const allShots = validateAndNormalizeShotArray(rawShots)

  // Filter shots
  const filteredShots = allShots.filter(shot => {
    const matchesSearch = shot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shot.sourceChapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shot.sourceSection?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || shot.status === filterBy
    
    let matchesEntity = true
    if (filterByEntity !== 'all') {
      const description = shot.description.toLowerCase()
      switch (filterByEntity) {
        case 'people':
          matchesEntity = description.includes('@') || description.includes('character') || 
                         description.includes('person') || description.includes('artist')
          break
        case 'places':
          matchesEntity = description.includes('location') || description.includes('setting') ||
                         description.includes('background') || description.includes('scene')
          break
        case 'props':
          matchesEntity = description.includes('prop') || description.includes('object') ||
                         description.includes('item') || description.includes('equipment')
          break
      }
    }
    
    return matchesSearch && matchesFilter && matchesEntity
  })

  // Status counts
  const statusCounts = {
    all: allShots.length,
    pending: allShots.filter(s => s.status === 'pending').length,
    completed: allShots.filter(s => s.status === 'completed').length,
    failed: allShots.filter(s => s.status === 'failed').length
  }

  // Event handlers
  const handleShotSelect = (shotId: string) => {
    const newSelection = new Set(selectedShots)
    if (newSelection.has(shotId)) {
      newSelection.delete(shotId)
    } else {
      newSelection.add(shotId)
    }
    setSelectedShots(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedShots.size === filteredShots.length) {
      setSelectedShots(new Set())
    } else {
      setSelectedShots(new Set(filteredShots.map(shot => shot.id)))
    }
  }

  const handleExportConfig = () => {
    // Export functionality
    const exportData = {
      shots: filteredShots,
      settings: { groupBy, filterBy, filterByEntity },
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shot-list-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredShots.length} shots`
    })
  }

  const handleClearAll = () => {
    clearQueue()
    setSelectedShots(new Set())
    toast({
      title: "Shots Cleared",
      description: "All shots removed from list"
    })
  }

  const handleShotEdit = (shot: PostProductionShot) => {
    // Edit shot functionality
    console.log('Edit shot:', shot.id)
  }

  const handleShotDelete = (shotId: string) => {
    removeShot(shotId)
    const newSelection = new Set(selectedShots)
    newSelection.delete(shotId)
    setSelectedShots(newSelection)
    
    toast({
      title: "Shot Deleted",
      description: "Shot removed from list"
    })
  }

  const handleShotCopy = (shot: PostProductionShot) => {
    navigator.clipboard.writeText(shot.description)
    toast({
      title: "Shot Copied",
      description: "Shot description copied to clipboard"
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <ShotListHeader
        totalShots={allShots.length}
        selectedCount={selectedShots.size}
        onExportConfig={handleExportConfig}
        onClearAll={handleClearAll}
        onShowSettings={() => setShowSettings(!showSettings)}
        canClearAll={allShots.length > 0}
      />

      {/* Filters */}
      <ShotListFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        filterByEntity={filterByEntity}
        setFilterByEntity={setFilterByEntity}
        statusCounts={statusCounts}
      />

      {/* Shot Grid */}
      <ShotListGrid
        shots={filteredShots}
        selectedShots={selectedShots}
        onShotSelect={handleShotSelect}
        onSelectAll={handleSelectAll}
        onShotEdit={handleShotEdit}
        onShotDelete={handleShotDelete}
        onShotCopy={handleShotCopy}
        groupBy={groupBy}
      />
    </div>
  )
}