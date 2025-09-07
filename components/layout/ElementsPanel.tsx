'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Package,
  Eye,
  EyeOff,
  Trash,
  Copy,
  Type,
  Image as ImageIcon,
  Square
} from 'lucide-react'

interface Element {
  id: string
  type: 'image' | 'text' | 'box'
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  content?: string
  src?: string
}

interface ElementsPanelProps {
  elements: Element[]
  selectedElement: string | null
  onElementSelect: (id: string) => void
  onElementUpdate: (id: string, updates: Partial<Element>) => void
  onElementDelete: (id: string) => void
  onElementDuplicate: (id: string) => void
  onElementToggleVisibility: (id: string) => void
}

export function ElementsPanel({
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementToggleVisibility
}: ElementsPanelProps) {
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-3 h-3" />
      case 'text': return <Type className="w-3 h-3" />
      case 'box': return <Square className="w-3 h-3" />
      default: return <Package className="w-3 h-3" />
    }
  }

  const getElementColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-blue-400'
      case 'text': return 'text-green-400'
      case 'box': return 'text-purple-400'
      default: return 'text-slate-400'
    }
  }

  const selectedEl = elements.find(el => el.id === selectedElement)

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-400" />
          Element Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedEl ? (
          <div className="space-y-4">
            {/* Element Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={getElementColor(selectedEl.type)}>
                  {getElementIcon(selectedEl.type)}
                </span>
                <span className="text-white font-medium capitalize">{selectedEl.type} Element</span>
              </div>
            </div>

            {/* Position and Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-xs">X Position</Label>
                <Input
                  type="number"
                  value={selectedEl.x}
                  onChange={(e) => onElementUpdate(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={selectedEl.y}
                  onChange={(e) => onElementUpdate(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-xs">Width</Label>
                <Input
                  type="number"
                  value={selectedEl.width}
                  onChange={(e) => onElementUpdate(selectedEl.id, { width: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-xs">Height</Label>
                <Input
                  type="number"
                  value={selectedEl.height}
                  onChange={(e) => onElementUpdate(selectedEl.id, { height: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Content (for text elements) */}
            {selectedEl.type === 'text' && (
              <div>
                <Label className="text-white text-xs">Text Content</Label>
                <Input
                  value={selectedEl.content || ''}
                  onChange={(e) => onElementUpdate(selectedEl.id, { content: e.target.value })}
                  placeholder="Enter text content..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onElementToggleVisibility(selectedEl.id)}
                className="border-slate-600 text-slate-300"
              >
                {selectedEl.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onElementDuplicate(selectedEl.id)}
                className="border-slate-600 text-slate-300"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onElementDelete(selectedEl.id)}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Trash className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Select an element to edit its properties</p>
            <p className="text-slate-500 text-xs mt-1">
              • Click to select • Double-click boxes to edit text • Drag to move • Use resize handles
            </p>
          </div>
        )}

        {/* Elements List */}
        {elements.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="text-white text-sm font-medium mb-3">All Elements ({elements.length})</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {elements.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => onElementSelect(element.id)}
                    className={`w-full p-2 rounded text-left text-xs transition-colors ${
                      selectedElement === element.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={getElementColor(element.type)}>
                        {getElementIcon(element.type)}
                      </span>
                      <span className="capitalize">{element.type}</span>
                      {!element.visible && <EyeOff className="w-3 h-3 text-slate-500 ml-auto" />}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}