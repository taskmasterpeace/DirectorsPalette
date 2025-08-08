"use client"

import { useMemo, useState } from "react"
import type {
  MusicVideoDirector,
  MusicVideoDirectorCategory,
  MusicDirectorDiscipline,
} from "@/lib/director-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, X, Wand2 } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { InfoTooltip } from "@/components/info-tooltip"
import { completeMusicDirector } from "@/app/actions"
import { ActionBar } from "@/components/action-bar"

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

  const [assisting, setAssisting] = useState(false)

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

  const aiAssist = async () => {
    setAssisting(true)
    try {
      const input = {
        name,
        description,
        visualHallmarks,
        narrativeStyle,
        pacingAndEnergy,
        genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
        category,
        disciplines,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }
      const suggestions = await completeMusicDirector(input)

      const mergeText = (current: string, suggested?: string) => {
        const s = (suggested || "").trim()
        if (!s) return current
        if (!current.trim()) return s
        return current.trim() + "\n\n" + s
      }

      setName((prev) => suggestions.name?.trim() && !prev.trim() ? suggestions.name : prev)
      setDescription((prev) => mergeText(prev, suggestions.description))
      setVisualHallmarks((prev) => mergeText(prev, suggestions.visualHallmarks))
      setNarrativeStyle((prev) => mergeText(prev, suggestions.narrativeStyle))
      setPacingAndEnergy((prev) => mergeText(prev, suggestions.pacingAndEnergy))
      if (suggestions.category && !category) setCategory(suggestions.category)
      if (Array.isArray(suggestions.genres)) {
        const merged = Array.from(new Set([...(genres ? genres.split(",").map((g)=>g.trim()).filter(Boolean) : []), ...suggestions.genres]))
        setGenres(merged.join(", "))
      }
      if (Array.isArray(suggestions.disciplines)) {
        const merged = Array.from(new Set([...(disciplines || []), ...suggestions.disciplines]))
        setDisciplines(merged as MusicDirectorDiscipline[])
      }
      if (Array.isArray(suggestions.tags)) {
        const merged = Array.from(new Set([...(tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []), ...suggestions.tags]))
        setTags(merged.join(", "))
      }
    } catch (e) {
      console.error("AI Assist (music) failed:", e)
    } finally {
      setAssisting(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{isEditing ? "Edit Music Video Director" : "New Music Video Director"}</CardTitle>
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
              The display name of this music video style. Appears in selectors and prompts. Keep it short and clear.
            </InfoTooltip>
          </div>
          <input
            placeholder="e.g., Neon Pulse"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Core Idea / Description</label>
            <InfoTooltip>
              A concise statement of the vibe and intent. Shows up in overviews and helps steer the style.
            </InfoTooltip>
          </div>
          <input
            placeholder="Short headline for the style"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Visual Hallmarks</label>
              <InfoTooltip>
                The recurring visual tactics: lenses, color, edits, staging, effects, lighting moods, framing. Drives how shots look and cut.
              </InfoTooltip>
            </div>
            <Textarea
              placeholder="Signature visuals and post motifs; how images are shaped"
              value={visualHallmarks}
              onChange={(e) => setVisualHallmarks(e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-600 text-white text-sm"
              rows={2}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Narrative Style</label>
              <InfoTooltip>
                Linear vs abstract; cinematic vs docu; performance‑driven vs story‑driven. Used to bias section shot lists.
              </InfoTooltip>
            </div>
            <Textarea
              placeholder="How this style tells stories in music contexts"
              value={narrativeStyle}
              onChange={(e) => setNarrativeStyle(e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-600 text-white text-sm"
              rows={2}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Pacing & Energy</label>
              <InfoTooltip>
                Typical tempo of edits and performance. Affects cutting rhythm and shot intensity.
              </InfoTooltip>
            </div>
            <input
              placeholder="e.g., high‑energy and kinetic"
              value={pacingAndEnergy}
              onChange={(e) => setPacingAndEnergy(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Genres (comma-separated)</label>
              <InfoTooltip>
                Music genres this style fits best. Helps guide treatments and section coverage.
              </InfoTooltip>
            </div>
            <input
              placeholder="e.g., Pop, Electronic, R&B"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Category</label>
            <InfoTooltip>
              Groups styles for browsing and selection. Pick the closest fit or use Custom.
            </InfoTooltip>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {MV_CATEGORIES.map((c) => (
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
              Strength areas that bias the generator (e.g., performance, editing, VFX). Pick several that define the style.
            </InfoTooltip>
          </div>
          <div className="mt-2 grid md:grid-cols-3 gap-3">
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Tags (comma-separated)</label>
            <InfoTooltip>
              Searchable keywords to find this style quickly. Keep them concise; 3–7 works great.
            </InfoTooltip>
          </div>
          <input
            placeholder="e.g., glossy, kinetic, surreal"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm"
          />
        </div>

        <div className="rounded-md border border-slate-700 p-3 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium mb-1">Usage</div>
          <ul className="text-xs text-slate-300 list-disc ml-5 space-y-1">
            <li>Influences structure, treatments, and section breakdown prompts</li>
            <li>Strongly affects visual phrasing, pacing, and performance notes</li>
          </ul>
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
