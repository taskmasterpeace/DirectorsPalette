'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Gen4Settings } from "./types"
import { GEN4_RESOLUTIONS } from "@/static/data"

interface GenerationSettingsProps {
  settings: Gen4Settings
  onSettingsChange: (settings: Gen4Settings) => void
  modelOptions?: { value: string; label: string }[]
}

export function GenerationSettings({
  settings,
  onSettingsChange,
  modelOptions = [
    { value: 'gen4', label: 'Gen4 Standard' },
    { value: 'seedream', label: 'Seedream' }
  ]
}: GenerationSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Selection */}
        <div>
          <Label htmlFor="model">Model</Label>
          <Select
            value={settings.model}
            onValueChange={(value) => onSettingsChange({ ...settings, model: value })}
          >
            <SelectTrigger id="model" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution */}
        <div>
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) => onSettingsChange({ ...settings, resolution: value })}
          >
            <SelectTrigger id="resolution" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GEN4_RESOLUTIONS.map(res => (
                <SelectItem key={res.value} value={res.value}>
                  {res.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Settings (if applicable) */}
        {settings.model === 'gen4-video' && (
          <>
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="15"
                value={settings.duration || 5}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  duration: parseInt(e.target.value)
                })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="fps">FPS</Label>
              <Select
                value={settings.fps?.toString() || '24'}
                onValueChange={(value) => onSettingsChange({
                  ...settings,
                  fps: parseInt(value)
                })}
              >
                <SelectTrigger id="fps" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Motion Intensity</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.motionIntensity || 50}%
                </span>
              </div>
              <Slider
                value={[settings.motionIntensity || 50]}
                onValueChange={(value) => onSettingsChange({
                  ...settings,
                  motionIntensity: value[0]
                })}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Seed */}
        <div>
          <Label htmlFor="seed">Seed (Optional)</Label>
          <Input
            id="seed"
            type="number"
            placeholder="Random seed for reproducibility"
            value={settings.seed || ''}
            onChange={(e) => onSettingsChange({
              ...settings,
              seed: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}