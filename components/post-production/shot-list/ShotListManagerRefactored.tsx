'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { List, Plus, Film, Music } from 'lucide-react'
import { ShotListFilters } from './ShotListFilters'
import { ShotCard } from './ShotCard'
import { ShotEditDialog } from './ShotEditDialog'
import { ExportDialog } from './ExportDialog'
import { useShotListLogic } from './useShotListLogic'

interface ShotListManagerProps {
  className?: string
}

export function ShotListManagerRefactored({ className = '' }: ShotListManagerProps) {
  const {
    shots,
    filteredShots,
    groupedShots,
    selectedShots,
    filters,
    editDialog,
    exportDialog,
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
    setFilters,
    setEditDialog,
    setExportDialog,
    addShots,
    clearQueue
  } = useShotListLogic()

  const handleAddManualShot = () => {
    const newShot = {
      id: `manual_${Date.now()}`,
      projectId: 'manual',
      projectType: 'story' as const,
      shotNumber: Date.now(),
      description: 'New manual shot - click to edit',
      status: 'pending' as const,
      sourceChapter: 'Manual Entry',
      prompt: 'New manual shot',
      images: []
    }
    addShots([newShot])
  }

  const handlePreviewShot = (shot: any) => {
    // Placeholder for preview functionality
    console.log('Preview shot:', shot)
  }

  const handleStatusChange = (shotId: string, status: string) => {
    // Placeholder for status change
    console.log('Change status:', shotId, status)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            <CardTitle>Shot List Manager</CardTitle>
            <Badge variant="secondary">{shots.length} total shots</Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddManualShot}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Shot
            </Button>
            {shots.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearQueue}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {shots.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 mb-4 text-muted-foreground">
              <Film className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Shots Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate shots from Story Mode or Music Video Mode
            </p>
            <Button onClick={handleAddManualShot}>
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Shot
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ShotListFilters
              filters={filters}
              onFiltersChange={setFilters}
              selectedCount={selectedShots.size}
              totalCount={filteredShots.length}
              onSelectAll={handleSelectAll}
              onCopySelected={handleCopySelected}
              onExport={handleExport}
              onBulkEdit={handleBulkEdit}
            />

            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {groupedShots.map((group) => (
                  <div key={group.groupName}>
                    {filters.groupBy !== 'none' && (
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-medium">{group.groupName}</h3>
                        <Badge variant="outline">{group.shots.length} shots</Badge>
                      </div>
                    )}

                    <div className="space-y-2">
                      {group.shots.map((shot) => (
                        <ShotCard
                          key={shot.id}
                          shot={shot}
                          isSelected={selectedShots.has(shot.id)}
                          onSelect={handleSelectShot}
                          onCopy={handleCopyShot}
                          onEdit={handleEditShot}
                          onDelete={handleDeleteShot}
                          onStatusChange={handleStatusChange}
                          onPreview={handlePreviewShot}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>

      <ShotEditDialog
        isOpen={editDialog.isOpen}
        shot={editDialog.shot}
        editedDescription={editDialog.editedDescription}
        onDescriptionChange={(desc) =>
          setEditDialog({ ...editDialog, editedDescription: desc })
        }
        onSave={handleSaveEdit}
        onClose={() => setEditDialog({ isOpen: false, shot: null, editedDescription: '' })}
      />

      <ExportDialog
        isOpen={exportDialog.isOpen}
        format={exportDialog.format}
        onFormatChange={(format) => setExportDialog({ ...exportDialog, format })}
        onExport={executeExport}
        onClose={() => setExportDialog({ ...exportDialog, isOpen: false })}
        selectedCount={selectedShots.size}
        totalCount={filteredShots.length}
      />
    </Card>
  )
}