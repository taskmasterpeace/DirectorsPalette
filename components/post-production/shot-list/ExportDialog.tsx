'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Download } from 'lucide-react'

interface ExportDialogProps {
  isOpen: boolean
  format: 'pdf' | 'csv' | 'json' | 'txt'
  onFormatChange: (format: 'pdf' | 'csv' | 'json' | 'txt') => void
  onExport: () => void
  onClose: () => void
  selectedCount: number
  totalCount: number
}

export function ExportDialog({
  isOpen,
  format,
  onFormatChange,
  onExport,
  onClose,
  selectedCount,
  totalCount
}: ExportDialogProps) {
  const exportCount = selectedCount > 0 ? selectedCount : totalCount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Shot List
          </DialogTitle>
          <DialogDescription>
            Choose your export format. {exportCount} shot{exportCount !== 1 ? 's' : ''} will be exported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={format} onValueChange={onFormatChange as any}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-red-500" />
                PDF Document
                <span className="text-xs text-muted-foreground">
                  (Professional formatting)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-green-500" />
                CSV Spreadsheet
                <span className="text-xs text-muted-foreground">
                  (Excel compatible)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-500" />
                JSON Data
                <span className="text-xs text-muted-foreground">
                  (For developers)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="txt" id="txt" />
              <Label htmlFor="txt" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Plain Text
                <span className="text-xs text-muted-foreground">
                  (Simple format)
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export {exportCount} Shot{exportCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}