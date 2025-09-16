'use client'

import { 
  useEffect, 
  useRef, 
  useCallback, 
  useState,
  forwardRef,
  useImperativeHandle
} from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2
} from 'lucide-react'

interface SimpleCanvasProps {
  tool: 'select' | 'brush' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser'
  brushSize: number
  color: string
  onObjectsChange?: (count: number) => void
  canvasWidth?: number
  canvasHeight?: number
  backgroundColor?: string
}

export interface SimpleCanvasRef {
  undo: () => void
  redo: () => void
  clear: () => void
  exportCanvas: (format: string) => string
  importImage: (imageUrl: string) => void
}

const SimpleWorkingCanvas = forwardRef<SimpleCanvasRef, SimpleCanvasProps>(({
  tool,
  brushSize,
  color,
  onObjectsChange,
  canvasWidth = 1200,
  canvasHeight = 675,
  backgroundColor = '#ffffff'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [objects, setObjects] = useState<any[]>([])
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(1)
  const [images, setImages] = useState<Array<{url: string, x: number, y: number, width: number, height: number, img: HTMLImageElement}>>([])
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [pendingText, setPendingText] = useState('')

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    if (!canvas || !previewCanvas) return

    // Set canvas size dynamically
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    previewCanvas.width = canvasWidth
    previewCanvas.height = canvasHeight
    
    const ctx = canvas.getContext('2d')
    const previewCtx = previewCanvas.getContext('2d')
    if (!ctx || !previewCtx) return

    // Set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctxRef.current = ctx
    previewCtxRef.current = previewCtx
    
    // Save initial state
    saveState()
  }, [])

  // Update object count
  useEffect(() => {
    onObjectsChange?.(objects.length + images.length)
  }, [objects.length, images.length, onObjectsChange])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = ctxRef.current?.getImageData(0, 0, canvas.width, canvas.height)
    if (!imageData) return

    // Clear forward history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    
    // Limit history size
    if (newHistory.length > 20) {
      newHistory.shift()
    } else {
      setHistoryIndex(newHistory.length - 1)
    }
    
    setHistory(newHistory)
  }, [history, historyIndex])

  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headlen = 15 // Length of arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Draw the arrowhead
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }, [])

  const drawPreview = useCallback(() => {
    const previewCtx = previewCtxRef.current
    if (!previewCtx || !startPoint || !currentPoint) return

    // Clear preview canvas
    previewCtx.clearRect(0, 0, 800, 450)

    // Set drawing properties
    previewCtx.strokeStyle = color
    previewCtx.lineWidth = brushSize
    previewCtx.lineCap = 'round'
    previewCtx.lineJoin = 'round'
    previewCtx.globalAlpha = 0.7 // Make preview slightly transparent

    if (tool === 'rectangle') {
      const width = currentPoint.x - startPoint.x
      const height = currentPoint.y - startPoint.y
      previewCtx.strokeRect(startPoint.x, startPoint.y, width, height)
      
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2))
      previewCtx.beginPath()
      previewCtx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
      previewCtx.stroke()
      
    } else if (tool === 'line') {
      previewCtx.beginPath()
      previewCtx.moveTo(startPoint.x, startPoint.y)
      previewCtx.lineTo(currentPoint.x, currentPoint.y)
      previewCtx.stroke()
      
    } else if (tool === 'arrow') {
      drawArrow(previewCtx, startPoint.x, startPoint.y, currentPoint.x, currentPoint.y)
    }

    previewCtx.globalAlpha = 1 // Reset alpha
  }, [startPoint, currentPoint, tool, color, brushSize, drawArrow])

  const redrawCanvas = useCallback(() => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    // Clear and set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw all images
    images.forEach(imageData => {
      ctx.drawImage(imageData.img, imageData.x, imageData.y, imageData.width, imageData.height)
    })
  }, [images])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom


    if (tool === 'text') {
      setTextPosition({ x, y })
      setShowTextInput(true)
      setPendingText('')
      return
    }

    setIsDrawing(true)
    setStartPoint({ x, y })
    setCurrentPoint({ x, y })

    // Set drawing properties
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'brush') {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }, [tool, color, brushSize, zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    setCurrentPoint({ x, y })

    if (tool === 'brush') {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      // For shape tools, draw live preview
      drawPreview()
    }
  }, [isDrawing, tool, zoom, drawPreview])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return

    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const previewCtx = previewCtxRef.current
    if (!canvas || !ctx || !previewCtx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom


    // Clear preview canvas
    previewCtx.clearRect(0, 0, 800, 450)

    // Set drawing properties
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'rectangle') {
      const width = x - startPoint.x
      const height = y - startPoint.y
      ctx.strokeRect(startPoint.x, startPoint.y, width, height)
      
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2))
      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
      
    } else if (tool === 'line') {
      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      
    } else if (tool === 'arrow') {
      drawArrow(ctx, startPoint.x, startPoint.y, x, y)
    }

    if (tool !== 'select') {
      // Add to objects list and save state
      setObjects(prev => [...prev, {
        type: tool,
        startPoint,
        endPoint: { x, y },
        color,
        brushSize,
        timestamp: Date.now()
      }])
      saveState()
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }, [isDrawing, startPoint, tool, color, brushSize, zoom, drawArrow, saveState])

  const handleTextSubmit = useCallback(() => {
    if (!pendingText.trim() || !textPosition) return

    const ctx = ctxRef.current
    if (!ctx) return

    // Set text properties
    ctx.fillStyle = color
    ctx.font = `${brushSize * 3}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // Draw text
    ctx.fillText(pendingText, textPosition.x, textPosition.y)

    // Add to objects
    setObjects(prev => [...prev, {
      type: 'text',
      position: textPosition,
      text: pendingText,
      color,
      fontSize: brushSize * 3,
      timestamp: Date.now()
    }])

    saveState()
    setShowTextInput(false)
    setPendingText('')
    setTextPosition(null)
    
  }, [pendingText, textPosition, color, brushSize, saveState])

  const importImage = useCallback((imageUrl: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) return

      // Calculate dimensions to fit image maintaining aspect ratio
      const maxWidth = 400
      const maxHeight = 300
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Position image at center of canvas
      const x = (800 - width) / 2
      const y = (450 - height) / 2

      // Draw image
      ctx.drawImage(img, x, y, width, height)

      // Add to images array
      setImages(prev => [...prev, {
        url: imageUrl,
        x,
        y,
        width,
        height,
        img
      }])

      saveState()
    }
    img.onerror = () => {
      console.error('❌ IMAGE IMPORT FAILED - Could not load image:', imageUrl)
    }
    img.src = imageUrl
  }, [saveState])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const imageData = history[newIndex]
      ctxRef.current?.putImageData(imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const imageData = history[newIndex]
      ctxRef.current?.putImageData(imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const previewCtx = previewCtxRef.current
    if (!canvas || !ctx || !previewCtx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    previewCtx.clearRect(0, 0, canvas.width, canvas.height)
    
    setObjects([])
    setImages([])
    saveState()
  }, [saveState])

  const exportCanvas = useCallback((format: string = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) return ''

    return canvas.toDataURL(`image/${format}`, 0.9)
  }, [])

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev * 0.8, 0.3))
  const handleFitToScreen = () => setZoom(1)

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    undo,
    redo,
    clear,
    exportCanvas,
    importImage
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

          <div className="text-sm text-slate-300 ml-auto">
            {Math.round(zoom * 100)}% zoom | {objects.length + images.length} objects | Tool: {tool}
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 bg-slate-900 rounded-lg p-4 relative flex items-center justify-center min-h-96 border-2 border-purple-500/50 overflow-auto">
          <div className="relative flex items-center justify-center w-full h-full min-h-[500px]">
            <div className="relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
              {/* Main Canvas */}
              <canvas
                ref={canvasRef}
                className="border-4 border-purple-400 bg-white shadow-2xl rounded-lg cursor-crosshair block"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
              {/* Preview Canvas (overlays main canvas) */}
              <canvas
                ref={previewCanvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`
                }}
              />
            </div>
          </div>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 max-w-md w-full mx-4">
              <h3 className="text-white text-lg mb-4">Add Text</h3>
              <Input
                value={pendingText}
                onChange={(e) => setPendingText(e.target.value)}
                placeholder="Enter text..."
                className="mb-4 bg-slate-700 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit()
                  } else if (e.key === 'Escape') {
                    setShowTextInput(false)
                    setPendingText('')
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleTextSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!pendingText.trim()}
                >
                  Add Text
                </Button>
                <Button 
                  onClick={() => {
                    setShowTextInput(false)
                    setPendingText('')
                  }}
                  className="bg-slate-600 hover:bg-slate-500 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

SimpleWorkingCanvas.displayName = 'SimpleWorkingCanvas'

export { SimpleWorkingCanvas }