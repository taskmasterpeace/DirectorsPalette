'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Copy, Edit, Trash2, Eye, CheckCircle, Clock, AlertCircle, Camera } from 'lucide-react'

interface ShotCardProps {
  shot: any // Replace with proper PostProductionShot type
  isSelected: boolean
  onSelect: (shotId: string) => void
  onCopy: (shot: any) => void
  onEdit: (shot: any) => void
  onDelete: (shotId: string) => void
  onStatusChange: (shotId: string, status: string) => void
  onPreview: (shot: any) => void
}

export function ShotCard({
  shot,
  isSelected,
  onSelect,
  onCopy,
  onEdit,
  onDelete,
  onStatusChange,
  onPreview
}: ShotCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'priority':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getProjectTypeBadge = (projectType?: string) => {
    if (!projectType) return null

    const badgeColors = {
      'story': 'bg-blue-600',
      'music-video': 'bg-purple-600',
      'commercial': 'bg-green-600'
    }

    return (
      <Badge className={`${badgeColors[projectType as keyof typeof badgeColors] || 'bg-gray-600'} text-white`}>
        {projectType === 'music-video' ? 'Music Video' : projectType}
      </Badge>
    )
  }

  return (
    <Card className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(shot.id)}
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(shot.status)}
                  <span className="font-medium text-sm">
                    Shot #{shot.shotNumber || shot.id}
                  </span>
                  {shot.priority && (
                    <Badge variant="destructive" className="text-xs">
                      Priority
                    </Badge>
                  )}
                  {getProjectTypeBadge(shot.projectType)}
                  {shot.sourceChapter && (
                    <Badge variant="outline" className="text-xs">
                      {shot.sourceChapter}
                    </Badge>
                  )}
                  {shot.sourceSection && (
                    <Badge variant="outline" className="text-xs">
                      {shot.sourceSection}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {shot.description}
                </p>

                {shot.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Notes: {shot.notes}
                  </p>
                )}

                {shot.cameraAngle && (
                  <div className="flex items-center gap-2 mt-2">
                    <Camera className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {shot.cameraAngle}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(shot)}
                  className="h-8 w-8"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCopy(shot)}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(shot)}
                  className="h-8 w-8"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(shot.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}