'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEEDANCE_MODELS } from './constants'
import { Sparkles, Zap } from 'lucide-react'

interface ModelSelectorProps {
  selectedModel: 'seedance-lite' | 'seedance-pro'
  onModelSelect: (model: 'seedance-lite' | 'seedance-pro') => void
  creditsPerSecond: number
}

export function ModelSelector({ selectedModel, onModelSelect, creditsPerSecond }: ModelSelectorProps) {
  return (
    <Card className="border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Model Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SEEDANCE_MODELS.map((model) => (
          <div
            key={model.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedModel === model.id
                ? 'border-purple-500 bg-purple-950/30'
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => onModelSelect(model.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{model.icon}</span>
                  <span className="font-medium">{model.name}</span>
                  {selectedModel === model.id && (
                    <Badge variant="outline" className="ml-2 border-purple-500 text-purple-400">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-2">{model.description}</p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs border-slate-600">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-slate-400">
                    {model.creditsPerSecond} credits/sec
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Max: {model.maxResolution}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}