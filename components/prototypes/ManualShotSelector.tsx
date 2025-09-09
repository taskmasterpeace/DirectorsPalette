'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Target, 
  Split, 
  Plus, 
  Trash2,
  Copy,
  Download,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { TextChunker, ShotChunk } from '@/lib/text-chunking'
import { Slider } from '@/components/ui/slider'

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

interface TextSelection {
  startIndex: number
  endIndex: number
  text: string
  id: string
}

interface GeneratedShot {
  id: string
  sourceText: string
  description: string
  timestamp: Date
  contextBefore: string
  contextAfter: string
}

interface ManualShotSelectorProps {
  text: string
  contentType: 'story' | 'lyrics' | 'children_book' | 'commercial'
  onShotsChange?: (shots: GeneratedShot[]) => void
}

export function ManualShotSelector({ 
  text, 
  contentType,
  onShotsChange 
}: ManualShotSelectorProps) {
  const [selectedText, setSelectedText] = useState<TextSelection | null>(null)
  const [generatedShots, setGeneratedShots] = useState<GeneratedShot[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPunctuationMarkers, setShowPunctuationMarkers] = useState(true)
  const [tempShotDescription, setTempShotDescription] = useState('')
  
  // Rainbow highlighting and precision control
  const [precisionLevel, setPrecisionLevel] = useState<number>(8)
  const [showRainbowHighlighting, setShowRainbowHighlighting] = useState(true)
  const [chunks, setChunks] = useState<ShotChunk[]>([])
  const [selectedChunk, setSelectedChunk] = useState<number | null>(null)

  // Initialize chunker for rainbow highlighting
  const chunker = useMemo(() => new TextChunker(text, 'punctuation'), [text])
  const boundaries = useMemo(() => chunker.getBoundaries(), [chunker])
  const maxPossibleShots = useMemo(() => boundaries.length + 1, [boundaries])

  // Get punctuation positions for visual markers (fallback)
  const punctuationMarkers = useMemo(() => {
    const markers: { position: number; type: string }[] = []
    const punctuationRegex = /[.!?,;:]/g
    let match
    
    while ((match = punctuationRegex.exec(text)) !== null) {
      markers.push({
        position: match.index,
        type: match[0]
      })
    }
    
    return markers
  }, [text])

  // Color helper functions from RainbowChunker
  const getShotColor = (index: number): string => {
    return SHOT_COLORS[index % SHOT_COLORS.length]
  }

  const getShotColorWithOpacity = (index: number, opacity: number = 0.3): string => {
    const color = getShotColor(index)
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Generate chunks when precision level changes
  useEffect(() => {
    if (showRainbowHighlighting) {
      const options = {
        targetShotCount: precisionLevel,
        contentType
      }
      const newChunks = chunker.generateChunks(options)
      setChunks(newChunks)
    }
  }, [precisionLevel, contentType, chunker, showRainbowHighlighting])

  // Handle precision level change
  const handlePrecisionChange = (value: number[]) => {
    setPrecisionLevel(value[0])
  }

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const selectedText = range.toString().trim()
    
    if (selectedText.length === 0) {
      setSelectedText(null)
      return
    }
    
    // Find positions in our text
    const startIndex = text.indexOf(selectedText)
    if (startIndex === -1) return
    
    const newSelection: TextSelection = {
      startIndex,
      endIndex: startIndex + selectedText.length,
      text: selectedText,
      id: `selection_${Date.now()}`
    }
    
    setSelectedText(newSelection)
  }, [text])

  // Generate shot description for selected text
  const generateShot = async () => {
    if (!selectedText) return
    
    setIsGenerating(true)
    
    try {
      // Get context around selection (50 chars before/after)
      const contextBefore = text.slice(Math.max(0, selectedText.startIndex - 50), selectedText.startIndex)
      const contextAfter = text.slice(selectedText.endIndex, Math.min(text.length, selectedText.endIndex + 50))
      
      // Simulate AI call (replace with actual API call)
      const mockShotDescription = await mockGenerateShot(
        selectedText.text,
        contextBefore,
        contextAfter,
        contentType,
        text // Full story context
      )
      
      setTempShotDescription(mockShotDescription)
      
    } catch (error) {
      console.error('Shot generation failed:', error)
      setTempShotDescription('Failed to generate shot description')
    } finally {
      setIsGenerating(false)
    }
  }

  // Add shot to the list
  const addShot = () => {
    if (!selectedText || !tempShotDescription) return
    
    const contextBefore = text.slice(Math.max(0, selectedText.startIndex - 50), selectedText.startIndex)
    const contextAfter = text.slice(selectedText.endIndex, Math.min(text.length, selectedText.endIndex + 50))
    
    const newShot: GeneratedShot = {
      id: `shot_${Date.now()}`,
      sourceText: selectedText.text,
      description: tempShotDescription,
      timestamp: new Date(),
      contextBefore,
      contextAfter
    }
    
    const updatedShots = [...generatedShots, newShot]
    setGeneratedShots(updatedShots)
    onShotsChange?.(updatedShots)
    
    // Clear selections
    setSelectedText(null)
    setTempShotDescription('')
    window.getSelection()?.removeAllRanges()
  }

  // Mock AI shot generation (replace with actual server action)
  const mockGenerateShot = async (
    selectedText: string,
    contextBefore: string, 
    contextAfter: string,
    contentType: string,
    fullStory: string
  ): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Content-specific shot generation logic
    switch (contentType) {
      case 'story':
        return `Wide shot: ${selectedText.toLowerCase()} - cinematic establishing shot with dramatic lighting, capturing the emotional weight of the scene within the larger narrative context.`
      
      case 'lyrics':
        return `Dynamic shot: Visual interpretation of "${selectedText}" with music video styling, synchronized to beat and rhythm, emphasizing the lyrical emotion.`
      
      case 'children_book':
        return `Illustration shot: Child-friendly depiction of "${selectedText}" with bright, engaging visuals appropriate for young readers, focusing on character expression and storytelling.`
      
      case 'commercial':
        return `Product shot: Professional commercial visualization of "${selectedText}" with brand-focused composition, clear messaging, and compelling visual appeal.`
      
      default:
        return `Professional shot: ${selectedText} - cinematically composed with attention to story context and visual storytelling principles.`
    }
  }

  // Remove shot from list
  const removeShot = (shotId: string) => {
    const updatedShots = generatedShots.filter(shot => shot.id !== shotId)
    setGeneratedShots(updatedShots)
    onShotsChange?.(updatedShots)
  }

  // Split selected text intelligently and create two shots
  const splitSelection = async () => {
    if (!selectedText) return
    
    // Find the best split point within the selection
    const selectionText = selectedText.text
    const words = selectionText.split(' ')
    
    if (words.length < 2) return // Can't split single word
    
    // Split roughly in middle, but prefer punctuation or natural breaks
    const midPoint = Math.floor(words.length / 2)
    let splitIndex = midPoint
    
    // Look for punctuation near the middle
    for (let i = Math.max(1, midPoint - 2); i < Math.min(words.length - 1, midPoint + 2); i++) {
      if (words[i].match(/[.!?,;:]$/)) {
        splitIndex = i + 1
        break
      }
    }
    
    const firstPart = words.slice(0, splitIndex).join(' ')
    const secondPart = words.slice(splitIndex).join(' ')
    
    console.log(`Split "${selectionText}" into:`)
    console.log(`Part 1: "${firstPart}"`)
    console.log(`Part 2: "${secondPart}"`)
    
    // Generate shots for both parts
    const contextBefore = text.slice(Math.max(0, selectedText.startIndex - 50), selectedText.startIndex)
    const contextAfter = text.slice(selectedText.endIndex, Math.min(text.length, selectedText.endIndex + 50))
    
    try {
      // Generate descriptions for both parts
      const firstShotDesc = await mockGenerateShot(firstPart, contextBefore, '', contentType, text)
      const secondShotDesc = await mockGenerateShot(secondPart, '', contextAfter, contentType, text)
      
      // Create two shots
      const firstShot: GeneratedShot = {
        id: `shot_${Date.now()}_1`,
        sourceText: firstPart,
        description: firstShotDesc,
        timestamp: new Date(),
        contextBefore,
        contextAfter: secondPart
      }
      
      const secondShot: GeneratedShot = {
        id: `shot_${Date.now()}_2`,
        sourceText: secondPart,
        description: secondShotDesc,
        timestamp: new Date(),
        contextBefore: firstPart,
        contextAfter
      }
      
      // Add both shots to the list
      const updatedShots = [...generatedShots, firstShot, secondShot]
      setGeneratedShots(updatedShots)
      onShotsChange?.(updatedShots)
      
      // Show success feedback
      setTempShotDescription(`✅ Successfully split into 2 shots:\n1. "${firstPart}"\n2. "${secondPart}"`)
      
    } catch (error) {
      console.error('Split generation failed:', error)
      setTempShotDescription('Failed to generate split shots')
    }
    
    // Clear current selection
    setSelectedText(null)
    window.getSelection()?.removeAllRanges()
  }

  // Render text with rainbow highlighting (much better visual feedback)
  const renderRainbowHighlightedText = () => {
    if (!showRainbowHighlighting || chunks.length === 0) {
      return renderSelectableText() // Fall back to punctuation dots
    }

    const elements: React.ReactNode[] = []
    let currentPos = 0
    
    chunks.forEach((chunk, chunkIndex) => {
      // Add any text before this chunk
      if (currentPos < chunk.startPos) {
        elements.push(
          <span key={`gap-${chunkIndex}`} className="text-gray-400">
            {text.slice(currentPos, chunk.startPos)}
          </span>
        )
      }
      
      // Add the chunk with rainbow highlighting
      const color = getShotColor(chunkIndex)
      const bgColor = getShotColorWithOpacity(chunkIndex, selectedChunk === chunkIndex ? 0.5 : 0.2)
      const isSelected = selectedChunk === chunkIndex
      
      elements.push(
        <span
          key={`chunk-${chunkIndex}`}
          className={`
            cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-sm
            ${isSelected ? 'ring-2 ring-blue-400' : 'hover:bg-opacity-40'}
            select-text
          `}
          style={{
            backgroundColor: bgColor,
            borderLeft: `3px solid ${color}`
          }}
          onClick={() => {
            setSelectedChunk(selectedChunk === chunkIndex ? null : chunkIndex)
            // Create a text selection for this chunk
            const chunkSelection: TextSelection = {
              startIndex: chunk.startPos,
              endIndex: chunk.endPos,
              text: chunk.text,
              id: `chunk_${chunk.id}`
            }
            setSelectedText(chunkSelection)
          }}
          title={`Shot ${chunkIndex + 1} - Click to select`}
        >
          {chunk.text}
        </span>
      )
      
      currentPos = chunk.endPos
    })
    
    // Add any remaining text
    if (currentPos < text.length) {
      elements.push(
        <span key="remaining" className="text-gray-400">
          {text.slice(currentPos)}
        </span>
      )
    }

    return <span className="whitespace-pre-wrap">{elements}</span>
  }

  // Render text with punctuation markers and selection highlighting
  const renderSelectableText = () => {
    let lastIndex = 0
    const elements: React.ReactNode[] = []
    
    // Add punctuation markers
    punctuationMarkers.forEach((marker, index) => {
      // Add text before marker
      if (lastIndex < marker.position) {
        const textSegment = text.slice(lastIndex, marker.position)
        elements.push(
          <span key={`text-${index}`} className="select-text">
            {textSegment}
          </span>
        )
      }
      
      // Add punctuation with marker
      const punctChar = text[marker.position]
      elements.push(
        <span key={`punct-${index}`} className="relative">
          {punctChar}
          {showPunctuationMarkers && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-50 pointer-events-none"></span>
          )}
        </span>
      )
      
      lastIndex = marker.position + 1
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="remaining" className="select-text">
          {text.slice(lastIndex)}
        </span>
      )
    }
    
    return elements
  }

  // Clear current selection
  const clearSelection = () => {
    setSelectedText(null)
    setTempShotDescription('')
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Manual Shot Selector
            <Badge variant="outline" className="ml-auto">Enterprise Tool</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium text-blue-600">{generatedShots.length} shots created</span> • {punctuationMarkers.length} break points available
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRainbowHighlighting(!showRainbowHighlighting)}
                >
                  {showRainbowHighlighting ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  {showRainbowHighlighting ? 'Rainbow Mode' : 'Dots Mode'}
                </Button>
              </div>
            </div>

            {/* Precision Slider */}
            {showRainbowHighlighting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Precision Level: {precisionLevel} shots (max: {maxPossibleShots})
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {precisionLevel === maxPossibleShots ? 'Maximum' : 'Adjustable'}
                  </Badge>
                </div>
                <Slider
                  value={[precisionLevel]}
                  onValueChange={handlePrecisionChange}
                  min={2}
                  max={maxPossibleShots}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  Drag slider left for fewer shots, right for maximum precision
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Select Text for Shot Creation
              {selectedText && (
                <Badge className="ml-2">
                  {selectedText.text.split(' ').length} words selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none cursor-text"
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
            >
              <div 
                className="text-base leading-relaxed whitespace-pre-wrap select-text"
                style={{ lineHeight: '2' }}
              >
                {renderRainbowHighlightedText()}
              </div>
            </div>

            {selectedText && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm font-medium mb-2">Selected Text:</div>
                <div className="text-gray-700 italic">"{selectedText.text}"</div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={generateShot}
                    disabled={isGenerating}
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {isGenerating ? 'Generating...' : 'Generate Shot'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={splitSelection}
                    size="sm"
                  >
                    <Split className="w-4 h-4 mr-1" />
                    Smart Split
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={clearSelection}
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shot Generation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shot Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tempShotDescription && (
              <div className="p-4 border rounded bg-green-50 border-green-200">
                <div className="text-sm font-medium mb-2">Generated Shot:</div>
                <Textarea
                  value={tempShotDescription}
                  onChange={(e) => setTempShotDescription(e.target.value)}
                  className="min-h-20 text-sm"
                  placeholder="Shot description will appear here..."
                />
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={addShot}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Shot List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateShot}
                    size="sm"
                    disabled={isGenerating}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
            
            {!selectedText && !tempShotDescription && (
              <div className="text-center text-gray-500 py-8">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select text to generate a shot</p>
                <p className="text-sm">Click and drag to highlight text portions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shot List */}
      {generatedShots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Manual Shot List ({generatedShots.length} shots)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Export shots:', generatedShots)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratedShots([])}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedShots.map((shot, index) => (
                <div
                  key={shot.id}
                  className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50"
                >
                  <Badge variant="outline" className="mt-1 shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Source: "{shot.sourceText}"
                    </div>
                    <div className="text-sm text-gray-800">
                      {shot.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {shot.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(shot.description)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShot(shot.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}