"use client"

import { useMemo, useState } from "react"
import type {
  MusicVideoDirector,
  MusicVideoDirectorCategory,
  MusicDirectorDiscipline,
} from "@/lib/director-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, X } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

const MV_CATEGORIES: MusicVideoDirectorCategory[] = [
  "Standard",
  "Hip-Hop & R&B Visionaries",
  "Cinematic Storytellers",
  "Avant-Garde & Indie Innovators",
  "Pop & Spectacle Auteurs",
  "Custom",
]

const MV_DISCIPLINES: MusicDirectorDiscipline[] = [
  "performance",
  "narrative",
  "choreography",
  "fashion-styling",
  "visual-effects",
  "editing",
  "live-action",
]

type Props = {
  initial?: Partial<MusicVideoDirector>
  onCancel: () => void
  onSave: (director: MusicVideoDirector) => void
}

export function DirectorMusicForm({ initial, onCancel, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [visualHallmarks, setVisualHallmarks] = useState(initial?.visualHallmarks ?? "")
  const [narrativeStyle, setNarrativeStyle] = useState(initial?.narrativeStyle ?? "")
  const [pacingAndEnergy, setPacingAndEnergy] = useState(initial?.pacingAndEnergy ?? "")
  const [genres, setGenres] = useState((initial?.genres ?? []).join(", "))
  const [category, setCategory] = useState<MusicVideoDirectorCategory>(initial?.category ?? "Standard")
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "))
  const [disciplines, setDisciplines] = useState<MusicDirectorDiscipline[]>(
    (initial?.disciplines ?? []) as MusicDirectorDiscipline[],
  )

  const isEditing = Boolean(initial?.id)
  const selectedDisciplines = useMemo(() => new Set(disciplines), [disciplines])

  const toggleDiscipline = (d: MusicDirectorDiscipline) => {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const save = () => {
    if (!name.trim()) return
    const now = new Date()
    const id = initial?.id ?? `mv-${crypto.randomUUID()}`
    const director: MusicVideoDirector = {
      id,
      domain: "music-video",
      name: name.trim(),
      description: description.trim() || undefined,
      visualHallmarks: visualHallmarks.trim() || undefined,
      narrativeStyle: narrativeStyle.trim() || undefined,
      pacingAndEnergy: pacingAndEnergy.trim() || undefined,
      genres: genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
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
        <CardTitle className="text-white">{isEditing ? "Edit Music Video Director" : "New Music Video Director"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-1 block">Name</label>
          <input
            placeholder="e.g., Hype Williams"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Core Idea / Description</label>
          <input
            placeholder="Short description or seed idea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Visual Hallmarks</label>
            <Textarea
              placeholder="Signature visuals, lenses, color, editing motifs..."
              value={visualHallmarks}
              onChange={(e) => setVisualHallmarks(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Narrative Style</label>
            <Textarea
              placeholder="Approach to story in music contexts"
              value={narrativeStyle}
              onChange={(e) => setNarrativeStyle(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white text-sm"
              rows={2}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Pacing & Energy</label>
            <input
              placeholder="e.g., high-energy, contemplative, explosive"
              value={pacingAndEnergy}
              onChange={(e) => setPacingAndEnergy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-1 block">Genres (comma-separated)</label>
            <input
              placeholder="e.g., Hip-Hop, R&B, Pop"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {MV_CATEGORIES.map((c) => (
              <Badge
                key={c}
                onClick={() => setCategory(c)}
                className={`cursor-pointer ${
                  category === c ? "bg-purple-600 text-white" : "bg-slate-700/60 text-slate-300"
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
            {MV_DISCIPLINES.map((d) => (
              <div key={d} className="flex items-center space-x-2">
                <Checkbox
                  id={`mv-disc-${d}`}
                  checked={selectedDisciplines.has(d)}
                  onCheckedChange={() => toggleDiscipline(d)}
                />
                <label htmlFor={`mv-disc-${d}`} className="text-sm text-white cursor-pointer">
                  {d}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-1 block">Tags (comma-separated)</label>
          <input
            placeholder="e.g., glossy, kinetic, iconic"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div className="rounded-md border border-slate-700 p-3 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium mb-1">Used in</div>
          <ul className="text-xs text-slate-300 list-disc ml-5 space-y-1">
            <li>Music video structure, treatments, and section breakdown prompts</li>
            <li>Fields used: name, visualHallmarks, narrativeStyle, pacingAndEnergy, genres</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button onClick={save} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Check className="h-4 w-4 mr-1" /> {isEditing ? "Save Changes" : "Create Director"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
