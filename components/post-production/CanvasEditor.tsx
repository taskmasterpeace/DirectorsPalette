'use client'

import { 
  useEffect, 
  useRef, 
  useImperativeHandle, 
  forwardRef, 
  useCallback 
} from 'react'
import { Canvas, PencilBrush, Rect, Circle, IText, FabricImage, TPointerEvent, TEvent, Line, Polygon } from 'fabric'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid,
  Move
} from 'lucide-react'
import type { CanvasState } from './LayoutAnnotationTab'

interface CanvasEditorProps {
  canvasState: CanvasState
  onStateChange: (updates: Partial<CanvasState>) => void
  incomingImages: string[]
  onImagesProcessed: () => void
  aspectRatio?: string
  canvasWidth?: number
  canvasHeight?: number
  backgroundColor?: string
}

export interface CanvasEditorRef {
  undo: () => void
  redo: () => void
  clear: () => void
  exportCanvas: (format: string) => string
  addImage: (imageUrl: string) => void
  getCanvas: () => Canvas | null
}

const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(({
  canvasState,
  onStateChange,
  incomingImages,
  onImagesProcessed,
  aspectRatio = '16:9',
  canvasWidth = 800,
  canvasHeight = 450,
  backgroundColor = '#ffffff'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const historyRef = useRef<any[]>([])
  const historyIndexRef = useRef<number>(-1)
  const isRedoingRef = useRef<boolean>(false)
  const drawingStateRef = useRef<{ isDrawing: boolean; startPoint: any }>({ 
    isDrawing: false, 
    startPoint: null 
  })

  // Initialize Fabric.js canvas with enhanced error handling and logging
  useEffect(() => {
      canvasElement: !!canvasRef.current, 
      existingCanvas: !!fabricCanvasRef.current,
      dimensions: { canvasWidth, canvasHeight }
    })

    if (!canvasRef.current) {
      console.error('❌ CANVAS INIT - No canvas element found!')
      return
    }

    if (fabricCanvasRef.current) {
      return
    }

    try {
      
      // Create Fabric.js canvas with explicit configuration
      const canvas = new Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: backgroundColor,
        isDrawingMode: false,
        selection: true,
        preserveObjectStacking: true,
        stateful: true
      })

      fabricCanvasRef.current = canvas

        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor,
        canvasElement: canvas.getElement()
      })

      // Force initial render to make sure canvas is visible
      canvas.renderAll()

      // Set up event handlers with comprehensive logging
      canvas.on('object:added', (e) => {
        saveState()
      })
      
      canvas.on('object:modified', (e) => {
        saveState()
      })
      
      canvas.on('object:removed', (e) => {
        saveState()
      })
      
      canvas.on('path:created', (e) => {
        saveState()
      })
      
      // Enhanced mouse event handlers with detailed logging
      canvas.on('mouse:down', (e) => {
        const tool = canvasState.tool
          tool, 
          pointer: e.pointer,
          target: e.target?.type 
        })
        handleMouseDown(e)
      })
      
      canvas.on('mouse:move', (e) => {
        if (drawingStateRef.current.isDrawing) {
        }
        handleMouseMove(e)
      })
      
      canvas.on('mouse:up', (e) => {
        const tool = canvasState.tool
          tool, 
          pointer: e.pointer,
          wasDrawing: drawingStateRef.current.isDrawing 
        })
        handleMouseUp(e)
      })

      // Save initial state
      saveState()

    } catch (error) {
      console.error('💥 CANVAS INIT - Canvas initialization failed:', error)
      console.error('💥 CANVAS INIT - Error stack:', error.stack)
    }

    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose()
          fabricCanvasRef.current = null
        } catch (error) {
          console.error('💥 CANVAS CLEANUP - Error during dispose:', error)
        }
      }
    }
  }, [canvasWidth, canvasHeight, backgroundColor])

  // Update canvas properties when state changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

      tool: canvasState.tool,
      color: canvasState.color,
      brushSize: canvasState.brushSize,
      zoom: canvasState.zoom
    })

    // Update canvas size if needed
    if (canvas.getWidth() !== canvasWidth || canvas.getHeight() !== canvasHeight) {
      canvas.setDimensions({ width: canvasWidth, height: canvasHeight })
    }

    // Update background color
    canvas.backgroundColor = backgroundColor
    
    // Update drawing mode based on tool
    const isDrawingMode = canvasState.tool === 'brush'
    canvas.isDrawingMode = isDrawingMode
    canvas.selection = canvasState.tool === 'select'
    
      tool: canvasState.tool, 
      isDrawingMode, 
      selection: canvas.selection 
    })

    if (canvasState.tool === 'brush') {
      const brush = new PencilBrush(canvas)
      brush.width = canvasState.brushSize
      brush.color = canvasState.color
      canvas.freeDrawingBrush = brush
        width: brush.width, 
        color: brush.color 
      })
    }

    // Update zoom
    canvas.setZoom(canvasState.zoom)
    
    // Force render after all updates
    canvas.renderAll()
    
  }, [canvasState.tool, canvasState.brushSize, canvasState.color, canvasState.zoom, canvasWidth, canvasHeight, backgroundColor])

  // Handle incoming images
  useEffect(() => {
    if (incomingImages.length > 0) {
      incomingImages.forEach(addImage)
      onImagesProcessed()
    }
  }, [incomingImages, onImagesProcessed])

  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current || isRedoingRef.current) return
    
    try {
      const currentState = JSON.stringify(fabricCanvasRef.current.toObject())
      
      // Clear forward history if we're adding a new state
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      }
      
      historyRef.current.push(currentState)
      historyIndexRef.current = historyRef.current.length - 1
      
      // Limit history size
      if (historyRef.current.length > 50) {
        historyRef.current.shift()
        historyIndexRef.current--
      }

      onStateChange({ 
        historyIndex: historyIndexRef.current,
        history: [...historyRef.current]
      })
    } catch (error) {
      console.error('💥 CANVAS STATE - Error saving state:', error)
    }
  }, [onStateChange])

  const addImage = useCallback((imageUrl: string) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      console.error('❌ ADD IMAGE - No canvas available')
      return
    }

    
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
        width: img.width, 
        height: img.height 
      })
      
      // Scale image to fit canvas while preserving aspect ratio
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      
      const scaleX = canvasWidth * 0.8 / img.width
      const scaleY = canvasHeight * 0.8 / img.height
      const scale = Math.min(scaleX, scaleY)
      
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale
      })
      
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }).catch((error) => {
      console.error('💥 ADD IMAGE - Error loading image:', error)
    })
  }, [])

  const handleMouseDown = useCallback((e: TPointerEvent) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !e.pointer) {
      return
    }

    const tool = canvasState.tool

    try {
      if (tool === 'rectangle') {
        const rect = new Rect({
          left: e.pointer.x,
          top: e.pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: canvasState.color,
          strokeWidth: canvasState.brushSize,
          opacity: canvasState.opacity
        })
        canvas.add(rect)
        canvas.setActiveObject(rect)
        
      } else if (tool === 'circle') {
        const circle = new Circle({
          left: e.pointer.x,
          top: e.pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: canvasState.color,
          strokeWidth: canvasState.brushSize,
          opacity: canvasState.opacity
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        
      } else if (tool === 'line') {
        drawingStateRef.current.isDrawing = true
        drawingStateRef.current.startPoint = { x: e.pointer.x, y: e.pointer.y }
        
      } else if (tool === 'arrow') {
        drawingStateRef.current.isDrawing = true
        drawingStateRef.current.startPoint = { x: e.pointer.x, y: e.pointer.y }
        
      } else if (tool === 'text') {
        const text = new IText('Click to edit', {
          left: e.pointer.x,
          top: e.pointer.y,
          fontFamily: canvasState.fontFamily,
          fontSize: canvasState.fontSize,
          fill: canvasState.color,
          opacity: canvasState.opacity
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
      }
      
      canvas.renderAll()
    } catch (error) {
      console.error('💥 MOUSE DOWN - Error:', error)
    }
  }, [canvasState])

  const handleMouseMove = useCallback((e: TPointerEvent) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !e.pointer || !drawingStateRef.current?.isDrawing) return

    // Handle line and arrow preview during drag (optional: show preview line)
    // This could be implemented to show a live preview during drawing
  }, [])

  const handleMouseUp = useCallback((e: TPointerEvent) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !e.pointer) {
      return
    }

    if (drawingStateRef.current?.isDrawing && drawingStateRef.current.startPoint) {
      const startPoint = drawingStateRef.current.startPoint
      const endPoint = { x: e.pointer.x, y: e.pointer.y }
      const tool = canvasState.tool


      try {
        if (tool === 'line') {
          const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            stroke: canvasState.color,
            strokeWidth: canvasState.brushSize,
            opacity: canvasState.opacity
          })
          canvas.add(line)
          
        } else if (tool === 'arrow') {
          // Create arrow as a group of line + arrowhead
          const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            stroke: canvasState.color,
            strokeWidth: canvasState.brushSize,
            opacity: canvasState.opacity
          })
          
          // Calculate arrowhead points
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)
          const arrowLength = 15
          const arrowAngle = Math.PI / 6 // 30 degrees
          
          const arrowHead = new Polygon([
            { x: endPoint.x, y: endPoint.y },
            { 
              x: endPoint.x - arrowLength * Math.cos(angle - arrowAngle), 
              y: endPoint.y - arrowLength * Math.sin(angle - arrowAngle) 
            },
            { 
              x: endPoint.x - arrowLength * Math.cos(angle + arrowAngle), 
              y: endPoint.y - arrowLength * Math.sin(angle + arrowAngle) 
            }
          ], {
            fill: canvasState.color,
            opacity: canvasState.opacity
          })
          
          canvas.add(line)
          canvas.add(arrowHead)
        }
        
        drawingStateRef.current.isDrawing = false
        drawingStateRef.current.startPoint = null
        canvas.renderAll()
        
      } catch (error) {
        console.error('💥 MOUSE UP - Error completing drawing:', error)
      }
    }
  }, [canvasState])

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isRedoingRef.current = true
      historyIndexRef.current--
      const previousState = historyRef.current[historyIndexRef.current]
      
      fabricCanvasRef.current?.loadFromJSON(previousState, () => {
        fabricCanvasRef.current?.renderAll()
        isRedoingRef.current = false
        onStateChange({ historyIndex: historyIndexRef.current })
      })
    }
  }, [onStateChange])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isRedoingRef.current = true
      historyIndexRef.current++
      const nextState = historyRef.current[historyIndexRef.current]
      
      fabricCanvasRef.current?.loadFromJSON(nextState, () => {
        fabricCanvasRef.current?.renderAll()
        isRedoingRef.current = false
        onStateChange({ historyIndex: historyIndexRef.current })
      })
    }
  }, [onStateChange])

  const clear = useCallback(() => {
    fabricCanvasRef.current?.clear()
    fabricCanvasRef.current?.set({ backgroundColor: backgroundColor })
    fabricCanvasRef.current?.renderAll()
    historyRef.current = []
    historyIndexRef.current = -1
    saveState()
  }, [saveState, backgroundColor])

  const exportCanvas = useCallback((format: string = 'png') => {
    if (!fabricCanvasRef.current) {
      console.error('❌ EXPORT - No canvas available for export')
      return ''
    }
    
    const multiplier = format === 'png' ? 2 : 1 // Higher resolution for PNG
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: format === 'jpg' ? 'jpeg' : format,
      quality: 0.9,
      multiplier
    })
    return dataUrl
  }, [])

  const handleZoomIn = () => {
    const newZoom = Math.min(canvasState.zoom * 1.2, 5)
    onStateChange({ zoom: newZoom })
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(canvasState.zoom * 0.8, 0.1)
    onStateChange({ zoom: newZoom })
  }

  const handleFitToScreen = () => {
    onStateChange({ zoom: 1 })
  }

  const toggleGrid = () => {
    onStateChange({ gridEnabled: !canvasState.gridEnabled })
  }

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    undo,
    redo,
    clear,
    exportCanvas,
    addImage,
    getCanvas: () => fabricCanvasRef.current
  }))

  return (
    <Card className="bg-slate-800/50 border-slate-600 h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Canvas Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            size="sm"
            onClick={handleZoomOut}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handleFitToScreen}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handleZoomIn}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={toggleGrid}
            className={`${canvasState.gridEnabled 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-slate-700 hover:bg-slate-600'} text-white`}
          >
            <Grid className="w-4 h-4" />
          </Button>

          <div className="text-sm text-slate-300 ml-auto">
            {Math.round(canvasState.zoom * 100)}% zoom | {canvasWidth}×{canvasHeight}
          </div>
        </div>

        {/* Canvas Container - ENHANCED VISIBILITY */}
        <div className="flex-1 bg-slate-900 rounded-lg p-4 relative flex items-center justify-center min-h-96 border-2 border-purple-500/50">
          {/* DEBUG INFO - Remove after testing */}
          <div className="absolute top-2 left-2 text-xs text-purple-300 bg-purple-900/50 p-2 rounded">
            DEBUG: Canvas {canvasWidth}×{canvasHeight} | Tool: {canvasState.tool} | Canvas Ready: {fabricCanvasRef.current ? '✅' : '❌'}
          </div>
          
          <canvas
            ref={canvasRef}
            className="border-4 border-purple-400 bg-white shadow-2xl rounded-lg max-w-full max-h-full"
            style={{
              cursor: canvasState.tool === 'brush' ? 'crosshair' : 
                     canvasState.tool === 'select' ? 'default' : 'crosshair',
              display: 'block' // Ensure canvas is visible
            }}
          />
          
          {/* Grid Overlay */}
          {canvasState.gridEnabled && (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: canvasWidth * canvasState.zoom,
                height: canvasHeight * canvasState.zoom,
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
})

CanvasEditor.displayName = 'CanvasEditor'

export { CanvasEditor }