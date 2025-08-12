"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Package } from "lucide-react"

export interface Prop {
  id: string
  reference: string
  name: string
  description: string
  purpose: string
  storyEnhancement: string
  sections: Array<{
    type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'
    emoji: string
    reason: string
  }>
}

interface PropSelectorProps {
  props: Prop[]
  onPropsChange: (props: Prop[]) => void
}

const sectionEmojis = {
  intro: '🎵',
  verse: '🎤', 
  chorus: '🚀',
  bridge: '🌉',
  outro: '🎵'
}

export function PropSelector({ props, onPropsChange }: PropSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProp, setNewProp] = useState<Partial<Prop>>({
    name: '',
    description: '',
    purpose: '',
    storyEnhancement: '',
    sections: []
  })

  const handleEdit = (prop: Prop) => {
    setEditingId(prop.id)
  }

  const handleSave = (id: string, updates: Partial<Prop>) => {
    const updatedProps = props.map(prop => 
      prop.id === id ? { ...prop, ...updates } : prop
    )
    onPropsChange(updatedProps)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = props.filter(prop => prop.id !== id)
    onPropsChange(filtered)
  }

  const handleAdd = () => {
    if (!newProp.name || !newProp.description) return
    
    const nextId = props.length + 1
    const prop: Prop = {
      id: `prop${nextId}`,
      reference: `@prop${nextId}`,
      name: newProp.name,
      description: newProp.description,
      purpose: newProp.purpose || 'Custom prop',
      storyEnhancement: newProp.storyEnhancement || 'Enhances visual narrative',
      sections: newProp.sections || []
    }
    
    onPropsChange([...props, prop])
    setNewProp({ name: '', description: '', purpose: '', storyEnhancement: '', sections: [] })
    setShowAddForm(false)
  }

  const toggleSection = (propId: string, sectionType: keyof typeof sectionEmojis) => {
    const updatedProps = props.map(prop => {
      if (prop.id === propId) {
        const hasSection = prop.sections.some(s => s.type === sectionType)
        if (hasSection) {
          return {
            ...prop,
            sections: prop.sections.filter(s => s.type !== sectionType)
          }
        } else {
          return {
            ...prop,
            sections: [...prop.sections, {
              type: sectionType,
              emoji: sectionEmojis[sectionType],
              reason: `Key element in ${sectionType}`
            }]
          }
        }
      }
      return prop
    })
    onPropsChange(updatedProps)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" />
          Props ({props.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Prop
        </Button>
      </div>

      {/* Add New Prop Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add Custom Prop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Prop name..."
              value={newProp.name || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <Textarea
              placeholder="Prop description..."
              value={newProp.description || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <Input
              placeholder="Purpose/function..."
              value={newProp.purpose || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, purpose: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <Textarea
              placeholder="How it enhances the story..."
              value={newProp.storyEnhancement || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, storyEnhancement: e.target.value }))}
              rows={2}
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

      {/* Prop Cards */}
      <div className="grid gap-4">
        {props.map((prop) => (
          <Card key={prop.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {editingId === prop.id ? (
                <EditPropForm
                  prop={prop}
                  onSave={(updates) => handleSave(prop.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <PropCard
                  prop={prop}
                  onEdit={() => handleEdit(prop)}
                  onDelete={() => handleDelete(prop.id)}
                  onToggleSection={(sectionType) => toggleSection(prop.id, sectionType)}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PropCard({ 
  prop, 
  onEdit, 
  onDelete, 
  onToggleSection 
}: {
  prop: Prop
  onEdit: () => void
  onDelete: () => void
  onToggleSection: (sectionType: keyof typeof sectionEmojis) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500/30 text-green-300">
              {prop.reference}
            </Badge>
            <h4 className="font-medium text-white">{prop.name}</h4>
          </div>
          <p className="text-sm text-slate-300">{prop.description}</p>
          <p className="text-sm text-slate-400 italic">Purpose: {prop.purpose}</p>
          <p className="text-sm text-amber-300">Story enhancement: {prop.storyEnhancement}</p>
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
        <p className="text-sm text-slate-400">Appears in:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(sectionEmojis).map(([sectionType, emoji]) => {
            const isActive = prop.sections.some(s => s.type === sectionType)
            return (
              <Button
                key={sectionType}
                onClick={() => onToggleSection(sectionType as keyof typeof sectionEmojis)}
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={isActive 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
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

function EditPropForm({ 
  prop, 
  onSave, 
  onCancel 
}: {
  prop: Prop
  onSave: (updates: Partial<Prop>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: prop.name,
    description: prop.description,
    purpose: prop.purpose,
    storyEnhancement: prop.storyEnhancement
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
        placeholder="Purpose/function..."
        value={form.purpose}
        onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
      <Textarea
        placeholder="How it enhances the story..."
        value={form.storyEnhancement}
        onChange={(e) => setForm(prev => ({ ...prev, storyEnhancement: e.target.value }))}
        rows={2}
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