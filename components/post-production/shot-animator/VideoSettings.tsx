'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Settings, Clock, Monitor, Camera } from 'lucide-react'
import { RESOLUTION_OPTIONS, DURATION_OPTIONS, ASPECT_RATIOS } from './constants'
import { VideoSettings as VideoSettingsType } from './types'

interface VideoSettingsProps {
  settings: VideoSettingsType
  onSettingsChange: (settings: VideoSettingsType) => void
  isProModel: boolean
}

export function VideoSettings({ settings, onSettingsChange, isProModel }: VideoSettingsProps) {
  return (
    <Card className="border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Video Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Video Prompt</Label>
          <Textarea
            id="prompt"
            value={settings.prompt}
            onChange={(e) => onSettingsChange({ ...settings, prompt: e.target.value })}
            placeholder="Describe your video scene..."
            className="min-h-[100px] bg-slate-900/50 border-slate-700"
          />
        </div>

        {/* Resolution Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Resolution
          </Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) => onSettingsChange({ ...settings, resolution: value })}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTION_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.value === '1080p' && !isProModel}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    <span className="text-xs text-slate-500 ml-2">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration
          </Label>
          <Select
            value={settings.duration.toString()}
            onValueChange={(value) => onSettingsChange({ ...settings, duration: parseInt(value) })}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {option.credits} credits
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Aspect Ratio
          </Label>
          <Select
            value={settings.aspectRatio}
            onValueChange={(value) => onSettingsChange({ ...settings, aspectRatio: value })}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{ratio.label}</span>
                    <span className="text-xs text-slate-500 ml-2">{ratio.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Motion Intensity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Motion Intensity</Label>
            <span className="text-sm text-slate-400">{settings.motionIntensity}%</span>
          </div>
          <Slider
            value={[settings.motionIntensity]}
            onValueChange={(value) => onSettingsChange({ ...settings, motionIntensity: value[0] })}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        {/* Seed */}
        <div className="space-y-2">
          <Label htmlFor="seed">Seed (Optional)</Label>
          <Input
            id="seed"
            type="number"
            value={settings.seed}
            onChange={(e) => onSettingsChange({ ...settings, seed: parseInt(e.target.value) || 0 })}
            placeholder="Random seed for reproducibility"
            className="bg-slate-900/50 border-slate-700"
          />
        </div>
      </CardContent>
    </Card>
  )
}