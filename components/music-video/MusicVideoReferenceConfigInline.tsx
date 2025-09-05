'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Shirt, 
  Package, 
  Sparkles, 
  Plus, 
  X, 
  Check,
  Wand2,
  Edit2,
  Trash2
} from 'lucide-react'

interface MusicVideoReference {
  id?: string
  name: string
  description: string
  type?: string
  style?: string
  purpose?: string
}

interface MusicVideoReferences {
  locations?: MusicVideoReference[]
  wardrobe?: MusicVideoReference[]
  props?: MusicVideoReference[]
  visualThemes?: string[]
}

interface MusicVideoReferenceConfigInlineProps {
  references: MusicVideoReferences
  isLoading?: boolean
  onConfigurationComplete: (configuredRefs: MusicVideoReferences) => void
  onCancel: () => void
}

export function MusicVideoReferenceConfigInline({
  references: initialReferences,
  isLoading,
  onConfigurationComplete,
  onCancel
}: MusicVideoReferenceConfigInlineProps) {
  const [locations, setLocations] = useState<MusicVideoReference[]>(initialReferences.locations || [])
  const [wardrobe, setWardrobe] = useState<MusicVideoReference[]>(initialReferences.wardrobe || [])
  const [props, setProps] = useState<MusicVideoReference[]>(initialReferences.props || [])
  const [visualThemes, setVisualThemes] = useState<string[]>(initialReferences.visualThemes || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTheme, setNewTheme] = useState('')

  const handleDelete = (type: 'location' | 'wardrobe' | 'prop', item: MusicVideoReference) => {
    if (type === 'location') {
      setLocations(locations.filter(l => l.id !== item.id && l.name !== item.name))
    } else if (type === 'wardrobe') {
      setWardrobe(wardrobe.filter(w => w.id !== item.id && w.name !== item.name))
    } else {
      setProps(props.filter(p => p.id !== item.id && p.name !== item.name))
    }
  }

  const handleUpdate = (type: 'location' | 'wardrobe' | 'prop', item: MusicVideoReference, field: string, value: string) => {
    const updateFn = (items: MusicVideoReference[]) => 
      items.map(i => (i.id === item.id || i.name === item.name) ? { ...i, [field]: value } : i)
    
    if (type === 'location') setLocations(updateFn(locations))
    else if (type === 'wardrobe') setWardrobe(updateFn(wardrobe))
    else setProps(updateFn(props))
  }

  const handleGenerate = () => {
    console.log('MusicVideoReferenceConfigInline - Sending configured refs:', {
      locations,
      wardrobe,
      props,
      visualThemes
    })
    onConfigurationComplete({
      locations,
      wardrobe,
      props,
      visualThemes
    })
  }

  const renderReferenceItem = (
    item: MusicVideoReference, 
    type: 'location' | 'wardrobe' | 'prop',
    extraField?: { key: string; label: string; value?: string }
  ) => (
    <div key={item.id || item.name} className="p-3 bg-slate-900/50 rounded-lg">
      {editingId === item.id ? (
        <div className="space-y-2">
          <Input
            value={item.name}
            onChange={(e) => handleUpdate(type, item, 'name', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Name"
          />
          <Textarea
            value={item.description}
            onChange={(e) => handleUpdate(type, item, 'description', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            rows={2}
            placeholder="Description"
          />
          {extraField && (
            <Input
              value={extraField.value || ''}
              onChange={(e) => handleUpdate(type, item, extraField.key, e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder={extraField.label}
            />
          )}
          <Button
            size="sm"
            onClick={() => setEditingId(null)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium text-white">{item.name}</div>
            <div className="text-sm text-slate-400 mt-1">{item.description}</div>
            {extraField?.value && (
              <Badge variant="outline" className="mt-2 border-purple-600 text-purple-400">
                {extraField.value}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingId(item.id || item.name)}
              className="text-slate-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(type, item)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Configure Music Video References
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Wand2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Generate Breakdown
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-1" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="wardrobe">
              <Shirt className="h-4 w-4 mr-1" />
              Wardrobe
            </TabsTrigger>
            <TabsTrigger value="props">
              <Package className="h-4 w-4 mr-1" />
              Props
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Sparkles className="h-4 w-4 mr-1" />
              Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-2 mt-4">
            {locations.map(location => 
              renderReferenceItem(location, 'location', { 
                key: 'type', 
                label: 'Type', 
                value: location.type 
              })
            )}
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-2 mt-4">
            {wardrobe.map(item => 
              renderReferenceItem(item, 'wardrobe', { 
                key: 'style', 
                label: 'Style', 
                value: item.style 
              })
            )}
          </TabsContent>

          <TabsContent value="props" className="space-y-2 mt-4">
            {props.map(prop => 
              renderReferenceItem(prop, 'prop', { 
                key: 'purpose', 
                label: 'Purpose', 
                value: prop.purpose 
              })
            )}
          </TabsContent>

          <TabsContent value="themes" className="space-y-2 mt-4">
            {visualThemes.map((theme, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <span className="text-white">{theme}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVisualThemes(visualThemes.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="Add visual theme..."
                className="bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTheme.trim()) {
                    setVisualThemes([...visualThemes, newTheme.trim()])
                    setNewTheme('')
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newTheme.trim()) {
                    setVisualThemes([...visualThemes, newTheme.trim()])
                    setNewTheme('')
                  }
                }}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}