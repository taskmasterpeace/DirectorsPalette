"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"

export interface Location {
  id: string
  reference: string
  name: string
  description: string
  atmosphere?: string
  why: string
  sections: Array<{
    type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'
    emoji: string
    reason: string
  }>
}

interface LocationSelectorProps {
  locations: Location[]
  onLocationsChange: (locations: Location[]) => void
}

const sectionEmojis = {
  intro: '🎵',
  verse: '🎤', 
  chorus: '🚀',
  bridge: '🌉',
  outro: '🎵'
}

export function LocationSelector({ locations, onLocationsChange }: LocationSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    description: '',
    atmosphere: '',
    why: '',
    sections: []
  })

  const handleEdit = (location: Location) => {
    setEditingId(location.id)
  }

  const handleSave = (id: string, updates: Partial<Location>) => {
    const updatedLocations = locations.map(loc => 
      loc.id === id ? { ...loc, ...updates } : loc
    )
    onLocationsChange(updatedLocations)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = locations.filter(loc => loc.id !== id)
    onLocationsChange(filtered)
  }

  const handleAdd = () => {
    if (!newLocation.name || !newLocation.description) return
    
    const nextId = locations.length + 1
    const location: Location = {
      id: `location${nextId}`,
      reference: `@location${nextId}`,
      name: newLocation.name,
      description: newLocation.description,
      atmosphere: newLocation.atmosphere,
      why: newLocation.why || 'Custom location',
      sections: newLocation.sections || []
    }
    
    onLocationsChange([...locations, location])
    setNewLocation({ name: '', description: '', atmosphere: '', why: '', sections: [] })
    setShowAddForm(false)
  }

  const toggleSection = (locationId: string, sectionType: keyof typeof sectionEmojis) => {
    const updatedLocations = locations.map(loc => {
      if (loc.id === locationId) {
        const hasSection = loc.sections.some(s => s.type === sectionType)
        if (hasSection) {
          return {
            ...loc,
            sections: loc.sections.filter(s => s.type !== sectionType)
          }
        } else {
          return {
            ...loc,
            sections: [...loc.sections, {
              type: sectionType,
              emoji: sectionEmojis[sectionType],
              reason: `Works well for ${sectionType}`
            }]
          }
        }
      }
      return loc
    })
    onLocationsChange(updatedLocations)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-400" />
          Locations ({locations.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </div>

      {/* Add New Location Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add Custom Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Location name..."
              value={newLocation.name || ''}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
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
                  onSave={(updates) => handleSave(location.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <LocationCard
                  location={location}
                  onEdit={() => handleEdit(location)}
                  onDelete={() => handleDelete(location.id)}
                  onToggleSection={(sectionType) => toggleSection(location.id, sectionType)}
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
  onEdit, 
  onDelete, 
  onToggleSection 
}: {
  location: Location
  onEdit: () => void
  onDelete: () => void
  onToggleSection: (sectionType: keyof typeof sectionEmojis) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
              {location.reference}
            </Badge>
            <h4 className="font-medium text-white">{location.name}</h4>
          </div>
          <p className="text-sm text-slate-300">{location.description}</p>
          {location.atmosphere && (
            <p className="text-sm text-slate-400 italic">Atmosphere: {location.atmosphere}</p>
          )}
          <p className="text-sm text-amber-300">Why: {location.why}</p>
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
        <p className="text-sm text-slate-400">Works best for:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(sectionEmojis).map(([sectionType, emoji]) => {
            const isActive = location.sections.some(s => s.type === sectionType)
            return (
              <Button
                key={sectionType}
                onClick={() => onToggleSection(sectionType as keyof typeof sectionEmojis)}
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={isActive 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }
              >
                {emoji} {sectionType}
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
  onSave, 
  onCancel 
}: {
  location: Location
  onSave: (updates: Partial<Location>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: location.name,
    description: location.description,
    atmosphere: location.atmosphere || '',
    why: location.why
  })

  return (
    <div className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
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
      <Input
        placeholder="Why it works..."
        value={form.why}
        onChange={(e) => setForm(prev => ({ ...prev, why: e.target.value }))}
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