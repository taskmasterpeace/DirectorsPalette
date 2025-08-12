"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Package } from "lucide-react"

export interface StoryProp {
  id: string
  reference: string
  name: string
  description: string
  significance: string
  type: 'object' | 'weapon' | 'tool' | 'document' | 'vehicle' | 'symbolic' | 'evidence'
  chapters: Array<{
    chapterId: string
    chapterTitle: string
    role: string
  }>
}

interface StoryPropSelectorProps {
  props: StoryProp[]
  onPropsChange: (props: StoryProp[]) => void
  availableChapters: Array<{ id: string; title: string }>
}

export function StoryPropSelector({ props, onPropsChange, availableChapters }: StoryPropSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProp, setNewProp] = useState<Partial<StoryProp>>({
    name: '',
    description: '',
    significance: '',
    type: 'object',
    chapters: []
  })

  const generateReference = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    return `@${cleanName}`
  }

  const handleEdit = (prop: StoryProp) => {
    setEditingId(prop.id)
  }

  const handleSave = (id: string, updates: Partial<StoryProp>) => {
    const updatedProps = props.map(prop => 
      prop.id === id ? { 
        ...prop, 
        ...updates,
        reference: generateReference(updates.name || prop.name)
      } : prop
    )
    onPropsChange(updatedProps)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = props.filter(prop => prop.id !== id)
    onPropsChange(filtered)
  }

  const handleAdd = () => {
    if (!newProp.name) return
    
    const nextId = props.length + 1
    const prop: StoryProp = {
      id: `prop${nextId}`,
      reference: generateReference(newProp.name),
      name: newProp.name,
      description: newProp.description || '',
      significance: newProp.significance || '',
      type: newProp.type || 'object',
      chapters: newProp.chapters || []
    }
    
    onPropsChange([...props, prop])
    setNewProp({ name: '', description: '', significance: '', type: 'object', chapters: [] })
    setShowAddForm(false)
  }

  const toggleChapterAssignment = (propId: string, chapterId: string, chapterTitle: string) => {
    const updatedProps = props.map(prop => {
      if (prop.id === propId) {
        const hasChapter = prop.chapters.some(c => c.chapterId === chapterId)
        if (hasChapter) {
          return {
            ...prop,
            chapters: prop.chapters.filter(c => c.chapterId !== chapterId)
          }
        } else {
          return {
            ...prop,
            chapters: [...prop.chapters, {
              chapterId,
              chapterTitle,
              role: `Important in ${chapterTitle}`
            }]
          }
        }
      }
      return prop
    })
    onPropsChange(updatedProps)
  }

  const typeColors = {
    object: 'bg-gray-600/20 text-gray-300 border-gray-500/30',
    weapon: 'bg-red-600/20 text-red-300 border-red-500/30',
    tool: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    document: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
    vehicle: 'bg-green-600/20 text-green-300 border-green-500/30',
    symbolic: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    evidence: 'bg-orange-600/20 text-orange-300 border-orange-500/30'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-400" />
          Props ({props.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Prop
        </Button>
      </div>

      {/* Add New Prop Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add New Prop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Prop name..."
                value={newProp.name || ''}
                onChange={(e) => setNewProp(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Select
                value={newProp.type || 'object'}
                onValueChange={(value) => setNewProp(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="weapon">Weapon</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="symbolic">Symbolic</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Prop description..."
              value={newProp.description || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            
            <Textarea
              placeholder="Story significance..."
              value={newProp.significance || ''}
              onChange={(e) => setNewProp(prev => ({ ...prev, significance: e.target.value }))}
              rows={2}
              className="bg-slate-900/50 border-slate-600 text-white"
            />

            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="bg-orange-600 hover:bg-orange-700">
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
                  availableChapters={availableChapters}
                  onSave={(updates) => handleSave(prop.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <PropCard
                  prop={prop}
                  typeColors={typeColors}
                  availableChapters={availableChapters}
                  onEdit={() => handleEdit(prop)}
                  onDelete={() => handleDelete(prop.id)}
                  onToggleChapter={(chapterId, chapterTitle) => 
                    toggleChapterAssignment(prop.id, chapterId, chapterTitle)
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

function PropCard({ 
  prop, 
  typeColors,
  availableChapters,
  onEdit, 
  onDelete, 
  onToggleChapter 
}: {
  prop: StoryProp
  typeColors: Record<string, string>
  availableChapters: Array<{ id: string; title: string }>
  onEdit: () => void
  onDelete: () => void
  onToggleChapter: (chapterId: string, chapterTitle: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-500/30 text-orange-300">
              {prop.reference}
            </Badge>
            <h4 className="font-medium text-white">{prop.name}</h4>
            <Badge variant="outline" className={typeColors[prop.type]}>
              {prop.type}
            </Badge>
          </div>
          <p className="text-sm text-slate-300">{prop.description}</p>
          <p className="text-sm text-amber-300">
            <strong>Significance:</strong> {prop.significance}
          </p>
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
            const isAssigned = prop.chapters.some(c => c.chapterId === chapter.id)
            return (
              <Button
                key={chapter.id}
                onClick={() => onToggleChapter(chapter.id, chapter.title)}
                size="sm"
                variant={isAssigned ? "default" : "outline"}
                className={isAssigned 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
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

function EditPropForm({ 
  prop, 
  availableChapters,
  onSave, 
  onCancel 
}: {
  prop: StoryProp
  availableChapters: Array<{ id: string; title: string }>
  onSave: (updates: Partial<StoryProp>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: prop.name,
    description: prop.description,
    significance: prop.significance,
    type: prop.type
  })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="bg-slate-900/50 border-slate-600 text-white"
        />
        <Select
          value={form.type}
          onValueChange={(value) => setForm(prev => ({ ...prev, type: value as any }))}
        >
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="weapon">Weapon</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="symbolic">Symbolic</SelectItem>
            <SelectItem value="evidence">Evidence</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Textarea
        value={form.description}
        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
        rows={2}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
      
      <Textarea
        placeholder="Story significance..."
        value={form.significance}
        onChange={(e) => setForm(prev => ({ ...prev, significance: e.target.value }))}
        rows={2}
        className="bg-slate-900/50 border-slate-600 text-white"
      />

      <div className="flex gap-2">
        <Button onClick={() => onSave(form)} size="sm" className="bg-orange-600 hover:bg-orange-700">
          Save
        </Button>
        <Button onClick={onCancel} size="sm" variant="outline" className="border-slate-600">
          Cancel
        </Button>
      </div>
    </div>
  )
}