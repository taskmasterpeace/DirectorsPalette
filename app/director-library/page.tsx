"use client"

import { useEffect, useMemo, useState } from "react"
import { directorDB } from "@/lib/director-db"
import type { FilmDirector, MusicVideoDirector } from "@/lib/director-types"
import { curatedFilmDirectors, curatedMusicVideoDirectors } from "@/lib/curated-directors"
import { commercialDirectors, type EnhancedCommercialDirector } from "@/lib/commercial-directors"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, Plus, Briefcase, Palette } from "lucide-react"
import { DirectorCard } from "@/components/director-card"
import { DirectorFilmForm } from "@/components/director-film-form"
import { DirectorMusicForm } from "@/components/director-music-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { StyleGuide } from "@/components/style-guide/StyleGuide"

type Source = "curated" | "library"
type FilmListItem = FilmDirector & { source: Source }
type MusicListItem = MusicVideoDirector & { source: Source }
type CommercialListItem = EnhancedCommercialDirector & { source: Source }

export default function DirectorLibraryPage() {
  const { toast } = useToast()

  // Data
  const [film, setFilm] = useState<FilmDirector[]>([])
  const [music, setMusic] = useState<MusicVideoDirector[]>([])
  const [tab, setTab] = useState<"film" | "music" | "commercial" | "style-guide">("film")

  // Filters
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")

  // Dialog State
  const [editOpen, setEditOpen] = useState(false)
  const [editingFilm, setEditingFilm] = useState<FilmDirector | null>(null)
  const [editingMusic, setEditingMusic] = useState<MusicVideoDirector | null>(null)

  useEffect(() => {
    const load = async () => {
      await directorDB.ensureSeeded()
      const [f, m] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])
      setFilm(f)
      setMusic(m)
    }
    load()
  }, [])

  const reload = async () => {
    const [f, m] = await Promise.all([directorDB.getAllFilm(), directorDB.getAllMusic()])
    setFilm(f)
    setMusic(m)
  }

  // Merge curated + library with full data preserved for library items
  const filmList: FilmListItem[] = useMemo(() => {
    const curated: FilmListItem[] = curatedFilmDirectors.map((c) => ({ ...c, source: "curated" }))
    const fromLibrary: FilmListItem[] = film.map((d) => ({ ...d, source: "library" }))
    const map = new Map<string, FilmListItem>()
    curated.forEach((c) => map.set(c.id, c))
    fromLibrary.forEach((d) => map.set(d.id, d))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [film])

  const musicList: MusicListItem[] = useMemo(() => {
    const curated: MusicListItem[] = curatedMusicVideoDirectors.map((c) => ({ ...c, source: "curated" }))
    const fromLibrary: MusicListItem[] = music.map((d) => ({ ...d, source: "library" }))
    const map = new Map<string, MusicListItem>()
    curated.forEach((c) => map.set(c.id, c))
    fromLibrary.forEach((d) => map.set(d.id, d))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [music])

  const commercialList: CommercialListItem[] = useMemo(() => {
    // Commercial directors are curated for now
    return commercialDirectors.map((c) => ({ ...c, source: "curated" }))
  }, [])

  const active = tab === "film" ? filmList : tab === "music" ? musicList : commercialList
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(active.map((i) => i.category).filter(Boolean)) as Set<string>)],
    [active],
  )

  const filtered = active.filter((i) => {
    const q = query.trim().toLowerCase()
    const matchQ =
      !q ||
      i.name.toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q) ||
      (tab === "film"
        ? ((i as FilmDirector).visualLanguage || "").toLowerCase().includes(q)
        : tab === "music"
          ? ((i as MusicVideoDirector).visualHallmarks || "").toLowerCase().includes(q)
          : ((i as EnhancedCommercialDirector).visualLanguage || "").toLowerCase().includes(q))
    const matchC = category === "All" || i.category === category
    return matchQ && matchC
  })

  const onEdit = (id: string) => {
    if (tab === "film") {
      const d = film?.find((x) => x.id === id)
      if (!d) return
      setEditingFilm(d)
      setEditingMusic(null)
      setEditOpen(true)
    } else {
      const d = music?.find((x) => x.id === id)
      if (!d) return
      setEditingMusic(d)
      setEditingFilm(null)
      setEditOpen(true)
    }
  }

  const onDelete = async (id: string) => {
    try {
      if (tab === "film") {
        await directorDB.deleteFilm(id)
      } else {
        await directorDB.deleteMusic(id)
      }
      await reload()
      toast({ title: "Deleted", description: "Director removed from your library." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e?.message || "Unexpected error" })
    }
  }

  const addCuratedToLibrary = async (id: string) => {
    try {
      if (tab === "film") {
        const d = curatedFilmDirectors.find((c) => c.id === id)
        if (!d) return
        const now = new Date()
        const payload: FilmDirector = {
          ...d,
          createdAt: now,
          updatedAt: now,
          isCustom: d.isCustom ?? false,
          domain: "film",
        }
        await directorDB.upsertFilm(payload)
      } else {
        const d = curatedMusicVideoDirectors.find((c) => c.id === id)
        if (!d) return
        const now = new Date()
        const payload: MusicVideoDirector = {
          ...d,
          createdAt: now,
          updatedAt: now,
          isCustom: d.isCustom ?? false,
          domain: "music-video",
        }
        await directorDB.upsertMusic(payload)
      }
      await reload()
      toast({ title: "Added", description: "Curated director added to your library." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Add failed", description: e?.message || "Unexpected error" })
    }
  }

  const saveFilm = async (director: FilmDirector) => {
    try {
      await directorDB.upsertFilm(director)
      setEditOpen(false)
      setEditingFilm(null)
      await reload()
      toast({ title: "Saved", description: "Film director updated." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e?.message || "Unexpected error" })
    }
  }

  const saveMusic = async (director: MusicVideoDirector) => {
    try {
      await directorDB.upsertMusic(director)
      setEditOpen(false)
      setEditingMusic(null)
      await reload()
      toast({ title: "Saved", description: "Music video director updated." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e?.message || "Unexpected error" })
    }
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl">
        {/* Tabs + Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={tab === "film" ? "default" : "outline"}
              onClick={() => setTab("film")}
              className={
                tab === "film"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
              size="sm"
            >
              Film Directors
              <Badge variant="secondary" className="ml-2 bg-slate-600/20 text-slate-300">
                {filmList.length}
              </Badge>
            </Button>
            <Button
              variant={tab === "music" ? "default" : "outline"}
              onClick={() => setTab("music")}
              className={
                tab === "music"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
              size="sm"
            >
              Music Video Directors
              <Badge variant="secondary" className="ml-2 bg-slate-600/20 text-slate-300">
                {musicList.length}
              </Badge>
            </Button>
            <Button
              variant={tab === "commercial" ? "default" : "outline"}
              onClick={() => setTab("commercial")}
              className={
                tab === "commercial"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
              size="sm"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Commercial Directors
              <Badge variant="secondary" className="ml-2 bg-slate-600/20 text-slate-300">
                {commercialList.length}
              </Badge>
            </Button>
            <Button
              variant={tab === "style-guide" ? "default" : "outline"}
              onClick={() => setTab("style-guide")}
              className={
                tab === "style-guide"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
              size="sm"
            >
              <Palette className="w-4 h-4 mr-2" />
              Style Guide
            </Button>
          </div>

          {/* Search + Category */}
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={
                  tab === "film" ? "Search film directors..." : 
                  tab === "music" ? "Search music video directors..." : 
                  "Search commercial directors..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                  className={`h-8 ${
                    category === c
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* Results */}
        {tab === "style-guide" ? (
          <StyleGuide />
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center text-slate-300">
            No directors match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => {
              if (tab === "film") {
                const item = d as FilmListItem
                const isLibrary = item.source === "library"
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DirectorCard
                      director={item}
                      onEdit={isLibrary ? onEdit : undefined}
                      onDelete={isLibrary ? onDelete : undefined}
                      compact={!isLibrary}
                    />
                    {!isLibrary && (
                      <Button
                        size="sm"
                        onClick={() => addCuratedToLibrary(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                )
              } else if (tab === "music") {
                const item = d as MusicListItem
                const isLibrary = item.source === "library"
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DirectorCard
                      director={item}
                      onEdit={isLibrary ? onEdit : undefined}
                      onDelete={isLibrary ? onDelete : undefined}
                      compact={!isLibrary}
                    />
                    {!isLibrary && (
                      <Button
                        size="sm"
                        onClick={() => addCuratedToLibrary(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                )
              } else {
                // Commercial directors
                const item = d as CommercialListItem
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DirectorCard
                      director={item}
                      compact={true}
                    />
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-green-400">Creativity:</span>
                          <span className="ml-1 text-white">{item.commercialStats.creativity}/10</span>
                        </div>
                        <div>
                          <span className="text-blue-400">Engagement:</span>
                          <span className="ml-1 text-white">{item.commercialStats.engagement}/10</span>
                        </div>
                        <div>
                          <span className="text-yellow-400">Authenticity:</span>
                          <span className="ml-1 text-white">{item.commercialStats.authenticity}/10</span>
                        </div>
                        <div>
                          <span className="text-purple-400">Premium:</span>
                          <span className="ml-1 text-white">{item.commercialStats.premiumFeel}/10</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="mb-1">
                          <span className="text-slate-400">Platforms:</span>
                          <span className="ml-1 text-cyan-300">{item.platformStrength.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Best for:</span>
                          <span className="ml-1 text-orange-300">{item.brandFit.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingFilm ? "Edit Film Director" : "Edit Music Video Director"}
              </DialogTitle>
            </DialogHeader>

            {editingFilm && (
              <DirectorFilmForm initial={editingFilm} onCancel={() => setEditOpen(false)} onSave={saveFilm} />
            )}

            {editingMusic && (
              <DirectorMusicForm initial={editingMusic} onCancel={() => setEditOpen(false)} onSave={saveMusic} />
            )}

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
