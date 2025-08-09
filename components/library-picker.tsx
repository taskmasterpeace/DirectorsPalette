"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categorizeDirectorByTags, FILM_CATEGORY_LABELS, MUSIC_CATEGORY_LABELS } from "@/lib/director-tags"
import { Film, PlayCircle } from "lucide-react"

type DirectorOption = {
  id: string
  name: string
  description?: string
  // Film
  visualLanguage?: string
  visualStyle?: string
  cameraStyle?: string
  colorPalette?: string
  narrativeFocus?: string
  // Music Video
  visualHallmarks?: string
  narrativeStyle?: string
  pacingAndEnergy?: string
  genres?: string[]
  // Shared
  category?: string
  tags?: string[]
  disciplines?: string[]
}

type Props = {
  value?: string
  onValueChange: (val: string) => void
  directors: DirectorOption[]
  placeholder?: string
  domain: "film" | "music-video"
}

// Ensure unique, auto-assign category if missing, and sort by name
function normalizeDirectors(list: DirectorOption[], domain: "film" | "music-video") {
  const map = new Map<string, DirectorOption>()
  for (const d of list || []) {
    if (!map.has(d.id)) {
      const cat = categorizeDirectorByTags(d, domain)
      map.set(d.id, { ...d, category: cat })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function groupByCategory(list: DirectorOption[], domain: "film" | "music-video") {
  const cats = domain === "film" ? Object.values(FILM_CATEGORY_LABELS) : Object.values(MUSIC_CATEGORY_LABELS)
  const groups: Record<string, DirectorOption[]> = {}
  for (const c of cats) groups[c] = []
  for (const d of list) {
    const key = d.category || (domain === "film" ? FILM_CATEGORY_LABELS.Contemporary : MUSIC_CATEGORY_LABELS.Custom)
    if (!groups[key]) groups[key] = []
    groups[key].push(d)
  }
  return groups
}

export function LibraryPicker({
  value,
  onValueChange,
  directors,
  placeholder = "Select a director...",
  domain,
}: Props) {
  // Mobile: use robust native select under sm breakpoint
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const normalized = React.useMemo(() => normalizeDirectors(directors, domain), [directors, domain])
  const groups = React.useMemo(() => groupByCategory(normalized, domain), [normalized, domain])

  const Icon =
    domain === "film" ? <Film className="h-4 w-4 text-amber-400" /> : <PlayCircle className="h-4 w-4 text-purple-400" />

  // Mobile native select
  if (isMobile) {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">{Icon}</div>
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-slate-600 bg-slate-900/60 py-2 pl-8 pr-8 text-white"
          aria-label="Director"
        >
          {!value && <option value="">{placeholder}</option>}
          {Object.entries(groups).map(([cat, items]) =>
            items.length ? (
              <optgroup key={cat} label={cat}>
                {items.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.tags && d.tags.length ? ` • ${d.tags.slice(0, 2).join(" • ")}` : ""}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
      </div>
    )
  }

  // Desktop grouped Select
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-slate-900/60 border-slate-600 text-white">
        <div className="flex items-center gap-2">
          {Icon}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-80">
        {Object.entries(groups).map(([cat, items]) =>
          items.length ? (
            <SelectGroup key={cat}>
              <SelectLabel className="text-slate-300">{cat}</SelectLabel>
              {items.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id}
                  // Force accessible contrast: keep text white across states.
                  className="
                    text-white
                    data-[highlighted]:text-white data-[highlighted]:bg-slate-700
                    data-[state=checked]:text-white data-[state=checked]:bg-slate-700
                    focus:text-white focus:bg-slate-700
                    hover:text-white
                  "
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{d.name}</span>
                    {d.tags && d.tags.length ? (
                      <span className="text-[11px] text-slate-300">{d.tags.slice(0, 3).join(" • ")}</span>
                    ) : null}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null,
        )}
      </SelectContent>
    </Select>
  )
}
