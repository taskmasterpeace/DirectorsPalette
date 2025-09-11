'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Sparkles, 
  Zap, 
  Leaf,
  Info
} from 'lucide-react'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  showTooltips?: boolean
  compact?: boolean
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  showTooltips = true,
  compact = false 
}: ModelSelectorProps) {
  const models = [
    {
      id: 'nano-banana',
      name: 'Nano Banana',
      icon: '🍌',
      iconComponent: Sparkles,
      description: 'Fast generation, good for quick iterations',
      badge: 'Fast',
      badgeColor: 'bg-yellow-600',
      textColor: 'text-yellow-300'
    },
    {
      id: 'seedream-4',
      name: 'Seedream-4',
      icon: '🌱',
      iconComponent: Leaf,
      description: 'High quality 2K/4K, supports multi-image generation (1-15)',
      badge: '2K/4K',
      badgeColor: 'bg-green-600',
      textColor: 'text-green-300'
    },
    {
      id: 'gen4-image',
      name: 'Gen4 Image',
      icon: '⚡',
      iconComponent: Zap,
      description: 'Balanced quality and speed',
      badge: 'Balanced',
      badgeColor: 'bg-blue-600',
      textColor: 'text-blue-300'
    },
    {
      id: 'gen4-image-turbo',
      name: 'Gen4 Turbo',
      icon: '💨',
      iconComponent: Zap,
      description: 'Fastest generation with good quality',
      badge: 'Turbo',
      badgeColor: 'bg-purple-600',
      textColor: 'text-purple-300'
    }
  ]

  const currentModel = models.find(m => m.id === selectedModel) || models[0]

  if (compact) {
    return (
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentModel.icon}</span>
              <span className="font-medium">{currentModel.name}</span>
              <Badge className={`${currentModel.badgeColor} text-white text-xs`}>
                {currentModel.badge}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{model.icon}</span>
                <span className="font-medium">{model.name}</span>
                <Badge className={`${model.badgeColor} text-white text-xs`}>
                  {model.badge}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-white">Model Selection</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {models.map((model) => {
          const isSelected = selectedModel === model.id
          const IconComponent = model.iconComponent
          
          return (
            <Button
              key={model.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onModelChange(model.id)}
              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'bg-slate-700 border-slate-500 shadow-md ring-2 ring-purple-500/30' 
                  : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
              }`}
              title={showTooltips ? model.description : undefined}
            >
              {/* Icon */}
              <div className="flex items-center gap-1">
                <span className="text-2xl">{model.icon}</span>
                <IconComponent className={`w-4 h-4 ${model.textColor}`} />
              </div>
              
              {/* Name */}
              <span className="text-sm font-medium text-white">
                {model.name}
              </span>
              
              {/* Badge */}
              <Badge className={`${model.badgeColor} text-white text-xs`}>
                {model.badge}
              </Badge>
              
              {/* Description for selected */}
              {isSelected && showTooltips && (
                <p className="text-xs text-slate-300 text-center mt-1">
                  {model.description}
                </p>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}