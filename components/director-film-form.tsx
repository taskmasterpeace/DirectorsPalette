"use client"

import { useMemo, useState } from "react"
import type { FilmDirector, FilmDirectorCategory, FilmDirectorDiscipline } from "@/lib/director-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, X } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

const FILM_CATEGORIES: FilmDirectorCategory[] = ["Contemporary", "Auteur", "Classic", "Custom"]

const FILM_DISCIPLINES: FilmDirectorDiscipline[] = [
  "composition",
  "camera-movement",
  "color-lighting",
  "editing-rhythm",
  "world-building",
  "performance-direction",
  "tone-mood",
]

type Props = {
  initial?: Partial<FilmDirector> & {
    // backward compat inputs from older records
    visualStyle?: string
    cameraStyle?: string
  }
  onCancel: () => void
  onSave: (director: FilmDirector) => void
}

export function DirectorFilmForm({ initial, onCancel, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  // Merge legacy fields into Visual Language
  const initialVisualLanguage =
    initial?.visualLanguage ||
    [initial?.visualStyle, initial?.cameraStyle].filter(Boolean).join("; ")
  const [visualLanguage, setVisualLanguage] = useState(initialVisualLanguage ?? "")
  const [colorPalette, setColorPalette] = useState(initial?.colorPalette ?? "")
  const [narrativeFocus, setNarrativeFocus] = useState(initial?.narrativeFocus ?? "")
  const [category, setCategory] = useState<FilmDirectorCategory>(initial?.category ?? "Contemporary")
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "))
  const [disciplines, setDisciplines] = useState<FilmDirectorDiscipline[]>(
    (initial?.disciplines ?? []) as FilmDirectorDiscipline[],
  )

  const isEditing = Boolean(initial?.id)
  const selectedDisciplines = useMemo(() => new Set(disciplines), [disciplines])

  const toggleDiscipline = (d: FilmDirectorDiscipline) => {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const save = () => {
    if (!name.trim()) return
    const now = new Date()
    const id = initial?.id ?? `film-${crypto.randomUUID()}`
    const director: FilmDirector = {
      id,
      domain: "film",
      name: name.trim(),
      description: description.trim() || undefined,
      visualLanguage: visualLanguage.trim() || undefined,
      colorPalette: colorPalette.trim() || undefined,
      narrativeFocus: narrativeFocus.trim() || undefined,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      disciplines,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      isCustom: initial?.isCustom ?? true,
    }
    onSave(director)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{isEditing ? "Edit Film Director" : "New Film Director"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-1 block">Name</label>
          <input
            placeholder="e.g., Christopher Nolan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Short Description</label>
          <input
            placeholder="e.g., IMAX-scale mind-bending epics"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Visual Language</label>
          <Textarea
            placeholder="Merge look, composition, lensing, movement, and framing into one description..."
            value={visualLanguage}
            onChange={(e) => setVisualLanguage(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white text-sm"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Color Palette</label>
            <input
              placeholder="e.g., warm pastels, high contrast"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Narrative Focus</label>
            <input
              placeholder="e.g., character emotions, puzzle-box plots"
              value={narrativeFocus}
              onChange={(e) => setNarrativeFocus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {FILM_CATEGORIES.map((c) => (
              <Badge
                key={c}
                onClick={() => setCategory(c)}
                className={`cursor-pointer ${
                  category === c ? "bg-amber-600 text-white" : "bg-slate-700/60 text-slate-300"
                }`}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-2 block">Disciplines (multi-select)</label>
          <div className="grid md:grid-cols-3 gap-3">
            {FILM_DISCIPLINES.map((d) => (
              <div key={d} className="flex items-center space-x-2">
                <Checkbox
                  id={`film-disc-${d}`}
                  checked={selectedDisciplines.has(d)}
                  onCheckedChange={() => toggleDiscipline(d)}
                />
                <label htmlFor={`film-disc-${d}`} className="text-sm text-white cursor-pointer">
                  {d}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Tags (comma-separated)</label>
          <input
            placeholder="e.g., precise, clinical, cool"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button onClick={save} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Check className="h-4 w-4 mr-1" /> {isEditing ? "Save Changes" : "Create Director"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
