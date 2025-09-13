'use client'

import { 
  useEffect, 
  useRef, 
  useImperativeHandle, 
  forwardRef, 
  useCallback,
  useState 
} from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid
} from 'lucide-react'
import type { CanvasState } from './LayoutAnnotationTab'

interface SimpleCanvasEditorProps {
  canvasState: CanvasState
  onStateChange: (updates: Partial<CanvasState>) => void
  incomingImages: string[]
  onImagesProcessed: () => void
}

export interface SimpleCanvasEditorRef {
  undo: () => void
  redo: () => void
  clear: () => void
  exportCanvas: (format: string) => string
  addImage: (imageUrl: string) => void
  getCanvas: () => HTMLCanvasElement | null
}

// Simple Canvas implementation using native HTML5 Canvas
const SimpleCanvasEditor = forwardRef<SimpleCanvasEditorRef, SimpleCanvasEditorProps>(({
  canvasState,
  onStateChange,
  incomingImages,
  onImagesProcessed
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef<number>(-1)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600
    const context = canvas.getContext('2d')
    if (!context) return

    contextRef.current = context
    context.fillStyle = '#f8f9fa'
    context.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }, [])

  // Handle incoming images
  useEffect(() => {
    if (incomingImages.length > 0) {
      incomingImages.forEach(addImage)
      onImagesProcessed()
    }
  }, [incomingImages, onImagesProcessed])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Clear forward history
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    }
    
    historyRef.current.push(imageData)
    historyIndexRef.current = historyRef.current.length - 1
    
    // Limit history size
    if (historyRef.current.length > 20) {
      historyRef.current.shift()
      historyIndexRef.current--
    }

    onStateChange({ 
      historyIndex: historyIndexRef.current,
      history: ['state'] // Simplified history tracking
    })
  }, [onStateChange])

  const addImage = useCallback((imageUrl: string) => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Scale image to fit canvas
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      
      const scaleX = canvasWidth * 0.8 / img.width
      const scaleY = canvasHeight * 0.8 / img.height
      const scale = Math.min(scaleX, scaleY)
      
      const width = img.width * scale
      const height = img.height * scale
      const x = (canvasWidth - width) / 2
      const y = (canvasHeight - height) / 2
      
      context.drawImage(img, x, y, width, height)
      setImages(prev => [...prev, img])
      saveState()
    }
    img.src = imageUrl
  }, [saveState])

  const startDrawing = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || canvasState.tool !== 'brush') return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvasState.zoom
    const y = (e.clientY - rect.top) / canvasState.zoom

    setIsDrawing(true)
    context.beginPath()
    context.moveTo(x, y)
    context.strokeStyle = canvasState.color
    context.lineWidth = canvasState.brushSize
    context.lineCap = 'round'
    context.globalAlpha = canvasState.opacity
  }, [canvasState])

  const draw = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || !isDrawing || canvasState.tool !== 'brush') return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvasState.zoom
    const y = (e.clientY - rect.top) / canvasState.zoom

    context.lineTo(x, y)
    context.stroke()
  }, [isDrawing, canvasState])

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      saveState()
    }
  }, [isDrawing, saveState])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || historyIndexRef.current <= 0) return

    historyIndexRef.current--
    const imageData = historyRef.current[historyIndexRef.current]
    context.putImageData(imageData, 0, 0)
    onStateChange({ historyIndex: historyIndexRef.current })
  }, [onStateChange])

  const redo = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || historyIndexRef.current >= historyRef.current.length - 1) return

    historyIndexRef.current++
    const imageData = historyRef.current[historyIndexRef.current]
    context.putImageData(imageData, 0, 0)
    onStateChange({ historyIndex: historyIndexRef.current })
  }, [onStateChange])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    context.fillStyle = '#f8f9fa'
    context.fillRect(0, 0, canvas.width, canvas.height)
    setImages([])
    historyRef.current = []
    historyIndexRef.current = -1
    saveState()
  }, [saveState])

  const exportCanvas = useCallback((format: string = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) return ''
    return canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`, 0.9)
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
    getCanvas: () => canvasRef.current
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
            {Math.round(canvasState.zoom * 100)}% zoom | Simple Canvas Mode
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 bg-slate-200 rounded-lg overflow-hidden relative">
          <canvas
            ref={canvasRef}
            className="border border-slate-400 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              transform: `scale(${canvasState.zoom})`,
              transformOrigin: 'top left'
            }}
          />
          
          {/* Grid Overlay */}
          {canvasState.gridEnabled && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
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

SimpleCanvasEditor.displayName = 'SimpleCanvasEditor'

export { SimpleCanvasEditor }