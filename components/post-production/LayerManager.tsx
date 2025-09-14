'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image,
  PenTool
} from 'lucide-react'
import type { CanvasLayer } from './LayoutAnnotationTab'

interface LayerManagerProps {
  layers: CanvasLayer[]
  onLayerUpdate: (layers: CanvasLayer[]) => void
}

export function LayerManager({ layers, onLayerUpdate }: LayerManagerProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const toggleLayerVisibility = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    )
    onLayerUpdate(updatedLayers)
  }

  const toggleLayerLock = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    )
    onLayerUpdate(updatedLayers)
  }

  const startEditingLayer = (layer: CanvasLayer) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const saveLayerName = () => {
    if (!editingLayerId || !editingName.trim()) return
    
    const updatedLayers = layers.map(layer =>
      layer.id === editingLayerId ? { ...layer, name: editingName.trim() } : layer
    )
    onLayerUpdate(updatedLayers)
    setEditingLayerId(null)
    setEditingName('')
  }

  const cancelEditingLayer = () => {
    setEditingLayerId(null)
    setEditingName('')
  }

  const addNewLayer = () => {
    const newLayer: CanvasLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      type: 'annotation',
      objects: []
    }
    onLayerUpdate([...layers, newLayer])
  }

  const deleteLayer = (layerId: string) => {
    // Prevent deleting the last layer or background layer
    if (layers.length <= 1 || layerId === 'background') return
    
    const updatedLayers = layers.filter(layer => layer.id !== layerId)
    onLayerUpdate(updatedLayers)
  }

  const moveLayer = (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex(layer => layer.id === layerId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= layers.length) return

    const updatedLayers = [...layers]
    const [movedLayer] = updatedLayers.splice(currentIndex, 1)
    updatedLayers.splice(newIndex, 0, movedLayer)
    
    onLayerUpdate(updatedLayers)
  }

  const getLayerIcon = (type: CanvasLayer['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-400" alt="Image layer icon" />
      case 'annotation':
        return <PenTool className="w-4 h-4 text-green-400" />
      default:
        return <Layers className="w-4 h-4 text-slate-400" />
    }
  }

  const visibleLayerCount = layers.filter(layer => layer.visible).length
  const lockedLayerCount = layers.filter(layer => layer.locked).length

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-400" />
            Layers ({layers.length})
          </div>
          <Button
            size="sm"
            onClick={addNewLayer}
            className="bg-green-600 hover:bg-green-700 text-white h-7"
            title="Add new layer"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>{visibleLayerCount} visible</span>
          <span>{lockedLayerCount} locked</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {layers.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No layers yet</p>
            <Button
              size="sm"
              onClick={addNewLayer}
              className="bg-green-600 hover:bg-green-700 text-white mt-3"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Layer
            </Button>
          </div>
        ) : (
          // Render layers in reverse order (top layer first)
          layers.slice().reverse().map((layer, index) => {
            const originalIndex = layers.length - 1 - index
            const isEditing = editingLayerId === layer.id
            
            return (
              <div
                key={layer.id}
                className={`p-3 rounded-lg border transition-colors ${
                  layer.visible 
                    ? 'bg-slate-700/50 border-slate-600' 
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Layer Icon */}
                  <div className="flex-shrink-0">
                    {getLayerIcon(layer.type)}
                  </div>
                  
                  {/* Layer Name */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveLayerName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveLayerName()
                          if (e.key === 'Escape') cancelEditingLayer()
                        }}
                        className="bg-slate-600 border-slate-500 text-white text-sm h-7"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditingLayer(layer)}
                        className={`text-left w-full text-sm truncate hover:text-white transition-colors ${
                          layer.visible ? 'text-slate-200' : 'text-slate-500'
                        }`}
                        title={`Double-click to rename: ${layer.name}`}
                      >
                        {layer.name}
                      </button>
                    )}
                  </div>
                  
                  {/* Layer Controls */}
                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <Button
                      size="sm"
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className={`h-7 w-7 p-0 ${
                        layer.visible
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-600 hover:bg-slate-500 text-slate-400'
                      }`}
                      title={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    
                    {/* Lock Toggle */}
                    <Button
                      size="sm"
                      onClick={() => toggleLayerLock(layer.id)}
                      className={`h-7 w-7 p-0 ${
                        layer.locked
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-slate-600 hover:bg-slate-500 text-slate-400'
                      }`}
                      title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Layer Actions */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600">
                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <Button
                      size="sm"
                      onClick={() => moveLayer(layer.id, 'up')}
                      disabled={originalIndex === 0}
                      className="h-6 w-6 p-0 bg-slate-600 hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move layer up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    
                    {/* Move Down */}
                    <Button
                      size="sm"
                      onClick={() => moveLayer(layer.id, 'down')}
                      disabled={originalIndex === layers.length - 1}
                      className="h-6 w-6 p-0 bg-slate-600 hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move layer down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Layer Info */}
                    <div className="text-xs text-slate-500">
                      {layer.objects.length} objects
                    </div>
                    
                    {/* Delete Layer */}
                    {layer.id !== 'background' && layers.length > 1 && (
                      <Button
                        size="sm"
                        onClick={() => deleteLayer(layer.id)}
                        className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                        title="Delete layer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Layer Management Tips */}
        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
          <h4 className="text-xs font-medium text-slate-300 mb-2">Layer Tips</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Click layer name to rename</li>
            <li>• Use eye icon to hide/show</li>
            <li>• Use lock icon to prevent editing</li>
            <li>• Higher layers appear on top</li>
            <li>• Background layer cannot be deleted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}