'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, ZoomIn, ZoomOut, RotateCcw, Grid } from 'lucide-react'

interface CanvasControlsProps {
  canvasSize: string
  setCanvasSize: (size: string) => void
  zoomLevel: number
  setZoomLevel: (zoom: number) => void
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  onReset: () => void
}

const canvasSizes = [
  { value: '16:9', label: '16:9 Landscape', width: 800, height: 450 },
  { value: '9:16', label: '9:16 Portrait', width: 450, height: 800 },
  { value: '1:1', label: '1:1 Square', width: 600, height: 600 },
  { value: '4:3', label: '4:3 Classic', width: 800, height: 600 },
  { value: '21:9', label: '21:9 Ultrawide', width: 840, height: 360 }
]

export function CanvasControls({
  canvasSize,
  setCanvasSize,
  zoomLevel,
  setZoomLevel,
  showGrid,
  setShowGrid,
  onReset
}: CanvasControlsProps) {
  const selectedSize = canvasSizes.find(size => size.value === canvasSize) || canvasSizes[0]

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Canvas Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas Size */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Canvas Size</Label>
          <Select value={canvasSize} onValueChange={setCanvasSize}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {canvasSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label} ({size.width}×{size.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Zoom Level ({Math.round(zoomLevel * 100)}%)</Label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
              className="border-slate-600 text-slate-300"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <div className="flex-1 text-center text-sm text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              className="border-slate-600 text-slate-300"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Grid Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-white text-sm">Show Grid</Label>
          <Button
            size="sm"
            variant={showGrid ? "default" : "outline"}
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300"}
          >
            <Grid className="w-3 h-3" />
          </Button>
        </div>

        {/* Reset Canvas */}
        <div className="pt-4 border-t border-slate-700">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset Canvas
          </Button>
        </div>

        {/* Canvas Info */}
        <div className="text-xs text-slate-400 space-y-1">
          <div>Canvas: {selectedSize.width}×{selectedSize.height}px</div>
          <div>Aspect Ratio: {selectedSize.label}</div>
        </div>
      </CardContent>
    </Card>
  )
}