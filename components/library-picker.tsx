"use client"

import { useEffect, useMemo, useState } from "react"
import { directorDB } from "@/lib/director-db"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Search, Film, PlayCircle } from 'lucide-react'

type Mode = "film" | "music"

type Props = {
  open: boolean
  mode: Mode
  onClose: () => void
  onSelect: (director: FilmDirector | MusicVideoDirector) => void
  title?: string
}

export function LibraryPicker({ open, mode, onClose, onSelect, title = "Import from Library" }: Props) {
  const [loading, setLoading] = useState(false)
  const [filmList, setFilmList] = useState<FilmDirector[]>([])
  const [musicList, setMusicList] = useState<MusicVideoDirector[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")

  useEffect(() => {
    if (!open) return
    const run = async () => {
      setLoading(true)
      try {
        await directorDB.ensureSeeded()
        const [f, m] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])
        setFilmList(f)
        setMusicList(m)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [open])

  const list = mode === "film" ? filmList : musicList
  const categories = useMemo(() => {
    const set = new Set<string>()
    list.forEach((d: any) => set.add(d.category))
    return ["all", ...Array.from(set)]
  }, [list])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter((d: any) => {
      const matchesQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        (mode === "film"
          ? d.visualStyle?.toLowerCase().includes(q)
          : (d as MusicVideoDirector).visualHallmarks?.toLowerCase().includes(q))

      const matchesCat = category === "all" || d.category === category
      return matchesQ && matchesCat
    })
  }, [list, search, category, mode])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 p-4 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-5xl">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                {mode === "film" ? <Film className="h-5 w-5 text-amber-400" /> : <PlayCircle className="h-5 w-5 text-purple-400" />}
                {title}
              </CardTitle>
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      placeholder="Search by name, style, tags..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white text-sm pl-9"
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`cursor-pointer ${category === c ? (mode === "film" ? "bg-amber-600" : "bg-purple-600") : "bg-slate-700/60"} text-white`}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="text-slate-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-slate-400">No directors match your filters.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {filtered.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-lg border border-slate-600 bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer"
                      onClick={() => onSelect(d)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium">{d.name}</div>
                        <Badge variant="outline" className={mode === "film" ? "border-amber-500/30 text-amber-300" : "border-purple-500/30 text-purple-300"}>
                          {d.category}
                        </Badge>
                      </div>
                      <div className="text-slate-300 text-sm mt-1">
                        {mode === "film" ? (d as FilmDirector).description : (d as MusicVideoDirector).description}
                      </div>
                      <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-1">
                        {(d.tags || []).slice(0, 6).map((t) => (
                          <Badge key={t} variant="secondary" className="bg-slate-700/50 text-slate-300">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
