'use client'

import { useState, useMemo } from 'react'
import { usePostProductionStore } from '@/stores/post-production-store'
import { useToast } from '@/components/ui/use-toast'
import { FilterState, EditDialogState, ExportDialogState } from './types'

export function useShotListLogic() {
  const { toast } = useToast()
  const {
    shotQueue,
    completedShots,
    addShots,
    removeShot,
    clearQueue
  } = usePostProductionStore()

  // Combine all shots
  const shots = useMemo(() => {
    return [...(shotQueue || []), ...(completedShots || [])]
  }, [shotQueue, completedShots])

  // State
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    filterStatus: 'all',
    groupBy: 'none',
    entityFilter: 'all'
  })

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    shot: null,
    editedDescription: ''
  })

  const [exportDialog, setExportDialog] = useState<ExportDialogState>({
    isOpen: false,
    format: 'pdf'
  })

  // Filter logic
  const filteredShots = useMemo(() => {
    if (!shots || shots.length === 0) {
      return []
    }
    return shots.filter(shot => {
      // Search filter
      const matchesSearch = !filters.searchTerm ||
        shot.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        shot.notes?.toLowerCase().includes(filters.searchTerm.toLowerCase())

      // Status filter
      const matchesFilter = filters.filterStatus === 'all' || shot.status === filters.filterStatus

      // Entity filter
      let matchesEntity = filters.entityFilter === 'all'
      if (filters.entityFilter !== 'all') {
        const description = shot.description.toLowerCase()
        switch (filters.entityFilter) {
          case 'characters':
            matchesEntity = description.includes('character') || description.includes('person') ||
                          description.includes('man') || description.includes('woman')
            break
          case 'places':
            matchesEntity = description.includes('location') || description.includes('setting') ||
                          description.includes('ext.') || description.includes('int.')
            break
          case 'props':
            matchesEntity = description.includes('object') || description.includes('prop') ||
                          description.includes('item') || description.includes('equipment')
            break
        }
      }

      return matchesSearch && matchesFilter && matchesEntity
    })
  }, [shots, filters])

  // Group shots
  const groupedShots = useMemo(() => {
    if (filters.groupBy === 'none') {
      return [{ groupName: 'All Shots', shots: filteredShots }]
    }

    return filteredShots.reduce((groups, shot) => {
      const groupKey = filters.groupBy === 'chapter'
        ? shot.sourceChapter || 'Unknown Chapter'
        : shot.sourceSection || 'Unknown Section'

      const existingGroup = groups.find(g => g.groupName === groupKey)
      if (existingGroup) {
        existingGroup.shots.push(shot)
      } else {
        groups.push({ groupName: groupKey, shots: [shot] })
      }
      return groups
    }, [] as { groupName: string; shots: typeof filteredShots }[])
  }, [filteredShots, filters.groupBy])

  // Handler functions
  const handleSelectShot = (shotId: string) => {
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

  const handleCopyShot = async (shot: any) => {
    try {
      await navigator.clipboard.writeText(shot.description)
      toast({
        title: "Shot Copied",
        description: "Shot description copied to clipboard"
      })
    } catch (error) {
      console.error('Clipboard error:', error)
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleCopySelected = async () => {
    const selectedShotsData = filteredShots.filter(shot => selectedShots.has(shot.id))
    const formattedShots = selectedShotsData
      .map((shot, index) => `${index + 1}. ${shot.description}`)
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(formattedShots)
      toast({
        title: "Shots Copied",
        description: `${selectedShotsData.length} shots copied to clipboard`
      })
    } catch (error) {
      console.error('Clipboard error:', error)
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleEditShot = (shot: any) => {
    setEditDialog({
      isOpen: true,
      shot,
      editedDescription: shot.description
    })
  }

  const handleSaveEdit = () => {
    if (editDialog.shot) {
      // For now, just show a message since the store doesn't have updateShot
      toast({
        title: "Shot Updated",
        description: "Shot update functionality coming soon"
      })
      setEditDialog({ isOpen: false, shot: null, editedDescription: '' })
    }
  }

  const handleDeleteShot = (shotId: string) => {
    removeShot(shotId)
    toast({
      title: "Shot Deleted",
      description: "Shot has been removed from the list"
    })
  }

  const handleExport = () => {
    setExportDialog({ ...exportDialog, isOpen: true })
  }

  const executeExport = () => {
    const dataToExport = selectedShots.size > 0
      ? filteredShots.filter(shot => selectedShots.has(shot.id))
      : filteredShots

    // Export logic based on format
    let content = ''
    let filename = `shotlist_${Date.now()}`

    switch (exportDialog.format) {
      case 'json':
        content = JSON.stringify(dataToExport, null, 2)
        filename += '.json'
        break
      case 'csv':
        const headers = ['Shot #', 'Description', 'Status', 'Chapter', 'Section', 'Notes']
        const rows = dataToExport.map(shot => [
          shot.shotNumber || shot.id,
          shot.description,
          shot.status,
          shot.sourceChapter || '',
          shot.sourceSection || '',
          shot.notes || ''
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        filename += '.csv'
        break
      case 'txt':
      default:
        content = dataToExport
          .map((shot, index) => `${index + 1}. ${shot.description}`)
          .join('\n\n')
        filename += '.txt'
        break
    }

    // Create download
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${dataToExport.length} shots exported as ${exportDialog.format.toUpperCase()}`
    })
    setExportDialog({ ...exportDialog, isOpen: false })
  }

  const handleBulkEdit = () => {
    // Placeholder for bulk edit functionality
    toast({
      title: "Bulk Edit",
      description: "Feature coming soon!"
    })
  }

  return {
    // State
    shots,
    filteredShots,
    groupedShots,
    selectedShots,
    filters,
    editDialog,
    exportDialog,

    // Handlers
    handleSelectShot,
    handleSelectAll,
    handleCopyShot,
    handleCopySelected,
    handleEditShot,
    handleSaveEdit,
    handleDeleteShot,
    handleExport,
    executeExport,
    handleBulkEdit,

    // Setters
    setFilters,
    setEditDialog,
    setExportDialog,

    // Store functions
    addShots,
    removeShot,
    clearQueue
  }
}