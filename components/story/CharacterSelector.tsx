"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Users } from "lucide-react"

export interface StoryCharacter {
  id: string
  reference: string
  name: string
  description: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'background'
  ageVariation?: string // 'young', 'adult', 'old', 'child', etc.
  chapters: Array<{
    chapterId: string
    chapterTitle: string
    significance: string
  }>
}

interface CharacterSelectorProps {
  characters: StoryCharacter[]
  onCharactersChange: (characters: StoryCharacter[]) => void
  availableChapters: Array<{ id: string; title: string }>
}

export function CharacterSelector({ characters, onCharactersChange, availableChapters }: CharacterSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCharacter, setNewCharacter] = useState<Partial<StoryCharacter>>({
    name: '',
    description: '',
    role: 'supporting',
    ageVariation: '',
    chapters: []
  })

  const generateReference = (name: string, ageVariation?: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (ageVariation) {
      return `@${cleanName}_${ageVariation.toLowerCase()}`
    }
    return `@${cleanName}`
  }

  const handleEdit = (character: StoryCharacter) => {
    setEditingId(character.id)
  }

  const handleSave = (id: string, updates: Partial<StoryCharacter>) => {
    const updatedCharacters = characters.map(char => 
      char.id === id ? { 
        ...char, 
        ...updates,
        reference: generateReference(updates.name || char.name, updates.ageVariation || char.ageVariation)
      } : char
    )
    onCharactersChange(updatedCharacters)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const filtered = characters.filter(char => char.id !== id)
    onCharactersChange(filtered)
  }

  const handleAdd = () => {
    if (!newCharacter.name) return
    
    const nextId = characters.length + 1
    const character: StoryCharacter = {
      id: `character${nextId}`,
      reference: generateReference(newCharacter.name, newCharacter.ageVariation),
      name: newCharacter.name,
      description: newCharacter.description || '',
      role: newCharacter.role || 'supporting',
      ageVariation: newCharacter.ageVariation,
      chapters: newCharacter.chapters || []
    }
    
    onCharactersChange([...characters, character])
    setNewCharacter({ name: '', description: '', role: 'supporting', ageVariation: '', chapters: [] })
    setShowAddForm(false)
  }

  const toggleChapterAssignment = (characterId: string, chapterId: string, chapterTitle: string) => {
    const updatedCharacters = characters.map(char => {
      if (char.id === characterId) {
        const hasChapter = char.chapters.some(c => c.chapterId === chapterId)
        if (hasChapter) {
          return {
            ...char,
            chapters: char.chapters.filter(c => c.chapterId !== chapterId)
          }
        } else {
          return {
            ...char,
            chapters: [...char.chapters, {
              chapterId,
              chapterTitle,
              significance: `Important role in ${chapterTitle}`
            }]
          }
        }
      }
      return char
    })
    onCharactersChange(updatedCharacters)
  }

  const roleColors = {
    protagonist: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    antagonist: 'bg-red-600/20 text-red-300 border-red-500/30',
    supporting: 'bg-green-600/20 text-green-300 border-green-500/30',
    background: 'bg-gray-600/20 text-gray-300 border-gray-500/30'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Characters ({characters.length})
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Character
        </Button>
      </div>

      {/* Add New Character Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Add New Character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Character name..."
                value={newCharacter.name || ''}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <Select
                value={newCharacter.role || 'supporting'}
                onValueChange={(value) => setNewCharacter(prev => ({ ...prev, role: value as any }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="protagonist">Protagonist</SelectItem>
                  <SelectItem value="antagonist">Antagonist</SelectItem>
                  <SelectItem value="supporting">Supporting</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Input
              placeholder="Age variation (young, adult, old, child, etc.) - optional"
              value={newCharacter.ageVariation || ''}
              onChange={(e) => setNewCharacter(prev => ({ ...prev, ageVariation: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            
            <Textarea
              placeholder="Character description..."
              value={newCharacter.description || ''}
              onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
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

      {/* Character Cards */}
      <div className="grid gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {editingId === character.id ? (
                <EditCharacterForm
                  character={character}
                  availableChapters={availableChapters}
                  onSave={(updates) => handleSave(character.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <CharacterCard
                  character={character}
                  roleColors={roleColors}
                  availableChapters={availableChapters}
                  onEdit={() => handleEdit(character)}
                  onDelete={() => handleDelete(character.id)}
                  onToggleChapter={(chapterId, chapterTitle) => 
                    toggleChapterAssignment(character.id, chapterId, chapterTitle)
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

function CharacterCard({ 
  character, 
  roleColors,
  availableChapters,
  onEdit, 
  onDelete, 
  onToggleChapter 
}: {
  character: StoryCharacter
  roleColors: Record<string, string>
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
            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
              {character.reference}
            </Badge>
            <h4 className="font-medium text-white">{character.name}</h4>
            <Badge variant="outline" className={roleColors[character.role]}>
              {character.role}
            </Badge>
            {character.ageVariation && (
              <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                {character.ageVariation}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-300">{character.description}</p>
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
        <p className="text-sm text-slate-400">Appears in chapters:</p>
        <div className="flex flex-wrap gap-2">
          {availableChapters.map((chapter) => {
            const isAssigned = character.chapters.some(c => c.chapterId === chapter.id)
            return (
              <Button
                key={chapter.id}
                onClick={() => onToggleChapter(chapter.id, chapter.title)}
                size="sm"
                variant={isAssigned ? "default" : "outline"}
                className={isAssigned 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
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

function EditCharacterForm({ 
  character, 
  availableChapters,
  onSave, 
  onCancel 
}: {
  character: StoryCharacter
  availableChapters: Array<{ id: string; title: string }>
  onSave: (updates: Partial<StoryCharacter>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: character.name,
    description: character.description,
    role: character.role,
    ageVariation: character.ageVariation || ''
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
          value={form.role}
          onValueChange={(value) => setForm(prev => ({ ...prev, role: value as any }))}
        >
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="protagonist">Protagonist</SelectItem>
            <SelectItem value="antagonist">Antagonist</SelectItem>
            <SelectItem value="supporting">Supporting</SelectItem>
            <SelectItem value="background">Background</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Input
        placeholder="Age variation (optional)"
        value={form.ageVariation}
        onChange={(e) => setForm(prev => ({ ...prev, ageVariation: e.target.value }))}
        className="bg-slate-900/50 border-slate-600 text-white"
      />
      
      <Textarea
        value={form.description}
        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
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