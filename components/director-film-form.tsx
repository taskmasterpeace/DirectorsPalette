"use client"

import { useMemo, useState } from "react"
import type { FilmDirector, FilmDirectorCategory, FilmDirectorDiscipline } from "@/lib/director-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, X, Wand2 } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { InfoTooltip } from "@/components/info-tooltip"
import { completeFilmDirector } from "@/app/actions"
import { ActionBar } from "@/components/action-bar"

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

  const [assisting, setAssisting] = useState(false)

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

  const aiAssist = async () => {
    setAssisting(true)
    try {
      const input = {
        name,
        description,
        visualLanguage,
        colorPalette,
        narrativeFocus,
        category,
        disciplines,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }
      const suggestions = await completeFilmDirector(input)
      // Apply strategy:
      // - Empty fields get filled
      // - Non-empty fields get an expanded version appended with a separating newline
      const mergeText = (current: string, suggested?: string) => {
        const s = (suggested || "").trim()
        if (!s) return current
        if (!current.trim()) return s
        // Append expanded details
        return current.trim() + "\n\n" + s
      }

      setName((prev) => suggestions.name?.trim() && !prev.trim() ? suggestions.name : prev)
      setDescription((prev) => mergeText(prev, suggestions.description))
      setVisualLanguage((prev) => mergeText(prev, suggestions.visualLanguage))
      setColorPalette((prev) => mergeText(prev, suggestions.colorPalette))
      setNarrativeFocus((prev) => mergeText(prev, suggestions.narrativeFocus))
      if (suggestions.category && !category) setCategory(suggestions.category)
      // Merge arrays with dedupe
      if (Array.isArray(suggestions.disciplines)) {
        const merged = Array.from(new Set([...(disciplines || []), ...suggestions.disciplines]))
        setDisciplines(merged as FilmDirectorDiscipline[])
      }
      if (Array.isArray(suggestions.tags)) {
        const mergedTags = Array.from(new Set([...(tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []), ...suggestions.tags]))
        setTags(mergedTags.join(", "))
      }
    } catch (e) {
      console.error("AI Assist (film) failed:", e)
    } finally {
      setAssisting(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{isEditing ? "Edit Film Director" : "New Film Director"}</CardTitle>
        <CardAction>
          <Button size="sm" onClick={aiAssist} disabled={assisting}>
            <Wand2 className={`h-4 w-4 mr-1 ${assisting ? "animate-spin" : ""}`} />
            {assisting ? "Assisting..." : "AI Assist"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Name</label>
            <InfoTooltip>
              The display name of this director style. Shown in pickers, search, and prompts. Choose a short, memorable name.
            </InfoTooltip>
          </div>
          <input
            placeholder="e.g., Midnight Realist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Short Description</label>
            <InfoTooltip>
              A one‑liner that captures the core flavor. Used in lists and summaries to quickly identify the style’s intent.
            </InfoTooltip>
          </div>
          <input
            placeholder="Concise headline for the style"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Visual Language</label>
            <InfoTooltip>
              Describe composition, lensing, movement, framing, and staging in one place. This heavily guides shot generation and the “feel” of coverage.
            </InfoTooltip>
          </div>
          <Textarea
            placeholder="Holistic description of how the camera sees and moves; framing logic and staging patterns"
            value={visualLanguage}
            onChange={(e) => setVisualLanguage(e.target.value)}
            className="mt-1 bg-slate-900/50 border-slate-600 text-white text-sm"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Color Palette</label>
              <InfoTooltip>
                Typical color/lighting mood. Influences color and lighting notes in generated shots. Use materials, temperatures, and contrast terms.
              </InfoTooltip>
            </div>
            <input
              placeholder="e.g., muted earth tones, high contrast highlights"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Narrative Focus</label>
              <InfoTooltip>
                What story elements this style emphasizes (e.g., character psychology, tension, intimacy). Used to bias the types of shots suggested.
              </InfoTooltip>
            </div>
            <input
              placeholder="e.g., character psychology and slow-burn tension"
              value={narrativeFocus}
              onChange={(e) => setNarrativeFocus(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Category</label>
            <InfoTooltip>
              Used for browsing and grouping in the library. Pick the closest era/identity or use Custom.
            </InfoTooltip>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILM_CATEGORIES.map((c) => (
              <Badge
                key={c}
                onClick={() => setCategory(c)}
                className={`cursor-pointer ${category === c ? "bg-slate-700 text-white" : "bg-slate-700/60 text-slate-300"}`}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Disciplines</label>
            <InfoTooltip>
              Strength areas. Checked items bias prompts toward those techniques. Pick several that truly represent the style.
            </InfoTooltip>
          </div>
          <div className="mt-2 grid md:grid-cols-3 gap-3">
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Tags (comma-separated)</label>
            <InfoTooltip>
              Searchable keywords that help discover this style. Keep them short; 3–7 tags works well.
            </InfoTooltip>
          </div>
          <input
            placeholder="e.g., precise, moody, geometric"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <ActionBar
          withSpacer
          secondary={{ label: "Cancel", onClick: onCancel }}
          primary={{ label: isEditing ? "Save Changes" : "Create Director", onClick: save }}
        />
      </CardContent>
    </Card>
  )
}
