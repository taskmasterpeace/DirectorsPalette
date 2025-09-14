'use client'

import { Button } from '@/components/ui/button'
import { 
  Plus,
  Type,
  Image as ImageIcon,
  Square,
  Download,
  Save,
  Trash,
  RotateCcw
} from 'lucide-react'

interface CanvasToolbarProps {
  onAddImages: () => void
  onDrawBoxes: () => void
  onAddText: () => void
  onDelete: () => void
  onSave: () => void
  onExport: () => void
  onReset: () => void
  hasElements: boolean
  elementCount: { images: number; boxes: number; text: number }
}

export function CanvasToolbar({
  onAddImages,
  onDrawBoxes, 
  onAddText,
  onDelete,
  onSave,
  onExport,
  onReset,
  hasElements,
  elementCount
}: CanvasToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Element Count */}
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span>{elementCount.images} images</span>
        <span>•</span>
        <span>{elementCount.boxes} boxes</span>
        <span>•</span>
        <span>{elementCount.text} text elements</span>
      </div>

      {/* Tool Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onAddImages}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Add Images
        </Button>
        
        <Button
          onClick={onDrawBoxes}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Square className="w-4 h-4 mr-2" />
          Draw Boxes
        </Button>
        
        <Button
          onClick={onAddText}
          className="bg-green-600 hover:bg-green-700"
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text
        </Button>
        
        <Button
          onClick={onDelete}
          disabled={!hasElements}
          variant="outline"
          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
        
        <Button
          onClick={onSave}
          disabled={!hasElements}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save to Layouts
        </Button>
        
        <Button
          onClick={onExport}
          disabled={!hasElements}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export as PNG
        </Button>
      </div>
    </div>
  )
}