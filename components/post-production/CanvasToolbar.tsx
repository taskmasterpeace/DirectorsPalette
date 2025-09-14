'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MousePointer2,
  Brush,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Eraser,
  Palette
} from 'lucide-react'
import type { CanvasState, DrawingProperties } from './LayoutAnnotationTab'

interface CanvasToolbarProps {
  canvasState: CanvasState
  onToolChange: (tool: CanvasState['tool']) => void
  onPropertiesChange: (properties: Partial<DrawingProperties>) => void
}

const PRESET_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000'
]

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma'
]

export function CanvasToolbar({ 
  canvasState, 
  onToolChange, 
  onPropertiesChange 
}: CanvasToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState(canvasState.color)

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'brush', icon: Brush, label: 'Brush', shortcut: 'B' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' }
  ] as const

  const handleColorChange = (color: string) => {
    onPropertiesChange({ color })
    setCustomColor(color)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    onPropertiesChange({ color })
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-green-400" />
          Drawing Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">Tools</Label>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              const isActive = canvasState.tool === tool.id
              
              return (
                <Button
                  key={tool.id}
                  size="sm"
                  onClick={() => onToolChange(tool.id as CanvasState['tool'])}
                  className={`flex items-center gap-2 justify-start text-left ${
                    isActive 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">Color</Label>
          
          {/* Current Color Display */}
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-slate-400 cursor-pointer"
              style={{ backgroundColor: canvasState.color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Current color - click to toggle color picker"
            />
            <Input
              type="text"
              value={canvasState.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 bg-slate-700 border-slate-600 text-white text-sm"
              placeholder="#FF0000"
            />
          </div>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 cursor-pointer hover:scale-110 transition-transform ${
                  canvasState.color === color ? 'border-white' : 'border-slate-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={color}
              />
            ))}
          </div>
          
          {/* Custom Color Picker */}
          {showColorPicker && (
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Custom Color</Label>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-full h-8 rounded border border-slate-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Brush Size */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">
            Brush Size: {canvasState.brushSize}px
          </Label>
          <Slider
            value={[canvasState.brushSize]}
            onValueChange={([value]) => onPropertiesChange({ brushSize: value })}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>1px</span>
            <span>50px</span>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">
            Opacity: {Math.round(canvasState.opacity * 100)}%
          </Label>
          <Slider
            value={[canvasState.opacity * 100]}
            onValueChange={([value]) => onPropertiesChange({ opacity: value / 100 })}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Text Properties (only show when text tool is selected) */}
        {canvasState.tool === 'text' && (
          <div className="space-y-4 border-t border-slate-600 pt-4">
            <Label className="text-sm font-medium text-slate-300">Text Properties</Label>
            
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Font Family</Label>
              <Select
                value={canvasState.fontFamily}
                onValueChange={(value) => onPropertiesChange({ fontFamily: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem 
                      key={font} 
                      value={font}
                      className="text-white hover:bg-slate-600"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">
                Font Size: {canvasState.fontSize}px
              </Label>
              <Slider
                value={[canvasState.fontSize]}
                onValueChange={([value]) => onPropertiesChange({ fontSize: value })}
                min={8}
                max={72}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>8px</span>
                <span>72px</span>
              </div>
            </div>
          </div>
        )}

        {/* Tool Tips */}
        <div className="border-t border-slate-600 pt-4">
          <Label className="text-xs font-medium text-slate-400 block mb-2">
            Keyboard Shortcuts
          </Label>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
            <div>V - Select</div>
            <div>B - Brush</div>
            <div>R - Rectangle</div>
            <div>C - Circle</div>
            <div>L - Line</div>
            <div>A - Arrow</div>
            <div>T - Text</div>
            <div>E - Eraser</div>
          </div>
        </div>

        {/* Current Tool Info */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-sm text-green-400 font-medium mb-1">
            Active Tool: {tools.find(t => t.id === canvasState.tool)?.label}
          </div>
          <div className="text-xs text-slate-400">
            {canvasState.tool === 'select' && 'Click and drag to move objects'}
            {canvasState.tool === 'brush' && 'Click and drag to draw freehand'}
            {canvasState.tool === 'rectangle' && 'Click and drag to draw rectangle'}
            {canvasState.tool === 'circle' && 'Click and drag to draw circle'}
            {canvasState.tool === 'line' && 'Click and drag to draw line'}
            {canvasState.tool === 'arrow' && 'Click and drag to draw arrow'}
            {canvasState.tool === 'text' && 'Click to add text'}
            {canvasState.tool === 'eraser' && 'Click to erase elements'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}