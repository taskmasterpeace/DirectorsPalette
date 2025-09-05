'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Eye, Download, RotateCcw } from 'lucide-react'
import { TextChunker, ShotChunk, ChunkingOptions } from '@/lib/text-chunking'

interface RainbowChunkerProps {
  text: string
  onShotsChange?: (shots: ShotChunk[]) => void
  initialShotCount?: number
  contentType?: 'story' | 'lyrics' | 'children_book' | 'commercial'
}

const SHOT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
] as const

export function RainbowChunker({ 
  text, 
  onShotsChange, 
  initialShotCount = 6,
  contentType = 'story'
}: RainbowChunkerProps) {
  const [shotCount, setShotCount] = useState(initialShotCount)
  const [chunks, setChunks] = useState<ShotChunk[]>([])
  const [selectedShot, setSelectedShot] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [clickableWords, setClickableWords] = useState<Set<number>>(new Set())
  const [parsingMode, setParsingMode] = useState<'punctuation' | 'lines' | 'hybrid'>('hybrid')

  // Initialize chunker with parsing mode
  const chunker = useMemo(() => new TextChunker(text, parsingMode), [text, parsingMode])
  const suggestions = useMemo(() => chunker.suggestShotCounts(), [chunker])
  const boundaries = useMemo(() => chunker.getBoundaries(), [chunker])
  const maxPossibleShots = useMemo(() => boundaries.length + 1, [boundaries])

  // Generate chunks when shot count changes
  useEffect(() => {
    const options: ChunkingOptions = {
      targetShotCount: shotCount,
      contentType
    }
    
    const newChunks = chunker.generateChunks(options)
    setChunks(newChunks)
    onShotsChange?.(newChunks)
  }, [shotCount, contentType, chunker])

  // Handle shot count change
  const handleShotCountChange = (value: number[]) => {
    setShotCount(value[0])
  }

  // Get color for shot
  const getShotColor = (index: number): string => {
    return SHOT_COLORS[index % SHOT_COLORS.length]
  }

  // Get color with opacity for highlighting
  const getShotColorWithOpacity = (index: number, opacity: number = 0.3): string => {
    const color = getShotColor(index)
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Handle word click for manual boundary adjustment
  const handleWordClick = (position: number) => {
    // Find which chunk this position belongs to
    const chunkIndex = chunks.findIndex(chunk => 
      position >= chunk.startPos && position <= chunk.endPos
    )
    
    if (chunkIndex !== -1) {
      setSelectedShot(chunkIndex)
      // Could implement manual splitting logic here
      console.log(`Clicked in shot ${chunkIndex + 1} at position ${position}`)
    }
  }

  // Render highlighted text (preserve original layout)
  const renderHighlightedText = () => {
    if (chunks.length === 0) {
      // If no chunks, show original text
      return <span className="whitespace-pre-wrap">{text}</span>
    }

    // Create a map of positions to chunk indices for efficient lookup
    const positionToChunk = new Map<number, number>()
    chunks.forEach((chunk, index) => {
      for (let i = chunk.startPos; i <= chunk.endPos; i++) {
        positionToChunk.set(i, index)
      }
    })

    // Render character by character to preserve exact layout
    const elements: React.ReactNode[] = []
    let currentChunk = -1
    let chunkStartElements: React.ReactNode[] = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const chunkIndex = positionToChunk.get(i) ?? -1
      
      // If we're starting a new chunk, wrap previous elements
      if (chunkIndex !== currentChunk) {
        // Close previous chunk
        if (currentChunk !== -1 && chunkStartElements.length > 0) {
          const color = getShotColor(currentChunk)
          const bgColor = getShotColorWithOpacity(currentChunk, selectedShot === currentChunk ? 0.5 : 0.2)
          const isSelected = selectedShot === currentChunk
          
          elements.push(
            <span
              key={`chunk-${currentChunk}`}
              className={`
                cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-sm
                ${isSelected ? 'ring-2 ring-blue-400' : 'hover:bg-opacity-40'}
              `}
              style={{
                backgroundColor: bgColor,
                borderLeft: `3px solid ${color}`
              }}
              onClick={() => setSelectedShot(selectedShot === currentChunk ? null : currentChunk)}
              title={`Shot ${currentChunk + 1} - Click to select`}
            >
              {chunkStartElements}
            </span>
          )
          chunkStartElements = []
        }
        
        currentChunk = chunkIndex
      }
      
      // Add character to current chunk or as unassigned
      if (currentChunk !== -1) {
        chunkStartElements.push(char)
      } else {
        elements.push(
          <span key={`unassigned-${i}`} className="text-gray-400">
            {char}
          </span>
        )
      }
    }

    // Close final chunk
    if (currentChunk !== -1 && chunkStartElements.length > 0) {
      const color = getShotColor(currentChunk)
      const bgColor = getShotColorWithOpacity(currentChunk, selectedShot === currentChunk ? 0.5 : 0.2)
      const isSelected = selectedShot === currentChunk
      
      elements.push(
        <span
          key={`chunk-${currentChunk}`}
          className={`
            cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-sm
            ${isSelected ? 'ring-2 ring-blue-400' : 'hover:bg-opacity-40'}
          `}
          style={{
            backgroundColor: bgColor,
            borderLeft: `3px solid ${color}`
          }}
          onClick={() => setSelectedShot(selectedShot === currentChunk ? null : currentChunk)}
          title={`Shot ${currentChunk + 1} - Click to select`}
        >
          {chunkStartElements}
        </span>
      )
    }

    return <span className="whitespace-pre-wrap">{elements}</span>
  }

  // Apply suggested shot count
  const applySuggestion = (suggestedCount: number) => {
    setShotCount(suggestedCount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Rainbow Highlighter
            <Badge variant="outline" className="ml-auto">Prototype 1</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shot Count Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Shot Count: {shotCount} (max: {maxPossibleShots})</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShotCount(initialShotCount)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            {/* Parsing Mode Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Parsing Mode:</label>
              <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
                <Button
                  variant={parsingMode === 'punctuation' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setParsingMode('punctuation')}
                  className="text-xs h-7"
                >
                  📝 Punctuation
                </Button>
                <Button
                  variant={parsingMode === 'lines' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setParsingMode('lines')}
                  className="text-xs h-7"
                >
                  📄 Lines
                </Button>
                <Button
                  variant={parsingMode === 'hybrid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setParsingMode('hybrid')}
                  className="text-xs h-7"
                >
                  🔗 Hybrid
                </Button>
              </div>
            </div>
            
            <Slider
              value={[shotCount]}
              onValueChange={handleShotCountChange}
              min={2}
              max={maxPossibleShots}
              step={1}
              className="w-full"
            />
            
            <div className="text-xs text-gray-600">
              Drag slider or click text to adjust shot boundaries
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Smart Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion(suggestion.count)}
                    className="text-xs"
                  >
                    {suggestion.count} shots
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {suggestion.confidence}/10
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Text Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Interactive Text ({chunks.length} shots)
            {selectedShot !== null && (
              <Badge className="ml-2" style={{ backgroundColor: getShotColor(selectedShot) }}>
                Shot {selectedShot + 1} Selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div 
              className="text-base leading-relaxed whitespace-pre-wrap select-text"
              style={{ lineHeight: '1.8' }}
            >
              {renderHighlightedText()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shot Preview Sidebar */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shot Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className={`p-3 rounded border-l-4 cursor-pointer transition-all ${
                    selectedShot === index ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ borderLeftColor: getShotColor(index) }}
                  onClick={() => setSelectedShot(selectedShot === index ? null : index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Shot {index + 1}</div>
                    <Badge 
                      style={{ 
                        backgroundColor: getShotColorWithOpacity(index, 0.8),
                        color: 'white'
                      }}
                    >
                      {chunk.text.split(' ').length} words
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {chunk.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {chunk.boundaryScore}/10
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {chunks.length} shots generated • Total: {text.split(' ').length} words
            </div>
            <Button onClick={() => console.log('Export shots:', chunks)}>
              <Download className="w-4 h-4 mr-2" />
              Export Shots
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}