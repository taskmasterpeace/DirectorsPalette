'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Layers, 
  Split, 
  Merge, 
  GripVertical, 
  Eye, 
  EyeOff,
  Zap,
  RotateCcw,
  Download,
  BarChart3
} from 'lucide-react'
import { TextChunker, ShotChunk, ChunkingOptions } from '@/lib/text-chunking'

interface LayerStackProps {
  text: string
  onShotsChange?: (shots: ShotChunk[]) => void
  initialShotCount?: number
  contentType?: 'story' | 'lyrics' | 'children_book' | 'commercial'
}

interface ShotLayer {
  id: string
  text: string
  startPos: number
  endPos: number
  confidence: number
  emotion: 'low' | 'medium' | 'high'
  action: 'low' | 'medium' | 'high'
  pacing: 'slow' | 'medium' | 'fast'
  isSelected: boolean
  isCollapsed: boolean
}

interface SplitSuggestion {
  position: number
  confidence: number
  reason: string
}

export function LayerStack({ 
  text, 
  onShotsChange, 
  initialShotCount = 6,
  contentType = 'story'
}: LayerStackProps) {
  const [layers, setLayers] = useState<ShotLayer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [showDNA, setShowDNA] = useState(true)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    layerId: string | null
    insertIndex: number | null
  }>({ isDragging: false, layerId: null, insertIndex: null })

  // Initialize chunker
  const chunker = useMemo(() => new TextChunker(text), [text])

  // Analyze text characteristics for "Shot DNA"
  const analyzeTextCharacteristics = useCallback((textSegment: string): {
    emotion: ShotLayer['emotion']
    action: ShotLayer['action'] 
    pacing: ShotLayer['pacing']
  } => {
    const words = textSegment.toLowerCase()
    
    // Emotion analysis
    const emotionWords = ['excited', 'scared', 'happy', 'sad', 'amazed', 'shocked', 'surprised', 'love', 'hate', 'angry']
    const emotionCount = emotionWords.filter(word => words.includes(word)).length
    const emotion: ShotLayer['emotion'] = 
      emotionCount >= 2 ? 'high' : 
      emotionCount >= 1 ? 'medium' : 'low'

    // Action analysis
    const actionWords = ['ran', 'jumped', 'fought', 'grabbed', 'threw', 'burst', 'crashed', 'exploded', 'rushed', 'charged']
    const actionCount = actionWords.filter(word => words.includes(word)).length
    const action: ShotLayer['action'] = 
      actionCount >= 2 ? 'high' : 
      actionCount >= 1 ? 'medium' : 'low'

    // Pacing analysis (based on sentence structure and word choice)
    const shortSentences = textSegment.split(/[.!?]/).filter(s => s.trim().split(' ').length < 8).length
    const totalSentences = textSegment.split(/[.!?]/).filter(s => s.trim().length > 0).length
    const shortSentenceRatio = shortSentences / Math.max(totalSentences, 1)
    
    const pacing: ShotLayer['pacing'] = 
      shortSentenceRatio > 0.6 ? 'fast' :
      shortSentenceRatio > 0.3 ? 'medium' : 'slow'

    return { emotion, action, pacing }
  }, [])

  // Generate initial layers
  useEffect(() => {
    const options: ChunkingOptions = {
      targetShotCount: initialShotCount,
      contentType
    }
    
    const chunks = chunker.generateChunks(options)
    const newLayers: ShotLayer[] = chunks.map((chunk, index) => {
      const characteristics = analyzeTextCharacteristics(chunk.text)
      
      return {
        id: chunk.id,
        text: chunk.text,
        startPos: chunk.startPos,
        endPos: chunk.endPos,
        confidence: chunk.boundaryScore,
        ...characteristics,
        isSelected: false,
        isCollapsed: false
      }
    })
    
    setLayers(newLayers)
  }, [initialShotCount, contentType, chunker])

  // Select layer
  const selectLayer = (layerId: string) => {
    setSelectedLayer(selectedLayer === layerId ? null : layerId)
    setLayers(prev => prev.map(layer => ({
      ...layer,
      isSelected: layer.id === layerId && selectedLayer !== layerId
    })))
  }

  // Toggle layer collapse
  const toggleCollapse = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId 
        ? { ...layer, isCollapsed: !layer.isCollapsed }
        : layer
    ))
  }

  // Get split suggestions for a layer
  const getSplitSuggestions = (layer: ShotLayer): SplitSuggestion[] => {
    const layerText = layer.text
    const sentences = layerText.split(/(?<=[.!?])\s+/)
    
    if (sentences.length <= 1) return []
    
    const suggestions: SplitSuggestion[] = []
    let position = 0
    
    for (let i = 0; i < sentences.length - 1; i++) {
      position += sentences[i].length + 1
      
      // Score this potential split point
      let confidence = 3 // Base score
      
      // Boost for dialogue transitions
      if (sentences[i].includes('"') !== sentences[i + 1].includes('"')) {
        confidence += 2
      }
      
      // Boost for action sequences
      if (sentences[i + 1].toLowerCase().includes('suddenly') || 
          sentences[i + 1].toLowerCase().includes('then')) {
        confidence += 2
      }
      
      // Boost for balanced splits
      const firstHalfWords = sentences.slice(0, i + 1).join(' ').split(' ').length
      const totalWords = layerText.split(' ').length
      const balance = Math.abs((firstHalfWords / totalWords) - 0.5)
      if (balance < 0.2) confidence += 1
      
      suggestions.push({
        position: layer.startPos + position,
        confidence,
        reason: confidence >= 6 ? 'Strong break point' : 'Possible break point'
      })
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  // Split layer at position
  const splitLayer = (layerId: string, splitPosition?: number) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return
    
    let actualSplitPos = splitPosition
    
    // If no position specified, use the best suggestion
    if (!actualSplitPos) {
      const suggestions = getSplitSuggestions(layer)
      if (suggestions.length === 0) return
      actualSplitPos = suggestions[0].position
    }
    
    // Calculate relative position within the layer
    const relativePos = actualSplitPos - layer.startPos
    const firstPartText = layer.text.substring(0, relativePos).trim()
    const secondPartText = layer.text.substring(relativePos).trim()
    
    if (!firstPartText || !secondPartText) return
    
    // Create new layers
    const firstLayer: ShotLayer = {
      ...layer,
      id: `${layer.id}_1`,
      text: firstPartText,
      endPos: actualSplitPos,
      ...analyzeTextCharacteristics(firstPartText)
    }
    
    const secondLayer: ShotLayer = {
      ...layer,
      id: `${layer.id}_2`,
      text: secondPartText,
      startPos: actualSplitPos,
      ...analyzeTextCharacteristics(secondPartText)
    }
    
    // Replace original layer with split layers
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId)
      if (index === -1) return prev
      
      const newLayers = [...prev]
      newLayers.splice(index, 1, firstLayer, secondLayer)
      return newLayers
    })
  }

  // Merge adjacent layers
  const mergeLayers = (layerId1: string, layerId2: string) => {
    const layer1 = layers.find(l => l.id === layerId1)
    const layer2 = layers.find(l => l.id === layerId2)
    
    if (!layer1 || !layer2) return
    
    // Ensure layers are adjacent
    const index1 = layers.findIndex(l => l.id === layerId1)
    const index2 = layers.findIndex(l => l.id === layerId2)
    
    if (Math.abs(index1 - index2) !== 1) return
    
    const firstLayer = index1 < index2 ? layer1 : layer2
    const secondLayer = index1 < index2 ? layer2 : layer1
    
    const mergedText = `${firstLayer.text} ${secondLayer.text}`
    const mergedLayer: ShotLayer = {
      id: `merged_${Date.now()}`,
      text: mergedText,
      startPos: firstLayer.startPos,
      endPos: secondLayer.endPos,
      confidence: Math.max(firstLayer.confidence, secondLayer.confidence),
      ...analyzeTextCharacteristics(mergedText),
      isSelected: false,
      isCollapsed: false
    }
    
    // Replace both layers with merged layer
    setLayers(prev => {
      const newLayers = [...prev]
      const minIndex = Math.min(index1, index2)
      const maxIndex = Math.max(index1, index2)
      
      newLayers.splice(minIndex, maxIndex - minIndex + 1, mergedLayer)
      return newLayers
    })
  }

  // Get DNA visualization color
  const getDNAColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low': return 'bg-gray-200'
      case 'medium': return 'bg-yellow-400'
      case 'high': return 'bg-red-500'
    }
  }

  // Get DNA visualization intensity
  const getDNAIntensity = (level: 'low' | 'medium' | 'high'): number => {
    switch (level) {
      case 'low': return 20
      case 'medium': return 60
      case 'high': return 100
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Layer Stack
            <Badge variant="outline" className="ml-auto">Prototype 3</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {layers.length} shot layers • Drag to reorder, split/merge to adjust
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDNA(!showDNA)}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                {showDNA ? 'Hide' : 'Show'} DNA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const options: ChunkingOptions = {
                    targetShotCount: initialShotCount,
                    contentType
                  }
                  
                  const chunks = chunker.generateChunks(options)
                  const newLayers: ShotLayer[] = chunks.map((chunk) => {
                    const characteristics = analyzeTextCharacteristics(chunk.text)
                    
                    return {
                      id: chunk.id,
                      text: chunk.text,
                      startPos: chunk.startPos,
                      endPos: chunk.endPos,
                      confidence: chunk.boundaryScore,
                      ...characteristics,
                      isSelected: false,
                      isCollapsed: false
                    }
                  })
                  
                  setLayers(newLayers)
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layer Stack */}
      <div className="space-y-3">
        {layers.map((layer, index) => (
          <Card
            key={layer.id}
            className={`
              transition-all duration-200 cursor-pointer
              ${layer.isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:shadow-md'}
            `}
          >
            <CardHeader 
              className="pb-3 cursor-pointer"
              onClick={() => selectLayer(layer.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div>
                    <CardTitle className="text-base">Shot {index + 1}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {layer.text.split(' ').length} words
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {layer.confidence}/10
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCollapse(layer.id)
                    }}
                  >
                    {layer.isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Shot DNA Visualization */}
              {showDNA && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-500">Shot DNA Analysis:</div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Emotion</span>
                        <span className="text-gray-500">{layer.emotion}</span>
                      </div>
                      <Progress 
                        value={getDNAIntensity(layer.emotion)} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Action</span>
                        <span className="text-gray-500">{layer.action}</span>
                      </div>
                      <Progress 
                        value={getDNAIntensity(layer.action)} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Pacing</span>
                        <span className="text-gray-500">{layer.pacing}</span>
                      </div>
                      <Progress 
                        value={layer.pacing === 'fast' ? 100 : layer.pacing === 'medium' ? 60 : 20} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            {!layer.isCollapsed && (
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {layer.text}
                  </p>
                </div>

                {/* Layer Controls */}
                {layer.isSelected && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => splitLayer(layer.id)}
                    >
                      <Split className="w-4 h-4 mr-1" />
                      Smart Split
                    </Button>
                    
                    {index < layers.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mergeLayers(layer.id, layers[index + 1].id)}
                      >
                        <Merge className="w-4 h-4 mr-1" />
                        Merge Down
                      </Button>
                    )}
                    
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mergeLayers(layers[index - 1].id, layer.id)}
                      >
                        <Merge className="w-4 h-4 mr-1" />
                        Merge Up
                      </Button>
                    )}

                    <div className="ml-auto">
                      {getSplitSuggestions(layer).length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          {getSplitSuggestions(layer).length} split options
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {layers.length} layers • Total: {text.split(' ').length} words
            </div>
            <Button onClick={() => console.log('Export layers:', layers)}>
              <Download className="w-4 h-4 mr-2" />
              Export Shots
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}