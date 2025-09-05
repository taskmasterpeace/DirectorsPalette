"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Shirt } from "lucide-react"

export interface WardrobeItem {
  id: string
  reference: string
  name: string
  description: string
  breakdown: {
    top: string
    bottom: string
    footwear: string
    accessories: string
  }
  sections: Array<{
    type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'
    emoji: string
    reason: string
  }>
}

interface WardrobeSelectorProps {
  wardrobe: WardrobeItem[]
  onWardrobeChange: (wardrobe: WardrobeItem[]) => void
  artistName: string
}

const sectionEmojis = {
  intro: '🎵',
  verse: '🎤', 
  chorus: '🚀',
  bridge: '🌉',
  outro: '🎵'
}

export function WardrobeSelector({ wardrobe, onWardrobeChange, artistName }: WardrobeSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWardrobe, setNewWardrobe] = useState<Partial<WardrobeItem>>({
    name: '',
    description: '',
    breakdown: {
      top: '',
      bottom: '',
      footwear: '',
      accessories: ''
    },
    sections: []
  })

  const generateReference = (name: string) => {
    const artist = artistName.toLowerCase().replace(/\s+/g, '')
    const style = name.toLowerCase().replace(/\s+/g, '')
    return `@${artist}_${style}`
  }

  const handleEdit = (item: WardrobeItem) => {
    setEditingId(item.id)
  }

  const handleSave = (id: string, updates: Partial<WardrobeItem>) => {
    const updatedWardrobe = wardrobe.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    onWardrobeChange(updatedWardrobe)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = wardrobe.filter(item => item.id !== id)
    onWardrobeChange(filtered)
  }

  const handleAdd = () => {
    if (!newWardrobe.name || !newWardrobe.breakdown?.top) return
    
    const nextId = wardrobe.length + 1
    const item: WardrobeItem = {
      id: `wardrobe${nextId}`,
      reference: generateReference(newWardrobe.name),
      name: newWardrobe.name,
      description: newWardrobe.description || '',
      breakdown: newWardrobe.breakdown || {
        top: '',
        bottom: '',
        footwear: '',
        accessories: ''
      },
      sections: newWardrobe.sections || []
    }
    
    onWardrobeChange([...wardrobe, item])
    setNewWardrobe({ 
      name: '', 
      description: '', 
      breakdown: { top: '', bottom: '', footwear: '', accessories: '' }, 
      sections: [] 
    })
    setShowAddForm(false)
  }

  const toggleSection = (itemId: string, sectionType: keyof typeof sectionEmojis) => {
    const updatedWardrobe = wardrobe.map(item => {
      if (item.id === itemId) {
        const hasSection = item.sections.some(s => s.type === sectionType)
        if (hasSection) {
          return {
            ...item,
            sections: item.sections.filter(s => s.type !== sectionType)
          }
        } else {
          return {
            ...item,
            sections: [...item.sections, {
              type: sectionType,
              emoji: sectionEmojis[sectionType],
              reason: `Perfect for ${sectionType} performance`
            }]
          }
        }
      }
      return item
    })
    onWardrobeChange(updatedWardrobe)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shirt className="h-5 w-5 text-purple-400" />
          Wardrobe ({wardrobe.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Outfit
        </Button>
      </div>

      {/* Add New Wardrobe Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add Custom Outfit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Outfit style (e.g., streetwear, formal, casual)..."
              value={newWardrobe.name || ''}
              onChange={(e) => setNewWardrobe(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <Textarea
              placeholder="Overall description..."
              value={newWardrobe.description || ''}
              onChange={(e) => setNewWardrobe(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Top (shirt, jacket, etc.)..."
                value={newWardrobe.breakdown?.top || ''}
                onChange={(e) => setNewWardrobe(prev => ({ 
                  ...prev, 
                  breakdown: { ...prev.breakdown!, top: e.target.value } 
                }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Input
                placeholder="Bottom (pants, shorts, etc.)..."
                value={newWardrobe.breakdown?.bottom || ''}
                onChange={(e) => setNewWardrobe(prev => ({ 
                  ...prev, 
                  breakdown: { ...prev.breakdown!, bottom: e.target.value } 
                }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Input
                placeholder="Footwear..."
                value={newWardrobe.breakdown?.footwear || ''}
                onChange={(e) => setNewWardrobe(prev => ({ 
                  ...prev, 
                  breakdown: { ...prev.breakdown!, footwear: e.target.value } 
                }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Input
                placeholder="Accessories..."
                value={newWardrobe.breakdown?.accessories || ''}
                onChange={(e) => setNewWardrobe(prev => ({ 
                  ...prev, 
                  breakdown: { ...prev.breakdown!, accessories: e.target.value } 
                }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

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

      {/* Wardrobe Cards */}
      <div className="grid gap-4">
        {wardrobe.map((item) => (
          <Card key={item.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {editingId === item.id ? (
                <EditWardrobeForm
                  item={item}
                  artistName={artistName}
                  onSave={(updates) => handleSave(item.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <WardrobeCard
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  onToggleSection={(sectionType) => toggleSection(item.id, sectionType)}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WardrobeCard({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleSection 
}: {
  item: WardrobeItem
  onEdit: () => void
  onDelete: () => void
  onToggleSection: (sectionType: keyof typeof sectionEmojis) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              {item.reference}
            </Badge>
            <h4 className="font-medium text-white">{item.name}</h4>
          </div>
          {item.description && (
            <p className="text-sm text-slate-300">{item.description}</p>
          )}
          
          {/* Breakdown */}
          <div className="space-y-1 text-sm">
            {item.breakdown.top && (
              <p className="text-slate-300"><span className="text-slate-400">Top:</span> {item.breakdown.top}</p>
            )}
            {item.breakdown.bottom && (
              <p className="text-slate-300"><span className="text-slate-400">Bottom:</span> {item.breakdown.bottom}</p>
            )}
            {item.breakdown.footwear && (
              <p className="text-slate-300"><span className="text-slate-400">Footwear:</span> {item.breakdown.footwear}</p>
            )}
            {item.breakdown.accessories && (
              <p className="text-slate-300"><span className="text-slate-400">Accessories:</span> {item.breakdown.accessories}</p>
            )}
          </div>
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
            const isActive = item.sections.some(s => s.type === sectionType)
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

function EditWardrobeForm({ 
  item, 
  artistName,
  onSave, 
  onCancel 
}: {
  item: WardrobeItem
  artistName: string
  onSave: (updates: Partial<WardrobeItem>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: item.name,
    description: item.description,
    breakdown: { ...item.breakdown }
  })

  const generateReference = (name: string) => {
    const artist = artistName.toLowerCase().replace(/\s+/g, '')
    const style = name.toLowerCase().replace(/\s+/g, '')
    return `@${artist}_${style}`
  }

  const handleSave = () => {
    onSave({
      ...form,
      reference: generateReference(form.name)
    })
  }

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
      
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Top..."
          value={form.breakdown.top}
          onChange={(e) => setForm(prev => ({ 
            ...prev, 
            breakdown: { ...prev.breakdown, top: e.target.value } 
          }))}
          className="bg-slate-900/50 border-slate-600 text-white"
        />
        <Input
          placeholder="Bottom..."
          value={form.breakdown.bottom}
          onChange={(e) => setForm(prev => ({ 
            ...prev, 
            breakdown: { ...prev.breakdown, bottom: e.target.value } 
          }))}
          className="bg-slate-900/50 border-slate-600 text-white"
        />
        <Input
          placeholder="Footwear..."
          value={form.breakdown.footwear}
          onChange={(e) => setForm(prev => ({ 
            ...prev, 
            breakdown: { ...prev.breakdown, footwear: e.target.value } 
          }))}
          className="bg-slate-900/50 border-slate-600 text-white"
        />
        <Input
          placeholder="Accessories..."
          value={form.breakdown.accessories}
          onChange={(e) => setForm(prev => ({ 
            ...prev, 
            breakdown: { ...prev.breakdown, accessories: e.target.value } 
          }))}
          className="bg-slate-900/50 border-slate-600 text-white"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
          Save
        </Button>
        <Button onClick={onCancel} size="sm" variant="outline" className="border-slate-600">
          Cancel
        </Button>
      </div>
    </div>
  )
}