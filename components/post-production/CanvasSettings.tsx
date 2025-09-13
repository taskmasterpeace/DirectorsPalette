'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Monitor,
  Square,
  Smartphone,
  Film
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

const ASPECT_RATIOS = [
  { id: '16:9', name: '16:9 (Widescreen)', width: 1200, height: 675, icon: Monitor },
  { id: '9:16', name: '9:16 (Portrait)', width: 675, height: 1200, icon: Smartphone },
  { id: '1:1', name: '1:1 (Square)', width: 900, height: 900, icon: Square },
  { id: '4:3', name: '4:3 (Standard)', width: 1200, height: 900, icon: Monitor },
  { id: '21:9', name: '21:9 (Cinematic)', width: 1260, height: 540, icon: Film },
  { id: 'custom', name: 'Custom Size', width: 1200, height: 675, icon: Settings }
]

const BACKGROUND_COLORS = [
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'light-gray', name: 'Light Gray', color: '#f8f9fa' },
  { id: 'dark-gray', name: 'Dark Gray', color: '#495057' },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'transparent', name: 'Transparent', color: 'transparent' },
  { id: 'custom', name: 'Custom', color: '#ffffff' }
]

export function CanvasSettings({
  aspectRatio,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  onSettingsChange
}: CanvasSettingsProps) {
  const [customColor, setCustomColor] = useState(backgroundColor)
  const [customWidth, setCustomWidth] = useState(canvasWidth)
  const [customHeight, setCustomHeight] = useState(canvasHeight)

  const handleAspectRatioChange = useCallback((newAspectRatio: string) => {
    const ratio = ASPECT_RATIOS.find(r => r.id === newAspectRatio)
    if (ratio && ratio.id !== 'custom') {
      onSettingsChange({
        aspectRatio: newAspectRatio,
        canvasWidth: ratio.width,
        canvasHeight: ratio.height,
        backgroundColor
      })
    } else {
      onSettingsChange({
        aspectRatio: newAspectRatio,
        canvasWidth: customWidth,
        canvasHeight: customHeight,
        backgroundColor
      })
    }
  }, [backgroundColor, customWidth, customHeight, onSettingsChange])

  const handleBackgroundColorChange = useCallback((colorId: string) => {
    const bgColor = BACKGROUND_COLORS.find(c => c.id === colorId)
    if (bgColor && bgColor.id !== 'custom') {
      onSettingsChange({
        aspectRatio,
        canvasWidth,
        canvasHeight,
        backgroundColor: bgColor.color
      })
    } else {
      onSettingsChange({
        aspectRatio,
        canvasWidth,
        canvasHeight,
        backgroundColor: customColor
      })
    }
  }, [aspectRatio, canvasWidth, canvasHeight, customColor, onSettingsChange])

  const handleCustomSizeChange = useCallback(() => {
    if (aspectRatio === 'custom') {
      onSettingsChange({
        aspectRatio: 'custom',
        canvasWidth: customWidth,
        canvasHeight: customHeight,
        backgroundColor
      })
    }
  }, [aspectRatio, customWidth, customHeight, backgroundColor, onSettingsChange])

  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color)
    onSettingsChange({
      aspectRatio,
      canvasWidth,
      canvasHeight,
      backgroundColor: color
    })
  }, [aspectRatio, canvasWidth, canvasHeight, onSettingsChange])

  const currentRatio = ASPECT_RATIOS.find(r => r.id === aspectRatio)
  const currentBgColor = BACKGROUND_COLORS.find(c => c.color === backgroundColor)

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Canvas Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aspect Ratio Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">Canvas Size</Label>
          <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {ASPECT_RATIOS.map((ratio) => {
                const IconComponent = ratio.icon
                return (
                  <SelectItem 
                    key={ratio.id} 
                    value={ratio.id}
                    className="text-white hover:bg-slate-600 focus:bg-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{ratio.name}</span>
                      {ratio.id !== 'custom' && (
                        <span className="text-slate-400 text-xs">({ratio.width}×{ratio.height})</span>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          
          {/* Show current dimensions */}
          <div className="text-xs text-slate-400">
            Current: {canvasWidth}×{canvasHeight} pixels
          </div>
        </div>

        {/* Custom Size Controls */}
        {aspectRatio === 'custom' && (
          <div className="space-y-3 border-t border-slate-600 pt-3">
            <Label className="text-sm font-medium text-slate-300">Custom Dimensions</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Width (px)</Label>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)}
                  onBlur={handleCustomSizeChange}
                  min={100}
                  max={2000}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Height (px)</Label>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 600)}
                  onBlur={handleCustomSizeChange}
                  min={100}
                  max={2000}
                  className="bg-slate-700 border-slate-600 text-white text-sm h-8"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleCustomSizeChange}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Apply Custom Size
            </Button>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Background Color Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">Background Color</Label>
          
          {/* Current Color Display */}
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-slate-400 flex-shrink-0"
              style={{ 
                backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor,
                backgroundImage: backgroundColor === 'transparent' 
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
                backgroundSize: backgroundColor === 'transparent' ? '8px 8px' : undefined,
                backgroundPosition: backgroundColor === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
              }}
            />
            <div className="flex-1">
              <div className="text-sm text-white">
                {currentBgColor?.name || 'Custom'}
              </div>
              <div className="text-xs text-slate-400">
                {backgroundColor}
              </div>
            </div>
          </div>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUND_COLORS.slice(0, -1).map((color) => (
              <Button
                key={color.id}
                size="sm"
                onClick={() => handleBackgroundColorChange(color.id)}
                className={`h-8 justify-start text-xs ${
                  backgroundColor === color.color
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded border border-slate-400 mr-2 flex-shrink-0"
                  style={{ 
                    backgroundColor: color.color === 'transparent' ? '#ffffff' : color.color,
                    backgroundImage: color.color === 'transparent' 
                      ? 'linear-gradient(45deg, #999 25%, transparent 25%), linear-gradient(-45deg, #999 25%, transparent 25%)'
                      : undefined,
                    backgroundSize: color.color === 'transparent' ? '4px 4px' : undefined
                  }}
                />
                {color.name}
              </Button>
            ))}
          </div>
          
          {/* Custom Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Custom Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-8 rounded border border-slate-600 cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 bg-slate-700 border-slate-600 text-white text-sm h-8"
              />
            </div>
          </div>
        </div>

        {/* Common Aspect Ratios */}
        <div className="space-y-2 border-t border-slate-600 pt-3">
          <Label className="text-xs font-medium text-slate-400 block">Common Ratios</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              onClick={() => handleAspectRatioChange('16:9')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
            >
              <Monitor className="w-3 h-3 mr-1" />
              16:9
            </Button>
            <Button
              size="sm"
              onClick={() => handleAspectRatioChange('9:16')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
            >
              <Smartphone className="w-3 h-3 mr-1" />
              9:16
            </Button>
            <Button
              size="sm"
              onClick={() => handleAspectRatioChange('1:1')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
            >
              <Square className="w-3 h-3 mr-1" />
              1:1
            </Button>
          </div>
        </div>

        {/* Canvas Info */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-sm text-blue-400 font-medium mb-1">
            Current Settings
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Size: {canvasWidth}×{canvasHeight}px</div>
            <div>Ratio: {aspectRatio}</div>
            <div>Background: {currentBgColor?.name || 'Custom'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}