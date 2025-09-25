'use client'

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback
} from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react'
import * as fabric from 'fabric'

interface FabricCanvasProps {
  tool: 'select' | 'brush' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser' | 'crop'
  brushSize: number
  color: string
  fillMode?: boolean
  onObjectsChange?: (count: number) => void
  onToolChange?: (tool: 'select' | 'brush' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser' | 'crop') => void
  canvasWidth?: number
  canvasHeight?: number
}

export interface FabricCanvasRef {
  undo: () => void
  redo: () => void
  clear: () => void
  exportCanvas: (format: string) => string
  importImage: (imageUrl: string) => void
}

const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>((props, ref) => {
  const {
    tool,
    brushSize,
    color,
    fillMode = false,
    onObjectsChange,
    onToolChange,
    canvasWidth = 1200,
    canvasHeight = 675
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [autoScale, setAutoScale] = useState(true)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDrawingShape, setIsDrawingShape] = useState(false)
  const [shapeStartPoint, setShapeStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null)

  // Calculate auto-scale to fit canvas in viewport
  const calculateAutoScale = useCallback(() => {
    if (!containerRef.current) return 1

    const container = containerRef.current
    const containerWidth = container.clientWidth - 32
    const containerHeight = container.clientHeight - 32

    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight

    return Math.min(scaleX, scaleY, 1)
  }, [canvasWidth, canvasHeight])

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff', // Always white background
      selection: tool === 'select',
      preserveObjectStacking: true,
      targetFindTolerance: 0
    })

    fabricRef.current = canvas

    // Set up event listeners
    canvas.on('object:added', () => {
      saveState()
      onObjectsChange?.(canvas.getObjects().length)
    })

    canvas.on('object:removed', () => {
      saveState()
      onObjectsChange?.(canvas.getObjects().length)
    })

    canvas.on('object:modified', () => {
      saveState()
    })

    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    return () => {
      canvas.dispose()
    }
  }, [canvasWidth, canvasHeight])


  // Update tool mode
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Reset drawing mode
    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.defaultCursor = 'default'

    // Remove any active brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize
      canvas.freeDrawingBrush.color = color
    }

    switch (tool) {
      case 'select':
        canvas.selection = true
        canvas.defaultCursor = 'default'
        break
      case 'brush':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = color
        break
      case 'eraser':
        canvas.isDrawingMode = true
        const eraserBrush = new fabric.PencilBrush(canvas)
        eraserBrush.width = brushSize * 2
        eraserBrush.color = '#ffffff' // Always white for eraser
        canvas.freeDrawingBrush = eraserBrush
        break
      case 'crop':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        break
      default:
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
    }
  }, [tool, brushSize, color])

  // Handle click-and-drag shape creation
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const handleMouseDown = (e: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (tool === 'select' || tool === 'brush' || tool === 'eraser') return

      const canvas = fabricRef.current!
      const pointer = canvas.getPointer(e.e)
      setIsDrawingShape(true)
      setShapeStartPoint({ x: pointer.x, y: pointer.y })

      canvas.skipTargetFind = true;
      canvas.discardActiveObject();
      canvas.selection = false;

      // Disable selecting objects while drawing
      canvas.forEachObject(obj => {
        obj.selectable = false;
        obj.evented = false;
      });
      // Handle text tool separately - it doesn't use drag
      if (tool === 'text') {
        const text = new fabric.IText('Double-click to edit', {
          left: pointer.x,
          top: pointer.y,
          fontSize: brushSize * 3,
          fill: color,
          editable: true
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
        setIsDrawingShape(false)
        return
      }

      // Crop tool: disable all objects temporarily
      if (tool === 'crop') {
        canvas.discardActiveObject()
        canvas.forEachObject(obj => {
          obj.selectable = false
          obj.evented = false
        })
        canvas.defaultCursor = 'crosshair'
        canvas.selection = false
      }

      let shape: fabric.Object | null = null

      switch (tool) {
        case 'rectangle':
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
            fill: fillMode ? color : 'transparent',
            stroke: fillMode ? 'transparent' : color,
            strokeWidth: fillMode ? 0 : brushSize,
            selectable: false
          })
          break
        case 'circle':
          shape = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 1,
            fill: fillMode ? color : 'transparent',
            stroke: fillMode ? 'transparent' : color,
            strokeWidth: fillMode ? 0 : brushSize,
            selectable: false
          })
          break
        case 'line':
          shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: color,
            strokeWidth: brushSize,
            selectable: false
          })
          break
        case 'arrow':
          // For arrow, start with just a line
          shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: color,
            strokeWidth: brushSize,
            selectable: false
          })
          break
        case 'crop':
          // Remove any existing crop rectangle
          canvas.getObjects().forEach(obj => {
            if (obj?.data?.isCropRect) {
              canvas.remove(obj)
            }
          });

          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
            fill: 'rgba(0, 0, 0, 0.3)',
            stroke: '#ff4444',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            data: { isCropRect: true }
          });
          break;
      }

      if (shape) {
        canvas.add(shape)
        setCurrentShape(shape)
        if (tool === 'crop') {
          canvas.selection = false
          canvas.defaultCursor = 'crosshair'
          canvas.renderAll()
        }
      }
    }

    const handleMouseMove = (e: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (!isDrawingShape || !shapeStartPoint || !currentShape) return

      const pointer = canvas.getPointer(e.e)
      const width = Math.abs(pointer.x - shapeStartPoint.x)
      const height = Math.abs(pointer.y - shapeStartPoint.y)
      const left = Math.min(pointer.x, shapeStartPoint.x)
      const top = Math.min(pointer.y, shapeStartPoint.y)

      // Crop tool updates
      if (tool === 'crop') {
        // Ensure minimum dimensions
        const minSize = 10
        const newWidth = Math.max(width, minSize)
        const newHeight = Math.max(height, minSize)

        // Ensure the crop rectangle stays within canvas bounds
        const boundedLeft = Math.max(0, left)
        const boundedTop = Math.max(0, top)
        const boundedRight = Math.min(canvas.width || 0, left + width)
        const boundedBottom = Math.min(canvas.height || 0, top + height)

        currentShape.set({
          left: boundedLeft,
          top: boundedTop,
          width: boundedRight - boundedLeft,
          height: boundedBottom - boundedTop
        });

        canvas.renderAll();
        return;
      }

      switch (tool) {
        case 'rectangle':
          currentShape.set({
            left: left,
            top: top,
            width: width,
            height: height
          })
          break
        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2
          currentShape.set({
            left: shapeStartPoint.x - radius,
            top: shapeStartPoint.y - radius,
            radius: radius
          })
          break
        case 'line':
        case 'arrow':
          (currentShape as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y
          })
          break
      }

      canvas.renderAll()
    }

    const handleMouseUp = (e: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (!isDrawingShape || !currentShape) return

      // Restore interactions
      canvas.skipTargetFind = false;
      canvas.selection = true;

      canvas.forEachObject(obj => {
        obj.selectable = true;
        obj.evented = true;
      });

      currentShape.set({ selectable: true, evented: true });


      if (tool === 'crop') {
        const rect = currentShape as fabric.Rect
        const { left = 0, top = 0, width = 0, height = 0 } = rect

        if (width > 10 && height > 10) {
          // First remove all existing images
          const objects = canvas.getObjects()
          objects.forEach(obj => {
            if (obj.type === 'image') {
              canvas.remove(obj)
            }
          })

          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) return;

          tempCanvas.width = width;
          tempCanvas.height = height;

          // Draw only the selected crop area
          tempCtx.drawImage(
            canvas.lowerCanvasEl,
            left * canvas.getZoom(),
            top * canvas.getZoom(),
            width * canvas.getZoom(),
            height * canvas.getZoom(),
            0,
            0,
            width,
            height
          );

          const croppedDataUrl = tempCanvas.toDataURL('image/png');

          // Create a fabric.Image from the cropped area
          fabric.FabricImage.fromURL(croppedDataUrl).then(img => {
            img.set({
              left,
              top,
              selectable: true,
              hasControls: true, // Allows resize/rotate
              evented: true
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();

            // Save state after adding
            saveState();
          })
        }

        // Remove the crop rectangle
        canvas.remove(currentShape)

        // Restore interaction with other objects
        canvas.forEachObject(obj => {
          obj.selectable = true
          obj.evented = true;
        });

        // Reset state
        setIsDrawingShape(false);
        setShapeStartPoint(null);
        setCurrentShape(null)

        // Switch back to select tool
        onToolChange?.('select')
        return
      }

      // Arrow handling (unchanged)
      if (tool === 'arrow' && currentShape instanceof fabric.Line) {
        const x1 = currentShape.x1 || 0
        const y1 = currentShape.y1 || 0
        const x2 = currentShape.x2 || 0
        const y2 = currentShape.y2 || 0

        // Calculate arrow angle
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI

        // Create triangle for arrow head
        const triangle = new fabric.Triangle({
          left: x2,
          top: y2,
          width: 15,
          height: 15,
          fill: color,
          angle: angle + 90,
          originX: 'center',
          originY: 'center'
        })

        // Group line and triangle
        const arrow = new fabric.Group([currentShape, triangle])
        canvas.remove(currentShape)
        canvas.add(arrow)
        canvas.setActiveObject(arrow)
      } else {
        // Keep the shape selected after creation
        canvas.setActiveObject(currentShape)
      }

      // Reset drawing state
      setIsDrawingShape(false)
      setShapeStartPoint(null)
      setCurrentShape(null)

      // AUTO-SWITCH TO SELECT TOOL AFTER CREATING SHAPE
      // This ensures user can immediately manipulate the shape they just created
      if (onToolChange && (tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'arrow')) {
        onToolChange('select')
      }

      canvas.renderAll()
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [tool, color, brushSize, fillMode, isDrawingShape, shapeStartPoint, currentShape])

  // Save state for undo/redo
  const saveState = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const json = JSON.stringify(canvas.toJSON())
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(json)

    if (newHistory.length > 20) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Import image function
  const importImage = useCallback((imageUrl: string) => {
    const canvas = fabricRef.current
    if (!canvas) return

    fabric.FabricImage.fromURL(imageUrl).then((img) => {
      const maxWidth = canvas.width! * 0.8
      const maxHeight = canvas.height! * 0.8

      const scale = Math.min(
        maxWidth / img.width!,
        maxHeight / img.height!,
        1
      )

      img.scale(scale)
      img.set({
        left: (canvas.width! - img.getScaledWidth()) / 2,
        top: (canvas.height! - img.getScaledHeight()) / 2
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    })
  }, [])

  // Handle paste from clipboard
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const canvas = fabricRef.current
    if (!canvas) return

    e.preventDefault()

    // Check for pasted files (images)
    const items = e.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Handle pasted images
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string
              importImage(imageUrl)
            }
            reader.readAsDataURL(blob)
            return // Exit after handling image
          }
        }
      }
    }

    // Handle pasted text
    const text = e.clipboardData?.getData('text/plain')
    if (text) {
      const textObject = new fabric.Textbox(text, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontSize: 20,
        fill: color,
        width: 200,
        originX: 'center',
        originY: 'center'
      })
      canvas.add(textObject)
      canvas.setActiveObject(textObject)
      canvas.renderAll()
    }
  }, [color, importImage])

  // Handle copy/cut operations
  const handleCopy = useCallback((e: ClipboardEvent, isCut: boolean = false) => {
    const canvas = fabricRef.current
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    e.preventDefault()

    // Store the object for later paste
    const objectData = activeObject.toObject()
    e.clipboardData?.setData('application/json', JSON.stringify(objectData))

    if (isCut) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }, [])

  // Object manipulation functions
  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    // Remove all selected objects
    canvas.remove(...activeObjects)
    canvas.discardActiveObject()
    canvas.renderAll()

    // Save state for undo/redo
    saveState()
  }, [saveState])

  // Set up clipboard event listeners
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e)
    const handleCopyEvent = (e: ClipboardEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return
      handleCopy(e, false)
    }
    const handleCutEvent = (e: ClipboardEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return
      handleCopy(e, true)
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricRef.current
      if (!canvas) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        e.stopPropagation()        
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length > 0) {
          deleteSelected()
          return
        }
      }

      // Check if canvas or its container has focus
      const canvasElement = canvasRef.current
      const containerElement = containerRef.current
      if (!canvasElement?.contains(document.activeElement) &&
        !containerElement?.contains(document.activeElement) &&
        document.activeElement !== canvasElement &&
        document.activeElement !== containerElement) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        // Trigger paste programmatically
        navigator.clipboard.read().then(items => {
          for (const item of items) {
            if (item.types.includes('image/png')) {
              item.getType('image/png').then(blob => {
                const reader = new FileReader()
                reader.onload = (event) => {
                  const imageUrl = event.target?.result as string
                  importImage(imageUrl)
                }
                reader.readAsDataURL(blob)
              })
              return
            }
            if (item.types.includes('text/plain')) {
              item.getType('text/plain').then(blob => {
                blob.text().then(text => {
                  const textObject = new fabric.Textbox(text, {
                    left: canvas.width! / 2,
                    top: canvas.height! / 2,
                    fontSize: 20,
                    fill: color,
                    width: 200,
                    originX: 'center',
                    originY: 'center'
                  })
                  canvas.add(textObject)
                  canvas.setActiveObject(textObject)
                  canvas.renderAll()
                })
              })
            }
          }
        }).catch(err => {
          console.log('Clipboard access denied:', err)
        })
      }
    }

    document.addEventListener('paste', handlePasteEvent)
    document.addEventListener('copy', handleCopyEvent)
    document.addEventListener('cut', handleCutEvent)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('paste', handlePasteEvent)
      document.removeEventListener('copy', handleCopyEvent)
      document.removeEventListener('cut', handleCutEvent)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlePaste, handleCopy, color, importImage, deleteSelected])

  // Undo function
  const undo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndex <= 0) return

    const newIndex = historyIndex - 1
    canvas.loadFromJSON(history[newIndex]).then(() => {
      setHistoryIndex(newIndex)
      canvas.renderAll()
    })
  }, [history, historyIndex])

  // Redo function
  const redo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    canvas.loadFromJSON(history[newIndex]).then(() => {
      setHistoryIndex(newIndex)
      canvas.renderAll()
    })
  }, [history, historyIndex])

  // Clear canvas
  const clear = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.clear()
    canvas.backgroundColor = '#ffffff' // Always white background
    canvas.renderAll()
    saveState()
  }, [saveState])

  // Export canvas
  const exportCanvas = useCallback((format: string = 'png') => {
    const canvas = fabricRef.current
    if (!canvas) return ''

    return canvas.toDataURL({
      format: format as fabric.ImageFormat,
      quality: 0.9,
      multiplier: 1
    })
  }, [])

  const rotateSelected = useCallback((angle: number) => {
    const canvas = fabricRef.current
    if (!canvas || !selectedObject) return

    selectedObject.rotate((selectedObject.angle || 0) + angle)
    canvas.renderAll()
    saveState()
  }, [selectedObject, saveState])

  const flipSelected = useCallback((direction: 'horizontal' | 'vertical') => {
    const canvas = fabricRef.current
    if (!canvas || !selectedObject) return

    if (direction === 'horizontal') {
      selectedObject.set('flipX', !selectedObject.flipX)
    } else {
      selectedObject.set('flipY', !selectedObject.flipY)
    }
    canvas.renderAll()
    saveState()
  }, [selectedObject, saveState])

  const toggleLockSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || !selectedObject) return

    const locked = !selectedObject.lockMovementX
    selectedObject.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked
    })
    canvas.renderAll()
  }, [selectedObject])

  // Zoom functions
  const handleZoomIn = () => {
    setAutoScale(false)
    setScale(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setAutoScale(false)
    setScale(prev => Math.max(prev * 0.8, 0.2))
  }

  const handleFitToScreen = () => {
    setAutoScale(true)
    const newScale = calculateAutoScale()
    setScale(newScale)
  }

  // Update scale when auto-scale is enabled
  useEffect(() => {
    if (autoScale) {
      const newScale = calculateAutoScale()
      setScale(newScale)
    }

    const handleResize = () => {
      if (autoScale) {
        const newScale = calculateAutoScale()
        setScale(newScale)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [autoScale, calculateAutoScale])

  // Update canvas zoom
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.setZoom(scale)
    canvas.setDimensions({
      width: canvasWidth * scale,
      height: canvasHeight * scale
    })
  }, [scale, canvasWidth, canvasHeight])

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
          <Button size="sm" onClick={handleZoomOut} className="bg-slate-700 hover:bg-slate-600 text-white">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={handleFitToScreen} className="bg-purple-600 hover:bg-purple-700 text-white" title="Fit canvas to screen">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={handleZoomIn} className="bg-slate-700 hover:bg-slate-600 text-white">
            <ZoomIn className="w-4 h-4" />
          </Button>

          {selectedObject && (
            <>
              <div className="h-6 w-px bg-slate-600 mx-2" />
              <Button size="sm" onClick={() => rotateSelected(45)} className="bg-slate-700 hover:bg-slate-600 text-white" title="Rotate 45°">
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => flipSelected('horizontal')} className="bg-slate-700 hover:bg-slate-600 text-white" title="Flip horizontal">
                <FlipHorizontal className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => flipSelected('vertical')} className="bg-slate-700 hover:bg-slate-600 text-white" title="Flip vertical">
                <FlipVertical className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={toggleLockSelected} className="bg-slate-700 hover:bg-slate-600 text-white" title="Lock/Unlock">
                {selectedObject?.lockMovementX ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
              <Button size="sm" onClick={deleteSelected} className="bg-red-600 hover:bg-red-700 text-white" title="Delete selected">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}

          <div className="text-sm text-slate-300 ml-auto">
            {Math.round(scale * 100)}% | Tool: {tool}
            {autoScale && <span className="text-purple-400 ml-2">(Auto-fit)</span>}
            {selectedObject && <span className="text-green-400 ml-2">| Object selected</span>}
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-900 rounded-lg p-4 relative flex items-center justify-center overflow-auto border-2 border-purple-500/50"
          tabIndex={0}
        >
          <canvas
            ref={canvasRef}
            className="border-4 border-purple-400 shadow-2xl rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  )
})

FabricCanvas.displayName = 'FabricCanvas'

export { FabricCanvas }