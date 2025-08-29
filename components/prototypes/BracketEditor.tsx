'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Move, Plus, X, RotateCcw, Download, Minus } from 'lucide-react'
import { TextChunker, ShotChunk, ChunkingOptions, TextBoundary } from '@/lib/text-chunking'

interface BracketEditorProps {
  text: string
  onShotsChange?: (shots: ShotChunk[]) => void
  initialShotCount?: number
  contentType?: 'story' | 'lyrics' | 'children_book' | 'commercial'
}

interface BracketMarker {
  id: string
  position: number
  isSelected: boolean
  isDragging: boolean
  confidence: number
  reason: string
}

export function BracketEditor({ 
  text, 
  onShotsChange, 
  initialShotCount = 6,
  contentType = 'story'
}: BracketEditorProps) {
  const [shotCount, setShotCount] = useState(initialShotCount)
  const [chunks, setChunks] = useState<ShotChunk[]>([])
  const [markers, setMarkers] = useState<BracketMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    markerId: string | null
    startPos: number
  }>({ isDragging: false, markerId: null, startPos: 0 })

  // Initialize chunker
  const chunker = useMemo(() => new TextChunker(text), [text])
  const suggestions = useMemo(() => chunker.suggestShotCounts(), [chunker])
  const boundaries = useMemo(() => chunker.getBoundaries(), [chunker])

  // Convert text boundaries to bracket markers
  const generateMarkersFromChunks = useCallback((newChunks: ShotChunk[]) => {
    const newMarkers: BracketMarker[] = []
    
    for (let i = 0; i < newChunks.length - 1; i++) {
      const chunk = newChunks[i]
      const nextChunk = newChunks[i + 1]
      
      // Find the boundary that corresponds to this position
      const boundary = boundaries.find(b => 
        Math.abs(b.position - chunk.endPos) < 10
      )
      
      newMarkers.push({
        id: `marker-${i}`,
        position: chunk.endPos,
        isSelected: false,
        isDragging: false,
        confidence: boundary?.score || 5,
        reason: boundary?.reason || 'Manual break'
      })
    }
    
    setMarkers(newMarkers)
  }, [boundaries])

  // Generate chunks from current markers
  const generateChunksFromMarkers = useCallback(() => {
    const sortedMarkers = [...markers].sort((a, b) => a.position - b.position)
    const newChunks: ShotChunk[] = []
    let lastPosition = 0

    sortedMarkers.forEach((marker, index) => {
      newChunks.push({
        id: `shot_${index + 1}`,
        text: text.slice(lastPosition, marker.position).trim(),
        startPos: lastPosition,
        endPos: marker.position,
        boundaryScore: marker.confidence
      })
      lastPosition = marker.position + 1
    })

    // Add final chunk
    newChunks.push({
      id: `shot_${newChunks.length + 1}`,
      text: text.slice(lastPosition).trim(),
      startPos: lastPosition,
      endPos: text.length,
      boundaryScore: 5
    })

    return newChunks.filter(chunk => chunk.text.length > 0)
  }, [markers, text])

  // Initial chunk generation
  useEffect(() => {
    const options: ChunkingOptions = {
      targetShotCount: shotCount,
      contentType
    }
    
    const newChunks = chunker.generateChunks(options)
    setChunks(newChunks)
    generateMarkersFromChunks(newChunks)
  }, [shotCount, contentType, chunker])

  // Update chunks when markers change
  useEffect(() => {
    if (markers.length > 0) {
      const newChunks = generateChunksFromMarkers()
      setChunks(newChunks)
    }
  }, [markers])

  // Handle shot count change
  const handleShotCountChange = (value: number[]) => {
    setShotCount(value[0])
  }

  // Handle marker selection
  const selectMarker = (markerId: string) => {
    setSelectedMarker(selectedMarker === markerId ? null : markerId)
    setMarkers(prev => prev.map(m => ({ ...m, isSelected: m.id === markerId })))
  }

  // Handle marker drag start
  const startDrag = (markerId: string, startPos: number) => {
    setDragState({ isDragging: true, markerId, startPos })
    setMarkers(prev => prev.map(m => ({ ...m, isDragging: m.id === markerId })))
  }

  // Handle marker drag
  const handleDrag = (newPosition: number) => {
    if (!dragState.isDragging || !dragState.markerId) return

    setMarkers(prev => prev.map(marker => 
      marker.id === dragState.markerId 
        ? { ...marker, position: Math.max(0, Math.min(text.length, newPosition)) }
        : marker
    ))
  }

  // Handle marker drag end
  const endDrag = () => {
    setDragState({ isDragging: false, markerId: null, startPos: 0 })
    setMarkers(prev => prev.map(m => ({ ...m, isDragging: false })))
  }

  // Add new marker at position
  const addMarker = (position: number) => {
    const newMarker: BracketMarker = {
      id: `marker-${Date.now()}`,
      position,
      isSelected: false,
      isDragging: false,
      confidence: 3,
      reason: 'Manual break'
    }
    setMarkers(prev => [...prev, newMarker].sort((a, b) => a.position - b.position))
  }

  // Remove marker
  const removeMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId))
    setSelectedMarker(null)
  }

  // Get suggestion ghost markers
  const getSuggestionMarkers = (): TextBoundary[] => {
    if (!showSuggestions) return []
    
    const currentPositions = new Set(markers.map(m => m.position))
    return boundaries.filter(b => 
      !currentPositions.has(b.position) && b.score >= 6
    )
  }

  // Render text with bracket markers
  const renderTextWithMarkers = () => {
    const sortedMarkers = [...markers].sort((a, b) => a.position - b.position)
    const suggestionMarkers = getSuggestionMarkers()
    
    let currentPos = 0
    const elements: React.ReactNode[] = []

    // Combine and sort all markers
    const allMarkers = [
      ...sortedMarkers.map(m => ({ ...m, type: 'active' as const })),
      ...suggestionMarkers.map((s, i) => ({
        id: `suggestion-${i}`,
        position: s.position,
        confidence: s.score,
        reason: s.reason,
        type: 'suggestion' as const,
        isSelected: false,
        isDragging: false
      }))
    ].sort((a, b) => a.position - b.position)

    allMarkers.forEach((marker, index) => {
      // Add text before marker
      if (currentPos < marker.position) {
        const textSegment = text.slice(currentPos, marker.position)
        elements.push(
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {textSegment}
          </span>
        )
      }

      // Add marker
      if (marker.type === 'active') {
        const isSelected = marker.isSelected
        const isDragging = marker.isDragging
        
        elements.push(
          <span
            key={marker.id}
            className={`
              inline-flex items-center px-2 py-1 mx-1 rounded cursor-move select-none
              border-2 transition-all duration-200
              ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-100'}
              ${isDragging ? 'shadow-lg scale-110' : 'hover:border-blue-400'}
            `}
            onClick={() => selectMarker(marker.id)}
            onMouseDown={(e) => startDrag(marker.id, e.clientX)}
            title={`${marker.reason} (Confidence: ${marker.confidence}/10)`}
          >
            <Minus className="w-3 h-3 mr-1" />
            <span className="text-xs font-mono">SHOT BREAK</span>
            {isSelected && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeMarker(marker.id)
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </span>
        )
      } else {
        // Suggestion marker
        elements.push(
          <span
            key={marker.id}
            className="
              inline-flex items-center px-1 py-0.5 mx-1 rounded cursor-pointer
              border border-dashed border-blue-300 bg-blue-50 opacity-60
              hover:opacity-100 transition-opacity
            "
            onClick={() => addMarker(marker.position)}
            title={`Suggestion: ${marker.reason} (Score: ${marker.confidence}/10)`}
          >
            <Plus className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600 ml-1">+</span>
          </span>
        )
      }

      currentPos = marker.position
    })

    // Add remaining text
    if (currentPos < text.length) {
      elements.push(
        <span key="remaining" className="whitespace-pre-wrap">
          {text.slice(currentPos)}
        </span>
      )
    }

    return elements
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
            <Move className="w-5 h-5" />
            Bracket Editor
            <Badge variant="outline" className="ml-auto">Prototype 2</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shot Count Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Target Shots: {shotCount}</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  {showSuggestions ? 'Hide' : 'Show'} Suggestions
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
            
            <Slider
              value={[shotCount]}
              onValueChange={handleShotCountChange}
              min={2}
              max={24}
              step={1}
              className="w-full"
            />
            
            <div className="text-xs text-gray-600">
              Drag markers to adjust boundaries, click suggestions to add them
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
            Interactive Text with Markers ({chunks.length} shots)
            {selectedMarker && (
              <Badge className="ml-2" variant="outline">
                Marker Selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div 
              className="text-base leading-relaxed select-text"
              style={{ lineHeight: '2' }}
            >
              {renderTextWithMarkers()}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 bg-gray-100 rounded"></div>
                <span>Active Break</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-dashed border-blue-300 bg-blue-50 rounded"></div>
                <span>Suggested Break</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4" />
                <span>Drag to reposition</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shot Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shot Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chunks.map((chunk, index) => (
              <div
                key={chunk.id}
                className="flex items-center gap-3 p-2 rounded border hover:bg-gray-50"
              >
                <Badge variant="outline" className="w-16 justify-center">
                  Shot {index + 1}
                </Badge>
                <div className="flex-1 text-sm text-gray-600 truncate">
                  {chunk.text.substring(0, 100)}{chunk.text.length > 100 ? '...' : ''}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {chunk.text.split(' ').length} words
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Score: {chunk.boundaryScore}/10
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {chunks.length} shots • {markers.length} active markers • {getSuggestionMarkers().length} suggestions
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