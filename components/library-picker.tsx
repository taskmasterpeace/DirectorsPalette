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

type Domain = "film" | "music-video"

interface DirectorOption {
id: string
name: string
description?: string
category?: string
}

interface LibraryPickerProps {
// Can be an empty string for "no selection"
value: string
onValueChange: (id: string) => void
directors: DirectorOption[]
placeholder?: string
domain: Domain
className?: string
}

const NONE_VALUE = "__none__"

// Add this helper near the top (after interfaces)
function dedupeById<T extends { id: string }>(arr: T[]): T[] {
const map = new Map<string, T>()
for (const item of arr) {
  if (!map.has(item.id)) map.set(item.id, item)
}
return Array.from(map.values())
}

/**
* LibraryPicker
* - Shows a Select list of directors, grouped by optional category when present.
* - Includes a "No director (default style)" option with sentinel value "__none__".
* - Emits empty string "" to represent "no selection" to parent components.
*/
export function LibraryPicker({
value,
onValueChange,
directors,
placeholder = "Select a director...",
domain,
className,
}: LibraryPickerProps) {
// Build category groups if available
const uniqueDirectors = React.useMemo(
  () => dedupeById(directors),
  [directors]
)

const categories = React.useMemo(() => {
  const map = new Map<string, DirectorOption[]>()
  for (const d of uniqueDirectors) {
    const key = d.category || "All"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  // Sort for stability
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, items]) => ({
      label,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}, [uniqueDirectors])

// Map empty string to undefined so placeholder is shown
const selectValue = value === "" ? undefined : value

const handleChange = (next: string) => {
  if (next === NONE_VALUE) {
    onValueChange("")
  } else {
    onValueChange(next)
  }
}

return (
  <div className={className}>
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-white">
        <SelectValue
          placeholder={placeholder}
          aria-label={domain === "film" ? "Select film director style" : "Select music video director style"}
        />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-600 text-white">
        <SelectGroup>
          <SelectLabel className="text-slate-300">Selection</SelectLabel>
          {/* Sentinel option for "no selection" */}
          <SelectItem value={NONE_VALUE}>
            No director (default style)
          </SelectItem>
        </SelectGroup>

        {categories.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-slate-400">{group.label}</SelectLabel>
            {group.items.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  </div>
)
}
