"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"

export interface StoryLocation {
  id: string
  reference: string
  name: string
  description: string
  atmosphere?: string
  type: 'interior' | 'exterior' | 'mixed'
  timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk' | 'various'
  chapters: Array<{
    chapterId: string
    chapterTitle: string
    purpose: string
  }>
}

interface StoryLocationSelectorProps {
  locations: StoryLocation[]
  onLocationsChange: (locations: StoryLocation[]) => void
  availableChapters: Array<{ id: string; title: string }>
}

export function StoryLocationSelector({ locations, onLocationsChange, availableChapters }: StoryLocationSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLocation, setNewLocation] = useState<Partial<StoryLocation>>({
    name: '',
    description: '',
    atmosphere: '',
    type: 'interior',
    timeOfDay: 'day',
    chapters: []
  })

  const generateReference = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    return `@${cleanName}`
  }

  const handleEdit = (location: StoryLocation) => {
    setEditingId(location.id)
  }

  const handleSave = (id: string, updates: Partial<StoryLocation>) => {
    const updatedLocations = locations.map(loc => 
      loc.id === id ? { 
        ...loc, 
        ...updates,
        reference: generateReference(updates.name || loc.name)
      } : loc
    )
    onLocationsChange(updatedLocations)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = locations.filter(loc => loc.id !== id)
    onLocationsChange(filtered)
  }

  const handleAdd = () => {
    if (!newLocation.name) return
    
    const nextId = locations.length + 1
    const location: StoryLocation = {
      id: `location${nextId}`,
      reference: generateReference(newLocation.name),
      name: newLocation.name,
      description: newLocation.description || '',
      atmosphere: newLocation.atmosphere,
      type: newLocation.type || 'interior',
      timeOfDay: newLocation.timeOfDay,
      chapters: newLocation.chapters || []
    }
    
    onLocationsChange([...locations, location])
    setNewLocation({ name: '', description: '', atmosphere: '', type: 'interior', timeOfDay: 'day', chapters: [] })
    setShowAddForm(false)
  }

  const toggleChapterAssignment = (locationId: string, chapterId: string, chapterTitle: string) => {
    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const hasChapter = loc.chapters.some(c => c.chapterId === chapterId)
        if (hasChapter) {
          return {
            ...loc,
            chapters: loc.chapters.filter(c => c.chapterId !== chapterId)
          }
        } else {
          return {
            ...loc,
            chapters: [...loc.chapters, {
              chapterId,
              chapterTitle,
              purpose: `Key setting for ${chapterTitle}`
            }]
          }
        }
      }
      return loc
    })
    onLocationsChange(updatedLocations)
  }

  const typeColors = {
    interior: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    exterior: 'bg-green-600/20 text-green-300 border-green-500/30',
    mixed: 'bg-purple-600/20 text-purple-300 border-purple-500/30'
  }

  const timeColors = {
    day: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
    night: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
    dawn: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
    dusk: 'bg-pink-600/20 text-pink-300 border-pink-500/30',
    various: 'bg-gray-600/20 text-gray-300 border-gray-500/30'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-400" />
          Locations ({locations.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </div>

      {/* Add New Location Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add New Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Location name..."
              value={newLocation.name || ''}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={newLocation.type || 'interior'}
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="mixed">Mixed (Int/Ext)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={newLocation.timeOfDay || 'day'}
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, timeOfDay: value as any }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="dusk">Dusk</SelectItem>
                  <SelectItem value="various">Various Times</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Location description..."
              value={newLocation.description || ''}
              onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            
            <Input
              placeholder="Atmosphere/mood (optional)..."
              value={newLocation.atmosphere || ''}
              onChange={(e) => setNewLocation(prev => ({ ...prev, atmosphere: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />

            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                size="sm" 
                variant="outline"
                className="border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Cards */}
      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {editingId === location.id ? (
                <EditLocationForm
                  location={location}
                  availableChapters={availableChapters}
                  onSave={(updates) => handleSave(location.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <LocationCard
                  location={location}
                  typeColors={typeColors}
                  timeColors={timeColors}
                  availableChapters={availableChapters}
                  onEdit={() => handleEdit(location)}
                  onDelete={() => handleDelete(location.id)}
                  onToggleChapter={(chapterId, chapterTitle) => 
                    toggleChapterAssignment(location.id, chapterId, chapterTitle)
                  }
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function LocationCard({ 
  location, 
  typeColors,
  timeColors,
  availableChapters,
  onEdit, 
  onDelete, 
  onToggleChapter 
}: {
  location: StoryLocation
  typeColors: Record<string, string>
  timeColors: Record<string, string>
  availableChapters: Array<{ id: string; title: string }>
  onEdit: () => void
  onDelete: () => void
  onToggleChapter: (chapterId: string, chapterTitle: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-green-500/30 text-green-300">
              {location.reference}
            </Badge>
            <h4 className="font-medium text-white">{location.name}</h4>
            <Badge variant="outline" className={typeColors[location.type]}>
              {location.type}
            </Badge>
            {location.timeOfDay && (
              <Badge variant="outline" className={timeColors[location.timeOfDay]}>
                {location.timeOfDay}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-300">{location.description}</p>
          {location.atmosphere && (
            <p className="text-sm text-slate-400 italic">Atmosphere: {location.atmosphere}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-400 hover:text-red-300">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-400">Featured in chapters:</p>
        <div className="flex flex-wrap gap-2">
          {availableChapters.map((chapter) => {
            const isAssigned = location.chapters.some(c => c.chapterId === chapter.id)
            return (
              <Button
                key={chapter.id}
                onClick={() => onToggleChapter(chapter.id, chapter.title)}
                size="sm"
                variant={isAssigned ? "default" : "outline"}
                className={isAssigned 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }
              >
                {chapter.title}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EditLocationForm({ 
  location, 
  availableChapters,
  onSave, 
  onCancel 
}: {
  location: StoryLocation
  availableChapters: Array<{ id: string; title: string }>
  onSave: (updates: Partial<StoryLocation>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: location.name,
    description: location.description,
    atmosphere: location.atmosphere || '',
    type: location.type,
    timeOfDay: location.timeOfDay || 'day'
  })

  return (
    <div className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={form.type}
          onValueChange={(value) => setForm(prev => ({ ...prev, type: value as any }))}
        >
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="interior">Interior</SelectItem>
            <SelectItem value="exterior">Exterior</SelectItem>
            <SelectItem value="mixed">Mixed (Int/Ext)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={form.timeOfDay}
          onValueChange={(value) => setForm(prev => ({ ...prev, timeOfDay: value as any }))}
        >
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="night">Night</SelectItem>
            <SelectItem value="dawn">Dawn</SelectItem>
            <SelectItem value="dusk">Dusk</SelectItem>
            <SelectItem value="various">Various Times</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Textarea
        value={form.description}
        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
        rows={2}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
      
      <Input
        placeholder="Atmosphere/mood..."
        value={form.atmosphere}
        onChange={(e) => setForm(prev => ({ ...prev, atmosphere: e.target.value }))}
        className="bg-slate-900/50 border-slate-600 text-white"
      />

      <div className="flex gap-2">
        <Button onClick={() => onSave(form)} size="sm" className="bg-green-600 hover:bg-green-700">
          Save
        </Button>
        <Button onClick={onCancel} size="sm" variant="outline" className="border-slate-600">
          Cancel
        </Button>
      </div>
    </div>
  )
}