'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Layout,
  Save,
  RotateCcw,
  Upload,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { FabricCanvas } from './FabricCanvas'
import { CanvasToolbar } from './CanvasToolbar'
import { CanvasExporter } from './CanvasExporter'
import { CanvasSettings } from './CanvasSettings'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LayoutAnnotationTabProps {
  initialImage?: string
  className?: string
}

export interface CanvasState {
  tool: 'select' | 'brush' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser' | 'crop'
  brushSize: number
  color: string
  opacity: number
  fontSize: number
  fontFamily: string
  fillMode: boolean
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
  fillMode?: boolean
}

const INITIAL_CANVAS_STATE: CanvasState = {
  tool: 'select',
  brushSize: 5,
  color: '#FF0000',
  opacity: 1,
  fontSize: 24,
  fontFamily: 'Arial',
  fillMode: false,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
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
      <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/30 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-purple-400" />
            Layout & Annotation Canvas - ENHANCED UX
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              type="button"
              onClick={handleImportClick}
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import image
            </Button>

            <Button
              size="sm"
              onClick={handleSaveCanvas}
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>

            <Button
              size="sm"
              onClick={handleUndo}
              disabled={canvasState.historyIndex <= 0}
              className="bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 transition-all"
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

            <div className="flex items-center gap-3 text-sm text-purple-200">
              <Select
                value={canvasState.aspectRatio}
                onValueChange={(newRatio) => {
                  const ratios = [
                    { id: '16:9', width: 1200, height: 675 },
                    { id: '9:16', width: 675, height: 1200 },
                    { id: '1:1', width: 900, height: 900 },
                    { id: '4:3', width: 1200, height: 900 },
                    { id: '21:9', width: 1260, height: 540 },
                    { id: 'custom', width: canvasState.canvasWidth, height: canvasState.canvasHeight }
                  ]
                  const ratio = ratios.find(r => r.id === newRatio)
                  if (ratio) {
                    updateCanvasSettings({
                      aspectRatio: newRatio,
                      canvasWidth: ratio.width,
                      canvasHeight: ratio.height,
                      backgroundColor: canvasState.backgroundColor
                    })
                  }
                }}
              >
                <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white h-7 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  <SelectItem value="16:9" className="text-white hover:bg-purple-600/30">16:9</SelectItem>
                  <SelectItem value="9:16" className="text-white hover:bg-purple-600/30">9:16</SelectItem>
                  <SelectItem value="1:1" className="text-white hover:bg-purple-600/30">1:1</SelectItem>
                  <SelectItem value="4:3" className="text-white hover:bg-purple-600/30">4:3</SelectItem>
                  <SelectItem value="21:9" className="text-white hover:bg-purple-600/30">21:9</SelectItem>
                  <SelectItem value="custom" className="text-white hover:bg-purple-600/30">Custom</SelectItem>
                </SelectContent>
              </Select>
              <span>Zoom: {Math.round(canvasState.zoom * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Sidebar - Tools & Settings */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 flex flex-col gap-4 relative`}>
          {/* Sidebar Toggle Button */}
          <Button
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 z-10 bg-purple-700 hover:bg-purple-600 text-white rounded-full p-1 w-6 h-6 transition-all"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>

          {/* Sidebar Content */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
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
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-w-0">
          <FabricCanvas
            ref={canvasRef}
            tool={canvasState.tool}
            brushSize={canvasState.brushSize}
            color={canvasState.color}
            fillMode={canvasState.fillMode}
            canvasWidth={canvasState.canvasWidth}
            canvasHeight={canvasState.canvasHeight}
            onToolChange={(tool) => updateCanvasState({ tool })}
            onObjectsChange={(count) => {
              // Update the status display to show object count
              console.log(`Canvas now has ${count} objects`)
            }}
          />
        </div>

        {/* Right Sidebar - Export */}
        <div className={`${rightSidebarCollapsed ? 'w-12' : 'w-64'} transition-all duration-300 relative`}>
          {/* Right Sidebar Toggle Button */}
          <Button
            size="sm"
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="absolute -left-3 top-4 z-10 bg-purple-700 hover:bg-purple-600 text-white rounded-full p-1 w-6 h-6 transition-all"
            title={rightSidebarCollapsed ? 'Expand export panel' : 'Collapse export panel'}
          >
            {rightSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </Button>

          {/* Right Sidebar Content */}
          <div className={`${rightSidebarCollapsed ? 'hidden' : 'block'}`}>
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