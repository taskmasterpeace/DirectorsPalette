'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Images, Settings2 } from 'lucide-react'
import type { Gen4Settings } from '@/lib/post-production/enhanced-types'

interface SeedreamSettingsProps {
  settings: Gen4Settings
  onSettingsChange: (settings: Gen4Settings) => void
}

export function SeedreamSettings({ settings, onSettingsChange }: SeedreamSettingsProps) {
  const updateSettings = (updates: Partial<Gen4Settings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  const seedreamResolutions = [
    { value: '1K', label: '1K (1024px)', description: 'Fast generation' },
    { value: '2K', label: '2K (2048px)', description: 'Default quality' },
    { value: '4K', label: '4K (4096px)', description: 'Maximum quality' },
    { value: 'custom', label: 'Custom Dimensions', description: 'Set your own size' }
  ]

  const seedreamAspectRatios = [
    { value: 'match_input_image', label: 'Match Input' },
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Classic (4:3)' },
    { value: '3:4', label: 'Portrait (3:4)' },
    { value: '3:2', label: 'Photo (3:2)' },
    { value: '2:3', label: 'Portrait Photo (2:3)' },
    { value: '21:9', label: 'Ultrawide (21:9)' }
  ]

  const maxImages = settings.maxImages || 1
  const creditsNeeded = maxImages * 9  // 9 credits per image (3x markup built in)

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
      <CardContent className="pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-300">Seedream-4</span>
          <span className="text-xs text-slate-400">Multi-image capable</span>
        </div>

        {/* Resolution Setting */}
        <div>
          <Label className="text-white text-sm font-medium">Resolution</Label>
          <Select 
            value={settings.resolution || '2K'} 
            onValueChange={(value) => updateSettings({ resolution: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seedreamResolutions.map((res) => (
                <SelectItem key={res.value} value={res.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{res.label}</span>
                    <span className="text-xs text-slate-400">{res.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Dimensions (when resolution is custom) */}
        {settings.resolution === 'custom' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
            <div>
              <Label className="text-white text-sm">Custom Width (px)</Label>
              <Input
                type="number"
                min={1024}
                max={4096}
                value={settings.customWidth || 2048}
                onChange={(e) => updateSettings({ customWidth: parseInt(e.target.value) || 2048 })}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="2048"
              />
            </div>
            <div>
              <Label className="text-white text-sm">Custom Height (px)</Label>
              <Input
                type="number"
                min={1024}
                max={4096}
                value={settings.customHeight || 2048}
                onChange={(e) => updateSettings({ customHeight: parseInt(e.target.value) || 2048 })}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="2048"
              />
            </div>
          </div>
        )}

        {/* Aspect Ratio */}
        <div>
          <Label className="text-white text-sm font-medium">Aspect Ratio</Label>
          <Select 
            value={settings.aspectRatio || '16:9'} 
            onValueChange={(value) => updateSettings({ aspectRatio: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seedreamAspectRatios.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Max Images Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-green-400" />
              <Label className="text-white text-sm font-medium">Number of Images</Label>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-300 border-green-500">
                {maxImages} image{maxImages > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="text-blue-300 border-blue-500">
                {creditsNeeded} credits
              </Badge>
            </div>
          </div>
          
          <div className="px-2">
            <Slider
              value={[maxImages]}
              onValueChange={([value]) => updateSettings({ maxImages: value })}
              min={1}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span>
              <span className="text-center">Generate up to 15 images</span>
              <span>15</span>
            </div>
          </div>
        </div>

        {/* Sequential Generation */}
        <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
          <Checkbox
            id="sequential"
            checked={settings.sequentialGeneration || false}
            onCheckedChange={(checked) => updateSettings({ sequentialGeneration: !!checked })}
          />
          <div className="flex-1">
            <Label htmlFor="sequential" className="text-white text-sm font-medium cursor-pointer">
              Sequential Generation
            </Label>
            <p className="text-xs text-slate-400 mt-1">
              Let the model automatically generate related image variations for storytelling
            </p>
          </div>
          <Settings2 className="w-4 h-4 text-slate-400" />
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400 bg-slate-800/20 p-3 rounded border border-slate-700">
          <strong className="text-green-300">Seedream-4 Features:</strong> High-resolution generation up to 4K, 
          multiple image output (1-15), advanced aspect ratio control, and sequential generation for story sequences.
        </div>
      </CardContent>
    </Card>
  )
}