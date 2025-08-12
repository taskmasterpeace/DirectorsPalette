'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MapPin, 
  Package, 
  Plus, 
  X, 
  Check,
  ChevronRight,
  Wand2,
  Edit2,
  Trash2
} from 'lucide-react'

interface Reference {
  id: string
  reference: string
  name: string
  description: string
  appearances?: string[]
}

interface StoryReferences {
  characters: Reference[]
  locations: Reference[]
  props: Reference[]
  themes?: string[]
  suggestedTreatments?: Array<{
    id: string
    name: string
    description: string
  }>
}

interface StoryReferenceConfigProps {
  references: StoryReferences
  isLoading?: boolean
  onConfigurationComplete: (configuredRefs: StoryReferences) => void
  onCancel: () => void
}

export function StoryReferenceConfig({
  references: initialReferences,
  isLoading,
  onConfigurationComplete,
  onCancel
}: StoryReferenceConfigProps) {
  // Handle null/undefined references safely
  const safeRefs = initialReferences || { characters: [], locations: [], props: [], themes: [], suggestedTreatments: [] }
  
  const [characters, setCharacters] = useState<Reference[]>(safeRefs.characters || [])
  const [locations, setLocations] = useState<Reference[]>(safeRefs.locations || [])
  const [props, setProps] = useState<Reference[]>(safeRefs.props || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<'character' | 'location' | 'prop' | null>(null)
  const [addingType, setAddingType] = useState<'character' | 'location' | 'prop' | null>(null)
  const [newItem, setNewItem] = useState({ name: '', description: '' })

  // Generate reference from name
  const generateReference = (name: string) => {
    return `@${name.toLowerCase().replace(/\s+/g, '_')}`
  }

  // Add new item
  const handleAdd = (type: 'character' | 'location' | 'prop') => {
    if (!newItem.name.trim()) return

    const newRef: Reference = {
      id: `${type}-${Date.now()}`,
      reference: generateReference(newItem.name),
      name: newItem.name,
      description: newItem.description || `A ${type} in the story`,
      appearances: []
    }

    if (type === 'character') setCharacters([...characters, newRef])
    else if (type === 'location') setLocations([...locations, newRef])
    else if (type === 'prop') setProps([...props, newRef])

    setNewItem({ name: '', description: '' })
    setAddingType(null)
  }

  // Delete item
  const handleDelete = (type: 'character' | 'location' | 'prop', id: string) => {
    if (type === 'character') setCharacters(characters.filter(c => c.id !== id))
    else if (type === 'location') setLocations(locations.filter(l => l.id !== id))
    else if (type === 'prop') setProps(props.filter(p => p.id !== id))
  }

  // Update item
  const handleUpdate = (type: 'character' | 'location' | 'prop', id: string, updates: Partial<Reference>) => {
    if (type === 'character') {
      setCharacters(characters.map(c => c.id === id ? { ...c, ...updates } : c))
    } else if (type === 'location') {
      setLocations(locations.map(l => l.id === id ? { ...l, ...updates } : l))
    } else if (type === 'prop') {
      setProps(props.map(p => p.id === id ? { ...p, ...updates } : p))
    }
    setEditingId(null)
    setEditingType(null)
  }

  const handleComplete = () => {
    onConfigurationComplete({
      characters,
      locations,
      props,
      themes: safeRefs.themes,
      suggestedTreatments: safeRefs.suggestedTreatments
    })
  }

  const renderReferenceSection = (
    title: string,
    icon: React.ReactNode,
    items: Reference[],
    type: 'character' | 'location' | 'prop',
    color: string
  ) => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title} ({items.length})
          </div>
          <Button
            size="sm"
            onClick={() => setAddingType(type)}
            className={`bg-${color}-600 hover:bg-${color}-700`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              {editingId === item.id && editingType === type ? (
                <div className="space-y-2">
                  <Input
                    value={item.name}
                    onChange={(e) => handleUpdate(type, item.id, { name: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Name"
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleUpdate(type, item.id, { description: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingId(null)
                        setEditingType(null)
                      }}
                      variant="outline"
                      className="border-slate-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-${color}-500/50 text-${color}-300`}>
                        {item.reference}
                      </Badge>
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(item.id)
                          setEditingType(type)
                        }}
                        className="hover:bg-slate-700"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(type, item.id)}
                        className="hover:bg-red-900/30 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{item.description}</p>
                  {item.appearances && item.appearances.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.appearances.map((app, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {addingType === type && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder={`${type} name`}
                autoFocus
              />
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAdd(type)}
                  className={`bg-${color}-600 hover:bg-${color}-700`}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAddingType(null)
                    setNewItem({ name: '', description: '' })
                  }}
                  variant="outline"
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-400" />
            Configure Story References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            Review and configure the extracted references from your story. 
            Add, edit, or remove elements to ensure the breakdown uses only the characters, locations, and props you want.
          </p>
          
          {safeRefs.themes && safeRefs.themes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Detected Themes:</p>
              <div className="flex flex-wrap gap-2">
                {safeRefs.themes.map((theme, i) => (
                  <Badge key={i} variant="secondary" className="bg-purple-600/20 text-purple-300">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {renderReferenceSection(
          'Characters',
          <Users className="h-5 w-5 text-blue-400" />,
          characters,
          'character',
          'blue'
        )}
        
        {renderReferenceSection(
          'Locations',
          <MapPin className="h-5 w-5 text-green-400" />,
          locations,
          'location',
          'green'
        )}
        
        {renderReferenceSection(
          'Props',
          <Package className="h-5 w-5 text-orange-400" />,
          props,
          'prop',
          'orange'
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isLoading || (characters.length === 0 && locations.length === 0)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isLoading ? (
            <>
              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Final Breakdown
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}