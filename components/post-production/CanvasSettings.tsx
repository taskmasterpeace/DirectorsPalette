'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Settings
} from 'lucide-react'

interface CanvasSettingsProps {
  aspectRatio: string
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  onSettingsChange: (settings: {
    aspectRatio: string
    canvasWidth: number
    canvasHeight: number
    backgroundColor: string
  }) => void
}


export function CanvasSettings({
  aspectRatio,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  onSettingsChange
}: CanvasSettingsProps) {

  const handleBackgroundColorChange = useCallback((color: string) => {
    onSettingsChange({
      aspectRatio,
      canvasWidth,
      canvasHeight,
      backgroundColor: color
    })
  }, [aspectRatio, canvasWidth, canvasHeight, onSettingsChange])

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Canvas Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-16 h-10 rounded border-2 border-slate-600 cursor-pointer bg-slate-700"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 bg-slate-700 border-slate-600 text-white text-sm h-10 font-mono"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-700/50 rounded p-2">
          <div className="text-xs text-slate-400 space-y-1">
            <div>Size: {canvasWidth}×{canvasHeight}px</div>
            <div>Ratio: {aspectRatio}</div>
            <div>BG: {backgroundColor}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}