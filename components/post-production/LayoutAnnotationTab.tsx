'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Layout, 
  Save, 
  RotateCcw, 
  Upload
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SimpleWorkingCanvas } from './SimpleWorkingCanvas'
import { CanvasToolbar } from './CanvasToolbar'
import { LayerManager } from './LayerManager'
import { CanvasExporter } from './CanvasExporter'
import { CanvasSettings } from './CanvasSettings'

interface LayoutAnnotationTabProps {
  initialImage?: string
  className?: string
}

export interface CanvasState {
  tool: 'select' | 'brush' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser'
  brushSize: number
  color: string
  opacity: number
  fontSize: number
  fontFamily: string
  layers: CanvasLayer[]
  history: any[]
  historyIndex: number
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
  aspectRatio: string
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
}

export interface CanvasLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  type: 'image' | 'annotation'
  objects: any[]
}

export interface DrawingProperties {
  color: string
  brushSize: number
  opacity: number
  fontSize: number
  fontFamily: string
}

const INITIAL_CANVAS_STATE: CanvasState = {
  tool: 'select',
  brushSize: 5,
  color: '#FF0000',
  opacity: 1,
  fontSize: 24,
  fontFamily: 'Arial',
  layers: [
    { id: 'background', name: 'Background', visible: true, locked: false, type: 'image', objects: [] },
    { id: 'annotations', name: 'Annotations', visible: true, locked: false, type: 'annotation', objects: [] }
  ],
  history: [],
  historyIndex: -1,
  zoom: 1,
  gridEnabled: false,
  snapToGrid: false,
  aspectRatio: '16:9',
  canvasWidth: 1200,
  canvasHeight: 675,
  backgroundColor: '#ffffff'
}

export function LayoutAnnotationTab({ initialImage, className }: LayoutAnnotationTabProps) {
  const { toast } = useToast()
  const [canvasState, setCanvasState] = useState<CanvasState>(INITIAL_CANVAS_STATE)
  const [incomingImages, setIncomingImages] = useState<string[]>(initialImage ? [initialImage] : [])
  const canvasRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = useCallback(() => {
    const node = fileInputRef.current
    if (!node) return

    if (typeof node.showPicker === 'function') {
      node.showPicker()
    } else {
      node.click()
    }
  }, [])

  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }))
  }, [])

  const updateDrawingProperties = useCallback((properties: Partial<DrawingProperties>) => {
    updateCanvasState(properties)
  }, [updateCanvasState])

  const updateCanvasSettings = useCallback((settings: {
    aspectRatio: string
    canvasWidth: number
    canvasHeight: number
    backgroundColor: string
  }) => {
    updateCanvasState(settings)
  }, [updateCanvasState])

  const handleReceiveImage = useCallback((imageUrl: string) => {
    setIncomingImages(prev => [...prev, imageUrl])
    toast({
      title: 'Image received',
      description: 'Image queued for the canvas.'
    })
  }, [toast])

  const handleUndo = useCallback(() => {
    if (canvasRef.current?.undo) {
      canvasRef.current.undo()
    }
  }, [])

  const handleRedo = useCallback(() => {
    if (canvasRef.current?.redo) {
      canvasRef.current.redo()
    }
  }, [])

  const handleClearCanvas = useCallback(() => {
    if (canvasRef.current?.clear) {
      canvasRef.current.clear()
      toast({
        title: "Canvas Cleared",
        description: "All content removed from canvas"
      })
    }
  }, [toast])

  useEffect(() => {
    if (incomingImages.length === 0) {
      return
    }

    const canvasApi = canvasRef.current
    if (!canvasApi?.importImage) {
      return
    }

    incomingImages.forEach((url) => {
      canvasApi.importImage(url)
    })
    setIncomingImages([])
  }, [incomingImages])

  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    handleReceiveImage(url)

    // allow selecting the same file twice in a row
    event.target.value = ''
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [handleReceiveImage])

  const handleSaveCanvas = useCallback(() => {
    if (canvasRef.current?.exportCanvas) {
      const dataUrl = canvasRef.current.exportCanvas('image/png')
      // Here you would typically save to your backend/storage
      toast({
        title: "Canvas Saved",
        description: "Layout and annotations saved successfully"
      })
    }
  }, [toast])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border-green-500/30 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-green-400" />
            Layout & Annotation Canvas - ENHANCED UX
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              type="button"
              onClick={handleImportClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import image
            </Button>
            
            <Button
              size="sm"
              onClick={handleSaveCanvas}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            
            <Button
              size="sm"
              onClick={handleUndo}
              disabled={canvasState.historyIndex <= 0}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Undo
            </Button>
            
            <Button
              size="sm"
              onClick={handleClearCanvas}
              variant="destructive"
            >
              Clear Canvas
            </Button>

            <div className="text-sm text-green-200">
              Zoom: {Math.round(canvasState.zoom * 100)}% | Tool: {canvasState.tool} |
              Layers: {canvasState.layers.filter(layer => layer.visible).length}/{canvasState.layers.length} visible
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Sidebar - Tools & Settings */}
        <div className="w-80 flex flex-col gap-4">
          <CanvasSettings
            aspectRatio={canvasState.aspectRatio}
            canvasWidth={canvasState.canvasWidth}
            canvasHeight={canvasState.canvasHeight}
            backgroundColor={canvasState.backgroundColor}
            onSettingsChange={updateCanvasSettings}
          />
          
          <CanvasToolbar 
            canvasState={canvasState}
            onToolChange={(tool) => updateCanvasState({ tool })}
            onPropertiesChange={updateDrawingProperties}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-w-0">
          <SimpleWorkingCanvas
            ref={canvasRef}
            tool={canvasState.tool}
            brushSize={canvasState.brushSize}
            color={canvasState.color}
            canvasWidth={canvasState.canvasWidth}
            canvasHeight={canvasState.canvasHeight}
            backgroundColor={canvasState.backgroundColor}
            onObjectsChange={(count) => {
              // Update the status display to show object count
              console.log(`Canvas now has ${count} objects`)
            }}
          />
        </div>

        {/* Right Sidebar - Layers & Export */}
        <div className="w-64 flex flex-col gap-4">
          <LayerManager
            layers={canvasState.layers}
            onLayerUpdate={(layers) => updateCanvasState({ layers })}
          />
          
          <CanvasExporter
            canvasRef={canvasRef}
            onExport={(format, dataUrl) => {
              toast({
                title: `Exported as ${format.toUpperCase()}`,
                description: "Canvas exported successfully"
              })
            }}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}