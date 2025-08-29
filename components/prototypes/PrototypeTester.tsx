'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TestTube2, 
  Palette, 
  Move, 
  Layers,
  BookOpen,
  Music,
  MessageSquare,
  Building,
  RefreshCw,
  Download,
  ArrowLeftRight
} from 'lucide-react'
import { RainbowChunker } from './RainbowChunker'
import { BracketEditor } from './BracketEditor'
import { LayerStack } from './LayerStack'
import { ManualShotSelector } from './ManualShotSelector'
import { CONTENT_EXAMPLES, ContentExample, getExampleById } from '@/lib/content-examples'
import { ShotChunk } from '@/lib/text-chunking'

const PROTOTYPE_INFO = {
  rainbow: {
    name: 'Rainbow Highlighter',
    icon: Palette,
    description: 'Color-coded text highlighting with real-time shot visualization',
    strengths: ['Visual feedback', 'Intuitive selection', 'Real-time updates'],
    ideal: 'Users who prefer visual learning and immediate feedback'
  },
  bracket: {
    name: 'Bracket Editor',
    icon: Move,
    description: 'Draggable markers with smart suggestions and precise control',
    strengths: ['Precise control', 'Smart suggestions', 'Professional workflow'],
    ideal: 'Power users who want granular control over boundaries'
  },
  stack: {
    name: 'Layer Stack',
    icon: Layers,
    description: 'Card-based layers with AI analysis and split/merge controls',
    strengths: ['Content analysis', 'Split/merge workflow', 'Shot DNA insights'],
    ideal: 'Creative professionals who want content-aware editing'
  },
  manual: {
    name: 'Manual Selector',
    icon: TestTube2,
    description: 'Professional manual shot creation with contextual AI assistance',
    strengths: ['Enterprise prompting', 'Manual precision', 'Context aware'],
    ideal: 'Hollywood professionals who need granular shot control'
  }
}

const CONTENT_TYPE_ICONS = {
  story: BookOpen,
  lyrics: Music,
  children_book: MessageSquare,
  commercial: Building
}

export function PrototypeTester() {
  const [selectedExample, setSelectedExample] = useState<string>(CONTENT_EXAMPLES[0].id)
  const [activePrototype, setActivePrototype] = useState<'rainbow' | 'bracket' | 'stack' | 'manual'>('manual')
  const [shotResults, setShotResults] = useState<Record<string, ShotChunk[]>>({})
  const [showComparison, setShowComparison] = useState(false)

  const currentExample = getExampleById(selectedExample)
  const ContentIcon = currentExample ? CONTENT_TYPE_ICONS[currentExample.type] : BookOpen

  const handleShotsChange = (prototypeKey: string, shots: ShotChunk[]) => {
    setShotResults(prev => ({
      ...prev,
      [prototypeKey]: shots
    }))
  }

  const exportResults = () => {
    const results = {
      example: currentExample,
      timestamp: new Date().toISOString(),
      results: shotResults
    }
    
    console.log('Prototype Test Results:', results)
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prototype-test-${currentExample?.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!currentExample) return null

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TestTube2 className="w-6 h-6" />
            Text Chunking Prototype Tester
            <Badge variant="secondary" className="ml-auto">Interactive Demo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ContentIcon className="w-5 h-5" />
              <label className="font-medium">Test Content:</label>
            </div>
            <Select value={selectedExample} onValueChange={setSelectedExample}>
              <SelectTrigger className="w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_EXAMPLES.map((example) => {
                  const Icon = CONTENT_TYPE_ICONS[example.type]
                  return (
                    <SelectItem key={example.id} value={example.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{example.title}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {example.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
              >
                <ArrowLeftRight className="w-4 h-4 mr-1" />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportResults}
              >
                <Download className="w-4 h-4 mr-1" />
                Export Results
              </Button>
            </div>
          </div>

          {/* Content Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{currentExample.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{currentExample.description}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{currentExample.content.split(' ').length} words</div>
                <div>Suggested: {currentExample.suggestedShotCount} shots</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showComparison ? (
        /* Comparison Mode - All Three Side by Side */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {Object.entries(PROTOTYPE_INFO).map(([key, info]) => {
            const Icon = info.icon
            return (
              <Card key={key} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5" />
                    {info.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{info.description}</p>
                </CardHeader>
                <CardContent className="p-4">
                  {key === 'rainbow' && (
                    <RainbowChunker
                      text={currentExample.content}
                      contentType={currentExample.type}
                      initialShotCount={currentExample.suggestedShotCount}
                      onShotsChange={(shots) => handleShotsChange('rainbow', shots)}
                    />
                  )}
                  {key === 'bracket' && (
                    <BracketEditor
                      text={currentExample.content}
                      contentType={currentExample.type}
                      initialShotCount={currentExample.suggestedShotCount}
                      onShotsChange={(shots) => handleShotsChange('bracket', shots)}
                    />
                  )}
                  {key === 'stack' && (
                    <LayerStack
                      text={currentExample.content}
                      contentType={currentExample.type}
                      initialShotCount={currentExample.suggestedShotCount}
                      onShotsChange={(shots) => handleShotsChange('stack', shots)}
                    />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Single Prototype Mode */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5" />
                <span className="font-medium">Choose Prototype to Test:</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShotResults({})}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activePrototype} onValueChange={(v) => setActivePrototype(v as any)}>
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(PROTOTYPE_INFO).map(([key, info]) => {
                  const Icon = info.icon
                  return (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {info.name}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {Object.entries(PROTOTYPE_INFO).map(([key, info]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  {/* Prototype Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg text-blue-900">{info.name}</h3>
                          <p className="text-blue-700 text-sm mt-1">{info.description}</p>
                          <div className="mt-2">
                            <div className="text-xs text-blue-600 font-medium mb-1">Strengths:</div>
                            <div className="flex flex-wrap gap-1">
                              {info.strengths.map((strength, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          {info.ideal}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prototype Component */}
                  <div>
                    {key === 'rainbow' && (
                      <RainbowChunker
                        text={currentExample.content}
                        contentType={currentExample.type}
                        initialShotCount={currentExample.suggestedShotCount}
                        onShotsChange={(shots) => handleShotsChange('rainbow', shots)}
                      />
                    )}
                    {key === 'bracket' && (
                      <BracketEditor
                        text={currentExample.content}
                        contentType={currentExample.type}
                        initialShotCount={currentExample.suggestedShotCount}
                        onShotsChange={(shots) => handleShotsChange('bracket', shots)}
                      />
                    )}
                    {key === 'stack' && (
                      <LayerStack
                        text={currentExample.content}
                        contentType={currentExample.type}
                        initialShotCount={currentExample.suggestedShotCount}
                        onShotsChange={(shots) => handleShotsChange('stack', shots)}
                      />
                    )}
                    {key === 'manual' && (
                      <ManualShotSelector
                        text={currentExample.content}
                        contentType={currentExample.type}
                        onShotsChange={(shots) => handleShotsChange('manual', shots)}
                      />
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {Object.keys(shotResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(shotResults).map(([prototypeKey, shots]) => {
                const info = PROTOTYPE_INFO[prototypeKey as keyof typeof PROTOTYPE_INFO]
                const Icon = info?.icon || TestTube2
                
                return (
                  <div key={prototypeKey} className="border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{info?.name || prototypeKey}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Generated: {shots.length} shots</div>
                      <div>Avg words/shot: {Math.round(shots.reduce((sum, shot) => sum + shot.text.split(' ').length, 0) / shots.length)}</div>
                      <div>Avg confidence: {Math.round(shots.reduce((sum, shot) => sum + shot.boundaryScore, 0) / shots.length)}/10</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}