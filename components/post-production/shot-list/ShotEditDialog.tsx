'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShotEditDialogProps {
  isOpen: boolean
  shot: any | null
  editedDescription: string
  onDescriptionChange: (description: string) => void
  onSave: () => void
  onClose: () => void
}

export function ShotEditDialog({
  isOpen,
  shot,
  editedDescription,
  onDescriptionChange,
  onSave,
  onClose
}: ShotEditDialogProps) {
  if (!shot) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Shot</DialogTitle>
          <DialogDescription>
            Modify shot details and properties
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shot-number">Shot Number</Label>
            <Input
              id="shot-number"
              value={shot.shotNumber || shot.id}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="min-h-[150px]"
              placeholder="Enter shot description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={shot.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera-angle">Camera Angle</Label>
              <Input
                id="camera-angle"
                defaultValue={shot.cameraAngle || ''}
                placeholder="e.g., Wide shot, Close-up..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="priority"
              defaultChecked={shot.priority}
            />
            <Label htmlFor="priority">Mark as Priority</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              defaultValue={shot.notes || ''}
              placeholder="Additional notes..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}