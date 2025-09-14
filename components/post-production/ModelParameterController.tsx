'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getModelConfig, isParameterSupported, type ModelId } from '@/lib/post-production/model-config'
import type { Gen4Settings } from '@/lib/post-production/enhanced-types'

interface ModelParameterControllerProps {
  modelId: ModelId
  settings: Gen4Settings
  onSettingsChange: (settings: Gen4Settings) => void
}

export function ModelParameterController({
  modelId,
  settings,
  onSettingsChange
}: ModelParameterControllerProps) {
  const modelConfig = getModelConfig(modelId)
  
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const renderParameter = (parameterId: string) => {
    if (!isParameterSupported(modelId, parameterId)) {
      return null
    }

    const parameter = modelConfig.parameters[parameterId]
    if (!parameter) return null

    switch (parameter.type) {
      case 'select':
        return (
          <div key={parameterId}>
            <Label className="text-white text-sm">{parameter.label}</Label>
            <Select 
              value={settings[parameterId as keyof Gen4Settings] as string || parameter.default} 
              onValueChange={(value) => updateSetting(parameterId, value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'number':
        return (
          <div key={parameterId}>
            <Label className="text-white text-sm">{parameter.label}</Label>
            <Input
              type="number"
              value={settings[parameterId as keyof Gen4Settings] as number || ''}
              onChange={(e) => updateSetting(parameterId, e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={parameter.default ? parameter.default.toString() : 'Optional'}
              min={parameter.min}
              max={parameter.max}
              className="bg-slate-800 border-slate-600 text-white"
            />
            {parameter.description && (
              <p className="text-xs text-slate-400 mt-1">{parameter.description}</p>
            )}
          </div>
        )

      case 'slider':
        const currentValue = settings[parameterId as keyof Gen4Settings] as number || parameter.default || parameter.min || 1
        return (
          <div key={parameterId}>
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm flex items-center gap-2">
                {parameter.label}
              </Label>
              <div className="text-sm text-slate-400">
                <span className="text-white font-medium">{currentValue}</span> {parameterId === 'maxImages' ? 'images' : ''}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[currentValue]}
                onValueChange={(value) => updateSetting(parameterId, value[0])}
                min={parameter.min || 1}
                max={parameter.max || 100}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
                <span>"{parameter.min}"</span>
                <span>{parameter.description}</span>
                <span>"{parameter.max}"</span>
              </div>
            </div>
          </div>
        )

      case 'boolean':
        const boolValue = settings[parameterId as keyof Gen4Settings] as boolean || parameter.default || false
        return (
          <div key={parameterId} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={parameterId}
                checked={boolValue}
                onCheckedChange={(checked) => updateSetting(parameterId, checked)}
              />
              <Label htmlFor={parameterId} className="text-white text-sm">
                {parameter.label}
              </Label>
            </div>
            {parameter.description && (
              <p className="text-xs text-slate-400 ml-6">{parameter.description}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Group parameters into logical sections
  const basicParameters = ['aspectRatio', 'resolution', 'seedreamResolution']
  const advancedParameters = ['seed', 'maxImages', 'customWidth', 'customHeight']
  const editingParameters = ['outputFormat', 'outputQuality', 'goFast']
  const specialParameters = ['sequentialGeneration']

  return (
    <div className="space-y-4">
      {/* Basic Generation Settings */}
      <div className="grid grid-cols-3 gap-4">
        {basicParameters.map(renderParameter)}
      </div>

      {/* Advanced Settings (for Seedream-4) */}
      {modelId === 'seedream-4' && (
        <div className="space-y-4 border-t border-slate-700 pt-4">
          <Label className="text-white text-sm font-medium">Advanced Settings</Label>
          <div className="space-y-3">
            {advancedParameters.map(renderParameter)}
          </div>
        </div>
      )}

      {/* Special Features */}
      {specialParameters.some(id => isParameterSupported(modelId, id)) && (
        <div className="space-y-3 border-t border-slate-700 pt-4">
          {specialParameters.map(renderParameter)}
        </div>
      )}

      {/* Editing Parameters (for Qwen Edit) - Compact horizontal layout */}
      {modelId === 'qwen-image-edit' && (
        <div className="border-t border-slate-700 pt-3">
          <div className="grid grid-cols-3 gap-3">
            {editingParameters.map(renderParameter)}
          </div>
        </div>
      )}

      {/* Model Info - Hide for simple models like Nano Banana */}
      {modelId !== 'nano-banana' && (
        <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{modelConfig.icon}</span>
            <span className="font-medium text-white">{modelConfig.displayName}</span>
            <span className="text-slate-500">•</span>
            <span>${modelConfig.costPerImage} per image</span>
          </div>
          <p>{modelConfig.description}</p>
          {modelConfig.maxReferenceImages && (
            <p className="mt-1">
              <strong>Reference Images:</strong> Up to {modelConfig.maxReferenceImages} supported
            </p>
          )}
        </div>
      )}
    </div>
  )
}