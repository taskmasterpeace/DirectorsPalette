'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  List,
  Copy,
  Edit,
  Trash2,
  Download,
  Eye,
  Plus,
  Film,
  Music,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Settings,
  MoreVertical,
  Camera,
  Users,
  MapPin,
  Package
} from 'lucide-react'
import { usePostProductionStore } from '@/stores/post-production-store'
import { useToast } from '@/components/ui/use-toast'
import { MobileReferenceSelector } from '@/components/mobile/MobileReferenceSelector'
import type { PostProductionShot } from '@/lib/post-production/types'
import { validateAndNormalizeShotArray, validateExportConfig } from '@/lib/validation/data-validators'

interface ShotListManagerProps {
  className?: string
}

export function ShotListManager({ className = '' }: ShotListManagerProps) {
  const { toast } = useToast()
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [groupBy, setGroupBy] = useState<'chapter' | 'section' | 'none'>('chapter') // Default to chapter grouping
  const [filterByEntity, setFilterByEntity] = useState<'all' | 'people' | 'places' | 'props'>('all')
  const [editingShot, setEditingShot] = useState<PostProductionShot | null>(null)
  const [editedDescription, setEditedDescription] = useState('')
  const [exportPrefix, setExportPrefix] = useState('')
  const [exportSuffix, setExportSuffix] = useState('')
  const [showExportConfig, setShowExportConfig] = useState(false)

  const {
    shotQueue,
    completedShots,
    failedShots,
    removeShot,
    clearQueue
  } = usePostProductionStore()

  // Combine all shots for unified view with validation
  const rawShots = [...shotQueue, ...completedShots, ...failedShots]
  const allShots = validateAndNormalizeShotArray(rawShots)

  // Filter and search shots with enhanced entity filtering
  const filteredShots = allShots.filter(shot => {
    const matchesSearch = shot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shot.sourceChapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shot.sourceSection?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || shot.status === filterBy
    
    // Entity filtering based on shot content
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

  // Group shots by chapter/section
  console.log('🔍 Grouping Debug - groupBy:', groupBy)
  console.log('🔍 Grouping Debug - filteredShots sample:', filteredShots.slice(0, 2).map(s => ({
    id: s.id,
    sourceChapter: s.sourceChapter,
    sourceSection: s.sourceSection,
    projectType: s.projectType
  })))
  
  const groupedShots = groupBy === 'none' ? 
    [{ groupName: 'All Shots', shots: filteredShots }] :
    filteredShots.reduce((groups, shot) => {
      const groupKey = groupBy === 'chapter' ? 
        shot.sourceChapter || 'Unknown Chapter' : 
        shot.sourceSection || 'Unknown Section'
      
      console.log(`🔍 Shot "${shot.id}" -> Group "${groupKey}"`)
      
      const existingGroup = groups.find(g => g.groupName === groupKey)
      if (existingGroup) {
        existingGroup.shots.push(shot)
      } else {
        groups.push({ groupName: groupKey, shots: [shot] })
      }
      return groups
    }, [] as { groupName: string; shots: typeof filteredShots }[])
    
  console.log('🔍 Grouping Debug - final groups:', groupedShots.map(g => ({ name: g.groupName, count: g.shots.length })))

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

  const handleCopyShot = async (shot: PostProductionShot) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shot.description)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shot.description
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      toast({
        title: "Shot Copied",
        description: "Shot description copied to clipboard"
      })
    } catch (error) {
      console.error('Clipboard error:', error)
      alert(`Copy failed. Here's the shot:\n\n${shot.description}`)
      toast({
        title: "Copy Failed",
        description: "Shot displayed for manual copy",
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedShots)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = formattedShots
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      toast({
        title: "Shots Copied",
        description: `Copied ${selectedShots.size} shots to clipboard`
      })
    } catch (error) {
      console.error('Clipboard error:', error)
      const displayShots = formattedShots.substring(0, 500) + (formattedShots.length > 500 ? '...' : '')
      alert(`Copy failed. Here are your shots:\n\n${displayShots}`)
      toast({
        title: "Copy Failed",
        description: "Shots displayed for manual copy",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedShots.size} selected shots?`)) {
      selectedShots.forEach(shotId => removeShot(shotId))
      setSelectedShots(new Set())
      
      toast({
        title: "Shots Deleted",
        description: `Deleted ${selectedShots.size} shots`
      })
    }
  }

  const handleEditShot = (shot: PostProductionShot) => {
    setEditingShot(shot)
    setEditedDescription(shot.description)
  }

  const handleSaveEdit = () => {
    if (editingShot && editedDescription.trim()) {
      // Update shot description (would need to add this to store)
      toast({
        title: "Shot Updated",
        description: "Shot description has been updated"
      })
      setEditingShot(null)
      setEditedDescription('')
    }
  }

  const handleExportWithFormatting = async () => {
    console.log('🚀 EXPORT FUNCTION CALLED')
    console.log('🔍 Export Debug - selectedShots:', selectedShots.size)
    console.log('🔍 Export Debug - filteredShots:', filteredShots.length)
    console.log('🔍 Export Debug - exportPrefix:', exportPrefix)
    console.log('🔍 Export Debug - exportSuffix:', exportSuffix)
    
    // Validate export configuration
    const validation = validateExportConfig({
      prefix: exportPrefix,
      suffix: exportSuffix,
      selectedShots: selectedShots,
      allShots: allShots
    })
    
    if (!validation.isValid) {
      console.error('❌ Export validation failed:', validation.errors)
      toast({
        title: "Export Configuration Error",
        description: validation.errors.join(', '),
        variant: "destructive"
      })
      return
    }
    
    const selectedShotsData = filteredShots.filter(shot => selectedShots.has(shot.id))
    const shotsToExport = selectedShotsData.length > 0 ? selectedShotsData : filteredShots

    console.log('🔍 Export Debug - shotsToExport:', shotsToExport.length)
    console.log('🔍 Export Debug - shotsToExport sample:', shotsToExport.slice(0, 2))

    if (shotsToExport.length === 0) {
      console.log('❌ No shots to export')
      toast({
        title: "No Shots to Export",
        description: "No shots available for export. Generate shots in Story or Music Video mode first.",
        variant: "destructive"
      })
      return
    }
    
    console.log('✅ Proceeding with export of', shotsToExport.length, 'shots')

    // Apply prefix/suffix formatting
    const formattedShots = shotsToExport.map((shot, index) => {
      console.log(`🔍 Formatting shot ${index + 1}:`, shot.description.substring(0, 50) + '...')
      
      let formatted = shot.description
      
      if (exportPrefix.trim()) {
        console.log('🔍 Adding prefix:', exportPrefix.trim())
        formatted = `${exportPrefix.trim()} ${formatted}`
      }
      
      if (exportSuffix.trim()) {
        console.log('🔍 Adding suffix:', exportSuffix.trim())
        formatted = `${formatted} ${exportSuffix.trim()}`
      }
      
      const final = `${index + 1}. ${formatted}`
      console.log('🔍 Final formatted shot:', final.substring(0, 100) + '...')
      return final
    }).join('\n\n')
    
    console.log('🔍 Total formatted output length:', formattedShots.length)

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedShots)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = formattedShots
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
        } finally {
          document.body.removeChild(textArea)
        }
      }
      
      toast({
        title: "Shots Exported!",
        description: `Exported ${shotsToExport.length} shots with formatting to clipboard`
      })
    } catch (error) {
      console.error('Clipboard error:', error)
      
      // Show formatted shots in a modal/alert for manual copy
      const formattedForDisplay = formattedShots.substring(0, 500) + (formattedShots.length > 500 ? '...' : '')
      alert(`Clipboard failed. Here are your formatted shots:\n\n${formattedForDisplay}\n\n(Full content logged to console)`)
      console.log('Formatted shots for manual copy:', formattedShots)
      
      toast({
        title: "Clipboard Failed",
        description: "Shots displayed in popup for manual copy",
        variant: "destructive"
      })
    }
  }

  const handleMarkAsCompleted = (shotId: string) => {
    // Mark shot as completed (would need to update store)
    toast({
      title: "Shot Completed",
      description: "Shot marked as completed"
    })
  }

  const handleSendToGen4 = (shot: PostProductionShot) => {
    // Send individual shot to Gen4 for image generation
    toast({
      title: "Sent to Gen4", 
      description: "Shot sent to Gen4 for image generation"
    })
  }

  const handleSendToReference = (position: 1 | 2 | 3, shot?: PostProductionShot) => {
    // Send shot or image to reference position
    toast({
      title: `Sent to ${position === 1 ? '1st' : position === 2 ? '2nd' : '3rd'} Reference`,
      description: shot ? `Shot "${shot.description.substring(0, 30)}..." assigned to reference position ${position}` : `Image assigned to reference position ${position}`
    })
  }

  const handleClearAll = () => {
    if (confirm('Clear all shots from the queue? This cannot be undone.')) {
      clearQueue()
      setSelectedShots(new Set())
      
      toast({
        title: "Queue Cleared",
        description: "All shots have been removed from the queue"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getSourceIcon = (projectType: string) => {
    return projectType === 'story' ? 
      <Film className="w-3 h-3 text-green-400" /> : 
      <Music className="w-3 h-3 text-purple-400" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5 text-blue-500" />
              Shot List Manager
              <Badge variant="outline">{allShots.length} total shots</Badge>
            </CardTitle>
            <div className="flex gap-2">
              {selectedShots.size > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopySelected}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy ({selectedShots.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedShots.size})
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={allShots.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  console.log('🔴 BUTTON CLICKED - Export Config Toggle')
                  console.log('🔍 Current showExportConfig:', showExportConfig)
                  console.log('🔍 Event object:', e)
                  console.log('🔍 Will set to:', !showExportConfig)
                  setShowExportConfig(!showExportConfig)
                  console.log('🔍 setShowExportConfig called')
                }}
              >
                <Settings className="w-4 h-4 mr-1" />
                Export Config
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Export Configuration Panel */}
      {showExportConfig && (
        <Card className="bg-blue-900/20 border-blue-600/30">
          <CardHeader>
            <CardTitle className="text-blue-300 text-base">⚙️ Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Prefix (added to beginning)</Label>
                <Input
                  placeholder="e.g., [PRODUCTION SHOT] Camera:"
                  value={exportPrefix}
                  onChange={(e) => setExportPrefix(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Suffix (added to end)</Label>
                <Input
                  placeholder="e.g., , cinematic lighting, 4K"
                  value={exportSuffix}
                  onChange={(e) => setExportSuffix(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={(e) => {
                console.log('🔴 BUTTON CLICKED - Export All Shots')
                console.log('🔍 Button disabled state:', filteredShots.length === 0)
                console.log('🔍 Event object:', e)
                console.log('🔍 About to call handleExportWithFormatting')
                handleExportWithFormatting()
                  .then(() => console.log('✅ Export function completed'))
                  .catch(error => console.error('❌ Export function failed:', error))
              }}
              disabled={filteredShots.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export {selectedShots.size > 0 ? `${selectedShots.size} Selected` : `All ${filteredShots.length}`} Shots
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mobile-First Search and Filter Controls */}
      <Card>
        <CardContent className="pt-4">
          {/* Mobile Layout: Stacked Controls */}
          <div className="space-y-3 sm:hidden">
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search shots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base bg-slate-900 border-slate-600 text-white"
              />
            </div>
            
            {/* Group By */}
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="h-11 text-base bg-slate-900 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">📚 Group by Chapter</SelectItem>
                <SelectItem value="section">🎵 Group by Section</SelectItem>
                <SelectItem value="none">📋 No Grouping</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Filters - Mobile Grid */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterBy('all')}
                className="h-11 text-sm"
              >
                All ({allShots.length})
              </Button>
              <Button
                variant={filterBy === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterBy('pending')}
                className="h-11 text-sm"
              >
                Pending ({shotQueue.length})
              </Button>
              <Button
                variant={filterBy === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterBy('completed')}
                className="h-11 text-sm"
              >
                Done ({completedShots.length})
              </Button>
            </div>
            
            {/* Entity Filters - Mobile Grid */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={filterByEntity === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('all')}
                className="h-11 text-sm"
              >
                All
              </Button>
              <Button
                variant={filterByEntity === 'people' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('people')}
                className="h-11 flex items-center justify-center border-blue-600/30 text-blue-400 hover:bg-blue-600/10"
              >
                <Users className="w-5 h-5" />
              </Button>
              <Button
                variant={filterByEntity === 'places' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('places')}
                className="h-11 flex items-center justify-center border-green-600/30 text-green-400 hover:bg-green-600/10"
              >
                <MapPin className="w-5 h-5" />
              </Button>
              <Button
                variant={filterByEntity === 'props' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('props')}
                className="h-11 flex items-center justify-center border-orange-600/30 text-orange-400 hover:bg-orange-600/10"
              >
                <Package className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout: Compact Horizontal Toolbar */}
          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            {/* Search Section */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search shots, chapters, sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-600"></div>

            {/* Group Control */}
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">📚 Chapter</SelectItem>
                <SelectItem value="section">🎵 Section</SelectItem>
                <SelectItem value="none">📋 None</SelectItem>
              </SelectContent>
            </Select>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-600"></div>

            {/* Status Filters - Compact */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filterBy === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterBy('all')}
                className="h-7 px-2 text-xs"
              >
                All ({allShots.length})
              </Button>
              <Button
                size="sm"
                variant={filterBy === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterBy('pending')}
                className="h-7 px-2 text-xs"
              >
                Pending ({shotQueue.length})
              </Button>
              <Button
                size="sm"
                variant={filterBy === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterBy('completed')}
                className="h-7 px-2 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done ({completedShots.length})
              </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-600"></div>

            {/* Entity Filters - Icon Only */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filterByEntity === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('all')}
                className="h-7 px-2 text-xs"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterByEntity === 'people' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('people')}
                className="h-7 w-7 p-0 border-blue-600/30 text-blue-400 hover:bg-blue-600/10"
                title="Filter by People"
              >
                👤
              </Button>
              <Button
                size="sm"
                variant={filterByEntity === 'places' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('places')}
                className="h-7 w-7 p-0 border-green-600/30 text-green-400 hover:bg-green-600/10"
                title="Filter by Places"
              >
                📍
              </Button>
              <Button
                size="sm"
                variant={filterByEntity === 'props' ? 'default' : 'outline'}
                onClick={() => setFilterByEntity('props')}
                className="h-7 w-7 p-0 border-orange-600/30 text-orange-400 hover:bg-orange-600/10"
                title="Filter by Props"
              >
                🎯
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shot list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedShots.size === filteredShots.length && filteredShots.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedShots.size > 0 ? `${selectedShots.size} selected` : `${filteredShots.length} shots`}
              </span>
            </div>
            {/* Mobile Actions */}
            <div className="flex gap-2 sm:hidden">
              <Button size="sm" variant="outline" className="h-9">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-2">
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-1" />
                Group by Chapter
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export with Metadata
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[80vh]">
            <div className="space-y-3">
              {filteredShots.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <List className="w-6 h-6 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium mb-1">No shots yet</p>
                  <p className="text-xs text-slate-500">
                    Generate shots in Story or Music Video mode
                  </p>
                </div>
              ) : (
                // Render grouped shots
                groupedShots.map((group) => (
                  <div key={group.groupName} className="space-y-3">
                    {/* Group header */}
                    {groupBy !== 'none' && (
                      <div className="flex items-center gap-2 py-2 border-b border-muted">
                        <h3 className="font-medium text-lg">
                          {groupBy === 'chapter' ? '📚' : '🎵'} {group.groupName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {group.shots.length} shots
                        </Badge>
                      </div>
                    )}
                    
                    {/* Shots in group */}
                    {group.shots.map((shot, index) => (
                      <Card key={shot.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedShots.has(shot.id)}
                              onCheckedChange={() => handleSelectShot(shot.id)}
                            />
                            
                            <div className="flex-1 space-y-2">
                              {/* Shot header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">Shot {shot.shotNumber}</span>
                                  {getStatusIcon(shot.status)}
                                  <Badge variant="outline" className="text-xs">
                                    {getSourceIcon(shot.projectType)}
                                    <span className="ml-1">
                                      {shot.sourceChapter || shot.sourceSection || 'Unknown Source'}
                                    </span>
                                  </Badge>
                                </div>
                                {/* Mobile Actions - Large Touch Targets */}
                                <div className="flex flex-col gap-2 sm:hidden w-full">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCopyShot(shot)}
                                      className="h-12 sm:h-9 flex-1 text-base sm:text-sm"
                                    >
                                      <Copy className="w-4 h-4 mr-1" />
                                      Copy
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditShot(shot)}
                                      className="h-12 sm:h-9 flex-1 text-base sm:text-sm"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  <div className="w-full">
                                    <MobileReferenceSelector
                                      onSendToPosition={(position) => handleSendToReference(position, shot)}
                                      triggerLabel="Send to Reference"
                                    />
                                  </div>
                                </div>
                                
                                {/* Desktop Actions - Compact */}
                                <div className="hidden sm:flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyShot(shot)}
                                    title="Copy shot"
                                  >
                                    <Copy className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSendToGen4(shot)}
                                    title="Send to Gen4"
                                  >
                                    <Camera className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsCompleted(shot.id)}
                                    title="Mark as completed"
                                  >
                                    <CheckCircle className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditShot(shot)}
                                    title="Edit shot"
                                  >
                                    <Edit className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeShot(shot.id)}
                                    title="Remove shot"
                                  >
                                    <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Shot description - FULL VISIBILITY */}
                              <div className="bg-muted/50 p-4 sm:p-3 rounded border-l-4 border-primary">
                                <div className="text-base sm:text-sm leading-relaxed">
                                  {shot.description}
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {shot.metadata?.directorStyle && (
                                  <Badge variant="outline" className="text-xs">
                                    🎬 {shot.metadata.directorStyle}
                                  </Badge>
                                )}
                                {shot.metadata?.timestamp && (
                                  <Badge variant="outline" className="text-xs">
                                    🕒 {new Date(shot.metadata.timestamp).toLocaleString()}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  📁 {shot.projectType === 'story' ? 'Story Mode' : 'Music Video Mode'}
                                </Badge>
                              </div>

                              {/* Generated images (if any) */}
                              {shot.generatedImages && shot.generatedImages.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {shot.generatedImages.map((image, imgIndex) => (
                                    <div key={imgIndex} className="w-16 h-16 bg-muted rounded border overflow-hidden">
                                      <img 
                                        src={image.url} 
                                        alt={`Generated ${imgIndex + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Shot editing dialog */}
      <Dialog open={!!editingShot} onOpenChange={(open) => !open && setEditingShot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shot Description</DialogTitle>
            <DialogDescription>
              Modify the shot description. Changes will be reflected in exports and image generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Shot Description</label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                placeholder="Enter shot description..."
              />
            </div>
            
            {editingShot && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Source:</strong> {editingShot.sourceChapter || editingShot.sourceSection}</div>
                <div><strong>Type:</strong> {editingShot.projectType === 'story' ? 'Story Mode' : 'Music Video Mode'}</div>
                <div><strong>Status:</strong> {editingShot.status}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShot(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editedDescription.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}