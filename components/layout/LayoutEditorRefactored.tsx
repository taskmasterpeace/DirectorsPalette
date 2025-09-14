'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layout } from 'lucide-react'
import { CanvasControls } from './CanvasControls'
import { CanvasToolbar } from './CanvasToolbar' 
import { ElementsPanel } from './ElementsPanel'

interface Element {
  id: string
  type: 'image' | 'text' | 'box'
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  content?: string
  src?: string
}

export function LayoutEditorRefactored() {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState('16:9')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showGrid, setShowGrid] = useState(true)

  const handleAddImages = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach((file, index) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            const newElement: Element = {
              id: `image_${Date.now()}_${index}`,
              type: 'image',
              x: 50 + (index * 20),
              y: 50 + (index * 20),
              width: 200,
              height: 150,
              visible: true,
              src: event.target?.result as string
            }
            setElements(prev => [...prev, newElement])
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const handleDrawBoxes = () => {
    const newBox: Element = {
      id: `box_${Date.now()}`,
      type: 'box',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      visible: true
    }
    setElements(prev => [...prev, newBox])
    setSelectedElement(newBox.id)
  }

  const handleAddText = () => {
    const newText: Element = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 150,
      y: 150,
      width: 200,
      height: 50,
      visible: true,
      content: 'New Text'
    }
    setElements(prev => [...prev, newText])
    setSelectedElement(newText.id)
  }

  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const handleElementUpdate = (id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const handleElementDuplicate = (id: string) => {
    const element = elements.find(el => el.id === id)
    if (element) {
      const duplicate: Element = {
        ...element,
        id: `${element.type}_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      }
      setElements(prev => [...prev, duplicate])
    }
  }

  const handleReset = () => {
    setElements([])
    setSelectedElement(null)
  }

  const elementCount = {
    images: elements.filter(el => el.type === 'image').length,
    boxes: elements.filter(el => el.type === 'box').length,
    text: elements.filter(el => el.type === 'text').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-purple-400" />
            Complete Layout & Annotation Editor
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="space-y-6">
          <CanvasControls
            canvasSize={canvasSize}
            setCanvasSize={setCanvasSize}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            onReset={handleReset}
          />
          
          <CanvasToolbar
            onAddImages={handleAddImages}
            onDrawBoxes={handleDrawBoxes}
            onAddText={handleAddText}
            onDelete={() => selectedElement && handleDeleteElement(selectedElement)}
            onSave={() => console.log('Save layout')}
            onExport={() => console.log('Export as PNG')}
            onReset={handleReset}
            hasElements={elements.length > 0}
            elementCount={elementCount}
          />
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div 
                className="relative bg-slate-800 border border-slate-600 rounded"
                style={{ 
                  width: canvasSize === '16:9' ? 640 : canvasSize === '1:1' ? 480 : 640,
                  height: canvasSize === '16:9' ? 360 : canvasSize === '1:1' ? 480 : 360,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left'
                }}
              >
                {/* Grid overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}

                {/* Elements */}
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 transition-colors cursor-pointer ${
                      selectedElement === element.id
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-slate-500 hover:border-slate-400'
                    } ${!element.visible ? 'opacity-50' : ''}`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {element.type === 'image' && element.src && (
                      <img
                        src={element.src}
                        alt="Canvas element"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {element.type === 'text' && (
                      <div className="p-2 text-white text-sm">
                        {element.content || 'Text'}
                      </div>
                    )}
                    {element.type === 'box' && (
                      <div className="w-full h-full bg-purple-400/20 border border-purple-400" />
                    )}
                  </div>
                ))}
                
                {/* Instructions */}
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <Layout className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Complete Layout Editor</p>
                      <div className="text-xs mt-2 space-y-1">
                        <p>• Add images for collages</p>
                        <p>• Draw bounding boxes to annotate</p>
                        <p>• Add text labels anywhere</p>
                        <p>• Drag to move, resize handles to scale</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div>
          <ElementsPanel
            elements={elements}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleDeleteElement}
            onElementDuplicate={handleElementDuplicate}
            onElementToggleVisibility={(id) => {
              const element = elements.find(el => el.id === id)
              if (element) {
                handleElementUpdate(id, { visible: !element.visible })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}